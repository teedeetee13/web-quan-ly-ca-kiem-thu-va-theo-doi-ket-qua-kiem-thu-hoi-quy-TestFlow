import { ArgumentsHost, Catch, ExceptionFilter, HttpStatus } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Response } from 'express';

/** Chuyển lỗi ràng buộc CSDL thành mã HTTP dễ hiểu thay vì lỗi 500. */
@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(err: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const res = host.switchToHttp().getResponse<Response>();
    const map: Record<string, [number, string]> = {
      P2002: [HttpStatus.CONFLICT, 'Dữ liệu bị trùng (giá trị đã tồn tại)'],
      P2003: [HttpStatus.CONFLICT, 'Dữ liệu đang được tham chiếu, không thể thực hiện'],
      P2025: [HttpStatus.NOT_FOUND, 'Không tìm thấy dữ liệu'],
    };
    const [statusCode, message] = map[err.code] ?? [HttpStatus.INTERNAL_SERVER_ERROR, 'Lỗi máy chủ'];
    res.status(statusCode).json({ statusCode, message, code: err.code });
  }
}
