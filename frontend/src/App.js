import React, { useState, useEffect } from 'react';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function App() {
  const [currentView, setCurrentView] = useState('login');
  const [user, setUser] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [description, setDescription] = useState('');
  const [aiResponse, setAiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  const API_URL = 'http://localhost:8000/api';

  // LOGIN
  const handleLogin = (e) => {
    e.preventDefault();
    const email = e.target.email.value;
    const role = e.target.role.value;
    setUser({ email, role });
    setCurrentView(role === 'empleado' ? 'empleado' : 'admin');
  };

  // LOGOUT
  const handleLogout = () => {
    setUser(null);
    setCurrentView('login');
    setIncidents([]);
    setDescription('');
    setAiResponse(null);
  };

  // CARGAR INCIDENTES (solo admin)
  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchIncidents();
    }
  }, [user]);

  const fetchIncidents = async () => {
    try {
      const response = await axios.get(`${API_URL}/incidents/`);
      setIncidents(response.data);
    } catch (error) {
      console.error('Error al cargar incidentes:', error);
    }
  };

  // REPORTAR INCIDENTE (Empleado) con IA REAL (Gemini vía backend)
  const handleReportIncident = async (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert('Por favor describe el incidente');
      return;
    }

    setLoading(true);
    setAiResponse(null);

    try {
      // 1) Crear incidente básico (opcional si deseas registrar antes del análisis)
      // const created = await axios.post(`${API_URL}/incidents/`, { description });

      // 2) Llamar análisis IA (backend llama a Gemini)
      const response = await axios.post(`${API_URL}/incidents/analyze/`, {
        description: description,
      });

      if (response.data && (response.data.success || response.data.analysis)) {
        const analysis = response.data.analysis || {};
        setAiResponse({
          threat: analysis.threat_type || 'DESCONOCIDO',
          criticality: analysis.criticality || 'MEDIO',
          recommendation: analysis.recommendation || 'Consultar con el área de TI',
          confidence: analysis.confidence ?? 0.7,
          technical_details: analysis.technical_details || '',
          incident_id: response.data.incident_id || null,
        });

        setDescription('');

        if (user && user.role === 'admin') {
          setTimeout(() => fetchIncidents(), 800);
        }
      } else {
        throw new Error('Respuesta inválida del análisis');
      }
    } catch (error) {
      console.error('Error al analizar incidente:', error);
      setAiResponse({
        threat: 'ERROR',
        criticality: 'DESCONOCIDO',
        recommendation: 'Error en análisis automático. Contactar soporte técnico.',
        confidence: 0.0,
        error: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // LOGIN
  if (currentView === 'login') {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>🔐 SecureOps PYMES</h1>
          <p className="subtitle">Protegiendo tu empresa</p>

          <form onSubmit={handleLogin}>
            <div className="mb-3">
              <label htmlFor="email" className="form-label">Email:</label>
              <input
                type="email"
                className="form-control"
                id="email"
                name="email"
                placeholder="tu@empresa.com"
                required
              />
            </div>

            <div className="mb-3">
              <label htmlFor="role" className="form-label">Tipo de usuario:</label>
              <select className="form-select" id="role" name="role">
                <option value="empleado">Empleado</option>
                <option value="admin">Administrador TI</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary w-100">
              Iniciar Sesión
            </button>
          </form>
        </div>
      </div>
    );
  }

  // EMPLEADO
  if (currentView === 'empleado' && user) {
    return (
      <div className="app-container">
        <nav className="navbar navbar-dark bg-primary mb-4">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">🛡️ SecureOps - Empleado</span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </nav>

        <div className="container">
          <div className="card">
            <div className="card-header bg-primary text-white">
              <h4 className="mb-0">¿Detectaste algo sospechoso?</h4>
              <small>El análisis se realiza con IA (Gemini) desde el backend</small>
            </div>
            <div className="card-body">
              <form onSubmit={handleReportIncident}>
                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Describe el incidente:
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    rows="4"
                    placeholder="Ej: Recibí un email pidiendo mi contraseña..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="btn btn-success w-100"
                  disabled={loading}
                >
                  {loading ? 'Analizando...' : '🔍 Analizar con IA'}
                </button>
              </form>

              {aiResponse && (
                <div className={`mt-4 p-3 border ${aiResponse.error ? 'border-danger' : 'border-warning'} bg-light rounded`}>
                  <h5>📊 Resultado del Análisis IA:</h5>
                  {!aiResponse.error ? (
                    <>
                      <p><strong>Tipo de amenaza:</strong> {aiResponse.threat}</p>
                      <p>
                        <strong>Criticidad:</strong>{' '}
                        <span className={`badge ${
                          aiResponse.criticality === 'CRÍTICO' ? 'bg-danger'
                            : aiResponse.criticality === 'ALTO' ? 'bg-warning'
                            : aiResponse.criticality === 'MEDIO' ? 'bg-primary'
                            : 'bg-secondary'
                        }`}>
                          {aiResponse.criticality}
                        </span>
                      </p>
                      <p><strong>Recomendación:</strong> {aiResponse.recommendation}</p>
                      {aiResponse.technical_details && (
                        <p className="text-muted"><small>{aiResponse.technical_details}</small></p>
                      )}
                      <p className="text-muted">
                        <small>
                          Confianza: {Math.round((aiResponse.confidence ?? 0.7) * 100)}%
                          {aiResponse.incident_id ? ` | ID incidente: ${aiResponse.incident_id}` : ''}
                        </small>
                      </p>
                    </>
                  ) : (
                    <div className="alert alert-danger">
                      <strong>❌ Error: </strong>{aiResponse.recommendation}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ADMIN
  if (currentView === 'admin' && user) {
    return (
      <div className="app-container">
        <nav className="navbar navbar-dark bg-danger mb-4">
          <div className="container-fluid">
            <span className="navbar-brand mb-0 h1">📊 SecureOps - Dashboard Admin</span>
            <button className="btn btn-outline-light" onClick={handleLogout}>
              Salir
            </button>
          </div>
        </nav>

        <div className="container">
          {/* KPIs */}
          <div className="row mb-4">
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-primary">{incidents.length}</h3>
                  <p className="card-text">Incidentes Totales</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-danger">
                    {incidents.filter(i => i.criticality === 'CRÍTICO').length}
                  </h3>
                  <p className="card-text">Críticos</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-success">
                    {incidents.filter(i => i.resolved).length}
                  </h3>
                  <p className="card-text">Resueltos</p>
                </div>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card text-center">
                <div className="card-body">
                  <h3 className="text-warning">
                    {incidents.filter(i => i.threat_type === 'PHISHING').length}
                  </h3>
                  <p className="card-text">Phishing</p>
                </div>
              </div>
            </div>
          </div>

          {/* TABLA DE INCIDENTES */}
          <div className="card">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Últimos Incidentes</h5>
              <button className="btn btn-outline-light btn-sm" onClick={fetchIncidents}>
                🔄 Actualizar
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Criticidad</th>
                      <th>Confianza IA</th>
                      <th>Fecha</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    {incidents.map((incident) => (
                      <tr key={incident.id}>
                        <td>#{incident.id}</td>
                        <td>{incident.threat_type}</td>
                        <td>
                          <span
                            className={`badge ${
                              incident.criticality === 'CRÍTICO'
                                ? 'bg-danger'
                                : incident.criticality === 'ALTO'
                                ? 'bg-warning'
                                : incident.criticality === 'MEDIO'
                                ? 'bg-primary'
                                : 'bg-secondary'
                            }`}
                          >
                            {incident.criticality}
                          </span>
                        </td>
                        <td>
                          <small className="text-muted">
                            {incident.confidence_score !== null && incident.confidence_score !== undefined
                              ? `${Math.round(Number(incident.confidence_score) * 100)}%`
                              : '—'}
                          </small>
                        </td>
                        <td>{new Date(incident.created_at).toLocaleString()}</td>
                        <td>
                          {incident.resolved ? (
                            <span className="badge bg-success">Resuelto</span>
                          ) : (
                            <span className="badge bg-warning">Pendiente</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {incidents.length === 0 && (
                <p className="text-center text-muted mb-0">No hay incidentes registrados aún.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
