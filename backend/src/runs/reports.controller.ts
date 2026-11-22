import { Controller, Get, Param, ParseIntPipe, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiProduces, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';

@ApiTags('Thống kê')
@ApiBearerAuth()
@Controller('runs/:id')
export class ReportsController {
  constructor(private readonly reports: ReportsService) {}

  @Get('stats')
  stats(@Param('id', ParseIntPipe) id: number) {
    return this.reports.stats(id);
  }

  @Get('export.csv')
  @ApiProduces('text/csv')
  async csv(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const { filename, content } = await this.reports.csv(id);
    res
      .status(200)
      .setHeader('Content-Type', 'text/csv; charset=utf-8')
      .setHeader('Content-Disposition', `attachment; filename="${filename}"`)
      .send(content);
  }
}
