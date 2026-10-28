import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';

export const ROLES_KEY = 'roles';
/** Giới hạn route cho các vai trò được liệt kê. Không gắn = mọi người đã đăng nhập. */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
