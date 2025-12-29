import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import * as querystring from 'qs';

import {
  IPaymentGateway,
  CreatePaymentUrlDto,
} from '../interfaces/payment-gateway.interface';
import moment from 'moment';
import { url } from 'inspector';

@Injectable()
export class VnpayService implements IPaymentGateway {
  private readonly vnp_TmnCode: string;
  private readonly vnp_HashSecret: string;
  private readonly vnp_Url: string;
  private readonly vnp_ReturnUrl: string;

  constructor(private configService: ConfigService) {
    // Lấy config từ environment variables hoặc sử dụng giá trị mặc định
    this.vnp_TmnCode =
      this.configService.get<string>('VNPAY_TMN_CODE') || 'CU3BPYJS';
    this.vnp_HashSecret =
      this.configService.get<string>('VNPAY_HASH_SECRET') ||
      'QO7A6BIM0IZ6WOQ4QCZ4K25DKTOKGEEE';
    this.vnp_Url =
      this.configService.get<string>('VNPAY_URL') ||
      'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html';
    this.vnp_ReturnUrl =
      this.configService.get<string>('VNPAY_RETURN_URL') ||
      'http://localhost:3000/vnpay_return';
  }

  /**
   * Hàm sắp xếp object theo thứ tự key
   */
  private sortObject(obj: any): any {
    const sorted = {};
    let str: string[] = [];
    let key;

    for (key in obj) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        str.push(encodeURIComponent(key));
      }
    }

    str.sort();

    for (key = 0; key < str.length; key++) {
      sorted[str[key]] = encodeURIComponent(obj[str[key]]).replace(/%20/g, '+');
    }

    return sorted;
  }

  /**
   * Hàm format date theo định dạng YYYYMMDDHHmmss
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${year}${month}${day}${hours}${minutes}${seconds}`;
  }

  /**
   * Tạo URL để redirect người dùng sang trang thanh toán VNPay
   */
  async createPaymentUrl(dto: CreatePaymentUrlDto): Promise<string> {
    process.env.TZ = 'Asia/Ho_Chi_Minh';

    const date = new Date();
    const createDate = this.formatDate(date);

    const locale = dto.language || 'vn';
    const currCode = 'VND';

    let vnp_Params: any = {};
    vnp_Params['vnp_Version'] = '2.1.0';
    vnp_Params['vnp_Command'] = 'pay';
    vnp_Params['vnp_TmnCode'] = this.vnp_TmnCode;
    vnp_Params['vnp_Locale'] = locale;
    vnp_Params['vnp_CurrCode'] = currCode;
    vnp_Params['vnp_TxnRef'] = dto.orderId;
    vnp_Params['vnp_OrderInfo'] = dto.orderInfo;
    vnp_Params['vnp_OrderType'] = 'other';
    vnp_Params['vnp_Amount'] = dto.amount * 100; // VNPay yêu cầu số tiền nhân 100
    vnp_Params['vnp_ReturnUrl'] = this.vnp_ReturnUrl;
    vnp_Params['vnp_IpAddr'] = dto.ipAddr;
    vnp_Params['vnp_CreateDate'] = createDate;

    if (dto.bankCode && dto.bankCode !== '') {
      vnp_Params['vnp_BankCode'] = dto.bankCode;
    }

    vnp_Params = this.sortObject(vnp_Params);

    const signData = querystring.stringify(vnp_Params, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    vnp_Params['vnp_SecureHash'] = signed;

    const paymentUrl =
      this.vnp_Url + '?' + querystring.stringify(vnp_Params, { encode: false });

    return paymentUrl;
  }

  /**
   * Kiểm tra chữ ký bảo mật từ Webhook (IPN) hoặc Return URL của VNPay
   */
  verifySignature(params: any): boolean {
    const vnp_Params = { ...params };
    const secureHash = vnp_Params['vnp_SecureHash'];

    delete vnp_Params['vnp_SecureHash'];
    delete vnp_Params['vnp_SecureHashType'];

    const sortedParams = this.sortObject(vnp_Params);
    const signData = querystring.stringify(sortedParams, { encode: false });
    const hmac = crypto.createHmac('sha512', this.vnp_HashSecret);
    const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex');

    return secureHash === signed;
  }

  /**
   * Xử lý hoàn tiền (Dành cho BE 4 sau này)
   * Hiện tại chưa implement, trả về false
   */
  async processRefund(
    transactionId: string,
    amount: number,
    transDate: string,
  ): Promise<boolean> {
    // TODO: Implement refund logic theo tài liệu VNPay
    // API: https://sandbox.vnpayment.vn/merchant_webapi/api/transaction
    // Command: refund

    process.env.TZ = 'Asia/Ho_Chi_Minh';
    let date = new Date();

    let vnp_TmnCode = this.vnp_TmnCode;
    let secretKey = this.vnp_HashSecret;
    let vnp_Api =
      'https://sandbox.vnpayment.vn/merchant_webapi/api/transaction';

    let vnp_TxnRef = transactionId;
    let vnp_TransactionDate = transDate;
    let vnp_Amount = amount * 100; // VNPay yêu cầu nhân 100
    let vnp_TransactionType = '02'; // Hoàn trả toàn phần = 02, một phần = 03
    let vnp_CreateBy = 'system';

    let currCode = 'VND';

    let vnp_RequestId = crypto.randomUUID();
    let vnp_Version = '2.1.0';
    let vnp_Command = 'refund';
    let vnp_OrderInfo = 'Hoan tien GD ma:' + vnp_TxnRef;

    // let vnp_IpAddr =
    //   req.headers['x-forwarded-for'] ||
    //   req.connection.remoteAddress ||
    //   req.socket.remoteAddress ||
    //   req.connection.socket.remoteAddress;
    let vnp_IpAddr = '127.0.0.1';

    let vnp_CreateDate = moment(date).format('YYYYMMDDHHmmss');

    let vnp_TransactionNo = '0';

    let data =
      vnp_RequestId +
      '|' +
      vnp_Version +
      '|' +
      vnp_Command +
      '|' +
      vnp_TmnCode +
      '|' +
      vnp_TransactionType +
      '|' +
      vnp_TxnRef +
      '|' +
      vnp_Amount +
      '|' +
      vnp_TransactionNo +
      '|' +
      vnp_TransactionDate +
      '|' +
      vnp_CreateBy +
      '|' +
      vnp_CreateDate +
      '|' +
      vnp_IpAddr +
      '|' +
      vnp_OrderInfo;
    let hmac = crypto.createHmac('sha512', secretKey);
    let vnp_SecureHash = hmac.update(Buffer.from(data, 'utf-8')).digest('hex');

    let dataObj = {
      vnp_RequestId: vnp_RequestId,
      vnp_Version: vnp_Version,
      vnp_Command: vnp_Command,
      vnp_TmnCode: vnp_TmnCode,
      vnp_TransactionType: vnp_TransactionType,
      vnp_TxnRef: vnp_TxnRef,
      vnp_Amount: vnp_Amount,
      vnp_TransactionNo: vnp_TransactionNo,
      vnp_CreateBy: vnp_CreateBy,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_TransactionDate: vnp_TransactionDate,
      vnp_CreateDate: vnp_CreateDate,
      vnp_IpAddr: vnp_IpAddr,
      vnp_SecureHash: vnp_SecureHash,
    };

    try {
      const res = await fetch(vnp_Api, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataObj),
      });

      const json = await res.json();

      if (json.vnp_ResponseCode == '00' && this.verifySignature(json)) {
        console.log(json);
        return true;
      }
    } catch (err) {
      console.log(err);
      return false;
    }

    return false;
  }
}
