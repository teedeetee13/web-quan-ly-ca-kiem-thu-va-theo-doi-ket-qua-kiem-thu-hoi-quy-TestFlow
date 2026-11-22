import { useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../auth';
import { ROLE_LABEL } from '../labels';
import { ErrorBox, Field, Modal } from './ui';

export default function Layout() {
  const { user, logout } = useAuth();
  const [pwOpen, setPwOpen] = useState(false);
  const { pathname } = useLocation();
  // Trang đợt nằm dưới /projects/:id/runs nhưng thuộc mục menu "Đợt kiểm thử".
  const inRuns = pathname.startsWith('/runs') || /^\/projects\/\d+\/runs/.test(pathname);

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="logo">✓</span> TestFlow
        </div>
        <nav>
          <NavLink to="/projects" className={() => (inRuns || pathname.startsWith('/users') ? '' : 'active')}>
            Dự án &amp; ca kiểm thử
          </NavLink>
          <NavLink to="/runs" className={() => (inRuns ? 'active' : '')}>
            Đợt kiểm thử &amp; thống kê
          </NavLink>
          {user?.role === 'ADMIN' && <NavLink to="/users">Tài khoản</NavLink>}
        </nav>
        <div className="sidebar-foot">TestFlow v1.0</div>
      </aside>

      <div className="main">
        <header className="topbar">
          <div />
          <div className="user-box">
            <div>
              <div className="user-name">{user?.fullName}</div>
              <div className="muted small">
                {user?.email} · <span className={`role role-${user?.role}`}>{user && ROLE_LABEL[user.role]}</span>
              </div>
            </div>
            <button className="btn ghost sm" onClick={() => setPwOpen(true)}>
              Đổi mật khẩu
            </button>
            <button className="btn ghost sm" onClick={logout}>
              Đăng xuất
            </button>
          </div>
        </header>
        <main className="content">
          <Outlet />
        </main>
      </div>

      {pwOpen && <ChangePasswordModal onClose={() => setPwOpen(false)} />}
    </div>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);

  const submit = async () => {
    if (form.newPassword !== form.confirm) return setError('Mật khẩu nhập lại không khớp');
    setBusy(true);
    setError(null);
    try {
      await api('PATCH', '/auth/password', {
        body: { currentPassword: form.currentPassword, newPassword: form.newPassword },
      });
      setDone(true);
    } catch (e) {
      setError(e);
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal title="Đổi mật khẩu" onClose={onClose} onSubmit={submit} busy={busy}>
      <ErrorBox error={error} />
      {done && <div className="alert success">Đã đổi mật khẩu.</div>}
      <Field label="Mật khẩu hiện tại">
        <input
          type="password"
          value={form.currentPassword}
          onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
          autoFocus
        />
      </Field>
      <Field label="Mật khẩu mới" hint="8–72 ký tự, gồm cả chữ và số">
        <input
          type="password"
          value={form.newPassword}
          onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
        />
      </Field>
      <Field label="Nhập lại mật khẩu mới">
        <input
          type="password"
          value={form.confirm}
          onChange={(e) => setForm({ ...form, confirm: e.target.value })}
        />
      </Field>
    </Modal>
  );
}
