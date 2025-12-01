import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room, RoomStatus, ModerationStatus } from '../room/entities/room.entity';
import { RoomImage } from '../room/entities/room-image.entity';
import { RoomAmenity } from '../room/entities/room-amenity.entity';
import { PaginationDto } from './dto/pagination.dto';
import { CreateRoomDto } from './dto/create-room.dto';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomRepository: Repository<Room>,

    @InjectRepository(RoomImage)
    private readonly imageRepo: Repository<RoomImage>,

    @InjectRepository(RoomAmenity)
    private readonly roomAmenityRepo: Repository<RoomAmenity>,
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
      relations: ['images', 'roomAmenities', 'roomAmenities.amenity'],
      select: {
        id: true,
        title: true,
        status: true,
        moderationStatus: true,  
        moderationNotes: true,
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

  async getMyListing(hostId: number, id: number) {
    const room = await this.roomRepository.findOne({
      where: { id, hostId },
      relations: ['images', 'roomAmenities', 'roomAmenities.amenity'],
    });

    if (!room) {
      throw new NotFoundException('Listing not found or you do not have access');
    }

    return room;
  }

  async createRoom(hostId: number, dto: CreateRoomDto) {
    const room = this.roomRepository.create({
      ...dto,
      hostId,
      status: RoomStatus.AVAILABLE,
      moderationStatus: dto.moderationStatus || ModerationStatus.PENDING,
    });
    const savedRoom = await this.roomRepository.save(room);

    // Upload images
    if (dto.imageUrls?.length) {
      const images = dto.imageUrls.map((url, index) =>
        this.imageRepo.create({
          roomId: savedRoom.id,
          imageUrl: url,
          isThumbnail: index === 0, // First image is thumbnail
        }),
      );
      await this.imageRepo.save(images);
    }

    // Add amenities
    if (dto.amenityIds?.length) {
      const amenities = dto.amenityIds.map((amenityId) =>
        this.roomAmenityRepo.create({
          roomId: savedRoom.id,
          amenityId,
        }),
      );
      await this.roomAmenityRepo.save(amenities);
    }

    return savedRoom;
  }

  async updatePost( userId: number, id: number, updateData: any) {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Post not found');
    // Kiểm tra quyền sở hữu
    if (room.hostId !== userId) {
      throw new ForbiddenException('You are not the owner of this post');
    }
    // Resubmit
    if (
      room.moderationStatus === ModerationStatus.REJECTED ||
      room.moderationStatus === ModerationStatus.NEEDS_EDIT ||
      room.moderationStatus === ModerationStatus.APPROVED
    ) {
      updateData.moderationStatus = ModerationStatus.PENDING;
    }
    Object.assign(room, updateData);
    return this.roomRepository.save(room);
  }

  async deletePost( userId: number, id: number) {
    const room = await this.roomRepository.findOne({ where: { id } });
    if (!room) throw new NotFoundException('Post not found');
    // kiểm tra quyền sở hữu
    if (room.hostId !== userId) {
      throw new ForbiddenException('You are not allowed to delete this post');
    }
    const result = await this.roomRepository.delete({ id: id });
    console.log(result);
    return { success: true, message: 'Post deleted successfully' };
  }

}
