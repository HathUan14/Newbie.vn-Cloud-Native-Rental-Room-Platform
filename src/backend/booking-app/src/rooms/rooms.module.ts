import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';

import { Room } from './entities/room.entity';
import { RoomType } from './entities/room-type.entity'; 
import { RoomImage } from './entities/room-image.entity'; 
import { RoomAmenity } from './entities/room-amenity.entity';
import { Amenity } from './entities/amenity.entity'; // ✅ Import Amenity entity

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Room, 
      RoomType, 
      RoomImage, 
      RoomAmenity,
      Amenity, 
    ]),
  ],
  controllers: [RoomsController],
  providers: [RoomsService],
  exports: [TypeOrmModule, RoomsService], 
})
export class RoomsModule {}