import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { hashPassword } from '../common/password';
import { paginate } from '../common/dto/pagination.dto';
import { CreateUserDto, UpdateUserDto, UserQueryDto } from './dto/user.dto';

/** Không bao giờ trả passwordHash ra ngoài API. */
const publicUser = {
  id: true,
  email: true,
  fullName: true,
  role: true,
  isActive: true,
  createdAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: UserQueryDto) {
    const where: Prisma.UserWhereInput = {
      role: q.role,
      OR: q.search
        ? [
            { email: { contains: q.search, mode: 'insensitive' } },
            { fullName: { contains: q.search, mode: 'insensitive' } },
          ]
        : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: publicUser,
        orderBy: { id: 'asc' },
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginate(items, total, q);
  }

  async create(dto: CreateUserDto) {
    const exists = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (exists) throw new ConflictException('Email đã được sử dụng');
    return this.prisma.user.create({
      data: {
        email: dto.email,
        fullName: dto.fullName,
        role: dto.role,
        passwordHash: await hashPassword(dto.password),
      },
      select: publicUser,
    });
  }

  async update(id: number, dto: UpdateUserDto, actorId: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('Không tìm thấy người dùng');

    // Admin không tự hạ quyền hoặc tự khoá mình để hệ thống luôn còn người quản trị.
    if (id === actorId && (dto.role === 'TESTER' || dto.isActive === false)) {
      throw new BadRequestException('Không thể tự hạ quyền hoặc tự khoá tài khoản của chính mình');
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        isActive: dto.isActive,
        passwordHash: dto.password ? await hashPassword(dto.password) : undefined,
      },
      select: publicUser,
    });
  }
}
