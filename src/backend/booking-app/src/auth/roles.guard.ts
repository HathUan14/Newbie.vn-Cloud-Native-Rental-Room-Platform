// // roles.guard.ts
// import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
// import { Reflector } from '@nestjs/core';

// @Injectable()
// export class RolesGuard implements CanActivate {
//   constructor(private reflector: Reflector) {}

//   canActivate(context: ExecutionContext): boolean {
//     const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
//     if (!requiredRoles || requiredRoles.length === 0) {
//       return true; // No roles required
//     }

//     const { user } = context.switchToHttp().getRequest();

//     //Chưa xử lý trường hợp user có cả isAdmin và isHost là true
//     //Tạm thời chặn quyền truy cập nếu có cả 2 role
//     if (user.isAdmin && user.isHost) {
//       throw new ForbiddenException('Bạn không có quyền truy cập endpoint này');
//     }
//     const userRole = user.isAdmin
//       ? 'ADMIN'
//       : user.isHost
//       ? 'HOST'
//       : 'GUEST';

//     if (!requiredRoles.includes(userRole)) {
//       throw new ForbiddenException('Bạn không có quyền truy cập endpoint này');
//     }
//     return true;
//   }
// }
