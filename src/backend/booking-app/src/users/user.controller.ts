import {
    Controller,
    Patch,
    Body,
    Req,
    HttpCode,
    HttpStatus,
    UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch('profile')
    @HttpCode(HttpStatus.OK)
    @UseGuards(JwtAuthGuard)
    async updateProfile(
        @Req() req: Request,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        // Lấy userId từ payload JWT
        const userId = req['payload'].sub;

        // Update user
        const updatedUser = await this.usersService.updateUser(userId, updateUserDto);

        return {
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser,
        };
    }
}
