import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus } from '../rooms/entities/room.entity';
import { PaginationDto } from './dto/pagination.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    // @InjectRepository(RoomImage)
    // private readonly imageRepo: Repository<RoomImage>,
  ) {}

  async getMyListings(hostId: number, pagination: PaginationDto) {
    const page = Number(pagination.page) || 1;
    const limit = Number(pagination.limit) || 10;
    const skip = (page - 1) * limit;

    const [rooms, total] = await this.roomRepository.findAndCount({
      where: { hostId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip,
      relations: ['images', 'roomAmenities', 'roomType'],
      select: {
        id: true,
        title: true,
        status: true,
        moderationStatus: true,  
        pricePerMonth: true,
        district: true,
        city: true,
        createdAt: true,
      },
    });

    return {
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      data: rooms,
    };
  }

  async createRoom(hostId: number, dto: CreateRoomDto) {
    const room = this.roomRepository.create({
      ...dto,
      hostId,
      status: RoomStatus.AVAILABLE,
    });

    const savedRoom = await this.roomRepository.save(room);

    // Để implement tính năng upload ảnh
    //
    // if (dto.imageUrls?.length) {
    //   const images = dto.imageUrls.map((url) =>
    //     this.imageRepo.create({
    //       roomId: savedRoom.id,
    //       imageUrl: url,
    //     }),
    //   );
    //   await this.imageRepo.save(images);
    // }

    return savedRoom;
  }
}
