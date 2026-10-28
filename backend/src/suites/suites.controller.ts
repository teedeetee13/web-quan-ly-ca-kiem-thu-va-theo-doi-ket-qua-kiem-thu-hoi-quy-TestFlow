import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { SuitesService } from './suites.service';
import { CreateSuiteDto, UpdateSuiteDto } from './dto/suite.dto';

@ApiTags('Bộ kiểm thử')
@ApiBearerAuth()
@Controller()
export class SuitesController {
  constructor(private readonly suites: SuitesService) {}

  @Get('projects/:projectId/suites')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number) {
    return this.suites.findByProject(projectId);
  }

  @Post('projects/:projectId/suites')
  create(@Param('projectId', ParseIntPipe) projectId: number, @Body() dto: CreateSuiteDto) {
    return this.suites.create(projectId, dto);
  }

  @Patch('suites/:id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSuiteDto) {
    return this.suites.update(id, dto);
  }

  @Delete('suites/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.suites.remove(id);
  }
}
