import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Role } from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination.dto';
import { trim } from '../../common/dto/transforms';
import { PASSWORD_MESSAGE, PASSWORD_REGEX } from '../../common/password';

export class CreateUserDto {
  @ApiProperty({ example: 'tester2@testflow.local' })
  @Transform(({ value }) => (typeof value === 'string' ? value.trim().toLowerCase() : value))
  @IsEmail({}, { message: 'Email không hợp lệ' })
  @MaxLength(120)
  email!: string;

  @ApiProperty({ example: 'Nguyễn Văn A' })
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Họ tên là bắt buộc' })
  @MaxLength(100)
  fullName!: string;

  @ApiProperty({ example: 'Tester@123' })
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password!: string;

  @ApiProperty({ enum: Role, default: Role.TESTER })
  @IsEnum(Role, { message: 'Vai trò chỉ được là ADMIN hoặc TESTER' })
  role: Role = Role.TESTER;
}

export class UpdateUserDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'Họ tên không được để trống' })
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'Vai trò chỉ được là ADMIN hoặc TESTER' })
  role?: Role;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean({ message: 'isActive phải là true/false' })
  isActive?: boolean;

  @ApiPropertyOptional({ description: 'Đặt lại mật khẩu' })
  @IsOptional()
  @IsString()
  @Matches(PASSWORD_REGEX, { message: PASSWORD_MESSAGE })
  password?: string;
}

export class UserQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ enum: Role })
  @IsOptional()
  @IsEnum(Role, { message: 'Vai trò chỉ được là ADMIN hoặc TESTER' })
  role?: Role;
}
