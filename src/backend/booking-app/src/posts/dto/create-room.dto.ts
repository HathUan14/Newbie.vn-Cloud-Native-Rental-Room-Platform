import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { ModerationStatus } from '../../rooms/entities/room.entity';


export class CreateRoomDto {
  @IsString()
  title: string;

  @IsString()
  description?: string;

  @IsNumber()
  area_sqm: number;

  @IsString()
  addressStreet: string;

  @IsString()
  ward: string;

  @IsString()
  district: string;

  @IsString()
  city: string;

  @IsNumber()
  pricePerMonth: number;

  @IsNumber()
  depositAmount: number;

  @IsNumber()
  guestCapacity: number;

  @IsOptional()
  @IsString()
  alleyDescription?: string;

  @IsNumber()
  roomTypeId: number;

  @IsEnum(ModerationStatus)
  moderationStatus: ModerationStatus; // DRAFT hoặc PENDING

  @IsOptional()
  imageUrls?: string[];
}
