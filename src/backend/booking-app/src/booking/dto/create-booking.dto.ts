import { IsDateString, IsInt, IsNotEmpty } from 'class-validator';

export class CreateBookingDto {
  @IsInt()
  roomId: number;

  @IsDateString()
  date: string; // Theo sơ đồ lớp

  @IsDateString()
  moveInDate: string; // Theo sơ đồ lớp
}