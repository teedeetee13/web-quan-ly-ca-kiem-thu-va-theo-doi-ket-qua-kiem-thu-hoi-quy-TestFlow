import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ProjectsModule } from './projects/projects.module';
import { SuitesModule } from './suites/suites.module';
import { TestCasesModule } from './test-cases/test-cases.module';
import { RunsModule } from './runs/runs.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';

@Module({
  imports: [PrismaModule, AuthModule, UsersModule, ProjectsModule, SuitesModule, TestCasesModule, RunsModule],
  providers: [
    // Thứ tự quan trọng: xác thực (401) trước, phân quyền (403) sau.
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
