import { FormEvent, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { fmtDate, PRIORITIES, PRIORITY_LABEL } from '../labels';
import { ErrorBox, Field } from '../components/ui';
import type { Priority, Project, Step, Suite, TestCase } from '../types';

interface FormState {
  code: string;
  title: string;
  preconditions: string;
  priority: Priority;
  suiteId: number | '';
  steps: Step[];
}

const emptyStep = (): Step => ({ action: '', expected: '' });

/** Dùng chung cho tạo mới (/projects/:id/cases/new) và xem/sửa (/cases/:id). */
export default function CaseFormPage() {
  const params = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const caseId = params.caseId ? Number(params.caseId) : null;

  const [projectId, setProjectId] = useState<number | null>(
    params.projectId ? Number(params.projectId) : null,
  );
  const [project, setProject] = useState<Project | null>(null);
  const [suites, setSuites] = useState<Suite[]>([]);
  const [original, setOriginal] = useState<TestCase | null>(null);
  const [form, setForm] = useState<FormState>({
    code: '',
    title: '',
    preconditions: '',
    priority: 'MEDIUM',
    suiteId: searchParams.get('suiteId') ? Number(searchParams.get('suiteId')) : '',
    steps: [emptyStep()],
  });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    api<TestCase>('GET', `/cases/${caseId}`)
      .then((tc) => {
        setOriginal(tc);
        setProjectId(tc.projectId);
        setForm({
          code: tc.code,
          title: tc.title,
          preconditions: tc.preconditions ?? '',
          priority: tc.priority,
          suiteId: tc.suiteId,
          steps: tc.steps.map(({ action, expected }) => ({ action, expected })),
        });
      })
      .catch(setError);
  }, [caseId]);

  useEffect(() => {
    if (!projectId) return;
    api<Project>('GET', `/projects/${projectId}`).then(setProject).catch(setError);
    api<Suite[]>('GET', `/projects/${projectId}/suites`).then(setSuites).catch(setError);
  }, [projectId]);

  const readOnly = project?.isArchived ?? false;
  const set = <K extends keyof FormState>(k: K, v: FormState[K]) => {
    setSaved(false);
    setForm((f) => ({ ...f, [k]: v }));
  };
  const setStep = (i: number, patch: Partial<Step>) =>
    set('steps', form.steps.map((s, j) => (j === i ? { ...s, ...patch } : s)));
  const moveStep = (i: number, d: -1 | 1) => {
    const steps = [...form.steps];
    [steps[i], steps[i + d]] = [steps[i + d], steps[i]];
    set('steps', steps);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const body = { ...form, suiteId: form.suiteId === '' ? undefined : form.suiteId };
      if (caseId) {
        const tc = await api<TestCase>('PATCH', `/cases/${caseId}`, { body });
        setOriginal(tc);
        setSaved(true);
      } else {
        const tc = await api<TestCase>('POST', `/projects/${projectId}/cases`, { body });
        navigate(`/cases/${tc.id}`, { replace: true });
      }
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const remove = async () => {
    if (!caseId || !confirm(`Xoá ca ${form.code}? Thao tác không thể hoàn tác.`)) return;
    try {
      await api('DELETE', `/cases/${caseId}`);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      setError(err);
    }
  };

  return (
    <form onSubmit={submit} className="case-form">
      <div className="breadcrumb">
        <Link to="/projects">Dự án</Link> / <Link to={`/projects/${projectId}`}>{project?.name}</Link> /{' '}
        <span>{caseId ? form.code || '…' : 'Ca mới'}</span>
      </div>
      <div className="page-head">
        <h1>{caseId ? (readOnly ? 'Chi tiết ca kiểm thử' : 'Sửa ca kiểm thử') : 'Tạo ca kiểm thử'}</h1>
        {original && (
          <p className="muted small">
            Tạo bởi {original.createdBy.fullName} · {fmtDate(original.createdAt)}
            {original.updatedBy && ` · Sửa lần cuối bởi ${original.updatedBy.fullName} · ${fmtDate(original.updatedAt)}`}
          </p>
        )}
      </div>

      <ErrorBox error={error} />
      {saved && <div className="alert success">Đã lưu thay đổi.</div>}

      <fieldset disabled={readOnly} className="panel">
        <div className="form-grid">
          <Field label="Mã ca *" hint="VD: TC_LOGIN_02 — tự viết hoa, duy nhất trong dự án">
            <input
              className="mono"
              value={form.code}
              onChange={(e) => set('code', e.target.value)}
              maxLength={50}
              autoFocus={!caseId}
            />
          </Field>
          <Field label="Bộ kiểm thử *">
            <select
              value={form.suiteId}
              onChange={(e) => set('suiteId', e.target.value ? Number(e.target.value) : '')}
            >
              <option value="">— Chọn bộ —</option>
              {suites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Độ ưu tiên">
            <select value={form.priority} onChange={(e) => set('priority', e.target.value as Priority)}>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Field label="Tên ca kiểm thử *">
          <input value={form.title} onChange={(e) => set('title', e.target.value)} maxLength={200} />
        </Field>
        <Field label="Tiền điều kiện">
          <textarea
            rows={2}
            value={form.preconditions}
            onChange={(e) => set('preconditions', e.target.value)}
            placeholder="VD: Có tài khoản thử nghiệm đang hoạt động"
          />
        </Field>

        <div className="steps-head">
          <b>Các bước thực hiện *</b>
          <span className="muted small">Mỗi bước gồm thao tác và kết quả mong đợi</span>
        </div>
        <div className="steps">
          {form.steps.map((s, i) => (
            <div key={i} className="step">
              <div className="step-no">{i + 1}</div>
              <textarea
                rows={2}
                placeholder="Thao tác"
                value={s.action}
                onChange={(e) => setStep(i, { action: e.target.value })}
              />
              <textarea
                rows={2}
                placeholder="Kết quả mong đợi"
                value={s.expected}
                onChange={(e) => setStep(i, { expected: e.target.value })}
              />
              {!readOnly && (
                <div className="step-tools">
                  <button type="button" disabled={i === 0} onClick={() => moveStep(i, -1)} title="Lên">
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={i === form.steps.length - 1}
                    onClick={() => moveStep(i, 1)}
                    title="Xuống"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    disabled={form.steps.length === 1}
                    onClick={() => set('steps', form.steps.filter((_, j) => j !== i))}
                    title="Xoá bước"
                  >
                    ✕
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!readOnly && (
          <button type="button" className="btn ghost sm" onClick={() => set('steps', [...form.steps, emptyStep()])}>
            + Thêm bước
          </button>
        )}
      </fieldset>

      <div className="form-actions">
        {caseId && !readOnly && (
          <button type="button" className="btn danger" onClick={remove}>
            Xoá ca
          </button>
        )}
        <div className="spacer" />
        <Link className="btn ghost" to={`/projects/${projectId}`}>
          Quay lại
        </Link>
        {!readOnly && (
          <button className="btn primary" disabled={busy}>
            {busy ? 'Đang lưu…' : caseId ? 'Lưu thay đổi' : 'Tạo ca'}
          </button>
        )}
      </div>
    </form>
  );
}
