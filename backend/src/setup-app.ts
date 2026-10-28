import { BadRequestException, INestApplication, ValidationPipe } from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

/** Gom thông báo lỗi của cả các đối tượng lồng nhau (VD: steps[1].action). */
function flatten(errors: ValidationError[], parent = ''): string[] {
  return errors.flatMap((e) => {
    const path = parent ? `${parent}.${e.property}` : e.property;
    const own = Object.entries(e.constraints ?? {}).map(([rule, msg]) =>
      rule === 'whitelistValidation' ? `Trường "${path}" không được phép gửi lên` : msg,
    );
    return [...own, ...flatten(e.children ?? [], path)];
  });
}

/** Cấu hình dùng chung cho main.ts và kiểm thử e2e. */
export function setupApp(app: INestApplication) {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // bỏ trường lạ
      forbidNonWhitelisted: true, // ...và báo lỗi nếu client cố gửi (VD: gửi "role" khi đăng nhập)
      transform: true,
      exceptionFactory: (errors) =>
        new BadRequestException({
          statusCode: 400,
          message: [...new Set(flatten(errors))],
          error: 'Dữ liệu không hợp lệ',
        }),
    }),
  );
  app.useGlobalFilters(new PrismaExceptionFilter());
}
