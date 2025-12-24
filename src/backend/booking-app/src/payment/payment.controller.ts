import { Controller, Post, Get, Body, Query, Req } from '@nestjs/common';
import { PaymentService } from './payment.service';
import type { Request } from 'express';
import { CreatePaymentDto } from './dto/create-payment.dto';


@Controller('payment')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}
  @Post('create-vnpay-url')
  async createVnpayPaymentUrl(@Body() dto: CreatePaymentDto, @Req() req: Request) {
    const ipAddr = (req.headers['x-forwarded-for'] as string) ||
      req.socket.remoteAddress ||
      '127.0.0.1';

    const orderId = dto.orderId || `ORDER${Date.now()}`;
    
    const orderInfo = dto.orderInfo || `Thanh toan cho ma GD: ${orderId}`;

    const paymentUrl = await this.paymentService.createVnpayPaymentUrl({
      amount: dto.amount,
      orderId,
      orderInfo,
      bankCode: dto.bankCode,
      language: dto.language,
      ipAddr,
    });

    return {
      success: true,
      paymentUrl,
      message: 'Tạo URL thanh toán thành công',
    };
  }


}
