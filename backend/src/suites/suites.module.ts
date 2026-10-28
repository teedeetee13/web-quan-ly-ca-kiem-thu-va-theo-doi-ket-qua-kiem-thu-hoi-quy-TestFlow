import { Module } from '@nestjs/common';
import { ProjectsModule } from '../projects/projects.module';
import { SuitesController } from './suites.controller';
import { SuitesService } from './suites.service';

@Module({
  imports: [ProjectsModule],
  controllers: [SuitesController],
  providers: [SuitesService],
})
export class SuitesModule {}
