// src/auth/dto/register-user.dto.ts
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { AuthProvider } from '../../users/user.entity';

export class RegisterUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  fullName: string;

  @IsString()
  @IsNotEmpty()
  password: string; // người dùng nhập plaintext, sau đó service sẽ hash

  @IsOptional()
  authProvider?: AuthProvider = AuthProvider.LOCAL;
}
