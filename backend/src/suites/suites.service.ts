import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ProjectsService } from '../projects/projects.service';
import { CreateSuiteDto, UpdateSuiteDto } from './dto/suite.dto';

const withCount = { _count: { select: { cases: true } } };

@Injectable()
export class SuitesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly projects: ProjectsService,
  ) {}

  async findByProject(projectId: number) {
    await this.projects.findOne(projectId);
    return this.prisma.testSuite.findMany({
      where: { projectId },
      include: withCount,
      orderBy: { name: 'asc' },
    });
  }

  async create(projectId: number, dto: CreateSuiteDto) {
    await this.projects.getWritable(projectId);
    await this.assertNameFree(projectId, dto.name);
    return this.prisma.testSuite.create({
      data: { projectId, name: dto.name, description: dto.description },
      include: withCount,
    });
  }

  async update(id: number, dto: UpdateSuiteDto) {
    const suite = await this.findOne(id);
    await this.projects.getWritable(suite.projectId);
    if (dto.name) await this.assertNameFree(suite.projectId, dto.name, id);
    return this.prisma.testSuite.update({
      where: { id },
      data: { name: dto.name, description: dto.description },
      include: withCount,
    });
  }

  async remove(id: number) {
    const suite = await this.findOne(id);
    await this.projects.getWritable(suite.projectId);
    if (suite._count.cases > 0) {
      throw new ConflictException('Bộ kiểm thử còn ca kiểm thử, hãy chuyển hoặc xoá các ca trước');
    }
    await this.prisma.testSuite.delete({ where: { id } });
    return { message: 'Đã xoá bộ kiểm thử' };
  }

  private async findOne(id: number) {
    const suite = await this.prisma.testSuite.findUnique({ where: { id }, include: withCount });
    if (!suite) throw new NotFoundException('Không tìm thấy bộ kiểm thử');
    return suite;
  }

  private async assertNameFree(projectId: number, name: string, exceptId?: number) {
    const dup = await this.prisma.testSuite.findFirst({
      where: {
        projectId,
        name: { equals: name, mode: 'insensitive' },
        id: exceptId ? { not: exceptId } : undefined,
      },
    });
    if (dup) throw new ConflictException('Tên bộ kiểm thử đã tồn tại trong dự án');
  }
}
