import { FormEvent, useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../auth';
import { ErrorBox, Field } from '../components/ui';

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<unknown>(null);
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/projects" replace />;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    // Kiểm tra sớm ở client cho phản hồi nhanh; backend vẫn kiểm tra lại.
    if (!email.trim() || !password) return setError('Vui lòng nhập email và mật khẩu');
    setBusy(true);
    setError(null);
    try {
      await login(email, password);
      navigate((location.state as { from?: string } | null)?.from ?? '/projects', { replace: true });
    } catch (err) {
      setError(err);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <form className="login-card" onSubmit={submit} noValidate>
        <div className="brand big">
          <span className="logo">✓</span> TestFlow
        </div>
        <p className="muted">Quản lý ca kiểm thử và theo dõi kết quả kiểm thử hồi quy</p>
        <ErrorBox error={error} />
        <Field label="Email">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="admin@testflow.local"
            autoComplete="username"
            autoFocus
          />
        </Field>
        <Field label="Mật khẩu">
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </Field>
        <button className="btn primary block" disabled={busy}>
          {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
        </button>
        <div className="demo-accounts">
          <b>Tài khoản demo</b>
          <span>Admin: admin@testflow.local / Admin@123</span>
          <span>Tester: tester@testflow.local / Tester@123</span>
        </div>
      </form>
    </div>
  );
}
