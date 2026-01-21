import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import IncidentReporter from '../components/IncidentReporter';
import { Icons } from '../components/Icons';
import BusinessBrand from '../components/BusinessBrand';
import './ReportingPage.css';

function ReportingPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="reporting-page">
      {/* Header */}
      <div className="reporting-header">
        <div>
          <div className="mb-2">
            <BusinessBrand textSize="text-lg" iconSize="h-6 w-6" />
          </div>
          <h1 className="flex items-center gap-2">
            <Icons.File className="h-8 w-8 text-blue-900" /> Centro de Reportes de Seguridad
          </h1>
          <p className="text-gray-600">Reporta incidentes de ciberseguridad aquí</p>
        </div>
        <div className="reporting-actions">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn-secondary flex items-center gap-2"
          >
            <Icons.Home className="h-5 w-5" /> Volver al Dashboard
          </button>
          <button
            onClick={handleLogout}
            className="btn-logout flex items-center gap-2"
          >
            <Icons.Logout className="h-5 w-5" /> Cerrar Sesión
          </button>
        </div>
      </div>

      {/* Formulario de Reporte */}
      <IncidentReporter />
    </div>
  );
}

export default ReportingPage;
