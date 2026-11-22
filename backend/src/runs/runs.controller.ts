import { Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { RunsService } from './runs.service';
import { CreateRunDto, RunQueryDto } from './dto/run.dto';

@ApiTags('Đợt kiểm thử')
@ApiBearerAuth()
@Controller()
export class RunsController {
  constructor(private readonly runs: RunsService) {}

  @Get('projects/:projectId/runs')
  findByProject(@Param('projectId', ParseIntPipe) projectId: number, @Query() q: RunQueryDto) {
    return this.runs.findByProject(projectId, q);
  }

  @Post('projects/:projectId/runs')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateRunDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.runs.create(projectId, dto, user.id);
  }

  @Get('runs/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.runs.findOne(id);
  }

  @Patch('runs/:id/close')
  close(@Param('id', ParseIntPipe) id: number) {
    return this.runs.close(id);
  }
}
