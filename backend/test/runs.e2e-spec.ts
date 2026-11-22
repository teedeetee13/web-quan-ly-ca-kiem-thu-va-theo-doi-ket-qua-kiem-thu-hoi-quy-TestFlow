/**
 * Kiểm thử API đợt kiểm thử, kết quả và thống kê (WBS 2.6, 2.7) trên CSDL thật.
 * Cần `npm run db:start` và `npm run db:seed` trước. Tự tạo dữ liệu riêng và dọn sau khi chạy.
 * Mỗi `it` là một tình huống TS-xx, nối tiếp TS-01..TS-26 của week3.e2e-spec.ts.
 */
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { setupApp } from '../src/setup-app';
import { PrismaService } from '../src/prisma/prisma.service';

process.loadEnvFile?.('.env');
jest.setTimeout(30_000);

describe('TestFlow API – đợt kiểm thử, kết quả, thống kê', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let admin: string;
  let tester: string;
  let projectId: number;
  let otherProjectId: number;
  let suiteId: number;
  const caseIds: number[] = [];
  let otherCaseId: number;
  const stamp = Date.now().toString(36).toUpperCase();

  const api = () => request(app.getHttpServer());
  const as = (token: string) => ({ Authorization: `Bearer ${token}` });
  const login = async (email: string, password: string) =>
    (await api().post('/api/auth/login').send({ email, password })).body.accessToken as string;
  const newCase = async (pid: number, sid: number, code: string, steps = 2) =>
    (
      await api()
        .post(`/api/projects/${pid}/cases`)
        .set(as(tester))
        .send({
          code,
          title: `Ca ${code}`,
          suiteId: sid,
          priority: 'HIGH',
          steps: Array.from({ length: steps }, (_, i) => ({ action: `Bước ${i + 1}`, expected: `Mong đợi ${i + 1}` })),
        })
        .expect(201)
    ).body.id as number;
  const newRun = (ids: number[], version = '1.0.0') =>
    api()
      .post(`/api/projects/${projectId}/runs`)
      .set(as(tester))
      .send({ name: `Đợt ${version}`, version, caseIds: ids });
  const record = (runCaseId: number, body: object, token = tester) =>
    api().patch(`/api/run-cases/${runCaseId}/result`).set(as(token)).send(body);

  beforeAll(async () => {
    const mod = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = mod.createNestApplication();
    setupApp(app);
    await app.init();
    prisma = app.get(PrismaService);
    admin = await login('admin@testflow.local', 'Admin@123');
    tester = await login('tester@testflow.local', 'Tester@123');

    projectId = (await api().post('/api/projects').set(as(tester)).send({ name: `E2E Đợt ${stamp}` })).body.id;
    suiteId = (await api().post(`/api/projects/${projectId}/suites`).set(as(tester)).send({ name: 'Bộ A' })).body.id;
    for (const code of ['RUN_01', 'RUN_02', 'RUN_03', 'RUN_04']) caseIds.push(await newCase(projectId, suiteId, code));

    otherProjectId = (await api().post('/api/projects').set(as(tester)).send({ name: `E2E Khác ${stamp}` })).body.id;
    const otherSuite = (await api().post(`/api/projects/${otherProjectId}/suites`).set(as(tester)).send({ name: 'Bộ B' })).body.id;
    otherCaseId = await newCase(otherProjectId, otherSuite, 'OTHER_01');
  });

  afterAll(async () => {
    const ids = [projectId, otherProjectId].filter((x): x is number => typeof x === 'number');
    await prisma.testRun.deleteMany({ where: { projectId: { in: ids } } });
    await prisma.testCase.deleteMany({ where: { projectId: { in: ids } } });
    await prisma.testSuite.deleteMany({ where: { projectId: { in: ids } } });
    await prisma.project.deleteMany({ where: { id: { in: ids } } });
    await app.close();
  });

  describe('Tạo đợt và bản chụp', () => {
    it('TS-27 tạo đợt hợp lệ: đủ ca, trạng thái Đang mở, mọi kết quả Chưa chạy, có bản chụp bước', async () => {
      const res = await newRun(caseIds).expect(201);
      expect(res.body.status).toBe('OPEN');
      expect(res.body.runCases).toHaveLength(4);
      expect(res.body.runCases.every((rc: any) => rc.result.status === 'UNTESTED')).toBe(true);
      expect(res.body.runCases[0].stepsSnapshot).toEqual([
        { order: 1, action: 'Bước 1', expected: 'Mong đợi 1' },
        { order: 2, action: 'Bước 2', expected: 'Mong đợi 2' },
      ]);
    });

    it('TS-28 tạo đợt không chọn ca hoặc thiếu phiên bản → 400', async () => {
      const r1 = await newRun([]).expect(400);
      expect(r1.body.message).toContain('Đợt kiểm thử cần ít nhất 1 ca');
      const r2 = await api()
        .post(`/api/projects/${projectId}/runs`)
        .set(as(tester))
        .send({ name: 'Thiếu phiên bản', caseIds })
        .expect(400);
      expect(r2.body.message).toContain('Phiên bản là bắt buộc');
    });

    it('TS-29 chọn trùng một ca trong đợt → 400', async () => {
      const res = await newRun([caseIds[0], caseIds[0]]).expect(400);
      expect(res.body.message).toContain('Không được chọn trùng một ca');
    });

    it('TS-30 chọn ca thuộc dự án khác → 400, không để lại đợt dở dang', async () => {
      const before = await prisma.testRun.count({ where: { projectId } });
      await newRun([caseIds[0], otherCaseId]).expect(400);
      expect(await prisma.testRun.count({ where: { projectId } })).toBe(before);
    });

    it('TS-31 sửa ca gốc sau khi tạo đợt: bản chụp trong đợt giữ nguyên', async () => {
      const run = (await newRun([caseIds[1]], 'snap')).body;
      await api()
        .patch(`/api/cases/${caseIds[1]}`)
        .set(as(tester))
        .send({
          title: 'Tên đã sửa',
          steps: [1, 2, 3].map((n) => ({ action: `Mới ${n}`, expected: `Mới ${n}` })),
        })
        .expect(200);
      const after = (await api().get(`/api/runs/${run.id}`).set(as(tester)).expect(200)).body;
      expect(after.runCases[0].title).toBe('Ca RUN_02');
      expect(after.runCases[0].stepsSnapshot).toHaveLength(2);
    });

    it('TS-32 xoá ca gốc: đợt cũ vẫn còn bản chụp và kết quả', async () => {
      const tmp = await newCase(projectId, suiteId, 'RUN_TMP');
      const run = (await newRun([tmp], 'xoa')).body;
      await record(run.runCases[0].id, { status: 'PASSED' }).expect(200);
      await api().delete(`/api/cases/${tmp}`).set(as(tester)).expect(200);
      const after = (await api().get(`/api/runs/${run.id}`).set(as(tester)).expect(200)).body;
      expect(after.runCases).toHaveLength(1);
      expect(after.runCases[0].testCaseId).toBeNull();
      expect(after.runCases[0].code).toBe('RUN_TMP');
      expect(after.runCases[0].result.status).toBe('PASSED');
    });
  });

  describe('Ghi kết quả và thống kê', () => {
    let run: any;
    beforeAll(async () => {
      run = (await newRun(caseIds, '2.0.0').expect(201)).body;
    });

    it('TS-33 thống kê khi chưa có kết quả: tiến độ 0, tỷ lệ đạt "chưa có dữ liệu" (null)', async () => {
      const s = (await api().get(`/api/runs/${run.id}/stats`).set(as(tester)).expect(200)).body;
      expect(s.total).toBe(4);
      expect(s.progress).toBe(0);
      expect(s.passRate).toBeNull();
    });

    it('TS-34 ghi Đạt: lưu người thực hiện và thời điểm', async () => {
      const res = await record(run.runCases[0].id, { status: 'PASSED' }).expect(200);
      expect(res.body.status).toBe('PASSED');
      expect(res.body.executedBy.fullName).toBe('Nguyễn Văn Kiểm');
      expect(res.body.executedAt).toBeTruthy();
    });

    it('TS-35 ghi Không đạt/Bị chặn thiếu mô tả → 400; có mô tả → 200', async () => {
      const bad = await record(run.runCases[1].id, { status: 'FAILED', actualResult: '   ' }).expect(400);
      expect(bad.body.message).toContain('cần mô tả kết quả thực tế hoặc ghi chú');
      await record(run.runCases[1].id, { status: 'FAILED', actualResult: 'Trang trắng' }).expect(200);
      await record(run.runCases[2].id, { status: 'BLOCKED' }).expect(400);
      await record(run.runCases[2].id, { status: 'BLOCKED', note: 'Thiếu dữ liệu thử' }).expect(200);
    });

    it('TS-36 trạng thái kết quả không hợp lệ → 400', () =>
      record(run.runCases[3].id, { status: 'DONE' }).expect(400));

    it('TS-37 thống kê đúng công thức: tỷ lệ đạt = Đạt/(Đạt+Không đạt), Bị chặn không tính', async () => {
      const s = (await api().get(`/api/runs/${run.id}/stats`).set(as(tester)).expect(200)).body;
      expect(s.counts).toEqual({ UNTESTED: 1, PASSED: 1, FAILED: 1, BLOCKED: 1 });
      expect(s.progress).toBeCloseTo(0.75);
      expect(s.passRate).toBeCloseTo(0.5);
      expect(s.problems.map((p: any) => p.code)).toEqual(['RUN_02', 'RUN_03']);
    });

    it('TS-38 xuất CSV: UTF-8 có BOM, tiếng Việt, đủ cột', async () => {
      const res = await api().get(`/api/runs/${run.id}/export.csv`).set(as(tester)).buffer(true).expect(200);
      expect(res.headers['content-type']).toContain('text/csv');
      expect(res.headers['content-disposition']).toContain('attachment');
      const text: string = res.text;
      expect(text.charCodeAt(0)).toBe(0xfeff);
      expect(text).toContain('"Mã ca","Tên ca","Độ ưu tiên","Trạng thái","Kết quả thực tế"');
      expect(text).toContain('"Không đạt","Trang trắng"');
      expect(text).toContain('"Tỷ lệ đạt","50.0%"');
    });

    it('TS-39 lịch sử ca qua các đợt', async () => {
      const h = (await api().get(`/api/cases/${caseIds[1]}/history`).set(as(tester)).expect(200)).body;
      const versions = h.map((x: any) => x.run.version);
      expect(versions).toEqual(expect.arrayContaining(['1.0.0', 'snap', '2.0.0']));
      expect(h.find((x: any) => x.run.version === '2.0.0').result.status).toBe('FAILED');
    });

    it('TS-40 đóng đợt; đóng lần hai → 400', async () => {
      const res = await api().patch(`/api/runs/${run.id}/close`).set(as(tester)).expect(200);
      expect(res.body.status).toBe('CLOSED');
      expect(res.body.closedAt).toBeTruthy();
      await api().patch(`/api/runs/${run.id}/close`).set(as(tester)).expect(400);
    });

    it('TS-41 sửa kết quả của đợt đã đóng → 400, kết quả cũ giữ nguyên', async () => {
      const res = await record(run.runCases[1].id, { status: 'PASSED' }).expect(400);
      expect(res.body.message).toContain('đã đóng');
      const after = (await api().get(`/api/runs/${run.id}`).set(as(tester))).body;
      expect(after.runCases[1].result.status).toBe('FAILED');
    });

    it('TS-44 so sánh với đợt trước: phát hiện ca thụt lùi và ca đã sửa', async () => {
      // Đợt 2.0.0: RUN_01 Đạt, RUN_02 Không đạt. Đợt 3.0.0 đảo ngược hai kết quả này.
      const next = (await newRun(caseIds, '3.0.0').expect(201)).body;
      const rc = (code: string) => next.runCases.find((x: any) => x.code === code).id;
      await record(rc('RUN_01'), { status: 'FAILED', actualResult: 'Hỏng sau khi sửa mã' }).expect(200);
      await record(rc('RUN_02'), { status: 'PASSED' }).expect(200);

      const s = (await api().get(`/api/runs/${next.id}/stats`).set(as(tester)).expect(200)).body;
      expect(s.comparison.previousRun.version).toBe('2.0.0');
      expect(s.comparison.regressions.map((x: any) => x.code)).toEqual(['RUN_01']);
      expect(s.comparison.regressions[0].previousStatus).toBe('PASSED');
      expect(s.comparison.fixed.map((x: any) => x.code)).toEqual(['RUN_02']);

      // Đợt đầu tiên của dự án không có đợt trước để so sánh.
      const all = (await api().get(`/api/projects/${projectId}/runs?pageSize=100`).set(as(tester))).body.items;
      const first = all[all.length - 1];
      const s0 = (await api().get(`/api/runs/${first.id}/stats`).set(as(tester)).expect(200)).body;
      expect(s0.comparison).toBeNull();
    });
  });

  describe('Quyền và lưu trữ', () => {
    it('TS-42 không có token gọi API đợt → 401', () => api().get(`/api/projects/${projectId}/runs`).expect(401));

    it('TS-43 dự án đã lưu trữ: không tạo đợt được nhưng vẫn xem được lịch sử', async () => {
      await api().patch(`/api/projects/${projectId}/archive`).set(as(admin)).expect(200);
      await newRun([caseIds[0]], '9.9.9').expect(400);
      const list = (await api().get(`/api/projects/${projectId}/runs`).set(as(tester)).expect(200)).body;
      expect(list.total).toBeGreaterThanOrEqual(3);
      expect(list.items[0].stats.total).toBeGreaterThan(0);
      await api().patch(`/api/projects/${projectId}/unarchive`).set(as(admin)).expect(200);
    });
  });
});
