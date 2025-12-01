import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { ModerationStatus, RoomTypeEnum } from '../../room/entities/room.entity';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNumber()
  @Type(() => Number)
  area: number;

  @IsString()
  address: string;

  @IsString()
  ward: string;

  @IsString()
  district: string;

  @IsString()
  city: string;

  @IsNumber()
  @Type(() => Number)
  pricePerMonth: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  deposit?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  guestCapacity?: number;

  @IsOptional()
  @IsEnum(RoomTypeEnum)
  roomType?: RoomTypeEnum;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  minLeaseTerm?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  electricityPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  waterPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  wifiPrice?: number;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  parkingFee?: number;

  @IsOptional()
  @IsBoolean()
  cookingAllowed?: boolean;

  @IsOptional()
  @IsBoolean()
  petAllowed?: boolean;

  @IsOptional()
  @IsEnum(ModerationStatus)
  moderationStatus?: ModerationStatus; // DRAFT hoặc PENDING

  @IsOptional()
  imageUrls?: string[];

  @IsOptional()
  amenityIds?: number[];
}
