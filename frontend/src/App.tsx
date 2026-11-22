import { Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ReactNode } from 'react';
import { useAuth } from './auth';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailPage from './pages/ProjectDetailPage';
import CaseFormPage from './pages/CaseFormPage';
import UsersPage from './pages/UsersPage';
import RunsHomePage from './pages/RunsHomePage';
import RunsPage from './pages/RunsPage';
import CreateRunPage from './pages/CreateRunPage';
import RunExecutePage from './pages/RunExecutePage';
import RunReportPage from './pages/RunReportPage';
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
        <Route path="/runs" element={<RunsHomePage />} />
        <Route path="/projects/:projectId/runs" element={<RunsPage />} />
        <Route path="/projects/:projectId/runs/new" element={<CreateRunPage />} />
        <Route path="/runs/:runId" element={<RunExecutePage />} />
        <Route path="/runs/:runId/report" element={<RunReportPage />} />
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
