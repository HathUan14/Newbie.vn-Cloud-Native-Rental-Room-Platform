import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';
import { FilterRoomDto } from './dto/filter-room.dto';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async findAll(filter: FilterRoomDto) {
    try {
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

      if (minPrice && maxPrice && minPrice > maxPrice) {
        throw new BadRequestException('minPrice cannot be greater than maxPrice');
      }

      if (minArea && maxArea && minArea > maxArea) {
        throw new BadRequestException('minArea cannot be greater than maxArea');
      }

      const query = this.roomsRepository
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.roomType', 'roomType')
        .leftJoinAndSelect('room.roomAmenities', 'roomAmenity')
        .leftJoinAndSelect('roomAmenity.amenity', 'amenity')
        .leftJoinAndSelect('room.images', 'images')
        .where('room.status = :status', { status: 'available' }); // Chỉ lấy phòng available

      if (keyword) {
        query.andWhere(
          '(room.title ILIKE :keyword OR room.description ILIKE :keyword OR room.addressStreet ILIKE :keyword)',
          { keyword: `%${keyword}%` },
        );
      }

      // Location filters
      if (city) query.andWhere('room.city ILIKE :city', { city: `%${city}%` });
      if (district) query.andWhere('room.district ILIKE :district', { district: `%${district}%` });
      if (ward) query.andWhere('room.ward ILIKE :ward', { ward: `%${ward}%` });

      // Price filter
      if (minPrice !== undefined) {
        query.andWhere('room.pricePerMonth >= :minPrice', { minPrice });
      }
      if (maxPrice !== undefined) {
        query.andWhere('room.pricePerMonth <= :maxPrice', { maxPrice });
      }

      // Area filter
      if (minArea !== undefined) {
        query.andWhere('room.area_sqm >= :minArea', { minArea });
      }
      if (maxArea !== undefined) {
        query.andWhere('room.area_sqm <= :maxArea', { maxArea });
      }

      // Room type
      if (roomTypeId) {
        query.andWhere('room.roomTypeId = :roomTypeId', { roomTypeId });
      }

      // Host
      if (hostId) {
        query.andWhere('room.hostId = :hostId', { hostId });
      }

      // Amenities filter 
      if (amenities) {
        const amenityIds = amenities
          .split(',')
          .map((id) => Number(id.trim()))
          .filter((id) => !isNaN(id) && id > 0);

        if (amenityIds.length > 0) {
          const subQuery = this.roomsRepository
            .createQueryBuilder('sub_room')
            .select('sub_room.id')
            .innerJoin('sub_room.roomAmenities', 'ra')
            .where('ra.amenity_id IN (:...amenityIds)', { amenityIds })
            .groupBy('sub_room.id')
            .having('COUNT(DISTINCT ra.amenity_id) = :count', { count: amenityIds.length });

          query.andWhere(`room.id IN (${subQuery.getQuery()})`);
          query.setParameters(subQuery.getParameters());
        }
      }

      if (sort) {
        const [field, order] = sort.split(':');
        const allowedFields = ['pricePerMonth', 'area_sqm', 'createdAt'];
        const allowedOrders = ['ASC', 'DESC'];

        if (allowedFields.includes(field) && allowedOrders.includes(order?.toUpperCase())) {
          query.orderBy(`room.${field}`, order.toUpperCase() as 'ASC' | 'DESC');
        } else {
          query.orderBy('room.createdAt', 'DESC');
        }
      } else {
        query.orderBy('room.createdAt', 'DESC');
      }

      const offset = (page - 1) * limit;
      query.skip(offset).take(limit);

      const [rooms, total] = await query.getManyAndCount();

      return {
        success: true,
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit),
        hasNextPage: page < Math.ceil(total / limit),
        hasPrevPage: page > 1,
        data: rooms.map((room) => ({
          id: room.id,
          title: room.title,
          description: room.description,
          price: Number(room.pricePerMonth),
          size: room.area_sqm,
          location: `${room.ward}, ${room.district}, ${room.city}`,
          address: room.addressStreet,
          status: room.status,
          roomType: room.roomType?.name,
          amenities: room.roomAmenities?.map((ra) => ({
            id: ra.amenity.id,
            name: ra.amenity.name,
          })) || [],
          images: room.images?.map((img) => ({
            id: img.id,
            url: img.imageUrl,
            isThumbnail: img.isThumbnail,
          })) || [],
          rating: room.aiLocationRating || 0,
          available: room.status === 'available',
        })),
      };
    } catch (error) {
      if (error instanceof BadRequestException || error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Invalid filter parameters');
    }
  }

  async findOne(id: number) {
    const room = await this.roomsRepository.findOne({
      where: { id },
      relations: [
        'host',
        'roomType',
        'images',
        'roomAmenities',
        'roomAmenities.amenity',
      ],
    });

    if (!room) {
      throw new NotFoundException(`Room with ID ${id} not found`);
    }

    return room
  }
}