/**
 * Kiểm thử API tuần 3 trên CSDL thật (cần `npm run db:start` và `npm run db:seed` trước).
 * Mỗi `it` tương ứng một tình huống kiểm thử (TS-xx) trong tài liệu báo cáo tuần 3.
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { PrismaService } from '../src/prisma/prisma.service';

process.loadEnvFile?.('.env');

describe('TestFlow API – tuần 3 (xác thực, phân quyền, kiểm tra đầu vào, CRUD ca)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminToken: string;
  let testerToken: string;
  let projectId: number;
  let suiteId: number;
  const stamp = Date.now().toString(36).toUpperCase();

  const api = () => request(app.getHttpServer());
  const login = async (email: string, password: string) =>
    (await api().post('/api/auth/login').send({ email, password })).body.accessToken as string;

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);

    adminToken = await login('admin@testflow.local', 'Admin@123');
    testerToken = await login('tester@testflow.local', 'Tester@123');

    // Dữ liệu riêng cho lần chạy này để không phụ thuộc vào seed.
    const p = await api()
      .post('/api/projects')
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ name: `E2E ${stamp}` });
    projectId = p.body.id;
    const s = await api()
      .post(`/api/projects/${projectId}/suites`)
      .set('Authorization', `Bearer ${testerToken}`)
      .send({ name: 'Đăng nhập' });
    suiteId = s.body.id;
  });

  afterAll(async () => {
    await prisma.testCase.deleteMany({ where: { projectId } });
    await prisma.testSuite.deleteMany({ where: { projectId } });
    await prisma.project.deleteMany({ where: { id: projectId } });
    await prisma.user.deleteMany({ where: { email: { startsWith: `e2e-${stamp.toLowerCase()}` } } });
    await app.close();
  });

  describe('Đăng nhập', () => {
    it('TS-01 đăng nhập đúng trả token', () => {
      expect(adminToken).toEqual(expect.any(String));
      expect(testerToken).toEqual(expect.any(String));
    });

    it('TS-02 sai mật khẩu → 401', () =>
      api()
        .post('/api/auth/login')
        .send({ email: 'admin@testflow.local', password: 'SaiMatKhau1' })
        .expect(401));

    it('TS-03 email sai định dạng, thiếu mật khẩu → 400 kèm thông báo', async () => {
      const res = await api().post('/api/auth/login').send({ email: 'abc@', password: '' }).expect(400);
      expect(res.body.message).toEqual(
        expect.arrayContaining(['Email không hợp lệ', 'Vui lòng nhập mật khẩu']),
      );
    });

    it('TS-04 tài khoản bị khoá → 401', () =>
      api()
        .post('/api/auth/login')
        .send({ email: 'locked@testflow.local', password: 'Locked@123' })
        .expect(401));

    it('TS-05 gửi kèm trường lạ (role) khi đăng nhập → 400', () =>
      api()
        .post('/api/auth/login')
        .send({ email: 'tester@testflow.local', password: 'Tester@123', role: 'ADMIN' })
        .expect(400));

    it('TS-06 email viết hoa/khoảng trắng vẫn đăng nhập được', () =>
      api()
        .post('/api/auth/login')
        .send({ email: '  TESTER@testflow.local ', password: 'Tester@123' })
        .expect(200));
  });

  describe('Xác thực token', () => {
    it('TS-07 không có token → 401', () => api().get('/api/projects').expect(401));

    it('TS-08 token giả mạo → 401', () =>
      api().get('/api/projects').set('Authorization', 'Bearer abc.def.ghi').expect(401));

    it('TS-09 /auth/me trả người dùng hiện tại, không có passwordHash', async () => {
      const res = await api()
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(200);
      expect(res.body).toMatchObject({ email: 'tester@testflow.local', role: 'TESTER' });
      expect(res.body).not.toHaveProperty('passwordHash');
    });
  });

  describe('Phân quyền', () => {
    it('TS-10 Tester xem danh sách tài khoản → 403', () =>
      api().get('/api/users').set('Authorization', `Bearer ${testerToken}`).expect(403));

    it('TS-11 Tester tạo tài khoản → 403', () =>
      api()
        .post('/api/users')
        .set('Authorization', `Bearer ${testerToken}`)
        .send({ email: 'x@y.z', fullName: 'X', password: 'Abcdef12' })
        .expect(403));

    it('TS-12 Tester lưu trữ dự án → 403', () =>
      api()
        .patch(`/api/projects/${projectId}/archive`)
        .set('Authorization', `Bearer ${testerToken}`)
        .expect(403));

    it('TS-13 Admin tạo tài khoản; mật khẩu yếu → 400; trùng email → 409', async () => {
      const email = `e2e-${stamp.toLowerCase()}@testflow.local`;
      const auth = { Authorization: `Bearer ${adminToken}` };
      await api()
        .post('/api/users')
        .set(auth)
        .send({ email, fullName: 'E2E', password: '123' })
        .expect(400);
      const ok = await api()
        .post('/api/users')
        .set(auth)
        .send({ email, fullName: 'E2E', password: 'Abcdef12' })
        .expect(201);
      expect(ok.body).not.toHaveProperty('passwordHash');
      await api()
        .post('/api/users')
        .set(auth)
        .send({ email, fullName: 'E2E', password: 'Abcdef12' })
        .expect(409);
    });

    it('TS-14 Admin khoá tài khoản → token cũ của tài khoản đó bị từ chối ngay', async () => {
      const email = `e2e-${stamp.toLowerCase()}-lock@testflow.local`;
      const created = await api()
        .post('/api/users')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ email, fullName: 'Sẽ bị khoá', password: 'Abcdef12' })
        .expect(201);
      const token = await login(email, 'Abcdef12');
      await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(200);
      await api()
        .patch(`/api/users/${created.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(200);
      await api().get('/api/auth/me').set('Authorization', `Bearer ${token}`).expect(401);
    });

    it('TS-15 Admin không thể tự khoá chính mình → 400', async () => {
      const me = await api().get('/api/auth/me').set('Authorization', `Bearer ${adminToken}`);
      await api()
        .patch(`/api/users/${me.body.id}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ isActive: false })
        .expect(400);
    });
  });

  describe('Dự án, bộ ca và ca kiểm thử', () => {
    const auth = () => ({ Authorization: `Bearer ${testerToken}` });
    const validCase = () => ({
      code: `tc_${stamp}_01`,
      title: 'Đăng nhập bằng mật khẩu sai',
      priority: 'HIGH',
      suiteId,
      steps: [
        { action: 'Nhập email hợp lệ', expected: 'Ô email nhận giá trị' },
        { action: 'Nhập mật khẩu sai, bấm Đăng nhập', expected: 'Báo sai thông tin đăng nhập' },
      ],
    });

    it('TS-16 tạo dự án thiếu tên → 400; trùng tên → 409', async () => {
      await api().post('/api/projects').set(auth()).send({ name: '   ' }).expect(400);
      await api().post('/api/projects').set(auth()).send({ name: `E2E ${stamp}` }).expect(409);
    });

    it('TS-17 tạo ca hợp lệ: mã được viết hoa, bước đánh số 1..n', async () => {
      const res = await api()
        .post(`/api/projects/${projectId}/cases`)
        .set(auth())
        .send(validCase())
        .expect(201);
      expect(res.body.code).toBe(`TC_${stamp}_01`);
      expect(res.body.steps.map((s: { order: number }) => s.order)).toEqual([1, 2]);
    });

    it('TS-18 tạo ca thiếu tên/bước → 400', async () => {
      const res = await api()
        .post(`/api/projects/${projectId}/cases`)
        .set(auth())
        .send({ ...validCase(), code: `TC_${stamp}_02`, title: '', steps: [] })
        .expect(400);
      expect(res.body.message).toEqual(
        expect.arrayContaining(['Tên ca kiểm thử là bắt buộc', 'Ca kiểm thử cần ít nhất 1 bước']),
      );
    });

    it('TS-19 bước thiếu kết quả mong đợi → 400', () =>
      api()
        .post(`/api/projects/${projectId}/cases`)
        .set(auth())
        .send({ ...validCase(), code: `TC_${stamp}_03`, steps: [{ action: 'a', expected: ' ' }] })
        .expect(400));

    it('TS-20 trùng mã ca trong dự án → 409', () =>
      api().post(`/api/projects/${projectId}/cases`).set(auth()).send(validCase()).expect(409));

    it('TS-21 chọn bộ kiểm thử của dự án khác → 400', async () => {
      const other = await prisma.testSuite.findFirst({ where: { projectId: { not: projectId } } });
      await api()
        .post(`/api/projects/${projectId}/cases`)
        .set(auth())
        .send({ ...validCase(), code: `TC_${stamp}_04`, suiteId: other!.id })
        .expect(400);
    });

    it('TS-22 tìm kiếm theo mã/tên và lọc độ ưu tiên', async () => {
      const res = await api()
        .get(`/api/projects/${projectId}/cases`)
        .query({ search: 'mật khẩu sai', priority: 'HIGH' })
        .set(auth())
        .expect(200);
      expect(res.body.total).toBe(1);
      const none = await api()
        .get(`/api/projects/${projectId}/cases`)
        .query({ priority: 'LOW' })
        .set(auth())
        .expect(200);
      expect(none.body.total).toBe(0);
    });

    it('TS-23 cập nhật ca thay toàn bộ danh sách bước', async () => {
      const tc = await prisma.testCase.findFirstOrThrow({ where: { projectId } });
      const res = await api()
        .patch(`/api/cases/${tc.id}`)
        .set(auth())
        .send({ steps: [{ action: 'Chỉ còn một bước', expected: 'OK' }] })
        .expect(200);
      expect(res.body.steps).toHaveLength(1);
      expect(res.body.updatedBy.fullName).toBe('Nguyễn Văn Kiểm');
    });

    it('TS-24 xoá bộ kiểm thử còn ca → 409', () =>
      api().delete(`/api/suites/${suiteId}`).set(auth()).expect(409));

    it('TS-25 dự án đã lưu trữ không cho thêm ca → 400; mở lại thì được', async () => {
      await api()
        .patch(`/api/projects/${projectId}/archive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
      await api()
        .post(`/api/projects/${projectId}/cases`)
        .set(auth())
        .send({ ...validCase(), code: `TC_${stamp}_05` })
        .expect(400);
      await api()
        .patch(`/api/projects/${projectId}/unarchive`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);
    });

    it('TS-26 phân trang: pageSize > 100 → 400', () =>
      api()
        .get(`/api/projects/${projectId}/cases`)
        .query({ pageSize: 1000 })
        .set(auth())
        .expect(400));
  });
});
