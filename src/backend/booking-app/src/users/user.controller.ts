import {
    Controller,
    Patch,
    Body,
    Req,
    UseInterceptors,
    UploadedFile,
    UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('users')
export class UsersController {
    constructor(private readonly usersService: UsersService) { }

    @Patch('profile')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('avatar'))
    async updateProfile(
        @Req() req,
        @Body() updateUserDto: UpdateUserDto,
        @UploadedFile() file: Express.Multer.File,
    ) {

        const userId = req.user.id;

        return await this.usersService.updateProfile(userId, updateUserDto, file);
    }
}
