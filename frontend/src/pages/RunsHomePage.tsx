import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { ErrorBox } from '../components/ui';
import type { Paginated, Project } from '../types';

/** Lối vào menu "Đợt kiểm thử": đợt thuộc về dự án nên chọn dự án trước. */
export default function RunsHomePage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [error, setError] = useState<unknown>(null);

  useEffect(() => {
    api<Paginated<Project>>('GET', '/projects', { query: { includeArchived: true, pageSize: 100 } })
      .then((d) => setProjects(d.items))
      .catch(setError);
  }, []);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Đợt kiểm thử</h1>
          <p className="muted">Chọn dự án để xem các đợt kiểm thử hồi quy và thống kê.</p>
        </div>
      </div>
      <ErrorBox error={error} />
      <table className="table">
        <thead>
          <tr>
            <th>Dự án</th>
            <th className="num">Số ca</th>
            <th className="num">Số đợt</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {projects?.map((p) => (
            <tr key={p.id} className="clickable" onClick={() => navigate(`/projects/${p.id}/runs`)}>
              <td>
                <b>{p.name}</b> {p.isArchived && <span className="badge gray">Đã lưu trữ</span>}
              </td>
              <td className="num">{p._count.cases}</td>
              <td className="num">{p._count.runs}</td>
              <td className="num">
                <span className="btn ghost sm">Xem đợt ›</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
