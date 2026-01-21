/**
 * CREAR INCIDENTE CON IA - TESIS CIBERSEGURIDAD
 * Ryan Gallegos Mera - PUCESI
 * Última actualización: 07 de Enero, 2026
 */

import React, { useState } from 'react';
import { createIncident } from '../services/api';
import { Icons } from './Icons';
// import './CreateIncident.css'; // Comentado para usar Tailwind nativo

function CreateIncident() {
  const [formData, setFormData] = useState({
    incident_type: '',
    description: '',
    url: ''
  });

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fieldErrors, setFieldErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Limpiar error del campo cuando el usuario escribe
    if (fieldErrors[name]) {
      setFieldErrors({
        ...fieldErrors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.incident_type) errors.incident_type = 'Debe seleccionar un tipo de incidente.';
    if (!formData.description || formData.description.length < 10) {
      errors.description = 'La descripción debe tener al menos 10 caracteres.';
    }

    if (formData.url) {
      // Regex simple para validar URL
      const urlPattern = /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/;
      if (!urlPattern.test(formData.url)) {
        errors.url = 'Ingrese una URL válida (ej: https://sitio-sospechoso.com)';
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {


      const response = await createIncident(formData);


      setResult(response);

      // Limpiar formulario
      setFormData({
        incident_type: '',
        description: '',
        url: ''
      });

    } catch (err) {
      console.error('Error:', err);
      setError(err.error || 'No se pudo conectar con el servidor. Intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityClass = (level) => {
    switch (level) {
      case 'Crítico': return 'bg-red-100 text-red-800';
      case 'Alto': return 'bg-orange-100 text-orange-800';
      case 'Medio': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
        <Icons.File className="text-blue-900 h-8 w-8" /> Reportar Incidente de Seguridad
      </h2>

      <div className="bg-white rounded-lg shadow-md p-6 border border-slate-200">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tipo de Incidente */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Tipo de Incidente <span className="text-red-500">*</span>
            </label>
            <select
              name="incident_type"
              value={formData.incident_type}
              onChange={handleChange}
              className={`w-full p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.incident_type ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
            >
              <option value="">Seleccione un tipo</option>
              <option value="Phishing">Phishing</option>
              <option value="Malware">Malware</option>
              <option value="Acceso no autorizado">Acceso no autorizado</option>
              <option value="Fuga de datos">Fuga de datos</option>
              <option value="Denegación de servicio">Denegación de servicio</option>
              <option value="Otro">Otro</option>
            </select>
            {fieldErrors.incident_type && (
              <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.incident_type}</p>
            )}
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Descripción del Incidente <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describa qué sucedió, qué sistemas se vieron afectados y cualquier detalle relevante..."
              rows="5"
              className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.description ? 'border-red-500 bg-red-50' : 'border-slate-300'
                }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.description}</p>
            )}
          </div>

          {/* URL (opcional) */}
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              URL Sospechosa (Opcional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Icons.Paperclip className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="url"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://ejemplo-sospechoso.com"
                className={`w-full pl-10 p-2.5 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors ${fieldErrors.url ? 'border-red-500 bg-red-50' : 'border-slate-300'
                  }`}
              />
            </div>
            {fieldErrors.url && (
              <p className="mt-1 text-sm text-red-600 font-medium">{fieldErrors.url}</p>
            )}
            <p className="mt-1 text-xs text-slate-500">
              Si el incidente involucra un sitio web, ingréselo para análisis automático con VirusTotal.
            </p>
          </div>

          {/* Botón de envío */}
          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 px-4 rounded-md font-bold text-white transition-all duration-200 flex items-center justify-center space-x-2 ${loading
              ? 'bg-blue-800 cursor-wait opacity-90'
              : 'bg-blue-900 hover:bg-blue-800 active:bg-blue-950 hover:shadow-lg'
              }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Analizando con IA...</span>
              </>
            ) : (
              <>
                <Icons.Robot className="h-5 w-5" />
                <span>Analizar y Crear Incidente</span>
              </>
            )}
          </button>
        </form>

        {/* Mensaje de error global */}
        {error && (
          <div className="mt-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md animate-fade-in">
            <div className="flex items-center">
              <Icons.Alert className="h-6 w-6 mr-3 text-red-600" />
              <div>
                <p className="font-bold">Error al procesar la solicitud</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultado del análisis */}
      {result && (
        <div className="mt-8 animate-slide-up">
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-bold text-green-800 mb-2 flex items-center">
              <Icons.Check className="mr-2 h-6 w-6" /> Incidente Reportado Exitosamente
            </h3>
            <p className="text-green-700">El incidente ha sido registrado y analizado por nuestros sistemas de seguridad.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Información básica */}
            <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
              <h4 className="font-bold text-slate-800 border-b pb-2 mb-3 flex items-center gap-2">
                <Icons.File className="h-4 w-4" /> Detalle del Reporte
              </h4>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-slate-500">ID:</span>
                  <span className="font-mono font-medium text-slate-900">#{result.incident.id}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Tipo:</span>
                  <span className="font-medium text-slate-900">{result.incident.incident_type}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-slate-500">Estado:</span>
                  <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-800">
                    {result.incident.status}
                  </span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-slate-500">Nivel de Riesgo:</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${getSeverityClass(result.incident.risk_level)}`}>
                    {result.incident.risk_level}
                  </span>
                </li>
              </ul>
            </div>

            {/* Análisis AI - Gemini */}
            {result.gemini && (
              <div className="bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 border-b pb-2 mb-3 flex items-center">
                  <span className="mr-2"><Icons.Robot className="h-5 w-5" /></span> Análisis de IA
                </h4>

                {result.gemini.confidence && (
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="font-semibold text-slate-600">Confianza del modelo</span>
                      <span className="text-blue-600 font-bold">{result.gemini.confidence}%</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${result.gemini.confidence}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {result.gemini.risk_assessment && (
                  <div className="text-sm text-slate-700 bg-slate-50 p-3 rounded border border-slate-100">
                    <p className="font-medium mb-1">Evaluación:</p>
                    <p>{result.gemini.risk_assessment}</p>
                  </div>
                )}
              </div>
            )}

            {/* Análisis VirusTotal */}
            {result.virustotal && (
              <div className="md:col-span-2 bg-white p-5 rounded-lg shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-800 border-b pb-2 mb-3 flex items-center">
                  <span className="mr-2"><Icons.Shield className="h-5 w-5" /></span> Reporte de VirusTotal
                </h4>

                {result.virustotal.error ? (
                  <p className="text-orange-600 bg-orange-50 p-3 rounded">{result.virustotal.error}</p>
                ) : (
                  <div className="flex flex-col md:flex-row gap-4 items-start">
                    <div className="flex-1">
                      <p className="text-sm text-slate-600 mb-2"><strong>URL:</strong> {result.virustotal.url}</p>
                      <div className="flex gap-4">
                        <div className="text-center p-3 bg-slate-50 rounded border border-slate-100 min-w-[100px]">
                          <span className="block text-2xl font-bold text-red-600">{result.virustotal.positives}</span>
                          <span className="text-xs text-slate-500 uppercase font-semibold">Detecciones</span>
                        </div>
                        <div className="text-center p-3 bg-slate-50 rounded border border-slate-100 min-w-[100px]">
                          <span className="block text-2xl font-bold text-slate-700">{result.virustotal.total}</span>
                          <span className="text-xs text-slate-500 uppercase font-semibold">Motores Total</span>
                        </div>
                      </div>
                    </div>

                    {result.virustotal.permalink && (
                      <a
                        href={result.virustotal.permalink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center mt-2 md:mt-0"
                      >
                        Ver reporte completo en VirusTotal ↗
                      </a>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CreateIncident;
