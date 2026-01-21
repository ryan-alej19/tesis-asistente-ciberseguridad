import React, { useState } from 'react';
import './IncidentReporter.css';
import { createIncident } from '../services/api';
import { Icons } from './Icons';

function IncidentReporter() {
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      // Usar FormData para enviar archivos
      const formData = new FormData();
      formData.append('description', description);
      formData.append('url', url);
      // Tipo por defecto, la backend/IA lo puede ajustar
      formData.append('incident_type', 'sospechoso');

      if (file) {
        formData.append('attached_file', file);
      }

      // Llamada directa a axios aquí o actualizar api.js para soportar FormData
      // Nota: createIncident en api.js usa axios.post(..., incidentData)
      // Axios maneja FormData automáticamente poniendo el header multipart/form-data
      const response = await createIncident(formData);

      const geminiData = response.gemini || {};
      const incidentData = response.incident || {};

      setResult({
        success: true,
        threatType: incidentData.incident_type || 'Desconocido',
        severity: incidentData.risk_level || 'Medio',
        confidence: incidentData.ai_confidence || 0,
        message: response.message
      });

      // Limpiar formulario
      setDescription('');
      setUrl('');
      setFile(null);
      // Resetear el input file visualmente
      document.getElementById('file-upload').value = '';

    } catch (error) {
      console.error("Error reportando:", error);
      setResult({
        success: false,
        error: error.error || 'Error al reportar incidente'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  // Validar si al menos uno tiene datos
  const isValid = description.trim() || url.trim() || file;

  return (
    <div className="incident-reporter">
      <h2 className="flex items-center gap-2">
        <Icons.File className="h-6 w-6 text-blue-900" /> Reportar Incidente de Seguridad
      </h2>
      <p className="subtitle">
        Ingrese al menos uno de los siguientes datos (Descripción, URL o Archivo) para analizar.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Campo URL */}
        <div className="form-group">
          <label className="flex items-center gap-2">
            <Icons.Link className="h-4 w-4" /> URL o Enlace Sospechoso
          </label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://sitio-malicioso.com"
            className="w-full p-2 border rounded"
          />
        </div>

        {/* Campo Archivo */}
        <div className="form-group">
          <label className="flex items-center gap-2">
            <Icons.File className="h-4 w-4" /> Archivo Adjunto (Opcional)
          </label>
          <input
            id="file-upload"
            type="file"
            onChange={handleFileChange}
            className="w-full p-2 border rounded"
          />
          <small className="text-gray-500">Imágenes, PDFs o archivos sospechosos.</small>
        </div>

        {/* Campo Descripción */}
        <div className="form-group">
          <label className="flex items-center gap-2">
            <Icons.Search className="h-4 w-4" /> Descripción / Contexto
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Ej: 'Me llegó un correo urgente...'"
            rows="4"
            className="w-full p-2 border rounded"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !isValid}
          className={`w-full p-3 rounded text-white font-bold flex items-center justify-center gap-2 ${loading || !isValid ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
        >
          {loading ? (
            <>
              <Icons.Refresh className="h-4 w-4 animate-spin" /> Analizando...
            </>
          ) : (
            <>
              <Icons.Rocket className="h-4 w-4" /> Reportar y Analizar
            </>
          )}
        </button>
      </form>

      {/* Mostrar resultado del análisis IA */}
      {result && (
        <div className={`result ${result.success ? 'success' : 'error'}`}>
          {result.success ? (
            <>
              <h3 className="flex items-center gap-2">
                <Icons.Check className="h-5 w-5" /> Incidente Procesado
              </h3>
              <div className="result-details">
                <p><strong>Resultado:</strong> {result.message}</p>
                <p><strong>Tipo:</strong> {result.threatType}</p>
                <p className="flex items-center gap-1"><strong>Severidad:</strong> <span className={`severity-${result.severity?.toLowerCase()}`}>{result.severity?.toUpperCase()}</span></p>
                <p><strong>Confianza IA:</strong> {(result.confidence * 100).toFixed(0)}%</p>
              </div>
            </>
          ) : (
            <>
              <h3 className="flex items-center gap-2">
                <Icons.Alert className="h-5 w-5" /> Error
              </h3>
              <p>{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default IncidentReporter;
