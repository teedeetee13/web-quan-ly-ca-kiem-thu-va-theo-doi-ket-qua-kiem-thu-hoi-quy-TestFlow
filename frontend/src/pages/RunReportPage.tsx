import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api, download } from '../api';
import { fmtDate, fmtPct, PRIORITY_LABEL, STATUS_LABEL } from '../labels';
import { ErrorBox, PriorityBadge, RunStatusBadge, StatusBadge, StatusBar } from '../components/ui';
import type { RunReport } from '../types';

/** Thống kê một đợt: số liệu để người phụ trách quyết định phát hành, kèm xuất CSV. */
export default function RunReportPage() {
  const runId = Number(useParams().runId);
  const [report, setReport] = useState<RunReport | null>(null);
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<RunReport>('GET', `/runs/${runId}/stats`).then(setReport).catch(setError);
  }, [runId]);

  const exportCsv = async () => {
    setBusy(true);
    try {
      await download(`/runs/${runId}/export.csv`);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  if (!report) return <ErrorBox error={error} />;
  const { run } = report;
  const tiles = [
    { label: 'Tổng số ca', value: report.total },
    { label: 'Tiến độ', value: `${report.executed}/${report.total}`, sub: `${(report.progress * 100).toFixed(0)}%` },
    { label: 'Tỷ lệ đạt', value: fmtPct(report.passRate), sub: 'Đạt / (Đạt + Không đạt)' },
  ];

  return (
    <>
      <div className="breadcrumb">
        <Link to="/projects">Dự án</Link> / <Link to={`/projects/${run.project.id}`}>{run.project.name}</Link> /{' '}
        <Link to={`/projects/${run.project.id}/runs`}>Đợt kiểm thử</Link> /{' '}
        <Link to={`/runs/${run.id}`}>{run.name}</Link> / <span>Thống kê</span>
      </div>
      <div className="page-head">
        <div>
          <h1>
            Thống kê: {run.name} <span className="mono badge gray">v{run.version}</span>{' '}
            <RunStatusBadge value={run.status} />
          </h1>
          <p className="muted small">
            Tạo lúc {fmtDate(run.createdAt)}
            {run.closedAt && ` · Đóng lúc ${fmtDate(run.closedAt)}`}
          </p>
        </div>
        <div className="row-actions">
          <Link className="btn ghost" to={`/runs/${run.id}`}>
            Về đợt kiểm thử
          </Link>
          <button className="btn primary" onClick={exportCsv} disabled={busy}>
            {busy ? 'Đang xuất…' : 'Xuất CSV'}
          </button>
        </div>
      </div>
      <ErrorBox error={error} />

      <div className="tiles">
        {tiles.map((t) => (
          <div key={t.label} className="tile">
            <div className="muted small">{t.label}</div>
            <div className="tile-value">{t.value}</div>
            {t.sub && <div className="muted small">{t.sub}</div>}
          </div>
        ))}
        {(['PASSED', 'FAILED', 'BLOCKED', 'UNTESTED'] as const).map((s) => (
          <div key={s} className="tile">
            <div>
              <StatusBadge value={s} />
            </div>
            <div className="tile-value">{report.counts[s]}</div>
          </div>
        ))}
      </div>

      <div className="panel" style={{ marginTop: 16 }}>
        <StatusBar stats={report} big />
        <p className="muted small" style={{ marginTop: 8 }}>
          Ca Chưa chạy và Bị chặn không tính vào tỷ lệ đạt vì chưa cho biết gì về chất lượng phần mềm.
        </p>
      </div>

      <Comparison report={report} />

      <h2 style={{ marginTop: 24 }}>Theo độ ưu tiên</h2>
      <table className="table">
        <thead>
          <tr>
            <th>Độ ưu tiên</th>
            <th className="num">Số ca</th>
            <th className="num">{STATUS_LABEL.PASSED}</th>
            <th className="num">{STATUS_LABEL.FAILED}</th>
            <th className="num">{STATUS_LABEL.BLOCKED}</th>
            <th className="num">{STATUS_LABEL.UNTESTED}</th>
            <th className="num">Tỷ lệ đạt</th>
          </tr>
        </thead>
        <tbody>
          {report.byPriority.map((p) => (
            <tr key={p.priority}>
              <td>{PRIORITY_LABEL[p.priority]}</td>
              <td className="num">{p.total}</td>
              <td className="num">{p.counts.PASSED}</td>
              <td className="num">{p.counts.FAILED}</td>
              <td className="num">{p.counts.BLOCKED}</td>
              <td className="num">{p.counts.UNTESTED}</td>
              <td className="num">{fmtPct(p.passRate)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2 style={{ marginTop: 24 }}>Ca Không đạt và Bị chặn ({report.problems.length})</h2>
      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 140 }}>Mã ca</th>
            <th>Tên ca</th>
            <th>Ưu tiên</th>
            <th>Trạng thái</th>
            <th>Kết quả thực tế / ghi chú</th>
          </tr>
        </thead>
        <tbody>
          {report.problems.map((p) => (
            <tr key={p.runCaseId}>
              <td className="mono">
                <Link to={`/runs/${run.id}?rc=${p.runCaseId}`}>{p.code}</Link>
              </td>
              <td>{p.title}</td>
              <td>
                <PriorityBadge value={p.priority} />
              </td>
              <td>
                <StatusBadge value={p.status} />
              </td>
              <td>
                {p.actualResult}
                {p.note && <div className="muted small">{p.note}</div>}
              </td>
            </tr>
          ))}
          {report.problems.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Không có ca Không đạt hoặc Bị chặn.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </>
  );
}

const KIND = {
  regressions: { label: 'Thụt lùi', cls: 'st-failed', hint: 'Đợt trước Đạt, đợt này Không đạt' },
  fixed: { label: 'Đã sửa', cls: 'st-passed', hint: 'Đợt trước Không đạt, đợt này Đạt' },
  stillFailing: { label: 'Vẫn lỗi', cls: 'st-blocked', hint: 'Không đạt ở cả hai đợt' },
} as const;

/** So sánh với đợt liền trước: điều người phụ trách cần biết nhất khi kiểm thử hồi quy. */
function Comparison({ report }: { report: RunReport }) {
  const c = report.comparison;
  if (!c) {
    return (
      <div className="panel compare" style={{ marginTop: 16 }}>
        <h2>So với đợt trước</h2>
        <p className="muted">Đây là đợt đầu tiên của dự án, chưa có đợt trước để so sánh.</p>
      </div>
    );
  }
  const kinds = Object.keys(KIND) as (keyof typeof KIND)[];
  const rows = kinds.flatMap((k) => c[k].map((r) => ({ ...r, kind: k })));
  return (
    <div className="panel compare" style={{ marginTop: 16 }}>
      <h2>
        So với đợt trước:{' '}
        <Link to={`/runs/${c.previousRun.id}/report`}>
          {c.previousRun.name} <span className="mono">v{c.previousRun.version}</span>
        </Link>
      </h2>
      <div className="compare-nums">
        {kinds.map((k) => (
          <span key={k} title={KIND[k].hint}>
            <span className={`badge ${KIND[k].cls}`}>{KIND[k].label}</span> <b>{c[k].length}</b>
          </span>
        ))}
        <span className="muted">Ca mới so với đợt trước: {c.added.length}</span>
      </div>
      {rows.length === 0 ? (
        <p className="muted">Không có ca nào thay đổi giữa Đạt và Không đạt so với đợt trước.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Thay đổi</th>
              <th style={{ width: 140 }}>Mã ca</th>
              <th>Tên ca</th>
              <th>Ưu tiên</th>
              <th>Bản {c.previousRun.version}</th>
              <th>Bản {report.run.version}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={`${r.kind}-${r.runCaseId}`}>
                <td>
                  <span className={`badge ${KIND[r.kind].cls}`}>{KIND[r.kind].label}</span>
                </td>
                <td className="mono">
                  <Link to={`/runs/${report.run.id}?rc=${r.runCaseId}`}>{r.code}</Link>
                </td>
                <td>{r.title}</td>
                <td>
                  <PriorityBadge value={r.priority} />
                </td>
                <td>{r.previousStatus && <StatusBadge value={r.previousStatus} />}</td>
                <td>
                  <StatusBadge value={r.status} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
