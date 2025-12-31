import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReviewService } from './review.service';
import { ReviewController } from './review.controller';
import { Review } from './entities/review.entity';
import { Transaction } from '../payment/entities/transaction.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Room } from '../room/entities/room.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Transaction, Booking, Room])],
  controllers: [ReviewController],
  providers: [ReviewService],
})
export class ReviewModule {}
