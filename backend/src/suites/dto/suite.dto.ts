import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';
import { trim, trimToNull } from '../../common/dto/transforms';

export class CreateSuiteDto {
  @ApiProperty({ example: 'Đăng nhập' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên bộ kiểm thử là bắt buộc' })
  @MaxLength(100, { message: 'Tên bộ kiểm thử tối đa 100 ký tự' })
  name!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(1000)
  description?: string | null;
}

export class UpdateSuiteDto extends PartialType(CreateSuiteDto) {}
