import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { ResultsService } from './results.service';
import { RecordResultDto } from './dto/run.dto';

@ApiTags('Kết quả kiểm thử')
@ApiBearerAuth()
@Controller()
export class ResultsController {
  constructor(private readonly results: ResultsService) {}

  @Patch('run-cases/:id/result')
  record(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RecordResultDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.results.record(id, dto, user.id);
  }

  @Get('cases/:id/history')
  history(@Param('id', ParseIntPipe) id: number) {
    return this.results.historyOfCase(id);
  }
}
