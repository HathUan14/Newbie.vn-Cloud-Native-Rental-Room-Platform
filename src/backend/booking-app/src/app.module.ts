import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';

import { RoomsModule } from './room/rooms.module';
import { Room } from './room/entities/room.entity';
import { PostsModule } from './posts/posts.module';
//import { AdminModerationModule } from './admin-moderation/admin-mod.module';

import { MailerModule } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import { BookingModule } from './booking/booking.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: true,
      }),
      inject: [ConfigService],
    }),

    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        port: 465,
        secure: true, 
        auth: {
          user: 'nakrothnguyen127@gmail.com', 
          pass: 'ldcv jqxm iewu qddu',    
        },
      },
      defaults: {
        from: '"No Reply - PhongTro.vn" <nakrothnguyen127@gmail.com>',
      },
      template: {
        dir: join(process.cwd(), 'src/mail/templates'),
        adapter: new HandlebarsAdapter(),
        options: {
          strict: true,
        },
      },
    }),

    UsersModule,
    AuthModule,
    RoomsModule,
    PostsModule,
    BookingModule,
    //AdminModerationModule
  ],
})
export class AppModule { }
