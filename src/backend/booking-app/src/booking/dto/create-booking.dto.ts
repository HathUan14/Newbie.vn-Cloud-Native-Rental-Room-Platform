import { IsDateString, IsEmpty, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus} from '../entities/booking.entity';

export class CreateBookingDto {
    @IsDateString()
    @IsNotEmpty()
    moveInDate: string;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    depositAmount: number;

    @IsInt()
    @Min(0)
    @Type(() => Number)
    totalPrice: number;

    @IsOptional()
    @IsEnum(BookingStatus)
    status?: BookingStatus;

    @IsOptional()
    @IsString()
    //Should be empty when creating a booking
    rejectReason?: string;

    @IsOptional()
    @IsString()
    // Should be empty when creating a booking
    cancelReason?: string;

}