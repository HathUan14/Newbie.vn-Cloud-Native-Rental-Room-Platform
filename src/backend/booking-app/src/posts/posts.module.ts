import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthModule } from '../auth/auth.module';
import { Room } from '../rooms/entities/room.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Room])
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
