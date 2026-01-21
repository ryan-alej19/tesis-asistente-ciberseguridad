import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/AdminDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import EmployeeDashboard from './pages/EmployeeDashboard';
import ReportingPage from './pages/ReportingPage';
import DashboardLayout from './components/DashboardLayout';

// Componente para proteger rutas privadas y envolver en el Layout
const ProtectedRoute = ({ children, allowedRoles, layout = true }) => {
  const { user, loading } = useAuth();

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
    </div>
  );

  if (!user) {
    return <Navigate to="/" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />;
  }

  // Si layout es false, renderizamos sin DashboardLayout
  if (layout === false) {
    return <>{children}</>;
  }

  // Envolvemos el contenido en el Layout por defecto
  return (
    <DashboardLayout role={user.role}>
      {children}
    </DashboardLayout>
  );
};

// Componente para manejar la redirección basada en el rol
function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading) return <div>Checking auth...</div>;
  if (!user) return <Navigate to="/" />;

  if (user.role === 'admin') return <Navigate to="/admin" />;
  if (user.role === 'analyst') return <Navigate to="/analyst" />;
  return <Navigate to="/employee" />;
}

function AppContent() {
  return (
    <Routes>
      <Route path="/" element={<LoginPage />} />

      {/* Ruta genérica que redirige según rol */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/analyst"
        element={
          <ProtectedRoute allowedRoles={['analyst']}>
            <AnalystDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/employee"
        element={
          <ProtectedRoute allowedRoles={['employee']} layout={false}>
            <EmployeeDashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/reporting"
        element={
          <ProtectedRoute allowedRoles={['employee', 'analyst', 'admin']}>
            <ReportingPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
