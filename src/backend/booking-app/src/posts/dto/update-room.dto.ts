import { IsEnum, IsNumber, IsOptional, IsString, IsBoolean } from 'class-validator';
import { RoomTypeEnum } from '../../room/entities/room.entity';
import { Type } from 'class-transformer';

export class UpdateRoomDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  area?: number;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  ward?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pricePerMonth?: number;

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
  imageUrls?: string[];

  @IsOptional()
  amenityIds?: number[];
}
