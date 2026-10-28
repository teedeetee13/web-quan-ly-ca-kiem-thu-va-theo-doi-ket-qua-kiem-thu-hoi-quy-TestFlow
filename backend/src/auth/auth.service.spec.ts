import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService.login', () => {
  const jwt = new JwtService({ secret: 'unit-test-secret' });
  let findUnique: jest.Mock;
  let service: AuthService;

  beforeEach(async () => {
    const user = {
      id: 7,
      email: 'tester@testflow.local',
      fullName: 'Tester',
      role: Role.TESTER,
      isActive: true,
      passwordHash: await bcrypt.hash('Tester@123', 4),
    };
    findUnique = jest.fn().mockResolvedValue(user);
    service = new AuthService({ user: { findUnique } } as unknown as PrismaService, jwt);
  });

  it('trả token và thông tin người dùng khi đúng mật khẩu, không lộ passwordHash', async () => {
    const res = await service.login('tester@testflow.local', 'Tester@123');
    expect(res.user).toEqual({ id: 7, email: 'tester@testflow.local', fullName: 'Tester', role: 'TESTER' });
    expect(res.user).not.toHaveProperty('passwordHash');
    const payload = await jwt.verifyAsync(res.accessToken);
    expect(payload).toMatchObject({ sub: 7, role: 'TESTER' });
  });

  it('từ chối mật khẩu sai', async () => {
    await expect(service.login('tester@testflow.local', 'sai-mat-khau1')).rejects.toThrow(
      'Email hoặc mật khẩu không đúng',
    );
  });

  it('email không tồn tại trả cùng thông báo với sai mật khẩu', async () => {
    findUnique.mockResolvedValue(null);
    await expect(service.login('khongco@testflow.local', 'x')).rejects.toThrow(
      'Email hoặc mật khẩu không đúng',
    );
  });

  it('từ chối tài khoản bị khoá', async () => {
    const locked = { ...(await findUnique()), isActive: false };
    findUnique.mockResolvedValue(locked);
    await expect(service.login('tester@testflow.local', 'Tester@123')).rejects.toBeInstanceOf(
      UnauthorizedException,
    );
  });
});
