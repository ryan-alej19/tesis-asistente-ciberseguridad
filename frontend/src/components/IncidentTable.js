import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Icons } from './Icons';

/**
 * Tabla interactiva con los últimos incidentes (RF-06)
 */
const IncidentTable = () => {
    const [incidents, setIncidents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filtros
    const [filters, setFilters] = useState({
        start_date: '',
        end_date: '',
        type: '',
        user: ''
    });

    useEffect(() => {
        fetchIncidents();
    }, [filters]); // Refetch when filters change

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const fetchIncidents = async () => {
        try {
            const token = localStorage.getItem('access_token');
            let query = 'http://localhost:8000/api/incidents/?limit=10';

            // Build query params
            if (filters.start_date) query += `&start_date=${filters.start_date}`;
            if (filters.end_date) query += `&end_date=${filters.end_date}`;
            if (filters.type) query += `&type=${filters.type}`;
            if (filters.user) query += `&user=${filters.user}`;

            const response = await axios.get(query, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.incidents) {
                setIncidents(response.data.incidents);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching incidents:", err);
            setError("Error al cargar datos");
            setLoading(false);
        }
    };

    const getSeverityBadge = (severity) => {
        const sev = severity.toLowerCase();
        if (sev === 'critical' || sev === 'crítico') return <span className="bg-red-100 text-red-700 px-2 py-1 rounded-full text-xs font-bold">Crítico</span>;
        if (sev === 'high' || sev === 'alto') return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">Alto</span>;
        if (sev === 'medium' || sev === 'medio') return <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold">Medio</span>;
        return <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold">Bajo</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading && !incidents.length) return (
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-6 bg-slate-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-3">
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded"></div>
                <div className="h-4 bg-slate-100 rounded"></div>
            </div>
        </div>
    );

    if (error) return (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-red-500">
            <Icons.Alert className="h-6 w-6 mx-auto mb-2" />
            {error}
        </div>
    );

    return (
        <div className="bg-white p-6 rounded-lg shadow-md overflow-hidden">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <Icons.List className="h-5 w-5 text-indigo-600" /> Últimos Incidentes
            </h3>

            {/* FILTROS (RF-06 Extendido) */}
            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-lg border border-slate-100">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Desde</label>
                    <input
                        type="date" name="start_date"
                        value={filters.start_date} onChange={handleFilterChange}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Hasta</label>
                    <input
                        type="date" name="end_date"
                        value={filters.end_date} onChange={handleFilterChange}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tipo</label>
                    <select
                        name="type" value={filters.type} onChange={handleFilterChange}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    >
                        <option value="">Todos</option>
                        <option value="Phishing">Phishing</option>
                        <option value="Malware">Malware</option>
                        <option value="Ransomware">Ransomware</option>
                    </select>
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Usuario</label>
                    <input
                        type="text" name="user" placeholder="Buscar usuario..."
                        value={filters.user} onChange={handleFilterChange}
                        className="w-full text-sm border-slate-300 rounded focus:ring-indigo-500 focus:border-indigo-500 p-2"
                    />
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-slate-600">
                    <thead className="text-xs text-slate-700 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-3">ID</th>
                            <th className="px-6 py-3">Usuario</th>
                            <th className="px-6 py-3">Tipo</th>
                            <th className="px-6 py-3">Severidad</th>
                            <th className="px-6 py-3">Fecha</th>
                            <th className="px-6 py-3">Estado</th>
                        </tr>
                    </thead>
                    <tbody>
                        {incidents.length === 0 ? (
                            <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-slate-400">
                                    No hay incidentes que coincidan con los filtros.
                                </td>
                            </tr>
                        ) : (
                            incidents.map((incident) => (
                                <tr
                                    key={incident.id}
                                    className="bg-white border-b hover:bg-slate-50 cursor-pointer transition-colors"
                                >
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        #{incident.id}
                                    </td>
                                    <td className="px-6 py-4">
                                        {incident.reported_by_username || 'Usuario'}
                                    </td>
                                    <td className="px-6 py-4 truncate max-w-[150px]">
                                        {incident.incident_type}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getSeverityBadge(incident.severity)}
                                    </td>
                                    <td className="px-6 py-4">
                                        {formatDate(incident.created_at)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded text-xs font-semibold ${incident.status === 'new' ? 'bg-blue-100 text-blue-800' :
                                            incident.status === 'resolved' ? 'bg-gray-100 text-gray-800' :
                                                'bg-purple-100 text-purple-800'
                                            }`}>
                                            {incident.status_display || incident.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default IncidentTable;
