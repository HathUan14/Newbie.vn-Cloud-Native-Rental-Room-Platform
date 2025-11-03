import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './entities/room.entity';

@Injectable()
export class RoomsService {
  constructor(
    @InjectRepository(Room)
    private readonly roomsRepository: Repository<Room>,
  ) {}

  async findAll() {
    return await this.roomsRepository.find({
      relations: ['host'], 
    });
  }

  async findOne(id: number) {
    
    const room =  await this.roomsRepository.findOne({
      where: { id },
      //Lấy tên của property trong room.entity khi truy vấn phòng
      relations: ['host','roomType', 'images', 'roomAmenities'],
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