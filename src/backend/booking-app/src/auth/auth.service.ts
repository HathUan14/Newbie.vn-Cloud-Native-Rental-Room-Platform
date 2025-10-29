import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, AuthProvider } from '../users/user.entity';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async register(registerDto: RegisterUserDto): Promise<User> {
        const { email, fullName, password } = registerDto;

        // Kiểm tra email đã tồn tại chưa
        const existingUser = await this.usersRepository.findOne({ where: { email } });
        if (existingUser) {
        throw new BadRequestException('Email exists');
        }

        // Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Tạo user mới
        const user = this.usersRepository.create({
        email,
        fullName,
        passwordHash,
        authProvider: AuthProvider.LOCAL,
        isActive: true, // hoặc false nếu cần xác thực email
        });

        return this.usersRepository.save(user);
    }

    async login(loginDto: LoginUserDto): Promise<User> {
        const { email, password } = loginDto;

        // Lấy user + passwordHash (phải select vì mặc định bị exclude)
        const user = await this.usersRepository
        .createQueryBuilder('user')
        .addSelect('user.passwordHash')
        .where('user.email = :email', { email })
        .getOne();

        if (!user) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        // Kiểm tra mật khẩu
        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) throw new UnauthorizedException('Email hoặc mật khẩu không đúng');

        // Có thể thêm JWT tại đây (ví dụ: return token)
        return user;
    }
} 

