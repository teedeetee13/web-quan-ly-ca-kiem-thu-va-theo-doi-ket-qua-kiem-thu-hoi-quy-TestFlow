import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { TestCasesService } from './test-cases.service';
import { CreateTestCaseDto, TestCaseQueryDto, UpdateTestCaseDto } from './dto/test-case.dto';

@ApiTags('Ca kiểm thử')
@ApiBearerAuth()
@Controller()
export class TestCasesController {
  constructor(private readonly cases: TestCasesService) {}

  @Get('projects/:projectId/cases')
  findByProject(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Query() q: TestCaseQueryDto,
  ) {
    return this.cases.findByProject(projectId, q);
  }

  @Post('projects/:projectId/cases')
  create(
    @Param('projectId', ParseIntPipe) projectId: number,
    @Body() dto: CreateTestCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.cases.create(projectId, dto, user.id);
  }

  @Get('cases/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.cases.findOne(id);
  }

  @Patch('cases/:id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTestCaseDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.cases.update(id, dto, user.id);
  }

  @Delete('cases/:id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.cases.remove(id);
  }
}
