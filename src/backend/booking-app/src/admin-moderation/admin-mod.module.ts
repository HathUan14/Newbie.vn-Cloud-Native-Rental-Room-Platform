// src/rooms/admin-rooms.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Room } from '../rooms/entities/room.entity';
import { AdminRoomsService } from './admin-mod.service';
import { AdminRoomsController } from './admin-mod.controller';
import { RolesGuard } from '../auth/roles.guard';
import { JwtStrategy } from '../auth/jwt.strategy';

@Module({
    imports: [TypeOrmModule.forFeature([Room])],
    controllers: [AdminRoomsController],
    providers: [AdminRoomsService, JwtStrategy, RolesGuard],
})
export class AdminModerationModule { }
