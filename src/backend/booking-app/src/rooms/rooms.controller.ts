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
} from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('rooms')
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}
  
  //Dùng JwtAuthGuard để bảo vệ route, đòi hỏi người dùng phải xác thực trước khi truy cập
  //@UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number){
    return this.roomsService.findOne(id);
  }
}