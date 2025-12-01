import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { AuthModule } from '../auth/auth.module';
import { Room } from '../room/entities/room.entity';
import { RoomImage } from '../room/entities/room-image.entity';
import { RoomAmenity } from '../room/entities/room-amenity.entity';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Room, RoomImage, RoomAmenity])
  ],
  controllers: [PostsController],
  providers: [PostsService],
})
export class PostsModule {}
