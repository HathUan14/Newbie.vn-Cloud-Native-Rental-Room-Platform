// // src/rooms/admin-rooms.controller.ts
// import {
//     Controller,
//     Get,
//     Put,
//     Param,
//     Query,
//     Body,
//     UseGuards,
//     ParseIntPipe,
// } from '@nestjs/common';
// import { AdminRoomsService } from './admin-mod.service';
// import { JwtAuthGuard } from '../auth/jwt-auth.guard';
// import { RolesGuard } from '../auth/roles.guard';
// import { Roles } from '../auth/roles.decorator';
// import { RejectRoomsDto } from './dto/reject-rooms.dto';
// import { RequestEditDto } from './dto/request-edit.dto';

// @Controller('admin/posts')
// @UseGuards(JwtAuthGuard, RolesGuard)
// @Roles('ADMIN')
// export class AdminRoomsController {
//     constructor(private adminRooms: AdminRoomsService) { }

//     @Get('pending')
//     getPending(
//         @Query('page') page = 1,
//         @Query('limit') limit = 10,
//     ) {
//         return this.adminRooms.getPending(+page, +limit);
//     }

//     @Put('approve/:id')
//     approve(@Param('id', ParseIntPipe) id: number) {
//         return this.adminRooms.approve(id);
//     }

//     @Put('reject/:id')
//     reject(
//         @Param('id', ParseIntPipe) id: number,
//         @Body() dto: RejectRoomsDto,
//     ) {
//         return this.adminRooms.reject(id, dto.reason);
//     }

//     @Put('request-edit/:id')
//     requestEdit(
//         @Param('id', ParseIntPipe) id: number,
//         @Body() dto: RequestEditDto,
//     ) {
//         return this.adminRooms.requestEdit(id, dto.notes);
//     }
// }
