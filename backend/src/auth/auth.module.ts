import { Module } from '@nestjs/common';
import { JwtModule, JwtModuleOptions } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      global: true,
      useFactory: (): JwtModuleOptions => {
        if (!process.env.JWT_SECRET) throw new Error('Thiếu biến môi trường JWT_SECRET');
        return {
          secret: process.env.JWT_SECRET,
          signOptions: {
            expiresIn: (process.env.JWT_EXPIRES_IN ?? '8h') as NonNullable<
              JwtModuleOptions['signOptions']
            >['expiresIn'],
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
