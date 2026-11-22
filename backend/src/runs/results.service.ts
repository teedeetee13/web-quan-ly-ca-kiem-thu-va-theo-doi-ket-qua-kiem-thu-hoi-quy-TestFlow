import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RecordResultDto } from './dto/run.dto';

@Injectable()
export class ResultsService {
  constructor(private readonly prisma: PrismaService) {}

  async record(runCaseId: number, dto: RecordResultDto, userId: number) {
    const rc = await this.prisma.runCase.findUnique({
      where: { id: runCaseId },
      include: { run: { include: { project: { select: { isArchived: true } } } } },
    });
    if (!rc) throw new NotFoundException('Không tìm thấy ca trong đợt');
    if (rc.run.status === 'CLOSED') {
      throw new BadRequestException('Đợt kiểm thử đã đóng, không thể sửa kết quả');
    }
    if (rc.run.project.isArchived) {
      throw new BadRequestException('Dự án đã lưu trữ, không thể chỉnh sửa dữ liệu');
    }
    // BR14: kết quả xấu phải có mô tả để lập trình viên tái hiện được lỗi.
    if ((dto.status === 'FAILED' || dto.status === 'BLOCKED') && !dto.actualResult && !dto.note) {
      throw new BadRequestException(
        'Kết quả Không đạt hoặc Bị chặn cần mô tả kết quả thực tế hoặc ghi chú',
      );
    }

    const executed = dto.status !== 'UNTESTED';
    const data = {
      status: dto.status,
      actualResult: dto.actualResult ?? null,
      note: dto.note ?? null,
      executedById: executed ? userId : null,
      executedAt: executed ? new Date() : null,
    };
    return this.prisma.testResult.upsert({
      where: { runCaseId },
      create: { runCaseId, ...data },
      update: data,
      include: { executedBy: { select: { id: true, fullName: true } } },
    });
  }

  /** Lịch sử một ca qua các đợt — đọc từ bản chụp nên vẫn đúng dù ca gốc đã sửa. */
  async historyOfCase(caseId: number) {
    const tc = await this.prisma.testCase.findUnique({ where: { id: caseId } });
    if (!tc) throw new NotFoundException('Không tìm thấy ca kiểm thử');
    return this.prisma.runCase.findMany({
      where: { testCaseId: caseId },
      select: {
        id: true,
        title: true,
        stepsSnapshot: true,
        run: { select: { id: true, name: true, version: true, status: true, createdAt: true } },
        result: {
          select: {
            status: true,
            actualResult: true,
            note: true,
            executedAt: true,
            executedBy: { select: { fullName: true } },
          },
        },
      },
      orderBy: { run: { createdAt: 'desc' } },
    });
  }
}
