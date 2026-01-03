import React from 'react';
import './IncidentAnalysisModal.css';

const IncidentAnalysisModal = ({ incident, onClose, onStatusChange, userRole }) => {
  if (!incident) return null;

  // Extraer datos de análisis
  const vtResult = incident.virustotal_result;
  const vtSuccess = vtResult?.success || false;
  const vtDetections = vtResult?.detections || 0;
  const vtTotal = vtResult?.total_engines || 0;
  const vtMalicious = vtResult?.malicious || 0;
  const vtSuspicious = vtResult?.suspicious || 0;
  const vtUrl = vtResult?.analysis_url || null;
  const vtError = vtResult?.error || null;

  const geminiResult = incident.gemini_analysis;
  const geminiSuccess = geminiResult?.success || false;
  const geminiExplanation = geminiResult?.explanation || '';
  const geminiPatterns = geminiResult?.patterns_detected || [];
  const geminiRecommendation = geminiResult?.recommendation || '';

  const handleStatusChange = (e) => {
    const newStatus = e.target.value;
    const notes = document.getElementById('analyst-notes')?.value || '';
    
    if (onStatusChange) {
      onStatusChange(incident.id, newStatus, notes);
    }
  };

  const getThreatTypeLabel = (type) => {
    const types = {
      'phishing': 'Phishing',
      'malware': 'Malware',
      'ransomware': 'Ransomware',
      'data_breach': 'Filtración de datos',
      'ddos': 'Ataque DDoS',
      'spam': 'Spam',
      'unknown': 'Desconocido'
    };
    return types[type] || type;
  };

  const getSeverityColor = (severity) => {
    const colors = {
      'critical': '#dc2626',
      'high': '#f97316',
      'medium': '#eab308',
      'low': '#22c55e'
    };
    return colors[severity] || '#6b7280';
  };

  const getSeverityText = (severity) => {
    const texts = {
      'critical': 'CRÍTICO',
      'high': 'ALTO',
      'medium': 'MEDIO',
      'low': 'BAJO'
    };
    return texts[severity] || severity.toUpperCase();
  };

  // 🔥 DETERMINAR SI ES VISTA SIMPLE (EMPLOYEE) O COMPLETA (ANALYST/ADMIN)
  const isSimpleView = userRole === 'employee';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🔍 {isSimpleView ? 'Análisis de tu Reporte' : `Análisis de Incidente #${incident.id}`}</h2>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">
          
          {/* ========================================== */}
          {/* 👤 VISTA SIMPLE PARA EMPLOYEE */}
          {/* ========================================== */}
          {isSimpleView ? (
            <>
              {/* 🤖 ORIENTACIÓN PRINCIPAL */}
              <section className="simple-orientation">
                <div className="orientation-header">
                  <span className="orientation-icon">🛡️</span>
                  <h3>Resultado del Análisis</h3>
                </div>

                <div className="severity-display" style={{ backgroundColor: getSeverityColor(incident.severity) }}>
                  <span className="severity-label">Nivel de Riesgo:</span>
                  <span className="severity-value">{getSeverityText(incident.severity)}</span>
                  <span className="confidence-indicator">
                    Confianza: {Math.round((incident.confidence || 0) * 100)}%
                  </span>
                </div>

                {geminiSuccess && (
                  <div className="simple-explanation">
                    <h4>📝 ¿Por qué es {incident.severity === 'high' || incident.severity === 'critical' ? 'peligroso' : 'sospechoso'}?</h4>
                    <p>{geminiExplanation}</p>
                  </div>
                )}

                <div className="simple-recommendation">
                  <h4>💡 ¿Qué debes hacer?</h4>
                  <p>{geminiRecommendation || 'Espera confirmación del equipo de seguridad antes de interactuar con el contenido reportado.'}</p>
                </div>

                {vtSuccess && vtDetections > 0 && (
                  <div className="simple-vt-alert">
                    <span className="alert-icon">⚠️</span>
                    <div>
                      <strong>Atención:</strong> {vtDetections} motores de seguridad detectaron esta URL como maliciosa.
                    </div>
                  </div>
                )}

                <div className="simple-status">
                  <span className="status-icon">📊</span>
                  <div>
                    <strong>Estado:</strong> {incident.status === 'new' ? 'En revisión por el equipo' : 
                                              incident.status === 'in_progress' ? 'Siendo analizado' : 
                                              'Resuelto'}
                  </div>
                </div>
              </section>

              {/* Información básica */}
              <section className="simple-info">
                <h4>📋 Tu reporte</h4>
                <p><strong>Descripción:</strong> {incident.description || 'Sin descripción'}</p>
                {incident.reported_url && (
                  <p><strong>URL:</strong> <span className="url-text">{incident.reported_url}</span></p>
                )}
                <p><strong>Fecha:</strong> {new Date(incident.created_at).toLocaleString('es-EC')}</p>
              </section>
            </>
          ) : (
            /* ========================================== */
            /* 🧠 VISTA COMPLETA PARA ANALYST/ADMIN */
            /* ========================================== */
            <>
              {/* 📋 INFORMACIÓN DEL REPORTE */}
              <section className="info-section">
                <h3>📋 Información del Reporte</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Título:</label>
                    <p>{incident.title}</p>
                  </div>
                  <div className="info-item">
                    <label>Fecha:</label>
                    <p>{new Date(incident.created_at).toLocaleString('es-EC')}</p>
                  </div>
                  <div className="info-item">
                    <label>Reportado por:</label>
                    <p>{incident.reported_by_username}</p>
                  </div>
                </div>

                <div className="info-item full-width">
                  <label>Descripción:</label>
                  <p className="description-text">{incident.description || 'Sin descripción'}</p>
                </div>

                {incident.reported_url && (
                  <div className="info-item full-width">
                    <label>🔗 URL Reportada:</label>
                    <p className="url-text">{incident.reported_url}</p>
                  </div>
                )}
              </section>

              {/* 🤖 ANÁLISIS GEMINI */}
              {geminiSuccess && (
                <section className="analysis-section gemini-section">
                  <h3>🤖 Análisis Contextual (Gemini AI)</h3>
                  
                  {geminiPatterns.length > 0 && (
                    <div className="gemini-patterns">
                      <h4>🔍 Patrones Detectados:</h4>
                      <ul>
                        {geminiPatterns.map((pattern, index) => (
                          <li key={index}>{pattern}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="gemini-explanation">
                    <h4>📝 Explicación:</h4>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{geminiExplanation}</p>
                  </div>

                  <div className="gemini-recommendation">
                    <h4>💡 Recomendación:</h4>
                    <p>{geminiRecommendation}</p>
                  </div>
                </section>
              )}

              {/* 🛡️ ANÁLISIS VIRUSTOTAL */}
              <section className="analysis-section virustotal-section">
                <h3>🛡️ Análisis VirusTotal</h3>
                
                {vtSuccess ? (
                  <>
                    <div className="vt-stats">
                      <div className="vt-stat">
                        <label>Detecciones:</label>
                        <span className="vt-value">{vtDetections}/{vtTotal}</span>
                      </div>
                      <div className="vt-stat">
                        <label>Maliciosos:</label>
                        <span className="vt-value malicious">{vtMalicious}</span>
                      </div>
                      <div className="vt-stat">
                        <label>Sospechosos:</label>
                        <span className="vt-value suspicious">{vtSuspicious}</span>
                      </div>
                      <div className="vt-stat">
                        <label>Inofensivos:</label>
                        <span className="vt-value safe">{vtTotal - vtDetections}</span>
                      </div>
                    </div>

                    {vtUrl && (
                      <a 
                        href={vtUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="vt-link"
                      >
                        📊 Ver análisis completo en VirusTotal →
                      </a>
                    )}
                  </>
                ) : (
                  <div className="vt-error">
                    <span className="error-icon">⚠️</span>
                    <div>
                      <strong>VirusTotal no disponible</strong>
                      <p>{vtError || 'No se pudo analizar la URL'}</p>
                    </div>
                  </div>
                )}
              </section>

              {/* 🤖 ANÁLISIS AUTOMÁTICO (IA LOCAL) */}
              <section className="analysis-section ia-section">
                <h3>🤖 Análisis Automático (IA Local)</h3>
                
                <div className="analysis-grid">
                  <div className="analysis-card">
                    <label>Severidad</label>
                    <span 
                      className="severity-badge"
                      style={{ backgroundColor: getSeverityColor(incident.severity) }}
                    >
                      {getSeverityText(incident.severity)}
                    </span>
                  </div>

                  <div className="analysis-card">
                    <label>Confianza IA</label>
                    <span className="confidence-value">
                      {Math.round((incident.confidence || 0) * 100)}%
                    </span>
                  </div>

                  <div className="analysis-card full-width">
                    <label>Tipo de Amenaza</label>
                    <span className="threat-type">
                      {getThreatTypeLabel(incident.threat_type)}
                    </span>
                  </div>
                </div>
              </section>

              {/* ⚙️ GESTIÓN DE ESTADO */}
              <section className="status-section">
                <h3>⚙️ Gestión de Estado</h3>
                
                <div className="status-info">
                  <label>Estado Actual:</label>
                  <span className={`status-badge status-${incident.status}`}>
                    {incident.status === 'new' ? 'Nuevo' : 
                     incident.status === 'in_progress' ? 'En Progreso' : 
                     'Resuelto'}
                  </span>
                </div>

                <div className="status-controls">
                  <label htmlFor="status-select">Cambiar a:</label>
                  <select 
                    id="status-select"
                    defaultValue={incident.status}
                    onChange={handleStatusChange}
                  >
                    <option value="new">Nuevo</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="resolved">Resuelto</option>
                  </select>
                </div>

                <div className="notes-section">
                  <label htmlFor="analyst-notes">Notas del Analista:</label>
                  <textarea
                    id="analyst-notes"
                    placeholder="Ej: Verificado con VirusTotal - URL legítima confirmada..."
                    defaultValue={incident.notes || ''}
                    rows="4"
                  />
                </div>

                <button 
                  className="btn-update"
                  onClick={handleStatusChange}
                >
                  ✅ Actualizar Estado
                </button>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncidentAnalysisModal;
