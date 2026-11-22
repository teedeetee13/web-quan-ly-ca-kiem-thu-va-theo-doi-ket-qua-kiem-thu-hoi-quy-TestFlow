import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { RunsController } from './runs.controller';
import { RunsService } from './runs.service';
import { ResultsController } from './results.controller';
import { ResultsService } from './results.service';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';

/** Đợt kiểm thử, ghi kết quả và thống kê: ba nhóm API cùng xoay quanh TestRun. */
@Module({
  imports: [ProjectsModule],
  controllers: [RunsController, ResultsController, ReportsController],
  providers: [RunsService, ResultsService, ReportsService],
})
export class RunsModule {}
