import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { getIncidents, getDashboardStats } from '../services/api';
import IncidentAnalysisModal from '../components/IncidentAnalysisModal';
import { Icons } from '../components/Icons';
import BusinessBrand from '../components/BusinessBrand';

function AnalystDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [incidents, setIncidents] = useState([]);
  const [stats, setStats] = useState(null);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [incidentsData, statsData] = await Promise.all([
        getIncidents(),
        getDashboardStats()
      ]);


      setIncidents(incidentsData.incidents || []);
      setStats(statsData.stats || {});
      setError(null);
    } catch (err) {
      console.error('Error cargando datos:', err);
      setError('No se pudieron cargar los datos del dashboard. Verifique su conexión.');
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyze = (incident) => {
    setSelectedIncident(incident);
  };

  const handleIncidentStatusChange = (incidentId, newStatus, notes) => {
    // Actualizar estado localmente sin recargar todo
    setIncidents(prevIncidents =>
      prevIncidents.map(inc =>
        inc.id === incidentId
          ? { ...inc, status: newStatus, analyst_notes: notes }
          : inc
      )
    );

    // Y actualizar estadísticas localmente (aproximado)
    fetchData();
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-slate-50">
      <div className="text-center">
        <svg className="animate-spin h-10 w-10 text-blue-900 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-slate-600 font-medium">Cargando dashboard...</p>
      </div>
    </div>
  );

  const analysisData = [
    { status: 'Nuevos', count: stats?.open || 0 },
    { status: 'En Progreso', count: stats?.in_progress || 0 },
    { status: 'Resueltos', count: stats?.closed || 0 }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'Nuevo': return 'bg-blue-100 text-blue-800';
      case 'En Proceso': return 'bg-yellow-100 text-yellow-800';
      case 'Resuelto': return 'bg-green-100 text-green-800';
      case 'Cerrado': return 'bg-slate-200 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      {/* Header */}
      {/* TITLE SECTION */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
          Centro de Operaciones (SOC)
        </h1>
        <p className="text-slate-500">
          Gestión y análisis de incidentes de seguridad.
        </p>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto mb-6 bg-red-50 border-l-4 border-red-500 p-4 text-red-700 rounded shadow-sm flex items-start gap-3">
          <Icons.Alert className="h-6 w-6 flex-shrink-0" />
          <div>
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Asignados</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{incidents.length}</h3>
            </div>
            <div className="p-2 bg-blue-50 rounded-full text-blue-500">
              <Icons.File className="h-6 w-6 opacity-80" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-orange-400 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Nuevos (Sin Revisar)</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats?.open || 0}</h3>
            </div>
            <div className="p-2 bg-orange-50 rounded-full text-orange-500">
              <Icons.Clock className="h-6 w-6 opacity-80" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500 hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-500 text-sm font-bold uppercase tracking-wider">Resueltos</p>
              <h3 className="text-3xl font-bold text-slate-800 mt-1">{stats?.closed || 0}</h3>
            </div>
            <div className="p-2 bg-green-50 rounded-full text-green-500">
              <Icons.Check className="h-6 w-6 opacity-80" />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Incidents Table */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                <Icons.Shield className="h-5 w-5 text-slate-500" /> Incidentes Recientes
              </h2>
              <button
                onClick={fetchData}
                className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                title="Actualizar lista"
              >
                <Icons.Refresh className="h-4 w-4" /> Actualizar
              </button>
            </div>

            {incidents.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center">
                <Icons.File className="h-12 w-12 text-slate-300 mb-2" />
                <p>No hay incidentes asignados en este momento.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                    <tr>
                      <th className="px-6 py-3">Fecha</th>
                      <th className="px-6 py-3">Tipo</th>
                      <th className="px-6 py-3">Riesgo</th>
                      <th className="px-6 py-3">Estado</th>
                      <th className="px-6 py-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {incidents.map(incident => (
                      <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-600">
                          {new Date(incident.created_at).toLocaleDateString('es-EC')}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900">
                          {incident.incident_type}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${incident.risk_level === 'Crítico' ? 'bg-red-100 text-red-800' :
                            incident.risk_level === 'Alto' ? 'bg-orange-100 text-orange-800' :
                              incident.risk_level === 'Medio' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-green-100 text-green-800'
                            }`}>
                            {incident.risk_level}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${getStatusColor(incident.status)}`}>
                            {incident.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <button
                            onClick={() => handleAnalyze(incident)}
                            className="text-blue-600 hover:text-blue-900 font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                          >
                            <Icons.Search className="h-4 w-4" /> Analizar
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Chart & Actions */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icons.ChartBar className="h-5 w-5 text-slate-500" /> Distribución
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={analysisData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="status" tick={{ fontSize: 12, fill: '#64748b' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#64748b' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    cursor={{ fill: '#f1f5f9' }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Cantidad" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Icons.Rocket className="h-5 w-5 text-slate-500" /> Acciones Rápidas
            </h3>
            <div className="space-y-3">
              <button
                onClick={() => alert('Generando reporte PDF... (Simulación)')}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <Icons.File className="h-4 w-4" /> Exportar Reporte Semanal
              </button>
              <button
                onClick={() => alert('Enviando notificación al administrador... (Simulación)')}
                className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-medium transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <Icons.Mail className="h-4 w-4" /> Notificar a Admin
              </button>
            </div>
          </div>
        </div>

      </div>

      {selectedIncident && (
        <IncidentAnalysisModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onStatusChange={handleIncidentStatusChange}
          userRole="analyst"
        />
      )}
    </div>
  );
}

export default AnalystDashboard;
