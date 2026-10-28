import { useCallback, useEffect, useState } from 'react';
import { api } from '../api';
import { useAuth } from '../auth';
import { fmtDate, ROLE_LABEL } from '../labels';
import { ErrorBox, Field, Modal, Pagination } from '../components/ui';
import type { Paginated, Role, User } from '../types';

export default function UsersPage() {
  const { user: me } = useAuth();
  const [data, setData] = useState<Paginated<User> | null>(null);
  const [search, setSearch] = useState('');
  const [role, setRole] = useState<Role | ''>('');
  const [page, setPage] = useState(1);
  const [error, setError] = useState<unknown>(null);
  const [editing, setEditing] = useState<User | 'new' | null>(null);

  const load = useCallback(() => {
    api<Paginated<User>>('GET', '/users', { query: { search, role, page, pageSize: 20 } })
      .then(setData)
      .catch(setError);
  }, [search, role, page]);
  useEffect(load, [load]);

  const toggleActive = async (u: User) => {
    try {
      await api('PATCH', `/users/${u.id}`, { body: { isActive: !u.isActive } });
      load();
    } catch (e) {
      setError(e);
    }
  };

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Tài khoản</h1>
          <p className="muted">Chỉ Admin truy cập được trang này (backend trả 403 nếu Tester gọi API).</p>
        </div>
        <button className="btn primary" onClick={() => setEditing('new')}>
          + Tài khoản mới
        </button>
      </div>

      <div className="toolbar">
        <input
          className="search"
          placeholder="Tìm theo email hoặc họ tên…"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
        <select
          value={role}
          onChange={(e) => {
            setRole(e.target.value as Role | '');
            setPage(1);
          }}
        >
          <option value="">Mọi vai trò</option>
          <option value="ADMIN">Admin</option>
          <option value="TESTER">Tester</option>
        </select>
      </div>

      <ErrorBox error={error} />

      <table className="table">
        <thead>
          <tr>
            <th>Họ tên</th>
            <th>Email</th>
            <th>Vai trò</th>
            <th>Trạng thái</th>
            <th>Ngày tạo</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {data?.items.map((u) => (
            <tr key={u.id}>
              <td>
                {u.fullName} {u.id === me?.id && <span className="muted small">(bạn)</span>}
              </td>
              <td>{u.email}</td>
              <td>
                <span className={`role role-${u.role}`}>{ROLE_LABEL[u.role]}</span>
              </td>
              <td>
                <span className={`badge ${u.isActive ? 'green' : 'gray'}`}>
                  {u.isActive ? 'Hoạt động' : 'Đã khoá'}
                </span>
              </td>
              <td className="muted small">{fmtDate(u.createdAt)}</td>
              <td className="row-actions">
                <button className="btn ghost sm" onClick={() => setEditing(u)}>
                  Sửa
                </button>
                {u.id !== me?.id && (
                  <button className="btn ghost sm" onClick={() => toggleActive(u)}>
                    {u.isActive ? 'Khoá' : 'Mở khoá'}
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {data && <Pagination page={data.page} pageSize={data.pageSize} total={data.total} onChange={setPage} />}

      {editing && (
        <UserModal
          user={editing === 'new' ? null : editing}
          isSelf={editing !== 'new' && editing.id === me?.id}
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

function UserModal({
  user,
  isSelf,
  onClose,
  onSaved,
}: {
  user: User | null;
  isSelf: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    email: user?.email ?? '',
    fullName: user?.fullName ?? '',
    role: (user?.role ?? 'TESTER') as Role,
    password: '',
  });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    setBusy(true);
    setError(null);
    try {
      if (user) {
        await api('PATCH', `/users/${user.id}`, {
          body: {
            fullName: form.fullName,
            role: isSelf ? undefined : form.role,
            password: form.password || undefined,
          },
        });
      } else {
        await api('POST', '/users', { body: form });
      }
      onSaved();
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title={user ? 'Sửa tài khoản' : 'Tạo tài khoản'} onClose={onClose} onSubmit={submit} busy={busy}>
      <ErrorBox error={error} />
      <Field label="Email *">
        <input
          type="email"
          value={form.email}
          disabled={!!user}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          autoFocus={!user}
        />
      </Field>
      <Field label="Họ tên *">
        <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
      </Field>
      <Field label="Vai trò" hint={isSelf ? 'Không thể tự đổi vai trò của chính mình' : undefined}>
        <select
          value={form.role}
          disabled={isSelf}
          onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
        >
          <option value="TESTER">Tester – thao tác dữ liệu kiểm thử</option>
          <option value="ADMIN">Admin – thêm quyền quản lý tài khoản, lưu trữ dự án</option>
        </select>
      </Field>
      <Field
        label={user ? 'Đặt lại mật khẩu' : 'Mật khẩu *'}
        hint={user ? 'Để trống nếu không đổi. 8–72 ký tự, có chữ và số' : '8–72 ký tự, gồm cả chữ và số'}
      >
        <input
          type="password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          autoComplete="new-password"
        />
      </Field>
    </Modal>
  );
}
