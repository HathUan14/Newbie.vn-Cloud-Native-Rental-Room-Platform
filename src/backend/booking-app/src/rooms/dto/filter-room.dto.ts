import { IsOptional, IsNumberString, IsString } from 'class-validator';

export class FilterRoomDto {
  @IsOptional() @IsString()
  city?: string;

  @IsOptional() @IsString()
  district?: string;

  @IsOptional() @IsString()
  ward?: string;

  @IsOptional() @IsNumberString()
  minPrice?: number;

  @IsOptional() @IsNumberString()
  maxPrice?: number;

  @IsOptional() @IsNumberString()
  minArea?: number;

  @IsOptional() @IsNumberString()
  maxArea?: number;

  @IsOptional() @IsNumberString()
  roomTypeId?: number;

  @IsOptional() @IsNumberString()
  hostId?: number;

  @IsOptional() @IsString()
  amenities?: string; // chuỗi các amenitiesId như "1,2,3"

  @IsOptional() @IsString()
  sort?: string; // ví dụ: "pricePerMonth:ASC"

  @IsOptional() @IsNumberString()
  page?: number;

  @IsOptional() @IsNumberString()
  limit?: number;

  @IsOptional() @IsString()
  keyword?: string; // tìm nâng cao theo tiêu đề, mô tả
}
