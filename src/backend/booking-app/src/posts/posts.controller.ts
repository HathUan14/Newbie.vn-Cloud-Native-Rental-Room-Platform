import {
  Controller,
  Get,
  Post,
  Body,
  Put,
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
    
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    async updatePost(
      @Param('id') id: number,
      @Body() updateData: any,
      @Request() req,
    ) {
      const hostId = req.user.id; 
      return this.postsService.updatePost(hostId, id, updateData);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    async deletePost(
      @Param('id') id: number,
      @Request() req,
    ) {
      const hostId = req.user.id;
      return this.postsService.deletePost(hostId, id);
    }
}
