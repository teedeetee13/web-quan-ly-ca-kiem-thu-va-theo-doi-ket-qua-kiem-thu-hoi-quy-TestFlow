import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api';
import { fmtDate, fmtPct, STATUS_LABEL, STATUSES } from '../labels';
import { ErrorBox, Field, PriorityBadge, RunStatusBadge, StatusBadge, StatusBar } from '../components/ui';
import type { ResultStatus, RunCase, RunDetail } from '../types';

const statusOf = (rc: RunCase): ResultStatus => rc.result?.status ?? 'UNTESTED';

/** Màn hình thực hiện đợt: bên trái danh sách ca, bên phải bản chụp các bước và ô ghi kết quả. */
export default function RunExecutePage() {
  const runId = Number(useParams().runId);
  const [params, setParams] = useSearchParams();
  const [run, setRun] = useState<RunDetail | null>(null);
  const [filter, setFilter] = useState<ResultStatus | ''>('');
  const [error, setError] = useState<unknown>(null);

  const load = useCallback(
    () => api<RunDetail>('GET', `/runs/${runId}`).then(setRun).catch(setError),
    [runId],
  );
  useEffect(() => {
    load();
  }, [load]);

  const selectedId = Number(params.get('rc')) || run?.runCases[0]?.id;
  const select = (id: number) => setParams({ rc: String(id) }, { replace: true });
  const current = run?.runCases.find((rc) => rc.id === selectedId) ?? null;
  const visible = useMemo(
    () => run?.runCases.filter((rc) => !filter || statusOf(rc) === filter) ?? [],
    [run, filter],
  );
  const readOnly = !run || run.status === 'CLOSED' || run.project.isArchived;

  const close = async () => {
    if (!run) return;
    const left = run.stats.counts.UNTESTED;
    const warn = left ? `Còn ${left} ca chưa chạy. ` : '';
    if (!confirm(`${warn}Đóng đợt "${run.name}"? Sau khi đóng sẽ không sửa được kết quả.`)) return;
    try {
      setRun(await api<RunDetail>('PATCH', `/runs/${run.id}/close`));
    } catch (e) {
      setError(e);
    }
  };

  /** Sau khi lưu, chuyển sang ca chưa chạy kế tiếp để thao tác liên tục. */
  const onSaved = async (rcId: number) => {
    const fresh = await api<RunDetail>('GET', `/runs/${runId}`);
    setRun(fresh);
    const idx = fresh.runCases.findIndex((rc) => rc.id === rcId);
    const next = [...fresh.runCases.slice(idx + 1), ...fresh.runCases.slice(0, idx)].find(
      (rc) => statusOf(rc) === 'UNTESTED',
    );
    if (next) select(next.id);
  };

  if (!run) return <ErrorBox error={error} />;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/projects">Dự án</Link> / <Link to={`/projects/${run.project.id}`}>{run.project.name}</Link> /{' '}
        <Link to={`/projects/${run.project.id}/runs`}>Đợt kiểm thử</Link> / <span>{run.name}</span>
      </div>
      <div className="page-head">
        <div>
          <h1>
            {run.name} <span className="mono badge gray">v{run.version}</span> <RunStatusBadge value={run.status} />
          </h1>
          <p className="muted small">
            Tạo bởi {run.createdBy.fullName} · {fmtDate(run.createdAt)}
            {run.closedAt && ` · Đóng lúc ${fmtDate(run.closedAt)}`}
          </p>
        </div>
        <div className="row-actions">
          <Link className="btn ghost" to={`/runs/${run.id}/report`}>
            Thống kê &amp; CSV
          </Link>
          {!readOnly && (
            <button className="btn danger" onClick={close}>
              Đóng đợt
            </button>
          )}
        </div>
      </div>

      <div className="run-summary panel">
        <StatusBar stats={run.stats} big />
        <div className="run-summary-nums">
          <span>
            Tiến độ <b>{run.stats.executed}/{run.stats.total}</b>
          </span>
          {STATUSES.map((s) => (
            <span key={s}>
              <StatusBadge value={s} /> <b>{run.stats.counts[s]}</b>
            </span>
          ))}
          <span>
            Tỷ lệ đạt <b>{fmtPct(run.stats.passRate)}</b>
          </span>
        </div>
      </div>

      {run.status === 'CLOSED' && (
        <div className="alert info">Đợt đã đóng: kết quả được chốt, chỉ xem. Muốn kiểm tra lại, hãy tạo đợt mới.</div>
      )}
      <ErrorBox error={error} />

      <div className="run-split">
        <aside className="suite-panel run-list">
          <div className="suite-head">
            <b>{visible.length} ca</b>
            <select value={filter} onChange={(e) => setFilter(e.target.value as ResultStatus | '')}>
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABEL[s]}
                </option>
              ))}
            </select>
          </div>
          {visible.map((rc) => (
            <button
              key={rc.id}
              className={`suite-item run-item ${rc.id === current?.id ? 'active' : ''}`}
              onClick={() => select(rc.id)}
            >
              <span className={`dot st-${statusOf(rc).toLowerCase()}`} title={STATUS_LABEL[statusOf(rc)]} />
              <span className="run-item-text">
                <span className="mono small">{rc.code}</span>
                <span className="run-item-title">{rc.title}</span>
              </span>
            </button>
          ))}
        </aside>

        {current && (
          <section className="panel run-case">
            <div className="run-case-head">
              <div>
                <div className="mono muted">{current.code}</div>
                <h2>{current.title}</h2>
              </div>
              <PriorityBadge value={current.priority} />
            </div>
            <p className="muted small">
              Bản chụp lúc tạo đợt.{' '}
              {current.testCaseId ? (
                <Link to={`/cases/${current.testCaseId}`}>Xem ca gốc hiện tại</Link>
              ) : (
                'Ca gốc đã bị xoá, lịch sử vẫn được giữ.'
              )}
            </p>
            {current.preconditions && (
              <p>
                <b>Tiền điều kiện:</b> {current.preconditions}
              </p>
            )}
            <table className="table steps-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Thao tác</th>
                  <th>Kết quả mong đợi</th>
                </tr>
              </thead>
              <tbody>
                {current.stepsSnapshot.map((s) => (
                  <tr key={s.order}>
                    <td className="num">{s.order}</td>
                    <td>{s.action}</td>
                    <td>{s.expected}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <ResultForm key={current.id} rc={current} readOnly={readOnly} onSaved={onSaved} />
          </section>
        )}
      </div>
    </>
  );
}

function ResultForm({
  rc,
  readOnly,
  onSaved,
}: {
  rc: RunCase;
  readOnly: boolean;
  onSaved: (rcId: number) => Promise<void>;
}) {
  const [status, setStatus] = useState<ResultStatus>(statusOf(rc));
  const [actualResult, setActual] = useState(rc.result?.actualResult ?? '');
  const [note, setNote] = useState(rc.result?.note ?? '');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await api('PATCH', `/run-cases/${rc.id}/result`, { body: { status, actualResult, note } });
      await onSaved(rc.id);
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  const needsText = status === 'FAILED' || status === 'BLOCKED';

  return (
    <form onSubmit={submit} className="result-form">
      <h3>Kết quả</h3>
      <ErrorBox error={error} />
      <fieldset disabled={readOnly}>
        <div className="status-picker" role="radiogroup" aria-label="Trạng thái kết quả">
          {(['PASSED', 'FAILED', 'BLOCKED', 'UNTESTED'] as ResultStatus[]).map((s) => (
            <label key={s} className={`status-option st-${s.toLowerCase()} ${status === s ? 'checked' : ''}`}>
              <input type="radio" name="status" value={s} checked={status === s} onChange={() => setStatus(s)} />
              {STATUS_LABEL[s]}
            </label>
          ))}
        </div>
        <Field
          label={needsText ? 'Kết quả thực tế *' : 'Kết quả thực tế'}
          hint={needsText ? 'Không đạt hoặc Bị chặn cần có kết quả thực tế hoặc ghi chú' : undefined}
        >
          <textarea rows={3} value={actualResult} onChange={(e) => setActual(e.target.value)}
            placeholder="Điều thực sự xảy ra khi làm theo các bước" />
        </Field>
        <Field label="Ghi chú">
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)}
            placeholder="VD: lý do bị chặn, mã lỗi đã báo" />
        </Field>
      </fieldset>
      {rc.result?.executedAt && (
        <p className="muted small">
          Ghi bởi {rc.result.executedBy?.fullName} · {fmtDate(rc.result.executedAt)}
        </p>
      )}
      {!readOnly && (
        <div className="form-actions">
          <div className="spacer" />
          <button className="btn primary" disabled={busy}>
            {busy ? 'Đang lưu…' : 'Lưu kết quả'}
          </button>
        </div>
      )}
    </form>
  );
}
