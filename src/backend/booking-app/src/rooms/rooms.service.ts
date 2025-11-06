import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, SelectQueryBuilder } from 'typeorm';
import { Room } from './entities/room.entity';

import { FilterRoomDto } from './dto/filter-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) { }

  // async findAll() {
  //   return await this.roomsRepository.find({
  //     relations: ['host'], 
  //   });
  // }

  // Rooms filter config
  async findAll(filter: FilterRoomDto) {
    const {
      city,
      district,
      ward,
      minPrice,
      maxPrice,
      minArea,
      maxArea,
      roomTypeId,
      hostId,
      amenities,
      sort,
      page = 1,
      limit = 10,
      keyword,
    } = filter;

    const query = this.roomsRepository
      .createQueryBuilder('room')
      .leftJoinAndSelect('room.roomType', 'roomType')
      .leftJoinAndSelect('room.roomAmenities', 'roomAmenity')
      .leftJoinAndSelect('roomAmenity.amenity', 'amenity')
      .leftJoinAndSelect('room.images', 'images')
      .where('1=1');

    // Keyword search (theo tên bài đăng, mô tả, tên đường - đây là nội dung chủ quan)
    if (keyword) {
      query.andWhere(
        '(room.title ILIKE :keyword OR room.description ILIKE :keyword OR room.addressStreet ILIKE :keyword)',
        { keyword: `%${keyword}%` },
      );
    }

    // Location filter (city, district, ward)
    if (city) query.andWhere('room.city ILIKE :city', { city: `%${city}%` });
    if (district) query.andWhere('room.district ILIKE :district', { district: `%${district}%` });
    if (ward) query.andWhere('room.ward ILIKE :ward', { ward: `%${ward}%` });

    // Price filter
    if (minPrice) query.andWhere('room.pricePerMonth >= :minPrice', { minPrice });
    if (maxPrice) query.andWhere('room.pricePerMonth <= :maxPrice', { maxPrice });

    // Area filter
    if (minArea) query.andWhere('room.area_sqm >= :minArea', { minArea });
    if (maxArea) query.andWhere('room.area_sqm <= :maxArea', { maxArea });

    // Room type
    if (roomTypeId) query.andWhere('room.roomTypeId = :roomTypeId', { roomTypeId });

    // HostId
    if (hostId) query.andWhere('room.hostId = :hostId', { hostId });

    // Amenities filter (bộ lọc gồm các amenitiesId ngăn cách bởi dấu phẩy)
    if (amenities) {
      const amenityIds = amenities.split(',').map((id) => Number(id.trim()));
      amenityIds.forEach((id) => {
        query.andWhere(
          (qb: SelectQueryBuilder<Room>) =>
            `EXISTS (
              SELECT 1 FROM room_amenities ra
              WHERE ra.room_id = room.id AND ra.amenity_id = ${id}
            )`,
        );
      });
    }

    // 🔄 Sorting (theo 3 biến: pricePerMonth, area_sqm, createdAt)
    if (sort) {
      const [field, order] = sort.split(':');
      const allowedFields = ['pricePerMonth', 'area_sqm', 'createdAt'];
      if (allowedFields.includes(field)) {
        query.orderBy(`room.${field}`, order?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC');
      }
    } else {
      query.orderBy('room.createdAt', 'DESC');
    }

    // 📄 Pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    // 🧾 Result
    const [rooms, total] = await query.getManyAndCount();

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
      data: rooms,
    };
  }


  async findOne(id: number) {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: [
        'host',
        'roomType',
        'images',
        'roomAmenities',
        'roomAmenities.amenity'
      ],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room;
  }

  async create(createRoomDto: any, hostId: number) {
    const room = this.roomsRepository.create({
      ...createRoomDto,
      host: { id: hostId },
    });
    return await this.roomsRepository.save(room);
  }

  async update(id: number, updateRoomDto: any) {
    await this.roomsRepository.update(id, updateRoomDto);
    return this.findOne(id);
  }

  async remove(id: number) {
    await this.roomsRepository.delete(id);
    return { deleted: true };
  }
}