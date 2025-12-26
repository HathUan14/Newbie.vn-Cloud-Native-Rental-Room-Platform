import { Module } from '@nestjs/common';
import { DisputeService } from './dispute.service';
import { DisputeController } from './dispute.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Dispute } from './entities/dispute.entity';
import { Booking } from '../booking/entities/booking.entity';
import { User } from '../users/user.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Dispute, Booking, User])],
  controllers: [DisputeController],
  providers: [DisputeService],
})
export class DisputeModule {}
