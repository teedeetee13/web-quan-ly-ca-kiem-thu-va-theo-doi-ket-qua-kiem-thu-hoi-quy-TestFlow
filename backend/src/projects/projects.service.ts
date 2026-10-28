import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { paginate } from '../common/dto/pagination.dto';
import { CreateProjectDto, ProjectQueryDto, UpdateProjectDto } from './dto/project.dto';

const withCounts = {
  _count: { select: { suites: true, cases: true, runs: true } },
} satisfies Prisma.ProjectInclude;

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(q: ProjectQueryDto) {
    const where: Prisma.ProjectWhereInput = {
      isArchived: q.includeArchived ? undefined : false,
      name: q.search ? { contains: q.search, mode: 'insensitive' } : undefined,
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.project.findMany({
        where,
        include: withCounts,
        orderBy: [{ isArchived: 'asc' }, { updatedAt: 'desc' }],
        skip: (q.page - 1) * q.pageSize,
        take: q.pageSize,
      }),
      this.prisma.project.count({ where }),
    ]);
    return paginate(items, total, q);
  }

  async findOne(id: number) {
    const project = await this.prisma.project.findUnique({ where: { id }, include: withCounts });
    if (!project) throw new NotFoundException('Không tìm thấy dự án');
    return project;
  }

  /**
   * Dự án đã lưu trữ chỉ được xem: mọi thao tác ghi lên bộ ca/ca kiểm thử
   * của dự án đó đều đi qua hàm này để bị từ chối.
   */
  async getWritable(id: number) {
    const project = await this.findOne(id);
    if (project.isArchived) {
      throw new BadRequestException('Dự án đã lưu trữ, không thể chỉnh sửa dữ liệu');
    }
    return project;
  }

  async create(dto: CreateProjectDto, userId: number) {
    await this.assertNameFree(dto.name);
    return this.prisma.project.create({
      data: { name: dto.name, description: dto.description, createdById: userId },
      include: withCounts,
    });
  }

  async update(id: number, dto: UpdateProjectDto) {
    await this.getWritable(id);
    if (dto.name) await this.assertNameFree(dto.name, id);
    return this.prisma.project.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
      include: withCounts,
    });
  }

  /** Lưu trữ thay vì xoá để giữ nguyên lịch sử các đợt kiểm thử. */
  async setArchived(id: number, isArchived: boolean) {
    await this.findOne(id);
    return this.prisma.project.update({ where: { id }, data: { isArchived }, include: withCounts });
  }

  private async assertNameFree(name: string, exceptId?: number) {
    const dup = await this.prisma.project.findFirst({
      where: { name: { equals: name, mode: 'insensitive' }, id: exceptId ? { not: exceptId } : undefined },
    });
    if (dup) throw new ConflictException('Tên dự án đã tồn tại');
  }
}
