import { IsOptional, IsString, IsPhoneNumber, IsNotEmpty } from 'class-validator';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  fullName?: string;

  @IsOptional()
  @IsPhoneNumber('VN')
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  avatarUrl?: string;
}
