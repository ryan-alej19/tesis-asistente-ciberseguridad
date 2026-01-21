/**
 * LISTA DE INCIDENTES - TESIS CIBERSEGURIDAD
 * Ryan Gallegos Mera - PUCESI
 * Última actualización: 07 de Enero, 2026
 */

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getIncidents } from '../services/api';
import { Icons } from './Icons';
import IncidentAnalysisModal from './IncidentAnalysisModal';
import './IncidentList.css';

function IncidentList() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('todos'); // filtro por estado
  const [selectedIncident, setSelectedIncident] = useState(null); // Modal state
  const navigate = useNavigate();

  // Cargar incidentes al montar el componente
  useEffect(() => {
    fetchIncidents();
  }, []);

  // Obtener incidentes del backend usando el servicio centralizado
  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const response = await getIncidents();
      // El backend devuelve { success: true, incidents: [...] } o directamente [...]
      const data = response.incidents || response;
      setIncidents(Array.isArray(data) ? data : []);
      setLoading(false);
    } catch (error) {
      console.error('Error al cargar incidentes:', error);
      setLoading(false);
    }
  };

  // Obtener clase CSS según severidad
  const getSeverityClass = (severity) => {
    const classes = {
      'Alta': 'severity-high',
      'Media': 'severity-medium',
      'Baja': 'severity-low',
      'Crítico': 'severity-critical',
      'critical': 'severity-critical',
      'high': 'severity-high',
      'medium': 'severity-medium',
      'low': 'severity-low'
    };
    return classes[severity] || classes[severity?.toLowerCase()] || 'severity-low';
  };

  // Obtener clase CSS según estado
  const getStatusClass = (status) => {
    const normalized = status?.toLowerCase().replace(' ', '_');
    const classes = {
      'nuevo': 'status-open',
      'abierto': 'status-open',
      'open': 'status-open',
      'en_proceso': 'status-progress',
      'in_progress': 'status-progress',
      'resuelto': 'status-resolved',
      'resolved': 'status-resolved',
      'cerrado': 'status-closed',
      'closed': 'status-closed'
    };
    return classes[normalized] || 'status-open';
  };

  // Filtrar incidentes por estado
  const filteredIncidents = incidents.filter(incident => {
    if (filter === 'todos') return true;

    // Normalizar estado para comparación flexible
    const status = incident.status?.toLowerCase().replace(' ', '_');

    if (filter === 'abierto') return ['nuevo', 'abierto', 'open'].includes(status);
    if (filter === 'en_proceso') return ['en_proceso', 'in_progress'].includes(status);
    if (filter === 'resuelto') return ['resuelto', 'resolved', 'cerrado', 'closed'].includes(status);

    return true;
  });

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-EC', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="incident-list-container">
      {/* MODAL DE DETALLES */}
      {selectedIncident && (
        <IncidentAnalysisModal
          incident={selectedIncident}
          onClose={() => setSelectedIncident(null)}
          onUpdate={fetchIncidents}
        />
      )}

      <div className="incident-list-header">
        <h1 className="flex items-center gap-2">
          <Icons.ChartBar className="h-8 w-8 text-blue-900" /> Gestión de Incidentes
        </h1>
        <button
          onClick={() => navigate('/reporting')}
          className="btn-new-incident flex items-center gap-2"
        >
          <Icons.Plus className="h-5 w-5" /> Nuevo Incidente
        </button>
      </div>

      {/* FILTROS */}
      <div className="filters">
        <button
          className={filter === 'todos' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('todos')}
        >
          <span className="flex items-center gap-2"><Icons.File className="h-4 w-4" /> Todos ({incidents.length})</span>
        </button>
        <button
          className={filter === 'abierto' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('abierto')}
        >
          <span className="flex items-center gap-2"><Icons.Alert className="h-4 w-4" /> Nuevos</span>
        </button>
        <button
          className={filter === 'en_proceso' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('en_proceso')}
        >
          <span className="flex items-center gap-2"><Icons.Settings className="h-4 w-4" /> En Proceso</span>
        </button>
        <button
          className={filter === 'resuelto' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('resuelto')}
        >
          <span className="flex items-center gap-2"><Icons.Check className="h-4 w-4" /> Resueltos</span>
        </button>
      </div>

      {/* TABLA DE INCIDENTES */}
      {loading ? (
        <div className="loading flex items-center justify-center gap-2">
          <Icons.Refresh className="h-6 w-6 animate-spin" /> Cargando incidentes...
        </div>
      ) : (
        <div className="table-container">
          <table className="incidents-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Tipo</th>
                <th>Descripción</th>
                <th>Severidad</th>
                <th>Estado</th>
                <th>Fecha</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredIncidents.length === 0 ? (
                <tr>
                  <td colSpan="7" className="no-data">
                    <div className="flex flex-col items-center justify-center gap-2 py-8">
                      <Icons.Search className="h-8 w-8 opacity-50" />
                      <span>No hay incidentes registrados</span>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredIncidents.map((incident, index) => (
                  <tr key={incident.id} className="hover:bg-slate-50 transition-colors">
                    <td className="font-mono text-xs text-slate-500">#{incident.id}</td>
                    <td>
                      <span className="incident-type font-medium">{incident.incident_type}</span>
                    </td>
                    <td className="description-cell">
                      {incident.description.substring(0, 60)}...
                    </td>
                    <td>
                      <span className={`severity-badge ${getSeverityClass(incident.risk_level || incident.severity)}`}>
                        {incident.risk_level || incident.severity}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge ${getStatusClass(incident.status)}`}>
                        {incident.status}
                      </span>
                    </td>
                    <td className="text-sm text-slate-600">{formatDate(incident.created_at)}</td>
                    <td>
                      <button
                        className="btn-view flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 p-2 rounded-full transition-colors"
                        title="Ver detalles / Gestionar"
                        onClick={() => setSelectedIncident(incident)}
                      >
                        <Icons.Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default IncidentList;
