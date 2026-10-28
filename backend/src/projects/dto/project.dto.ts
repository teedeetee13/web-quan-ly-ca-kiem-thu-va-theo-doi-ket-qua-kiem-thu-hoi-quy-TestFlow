import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { trim, trimToNull } from '../../common/dto/transforms';

export class CreateProjectDto {
  @ApiProperty({ example: 'Website bán sách' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên dự án là bắt buộc' })
  @MaxLength(100, { message: 'Tên dự án tối đa 100 ký tự' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(1000, { message: 'Mô tả tối đa 1000 ký tự' })
  description?: string | null;
}

export class UpdateProjectDto extends PartialType(CreateProjectDto) {}

export class ProjectQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Hiển thị cả dự án đã lưu trữ' })
  @IsOptional()
  @Transform(({ value }) => value === true || value === 'true')
  @IsBoolean()
  includeArchived?: boolean;
}
