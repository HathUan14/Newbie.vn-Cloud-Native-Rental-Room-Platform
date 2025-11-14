import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from '../rooms/entities/room.entity';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,
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
        moderationStatus: true,   // ⭐ thêm ở đây
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
}
