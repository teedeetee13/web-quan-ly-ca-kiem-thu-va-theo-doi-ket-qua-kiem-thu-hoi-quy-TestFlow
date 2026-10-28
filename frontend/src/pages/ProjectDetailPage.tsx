import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { fmtDate, PRIORITIES, PRIORITY_LABEL } from '../labels';
import { ErrorBox, Field, Modal, Pagination, PriorityBadge } from '../components/ui';
import type { CaseListItem, Paginated, Priority, Project, Suite } from '../types';

export default function ProjectDetailPage() {
  const projectId = Number(useParams().projectId);
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [suites, setSuites] = useState<Suite[]>([]);
  const [cases, setCases] = useState<Paginated<CaseListItem> | null>(null);
  const [suiteId, setSuiteId] = useState<number | null>(null);
  const [priority, setPriority] = useState<Priority | ''>('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<unknown>(null);
  const [suiteModal, setSuiteModal] = useState<Suite | 'new' | null>(null);

  const loadProject = useCallback(() => {
    api<Project>('GET', `/projects/${projectId}`).then(setProject).catch(setError);
    api<Suite[]>('GET', `/projects/${projectId}/suites`).then(setSuites).catch(setError);
  }, [projectId]);

  const loadCases = useCallback(() => {
    api<Paginated<CaseListItem>>('GET', `/projects/${projectId}/cases`, {
      query: { suiteId, priority, search, page, pageSize: 15 },
    })
      .then(setCases)
      .catch(setError);
  }, [projectId, suiteId, priority, search, page]);

  useEffect(loadProject, [loadProject]);
  useEffect(loadCases, [loadCases]);

  const readOnly = project?.isArchived ?? false;

  const deleteSuite = async (s: Suite) => {
    if (!confirm(`Xoá bộ kiểm thử "${s.name}"?`)) return;
    try {
      await api('DELETE', `/suites/${s.id}`);
      if (suiteId === s.id) setSuiteId(null);
      loadProject();
    } catch (e) {
      setError(e);
    }
  };

  const filter = (fn: () => void) => {
    fn();
    setPage(1);
  };

  return (
    <>
      <div className="breadcrumb">
        <Link to="/projects">Dự án</Link> / <span>{project?.name}</span>
      </div>
      <div className="page-head">
        <div>
          <h1>
            {project?.name} {readOnly && <span className="badge gray">Đã lưu trữ – chỉ xem</span>}
          </h1>
          <p className="muted">{project?.description}</p>
        </div>
        {!readOnly && (
          <button
            className="btn primary"
            disabled={suites.length === 0}
            title={suites.length === 0 ? 'Hãy tạo bộ kiểm thử trước' : undefined}
            onClick={() => navigate(`/projects/${projectId}/cases/new${suiteId ? `?suiteId=${suiteId}` : ''}`)}
          >
            + Ca kiểm thử
          </button>
        )}
      </div>

      <ErrorBox error={error} />

      <div className="split">
        <aside className="suite-panel">
          <div className="suite-head">
            <b>Bộ kiểm thử</b>
            {!readOnly && (
              <button className="btn ghost sm" onClick={() => setSuiteModal('new')}>
                + Thêm
              </button>
            )}
          </div>
          <button
            className={`suite-item ${suiteId === null ? 'active' : ''}`}
            onClick={() => filter(() => setSuiteId(null))}
          >
            <span>Tất cả</span>
            <span className="count">{project?._count.cases ?? 0}</span>
          </button>
          {suites.map((s) => (
            <div key={s.id} className={`suite-item ${suiteId === s.id ? 'active' : ''}`}>
              <button className="suite-name" onClick={() => filter(() => setSuiteId(s.id))}>
                {s.name}
              </button>
              <span className="count">{s._count.cases}</span>
              {!readOnly && (
                <span className="suite-actions">
                  <button title="Sửa" onClick={() => setSuiteModal(s)}>
                    ✎
                  </button>
                  <button title="Xoá" onClick={() => deleteSuite(s)}>
                    ✕
                  </button>
                </span>
              )}
            </div>
          ))}
          {suites.length === 0 && <p className="muted small">Chưa có bộ kiểm thử.</p>}
        </aside>

        <section className="case-panel">
          <div className="toolbar">
            <input
              className="search"
              placeholder="Tìm theo mã hoặc tên ca…"
              value={search}
              onChange={(e) => filter(() => setSearch(e.target.value))}
            />
            <select value={priority} onChange={(e) => filter(() => setPriority(e.target.value as Priority | ''))}>
              <option value="">Mọi độ ưu tiên</option>
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABEL[p]}
                </option>
              ))}
            </select>
          </div>

          <table className="table">
            <thead>
              <tr>
                <th style={{ width: 150 }}>Mã ca</th>
                <th>Tên ca kiểm thử</th>
                <th>Bộ</th>
                <th>Ưu tiên</th>
                <th className="num">Bước</th>
                <th>Cập nhật</th>
              </tr>
            </thead>
            <tbody>
              {cases?.items.map((c) => (
                <tr key={c.id} onClick={() => navigate(`/cases/${c.id}`)} className="clickable">
                  <td className="mono">{c.code}</td>
                  <td>{c.title}</td>
                  <td className="muted">{c.suite.name}</td>
                  <td>
                    <PriorityBadge value={c.priority} />
                  </td>
                  <td className="num">{c._count.steps}</td>
                  <td className="muted small">{fmtDate(c.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {cases && cases.total === 0 && <div className="empty">Không có ca kiểm thử phù hợp.</div>}
          {cases && (
            <Pagination page={cases.page} pageSize={cases.pageSize} total={cases.total} onChange={setPage} />
          )}
        </section>
      </div>

      {suiteModal && (
        <SuiteModal
          projectId={projectId}
          suite={suiteModal === 'new' ? null : suiteModal}
          onClose={() => setSuiteModal(null)}
          onSaved={() => {
            setSuiteModal(null);
            loadProject();
            loadCases();
          }}
        />
      )}
    </>
  );
}

function SuiteModal({
  projectId,
  suite,
  onClose,
  onSaved,
}: {
  projectId: number;
  suite: Suite | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(suite?.name ?? '');
  const [description, setDescription] = useState(suite?.description ?? '');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = { name, description };
      if (suite) await api('PATCH', `/suites/${suite.id}`, { body });
      else await api('POST', `/projects/${projectId}/suites`, { body });
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={suite ? 'Sửa bộ kiểm thử' : 'Thêm bộ kiểm thử'} onClose={onClose} onSubmit={submit} busy={busy}>
      <ErrorBox error={error} />
      <Field label="Tên bộ *">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus />
      </Field>
      <Field label="Mô tả">
        <textarea rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
    </Modal>
  );
}
