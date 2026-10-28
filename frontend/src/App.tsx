import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CaseFormPage from './pages/CaseFormPage';
import UsersPage from './pages/UsersPage';
import ComingSoonPage from './pages/ComingSoonPage';
import type { Role } from './types';

/** Chặn ở giao diện cho trải nghiệm tốt; quyền thực sự vẫn do backend kiểm tra. */
function RequireAuth({ children, role }: { children: ReactNode; role?: Role }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <div className="center muted">Đang tải…</div>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (role && user.role !== role) return <Navigate to="/projects" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }
      >
        <Route path="/projects" element={<ProjectsPage />} />
        <Route path="/projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="/projects/:projectId/cases/new" element={<CaseFormPage />} />
        <Route path="/cases/:caseId" element={<CaseFormPage />} />
        <Route path="/runs" element={<ComingSoonPage title="Đợt kiểm thử" week="tuần 5" />} />
        <Route path="/reports" element={<ComingSoonPage title="Thống kê & xuất CSV" week="tuần 6" />} />
        <Route
          path="/users"
          element={
            <RequireAuth role="ADMIN">
              <UsersPage />
            </RequireAuth>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/projects" replace />} />
    </Routes>
  );
}
