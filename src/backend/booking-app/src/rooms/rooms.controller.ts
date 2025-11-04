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
    return this.roomsService.findAll(filter);
  }
  
  //Dùng JwtAuthGuard để bảo vệ route, đòi hỏi người dùng phải xác thực trước khi truy cập
  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.roomsService.findOne(id);
  }
}