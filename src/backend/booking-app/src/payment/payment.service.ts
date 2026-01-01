import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { VnpayService } from './gateways/vnpay.service';
import { CreatePaymentUrlDto } from './interfaces/payment-gateway.interface';
import { Transaction } from './entities/transaction.entity';
import { TransactionStatus, TransactionType, PaymentMethod } from './payment.constant';
import { BookingService } from '../booking/booking.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly vnpayService: VnpayService,
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    private readonly bookingService: BookingService,
  ) {}

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
   * Tạo transaction record trong database
   */
  async createTransaction(
    bookingId: number,
    userId: number,
    amount: number,
    orderId: string,
    description: string,
  ): Promise<Transaction> {
    const transaction = this.transactionRepo.create({
      bookingId,
      userId,
      amount,
      paymentMethod: PaymentMethod.VNPAY,
      status: TransactionStatus.PENDING,
      type: TransactionType.DEPOSIT,
      gatewayTransactionId: orderId,
      description,
    });
    return await this.transactionRepo.save(transaction);
  }

  /**
   * Cập nhật transaction sau khi nhận callback từ VNPay
   */
  async updateTransactionStatus(
    orderId: string,
    status: TransactionStatus,
    gatewayTransactionId?: string,
  ): Promise<Transaction> {
    const transaction = await this.transactionRepo.findOne({
      where: { gatewayTransactionId: orderId },
      relations: ['booking'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    transaction.status = status;
    if (gatewayTransactionId) {
      transaction.gatewayTransactionId = gatewayTransactionId;
    }

    return await this.transactionRepo.save(transaction);
  }

  /**
   * Xử lý thanh toán thành công - cập nhật booking status
   */
  async processSuccessfulPayment(orderId: string, vnpayTransactionNo: string): Promise<void> {
    const transaction = await this.transactionRepo.findOne({
      where: { gatewayTransactionId: orderId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === TransactionStatus.SUCCESS) {
      return; // Đã xử lý rồi
    }

    // Cập nhật transaction với vnpayTransactionNo
    transaction.status = TransactionStatus.SUCCESS;
    await this.transactionRepo.save(transaction);

    // Cập nhật booking thành CONFIRMED
    await this.bookingService.confirmBooking(transaction.bookingId);
  }

  /**
   * Xử lý hoàn tiền
   */
  // async processRefund(
  //   bookingId: number,
  //   amount: number,
  // ): Promise<{ success: boolean; message: string }> {
  //   // Lấy transaction gốc để lấy vnp_TransactionNo và transDate
  //   const originalTransaction = await this.transactionRepo.findOne({
  //     where: {
  //       bookingId,
  //       type: TransactionType.DEPOSIT,
  //       status: TransactionStatus.SUCCESS,
  //     },
  //     order: { createdAt: 'DESC' },
  //   });

  //   if (!originalTransaction || !originalTransaction.gatewayTransactionId) {
  //     throw new NotFoundException(
  //       'Không tìm thấy giao dịch thanh toán gốc để hoàn tiền',
  //     );
  //   }

  //   if (!originalTransaction.vnpayTransactionNo) {
  //     throw new NotFoundException(
  //       'Không tìm thấy mã giao dịch VNPay. Có thể thanh toán chưa hoàn tất.',
  //     );
  //   }

  //   // Lấy orderId (vnp_TxnRef) từ transaction
  //   const orderId = originalTransaction.gatewayTransactionId;

  //   // Format transDate từ createdAt của transaction gốc
  //   const transDate = new Date(originalTransaction.createdAt)
  //     .toISOString()
  //     .replace(/[-:T]/g, '')
  //     .substring(0, 14); // YYYYMMDDHHmmss

  //   // Dùng vnpayTransactionNo đã lưu từ callback
  //   const vnpayTransactionNo = originalTransaction.vnpayTransactionNo;

  //   console.log('=== Refund Info ===');
  //   console.log('Original Transaction ID:', originalTransaction.id);
  //   console.log('Order ID (vnp_TxnRef):', orderId);
  //   console.log('Trans Date:', transDate);
  //   console.log('VNPay Trans No:', vnpayTransactionNo);
  //   console.log('Refund Amount:', amount);

  //   return await this.vnpayService.processRefund(
  //     orderId,
  //     amount,
  //     transDate,
  //     vnpayTransactionNo,
  //   );
  // }
}