import { Injectable } from '@nestjs/common';
import { VnpayService } from './gateways/vnpay.service';
import { CreatePaymentUrlDto } from './interfaces/payment-gateway.interface';

@Injectable()
export class PaymentService {
  constructor(private readonly vnpayService: VnpayService) {}

  /**
   * Tạo URL thanh toán VNPay
   */
  async createVnpayPaymentUrl(dto: CreatePaymentUrlDto): Promise<string> {
    return await this.vnpayService.createPaymentUrl(dto);
  }

  /**
   * Xác thực callback từ VNPay
   */
  verifyVnpayCallback(params: any): boolean {
    return this.vnpayService.verifySignature(params);
  }

  /**
   * Xử lý hoàn tiền
   */
  async processRefund(
    transactionId: string,
    amount: number,
    transDate: string,
  ): Promise<boolean> {
    return await this.vnpayService.processRefund(
      transactionId,
      amount,
      transDate,
    );
  }
}
