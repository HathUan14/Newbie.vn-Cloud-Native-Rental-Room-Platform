// // src/rooms/admin-rooms.service.ts
// import { Injectable, NotFoundException } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Room, ModerationStatus } from '../room/entities/room.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class AdminRoomsService {
//     constructor(
//         @InjectRepository(Room)
//         private roomRepo: Repository<Room>,
//     ) { }

//     async getPending(page = 1, limit = 10) {
//         const take = Math.min(limit, 50);
//         const skip = (page - 1) * take;

//         const [data, total] = await this.roomRepo.findAndCount({
//             where: { moderationStatus: ModerationStatus.PENDING },
//             skip,
//             take,
//             order: { id: 'DESC' },
//         });

//         return {
//             data,
//             pagination: {
//                 total,
//                 page,
//                 limit: take,
//                 totalPages: Math.ceil(total / take),
//             },
//         };
//     }

//     private async find(id: number) {
//         const room = await this.roomRepo.findOne({ where: { id } });
//         if (!room) throw new NotFoundException('Room not found');
//         return room;
//     }

//     async approve(id: number) {
//         const room = await this.find(id);
//         room.moderationStatus = ModerationStatus.APPROVED;
//         room.moderationNotes = "";
//         return this.roomRepo.save(room);
//     }

//     async reject(id: number, reason: string) {
//         const room = await this.find(id);
//         room.moderationStatus = ModerationStatus.REJECTED;
//         room.moderationNotes = reason;
//         return this.roomRepo.save(room);
//     }

//     async requestEdit(id: number, notes: string) {
//         const room = await this.find(id);
//         room.moderationStatus = ModerationStatus.NEEDS_EDIT;
//         room.moderationNotes = notes;
//         return this.roomRepo.save(room);
//     }
// }
