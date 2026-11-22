import { FormEvent, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api';
import { PRIORITIES, PRIORITY_LABEL } from '../labels';
import { ErrorBox, Field, PriorityBadge } from '../components/ui';
import type { CaseListItem, Paginated, Priority, Project, RunDetail, Suite } from '../types';

/** Tải toàn bộ ca của dự án (API phân trang tối đa 100 ca/lần). */
async function loadAllCases(projectId: number) {
  const all: CaseListItem[] = [];
  for (let page = 1; ; page++) {
    const res = await api<Paginated<CaseListItem>>('GET', `/projects/${projectId}/cases`, {
      query: { page, pageSize: 100 },
    });
    all.push(...res.items);
    if (all.length >= res.total || res.items.length === 0) return all;
  }
}

export default function CreateRunPage() {
  const projectId = Number(useParams().projectId);
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [suites, setSuites] = useState<Suite[]>([]);
  const [cases, setCases] = useState<CaseListItem[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [name, setName] = useState('');
  const [version, setVersion] = useState('');
  const [suiteId, setSuiteId] = useState<number | ''>('');
  const [priority, setPriority] = useState<Priority | ''>('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api<Project>('GET', `/projects/${projectId}`).then(setProject).catch(setError);
    api<Suite[]>('GET', `/projects/${projectId}/suites`).then(setSuites).catch(setError);
    loadAllCases(projectId)
      .then((all) => {
        setCases(all);
        setSelected(new Set(all.map((c) => c.id))); // hồi quy đầy đủ là lựa chọn mặc định
      })
      .catch(setError);
  }, [projectId]);

  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cases.filter(
      (c) =>
        (suiteId === '' || c.suiteId === suiteId) &&
        (priority === '' || c.priority === priority) &&
        (!q || c.code.toLowerCase().includes(q) || c.title.toLowerCase().includes(q)),
    );
  }, [cases, suiteId, priority, search]);

  const allVisibleSelected = visible.length > 0 && visible.every((c) => selected.has(c.id));
  const toggleVisible = () => {
    const next = new Set(selected);
    for (const c of visible) (allVisibleSelected ? next.delete(c.id) : next.add(c.id));
    setSelected(next);
  };
  const toggle = (id: number) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const run = await api<RunDetail>('POST', `/projects/${projectId}/runs`, {
        body: { name, version, caseIds: [...selected] },
      });
      navigate(`/runs/${run.id}`, { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit}>
      <div className="breadcrumb">
        <Link to="/projects">Dự án</Link> / <Link to={`/projects/${projectId}`}>{project?.name}</Link> /{' '}
        <Link to={`/projects/${projectId}/runs`}>Đợt kiểm thử</Link> / <span>Đợt mới</span>
      </div>
      <div className="page-head">
        <div>
          <h1>Tạo đợt kiểm thử</h1>
          <p className="muted">
            Nội dung các ca được chụp lại lúc tạo đợt. Sửa ca gốc sau này không làm thay đổi đợt này.
          </p>
        </div>
      </div>

      <ErrorBox error={error} />

      <div className="panel">
        <div className="form-grid two">
          <Field label="Tên đợt *">
            <input value={name} onChange={(e) => setName(e.target.value)} maxLength={150} autoFocus
              placeholder="VD: Hồi quy trước phát hành 1.3" />
          </Field>
          <Field label="Phiên bản phần mềm *" hint="Phiên bản đang được kiểm thử">
            <input className="mono" value={version} onChange={(e) => setVersion(e.target.value)} maxLength={50}
              placeholder="VD: 1.3.0" />
          </Field>
        </div>
      </div>

      <div className="steps-head" style={{ marginTop: 18 }}>
        <b>Chọn ca kiểm thử</b>
        <span className="muted small">
          Đã chọn <b>{selected.size}</b>/{cases.length} ca
        </span>
      </div>
      <div className="toolbar">
        <input className="search" placeholder="Tìm theo mã hoặc tên ca…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select value={suiteId} onChange={(e) => setSuiteId(e.target.value ? Number(e.target.value) : '')}>
          <option value="">Mọi bộ kiểm thử</option>
          {suites.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={priority} onChange={(e) => setPriority(e.target.value as Priority | '')}>
          <option value="">Mọi độ ưu tiên</option>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>
              {PRIORITY_LABEL[p]}
            </option>
          ))}
        </select>
        <button type="button" className="btn ghost sm" onClick={() => setSelected(new Set())}>
          Bỏ chọn tất cả
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th style={{ width: 40 }}>
              <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisible}
                aria-label="Chọn tất cả ca đang hiển thị" />
            </th>
            <th style={{ width: 150 }}>Mã ca</th>
            <th>Tên ca kiểm thử</th>
            <th>Bộ</th>
            <th>Ưu tiên</th>
          </tr>
        </thead>
        <tbody>
          {visible.map((c) => (
            <tr key={c.id} className="clickable" onClick={() => toggle(c.id)}>
              <td>
                <input type="checkbox" checked={selected.has(c.id)} onChange={() => toggle(c.id)}
                  onClick={(e) => e.stopPropagation()} aria-label={`Chọn ${c.code}`} />
              </td>
              <td className="mono">{c.code}</td>
              <td>{c.title}</td>
              <td className="muted">{c.suite.name}</td>
              <td>
                <PriorityBadge value={c.priority} />
              </td>
            </tr>
          ))}
          {visible.length === 0 && (
            <tr>
              <td colSpan={5} className="empty">
                Không có ca phù hợp.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="form-actions">
        <div className="spacer" />
        <Link className="btn ghost" to={`/projects/${projectId}/runs`}>
          Huỷ
        </Link>
        <button className="btn primary" disabled={busy || selected.size === 0}>
          {busy ? 'Đang tạo…' : `Tạo đợt với ${selected.size} ca`}
        </button>
      </div>
    </form>
  );
}
