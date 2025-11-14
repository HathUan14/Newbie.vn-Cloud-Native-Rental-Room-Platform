import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
// export class JwtAuthGuard implements CanActivate {
//   constructor(
//     private jwtService: JwtService,
//     protected configService: ConfigService,
//   ) {}

//   canActivate(context: ExecutionContext): boolean {
//     const req = context.switchToHttp().getRequest<Request>();

//     const accessToken = req.cookies?.access_token;
//     if (!accessToken) throw new UnauthorizedException('No access token');

//     try {
//       const payload = this.jwtService.verify(accessToken, {
//         secret: this.configService.get('JWT_SECRET'),
//       });

//       req['payload'] = payload;
//       return true;
//     } catch (error) {
//       throw new UnauthorizedException(
//         'Access token has been expired or invalid',
//       );
//     }
//   }
// }
