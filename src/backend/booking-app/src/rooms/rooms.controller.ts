import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

import { FilterRoomDto } from './dto/filter-room.dto';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Get()
  async findAll(@Query() filter: FilterRoomDto) {
    const rooms = await this.roomsService.findAll(filter);
    return {
      success: true,
      data: rooms,
    };
  }
  
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const room = await this.roomsService.findOne(id);
    return {
      success: true,
      data: room,
    };
  }
}