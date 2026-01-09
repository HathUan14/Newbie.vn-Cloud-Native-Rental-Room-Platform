import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
  Query,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { AiService } from './ai.service';

// DTOs
class ChatRequestDto {
  @IsString()
  message: string;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  roomId?: number;
}

class GeneralChatRequestDto {
  @IsString()
  message: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  /**
   * Chat với AI về thông tin phòng cụ thể
   * POST /ai/chat
   */
  @Post('chat')
  @HttpCode(HttpStatus.OK)
  async chat(@Body() body: ChatRequestDto) {
    if (!body.message || body.message.trim() === '') {
      throw new BadRequestException('Vui lòng nhập tin nhắn');
    }

    let response: string;

    if (body.roomId) {
      // Chat về phòng cụ thể
      response = await this.aiService.chatWithGemini(body.message, body.roomId);
    } else {
      // Chat tổng quát
      response = await this.aiService.chatGeneral(body.message);
    }

    return {
      success: true,
      data: {
        message: response,
        roomId: body.roomId || null,
      },
    };
  }


}