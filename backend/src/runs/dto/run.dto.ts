import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ResultStatus, RunStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  ArrayUnique,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { trim, trimToNull } from '../../common/dto/transforms';

export class CreateRunDto {
  @ApiProperty({ example: 'Hồi quy trước phát hành' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên đợt là bắt buộc' })
  @MaxLength(150, { message: 'Tên đợt tối đa 150 ký tự' })
  name!: string;

  @ApiProperty({ example: '1.1.0', description: 'Phiên bản phần mềm được kiểm thử' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Phiên bản là bắt buộc' })
  @MaxLength(50, { message: 'Phiên bản tối đa 50 ký tự' })
  version!: string;

  @ApiProperty({ type: [Number], description: 'Danh sách id ca thuộc dự án' })
  @IsArray({ message: 'Danh sách ca không hợp lệ' })
  @ArrayMinSize(1, { message: 'Đợt kiểm thử cần ít nhất 1 ca' })
  @ArrayMaxSize(1000, { message: 'Tối đa 1000 ca cho một đợt' })
  @ArrayUnique({ message: 'Không được chọn trùng một ca' })
  @Type(() => Number)
  @IsInt({ each: true, message: 'Mã ca không hợp lệ' })
  caseIds!: number[];
}

export class RunQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: RunStatus })
  @IsOptional()
  @IsEnum(RunStatus, { message: 'Trạng thái đợt chỉ được là OPEN hoặc CLOSED' })
  status?: RunStatus;
}

export class RecordResultDto {
  @ApiProperty({ enum: ResultStatus })
  @IsEnum(ResultStatus, {
    message: 'Trạng thái chỉ được là UNTESTED, PASSED, FAILED hoặc BLOCKED',
  })
  status!: ResultStatus;

  @ApiPropertyOptional({ example: 'Bấm Đăng nhập thì trang trắng, không có thông báo' })
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(2000, { message: 'Kết quả thực tế tối đa 2000 ký tự' })
  actualResult?: string | null;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(2000, { message: 'Ghi chú tối đa 2000 ký tự' })
  note?: string | null;
}
