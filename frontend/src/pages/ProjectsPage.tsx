import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { fmtDate } from '../labels';
import { ErrorBox, Field, Modal, Pagination } from '../components/ui';
import type { Paginated, Project } from '../types';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Paginated<Project> | null>(null);
  const [search, setSearch] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [page, setPage] = useState(1);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState<Project | 'new' | null>(null);

  const load = useCallback(() => {
    api<Paginated<Project>>('GET', '/projects', {
      query: { search, includeArchived, page, pageSize: 12 },
    })
      .then(setData)
      .catch(setError);
  }, [search, includeArchived, page]);

  useEffect(load, [load]);

  const toggleArchive = async (p: Project) => {
    const action = p.isArchived ? 'unarchive' : 'archive';
    if (!p.isArchived && !confirm(`Lưu trữ dự án "${p.name}"? Dữ liệu được giữ nguyên nhưng không thể chỉnh sửa.`))
      return;
    try {
      await api('PATCH', `/projects/${p.id}/${action}`);
      load();
    } catch (e) {
      setError(e);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Dự án</h1>
          <p className="muted">Mỗi dự án chứa các bộ kiểm thử và ca kiểm thử của một phần mềm cần kiểm tra.</p>
        </div>
        <button className="btn primary" onClick={() => setEditing('new')}>
          + Dự án mới
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Tìm theo tên dự án…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <label className="check">
          <input
            type="checkbox"
            checked={includeArchived}
            onChange={(e) => {
              setIncludeArchived(e.target.checked);
              setPage(1);
            }}
          />
          Hiện cả dự án đã lưu trữ
        </label>
      </div>

      <ErrorBox error={error} />

      <div className="grid">
        {data?.items.map((p) => (
          <div key={p.id} className={`card project ${p.isArchived ? 'archived' : ''}`}>
            <div className="card-top">
              <Link to={`/projects/${p.id}`} className="card-title">
                {p.name}
              </Link>
              {p.isArchived && <span className="badge gray">Đã lưu trữ</span>}
            </div>
            <p className="muted clamp">{p.description || 'Chưa có mô tả'}</p>
            <div className="stats">
              <span>
                <b>{p._count.suites}</b> bộ
              </span>
              <span>
                <b>{p._count.cases}</b> ca
              </span>
              <span>
                <b>{p._count.runs}</b> đợt
              </span>
            </div>
            <div className="card-foot">
              <span className="muted small">Cập nhật {fmtDate(p.updatedAt)}</span>
              <div className="row-actions">
                {!p.isArchived && (
                  <button className="btn ghost sm" onClick={() => setEditing(p)}>
                    Sửa
                  </button>
                )}
                {user?.role === 'ADMIN' && (
                  <button className="btn ghost sm" onClick={() => toggleArchive(p)}>
                    {p.isArchived ? 'Mở lại' : 'Lưu trữ'}
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {data && data.total === 0 && <div className="empty">Không có dự án phù hợp.</div>}
      {data && data.total > data.pageSize && (
        <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />
      )}

      {editing && (
        <ProjectModal
          project={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}
    </>
  );
}

function ProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: Project | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project?.name ?? '');
  const [description, setDescription] = useState(project?.description ?? '');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      const body = { name, description };
      if (project) await api('PATCH', `/projects/${project.id}`, { body });
      else await api('POST', '/projects', { body });
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={project ? 'Sửa dự án' : 'Tạo dự án'} onClose={onClose} onSubmit={submit} busy={busy}>
      <ErrorBox error={error} />
      <Field label="Tên dự án *">
        <input value={name} onChange={(e) => setName(e.target.value)} maxLength={100} autoFocus />
      </Field>
      <Field label="Mô tả">
        <textarea rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
    </Modal>
  );
}
