import { Controller, Get, Post, Body, Patch, Param, Delete, UseInterceptors, UseGuards } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { CreateDisputeDto } from './dto/create-dispute.dto';
import { UpdateDisputeDto } from './dto/update-dispute.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller('dispute')
export class DisputeController {
  constructor(private readonly disputeService: DisputeService) {}

  //Viết controller cho các chức năng của disputeService tương tự như trong booking.controller.ts
  @Post('create')
  async create(@Body() createDisputeDto: CreateDisputeDto, @Body('renterId') renterId: number) {
    const data = await this.disputeService.createDispute(createDisputeDto, renterId);
    return { success: true, msg: 'Dispute created successfully', data };
  }

  @Get('pending')
  async findOne(@Param('id') id: string) {
    const data = await this.disputeService.getPendingDisputes();
    return { success: true, data };
  }
  
}
