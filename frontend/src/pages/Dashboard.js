import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import AdminDashboard from './AdminDashboard';
import AnalystDashboard from './AnalystDashboard';
import EmployeeDashboard from './EmployeeDashboard';

function Dashboard() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    } else if (user) {
      setUserRole(user?.role);
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-blue-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-slate-600 font-medium">Cargando sistema...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Renderiza dashboard según el rol
  switch (userRole) {
    case 'admin':
      return <AdminDashboard />;
    case 'analyst':
      return <AnalystDashboard />;
    case 'employee':
      return <EmployeeDashboard />;
    default:
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center p-8 bg-white rounded-lg shadow border border-slate-200">
            <h2 className="text-xl font-bold text-slate-800 mb-2">Rol Desconocido</h2>
            <p className="text-slate-600">No tienes un rol asignado válido. Contacta al administrador.</p>
          </div>
        </div>
      );
  }
}

export default Dashboard;
