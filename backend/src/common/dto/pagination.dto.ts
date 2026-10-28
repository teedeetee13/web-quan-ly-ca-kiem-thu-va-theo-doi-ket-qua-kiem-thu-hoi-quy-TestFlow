import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, MaxLength, Min } from 'class-validator';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page phải là số nguyên' })
  @Min(1, { message: 'page tối thiểu là 1' })
  page = 1;

  @ApiPropertyOptional({ default: 20, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'pageSize phải là số nguyên' })
  @Min(1, { message: 'pageSize tối thiểu là 1' })
  @Max(100, { message: 'pageSize tối đa là 100' })
  pageSize = 20;

  @ApiPropertyOptional({ description: 'Từ khoá tìm kiếm' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  search?: string;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export function paginate<T>(items: T[], total: number, q: PaginationQueryDto): Paginated<T> {
  return { items, total, page: q.page, pageSize: q.pageSize };
}
