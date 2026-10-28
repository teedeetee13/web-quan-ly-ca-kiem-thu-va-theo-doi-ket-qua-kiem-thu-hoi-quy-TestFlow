import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { setupApp } from './setup-app';

async function bootstrap() {
  process.loadEnvFile?.('.env');
  const app = await NestFactory.create(AppModule);
  setupApp(app);
  app.enableCors({ origin: process.env.CORS_ORIGIN ?? 'http://localhost:5173' });

  const config = new DocumentBuilder()
    .setTitle('TestFlow API')
    .setDescription('REST API quản lý ca kiểm thử và kết quả kiểm thử hồi quy')
    .setVersion('0.3.0 (tuần 3)')
    .addBearerAuth()
    .build();
  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, config));

  const port = Number(process.env.PORT ?? 3000);
  await app.listen(port);
  console.log(`TestFlow API: http://localhost:${port}/api  —  Swagger: http://localhost:${port}/api/docs`);
}
bootstrap();
