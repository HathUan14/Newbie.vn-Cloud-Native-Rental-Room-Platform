import {
  Body,
  Controller,
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
    const payload = req.user;

    const token = await this.authService.refresh(payload);

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

  @Post('me')
  async me() {
    // Todo
    return 'me';
  }

  @Post('logout')
  @UseGuards()
  async logout() {
    // Todo
    return 'logout';
  }
}
