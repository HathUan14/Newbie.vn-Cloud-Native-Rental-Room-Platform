import {
  Body,
  Controller,
  Get,
  Post,
  Res,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import type { Response, Request } from 'express';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dto/register-user.dto';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtRefreshGuard } from './guards/jwt-refresh.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() registerDto: RegisterUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.register(registerDto);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Register successfully',
      user: result.user,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() loginDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.authService.login(loginDto);

    res.cookie('access_token', result.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Login successfully',
      user: result.user,
    };
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    const userId = req['payload'].sub;

    const token = await this.authService.refresh(userId);

    res.cookie('access_token', token.access_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 60 * 60 * 1000,
    });

    res.cookie('refresh_token', token.refresh_token, {
      httpOnly: true,
      secure: false,
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return {
      message: 'Refresh successfully',
      token: token,
    };
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  async me(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    const userId = req['payload'].sub;

    console.log(userId);

    const user = await this.authService.me(userId);

    return {
      message: 'Get user successfully',
      user: user,
    };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response, @Req() req: Request) {
    res.clearCookie('refresh_token');
    res.clearCookie('access_token');
    return {
      message: 'Logout successfully',
    };
  }
}
