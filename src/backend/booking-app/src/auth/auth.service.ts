
import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterUserDto } from './dto/register-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository } from 'typeorm';
import { User } from '../users/user.entity';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
    ){}
        async register(registerUserDto: RegisterUserDto) {
        // Logic to register a user
        const existing = await this.userRepository.findOne({where: {email: registerUserDto.email}});
        if (existing) {
            throw new BadRequestException('Email is already in use');
        }
        //Check if email is in use
        //Hash password
        const hashed = await bcrypt.hash(registerUserDto.password, 10);
        //Create user record and save to database
        const newUser=this.userRepository.create({
            email: registerUserDto.email,
            fullName: registerUserDto.username,
            passwordHash: hashed,
        })
        await this.userRepository.save(newUser);

        //Trả về
        return {
            message: 'User registered successfully',
            user: { id: newUser.id, email: newUser.email, name: newUser.fullName },
        };

    }
}
