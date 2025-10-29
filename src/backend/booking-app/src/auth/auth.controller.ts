import {Body, Controller, Post} from '@nestjs/common';
import {AuthService} from './auth.service';
import {RegisterUserDto} from './dto/register-user.dto';    

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}
    //POST Register User
    @Post('register')
    async register(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.register(registerUserDto);
    }
}