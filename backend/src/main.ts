import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap() {
  // Máy chủ triển khai (Render…) cấp biến môi trường trực tiếp, không có tệp .env.
  try {
    process.loadEnvFile?.('.env');
  } catch {}
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  // CORS_ORIGIN có thể chứa nhiều địa chỉ, cách nhau bằng dấu phẩy.
  app.enableCors({
    origin: (process.env.CORS_ORIGIN ?? 'http://localhost:5173').split(',').map((o) => o.trim()),
    exposedHeaders: ['Content-Disposition'], // để giao diện đọc được tên tệp CSV khi khác tên miền
  });

  const config = new DocumentBuilder()
    .setTitle('TestFlow API')
    .setDescription('REST API quản lý ca kiểm thử và kết quả kiểm thử hồi quy')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`TestFlow API: http://localhost:${port}/api  —  Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
