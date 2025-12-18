import { forwardRef, Module } from '@nestjs/common';
import { BookingService } from './booking.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingController } from './booking.controller';
import { AuthModule } from '../auth/auth.module';
import { Booking } from './entities/booking.entity';
import { User } from '../users/user.entity';
import { Room } from '../room/entities/room.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([Booking, User, Room]),
    forwardRef(() => AuthModule),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
