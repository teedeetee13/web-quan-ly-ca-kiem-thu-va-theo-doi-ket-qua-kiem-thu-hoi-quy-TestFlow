import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { fmtDate, fmtPct } from '../labels';
import { ErrorBox, Pagination, RunStatusBadge, StatusBar } from '../components/ui';
import type { Paginated, Project, RunListItem, RunStatus } from '../types';

/** Danh sách đợt của một dự án: đọc theo hàng là thấy kết quả hồi quy qua từng phiên bản. */
export default function RunsPage() {
  const projectId = Number(useParams().projectId);
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [data, setData] = useState<Paginated<RunListItem> | null>(null);
  const [status, setStatus] = useState<RunStatus | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    api<Project>('GET', `/projects/${projectId}`).then(setProject).catch(setError);
  }, [projectId]);

  const load = useCallback(() => {
    api<Paginated<RunListItem>>('GET', `/projects/${projectId}/runs`, {
      query: { status, search, page, pageSize: 20 },
    })
      .then(setData)
      .catch(setError);
  }, [projectId, status, search, page]);
  useEffect(load, [load]);

  const readOnly = project?.isArchived ?? false;

  return (
    <>
      <div className="breadcrumb">
        <Link to="/projects">Dự án</Link> / <Link to={`/projects/${projectId}`}>{project?.name}</Link> /{' '}
        <span>Đợt kiểm thử</span>
      </div>
      <div className="page-head">
        <div>
          <h1>
            Đợt kiểm thử {readOnly && <span className="badge gray">Đã lưu trữ – chỉ xem</span>}
          </h1>
          <p className="muted">
            Mỗi đợt là một lần chạy lại các ca cho một phiên bản. Đợt mới nhất ở trên cùng.
          </p>
        </div>
        <div className="row-actions">
          <Link className="btn ghost" to={`/projects/${projectId}`}>
            Ca kiểm thử
          </Link>
          {!readOnly && (
            <Link
              className={`btn primary ${project?._count.cases ? '' : 'disabled'}`}
              to={`/projects/${projectId}/runs/new`}
            >
              + Đợt kiểm thử
            </Link>
          )}
        </div>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Tìm theo tên đợt hoặc phiên bản…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as RunStatus | '');
            setPage(1);
          }}
        >
          <option value="">Mọi trạng thái</option>
          <option value="OPEN">Đang mở</option>
          <option value="CLOSED">Đã đóng</option>
        </select>
      </div>

      <ErrorBox error={error} />

      <table className="table">
        <thead>
          <tr>
            <th>Đợt kiểm thử</th>
            <th>Phiên bản</th>
            <th>Trạng thái</th>
            <th style={{ width: 220 }}>Kết quả</th>
            <th className="num">Tiến độ</th>
            <th className="num">Tỷ lệ đạt</th>
            <th>Tạo lúc</th>
          </tr>
        </thead>
        <tbody>
          {data?.items.map((r) => (
            <tr key={r.id} className="clickable" onClick={() => navigate(`/runs/${r.id}`)}>
              <td>
                <b>{r.name}</b>
                <div className="muted small">{r.createdBy.fullName}</div>
              </td>
              <td className="mono">{r.version}</td>
              <td>
                <RunStatusBadge value={r.status} />
              </td>
              <td>
                <StatusBar stats={r.stats} />
                <div className="muted small">
                  {r.stats.counts.PASSED} đạt · {r.stats.counts.FAILED} không đạt · {r.stats.counts.BLOCKED} bị chặn
                </div>
              </td>
              <td className="num">
                {r.stats.executed}/{r.stats.total}
              </td>
              <td className="num">
                <b>{fmtPct(r.stats.passRate)}</b>
              </td>
              <td className="muted small">{fmtDate(r.createdAt)}</td>
            </tr>
          ))}
          {data?.items.length === 0 && (
            <tr>
              <td colSpan={7} className="empty">
                Chưa có đợt kiểm thử nào.
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}
    </>
  );
}
