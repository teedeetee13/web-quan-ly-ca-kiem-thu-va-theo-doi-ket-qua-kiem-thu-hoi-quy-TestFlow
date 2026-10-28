import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Priority } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { trim, trimToNull } from '../../common/dto/transforms';

export class TestStepDto {
  @ApiProperty({ example: 'Nhập mật khẩu sai' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Thao tác của bước là bắt buộc' })
  @MaxLength(1000)
  action!: string;

  @ApiProperty({ example: 'Hiển thị thông báo "Sai mật khẩu"' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Kết quả mong đợi của bước là bắt buộc' })
  @MaxLength(1000)
  expected!: string;
}

export class CreateTestCaseDto {
  @ApiProperty({ example: 'TC_LOGIN_02', description: 'Duy nhất trong dự án' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toUpperCase() : value))
  @IsString()
  @Matches(/^[A-Z0-9_-]{2,50}$/, {
    message: 'Mã ca gồm 2–50 ký tự chữ, số, gạch dưới hoặc gạch ngang (VD: TC_LOGIN_02)',
  })
  code!: string;

  @ApiProperty({ example: 'Đăng nhập bằng mật khẩu sai' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Tên ca kiểm thử là bắt buộc' })
  @MaxLength(200, { message: 'Tên ca tối đa 200 ký tự' })
  title!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trimToNull)
  @IsString()
  @MaxLength(2000)
  preconditions?: string | null;

  @ApiProperty({ enum: Priority, default: Priority.MEDIUM })
  @IsEnum(Priority, { message: 'Độ ưu tiên chỉ được là LOW, MEDIUM, HIGH hoặc CRITICAL' })
  priority: Priority = Priority.MEDIUM;

  @ApiProperty()
  @Type(() => Number)
  @IsInt({ message: 'Vui lòng chọn bộ kiểm thử' })
  suiteId!: number;

  @ApiProperty({ type: [TestStepDto] })
  @IsArray({ message: 'Danh sách bước không hợp lệ' })
  @ArrayMinSize(1, { message: 'Ca kiểm thử cần ít nhất 1 bước' })
  @ArrayMaxSize(50, { message: 'Tối đa 50 bước cho một ca' })
  @ValidateNested({ each: true })
  @Type(() => TestStepDto)
  steps!: TestStepDto[];
}

export class UpdateTestCaseDto extends PartialType(CreateTestCaseDto) {}

export class TestCaseQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  suiteId?: number;

  @ApiPropertyOptional({ enum: Priority })
  @IsOptional()
  @IsEnum(Priority, { message: 'Độ ưu tiên không hợp lệ' })
  priority?: Priority;
}
