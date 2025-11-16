import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PostsService } from './posts.service'; 
import { PaginationDto } from './dto/pagination.dto';
import { CreateRoomDto } from './dto/create-room.dto';


@Controller('posts')
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Get('/my-listings')
    @UseGuards(JwtAuthGuard)
    async getMyListings(
        @Request() req,
        @Query() pagination: PaginationDto,
        // @Query('page') page = 1,
        // @Query('limit') limit = 10,
    ) {
      const hostId = req.user.id; // lấy từ JWT
      return this.postsService.getMyListings(hostId, pagination);
      // return this.postsService.getMyListings(hostId, +page, +limit);
    }

    @Post()
    @UseGuards(JwtAuthGuard)
    async createPost(
      @Request() req, 
      @Body() dto: CreateRoomDto
    ) {
      const hostId = req.user.id; 
      return await this.postsService.createRoom(hostId, dto);
    }
}
