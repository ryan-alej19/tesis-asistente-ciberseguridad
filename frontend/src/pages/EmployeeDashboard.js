
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Icons } from '../components/Icons';
import BusinessBrand from '../components/BusinessBrand';
import { debounce } from 'lodash';

// --- COMPONENTS ---

// Skeleton Loader for AI Panel
const SkeletonLoader = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-slate-200 rounded w-3/4"></div>
    <div className="h-20 bg-slate-200 rounded"></div>
    <div className="space-y-2">
      <div className="h-3 bg-slate-200 rounded w-5/6"></div>
      <div className="h-3 bg-slate-200 rounded w-4/6"></div>
    </div>
  </div>
);

// 1. History Item Component (Dark/Unified Sidebar)
const HistoryItem = ({ incident, isSelected, onClick }) => {
  const getSeverityStyle = (sev) => {
    switch (sev) {
      case 'critical': return 'bg-red-500 ring-red-900/50';
      case 'high': return 'bg-orange-500 ring-orange-900/50';
      case 'medium': return 'bg-yellow-500 ring-yellow-900/50';
      default: return 'bg-green-500 ring-green-900/50';
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group p-4 mb-2 rounded-lg cursor-pointer transition-all border border-l-4 ${isSelected
        ? 'bg-slate-800 border-indigo-500 shadow-lg shadow-black/20'
        : 'bg-slate-900/50 border-transparent border-l-slate-700 hover:bg-slate-800 hover:border-l-indigo-400'
        }`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ring-2 ${getSeverityStyle(incident.severity)}`}></span>
          <span className="text-[10px] font-bold uppercase text-slate-400 tracking-wider">
            {incident.severity || 'UNKNOWN'}
          </span>
        </div>
        <span className="text-[10px] text-slate-500 font-mono">
          {new Date(incident.created_at).toLocaleDateString()}
        </span>
      </div>
      <h4 className={`text-sm font-bold line-clamp-1 mb-1 ${isSelected ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
        {incident.title}
      </h4>
      <p className="text-xs text-slate-500 line-clamp-1 group-hover:text-slate-400">
        {incident.description}
      </p>
    </div>
  );
};

// 2. AI Analysis Panel (Right Column)
const AIAnalysisPanel = ({ isAnalyzing, analysisData, incidentCount, virustotalData }) => {
  const [showTechnical, setShowTechnical] = useState(false);

  if (isAnalyzing) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wide animate-pulse">
          <Icons.Refresh className="h-4 w-4 animate-spin" />
          Analizando...
        </div>
        <SkeletonLoader />
      </div>
    );
  }

  if (!analysisData && !virustotalData) {
    return (
      <div className="h-full flex flex-col justify-between p-6 bg-slate-50">
        <div className="text-center mt-10">
          <div className="inline-flex items-center justify-center p-4 bg-white rounded-full shadow-sm mb-4">
            <Icons.Brain className="h-8 w-8 text-indigo-400" />
          </div>
          <h3 className="text-sm font-bold text-slate-800">Asistente de Ciberseguridad</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed px-4">
            Escriba los detalles o suba un archivo. La IA analizará riesgos, detectará malware y explicará por qué es sospechoso.
          </p>
        </div>

        {/* Educational Content */}
        <div className="space-y-6 border-t border-slate-200 pt-6">
          {/* Tips or Stats */}
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <h4 className="text-xs font-bold text-slate-700 uppercase mb-2">💡 Tips de Seguridad</h4>
            <ul className="text-xs text-slate-600 space-y-2 list-disc list-inside">
              <li>Verifica siempre el remitente de los correos.</li>
              <li>No abras adjuntos no solicitados.</li>
              <li>Reporta cualquier comportamiento extraño.</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in pb-20">

      {/* 1. VIRUSTOTAL RESULTS (Files/URLs) */}
      {virustotalData && (
        <div className="mb-6 border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
          <div className="bg-slate-100 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-xs uppercase">
              <Icons.Shield className="h-4 w-4 text-blue-600" />
              VirusTotal {virustotalData.file_hash ? '(Archivo)' : '(URL)'}
            </h3>
            {virustotalData.malicious > 0 ? (
              <span className="text-[10px] font-bold bg-red-100 text-red-700 px-2 py-0.5 rounded-full ring-1 ring-red-200">
                MALWARE
              </span>
            ) : (
              <span className="text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full ring-1 ring-green-200">
                CLEAN
              </span>
            )}
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                <div className="text-lg font-bold text-slate-700">{virustotalData.detections}/{virustotalData.total_engines}</div>
                <div className="text-[10px] text-slate-400 uppercase">Motores</div>
              </div>
              <div className="text-center p-2 bg-slate-50 rounded border border-slate-100">
                <div className={`text-lg font-bold ${virustotalData.malicious > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {virustotalData.detection_rate}%
                </div>
                <div className="text-[10px] text-slate-400 uppercase">Tasa Detección</div>
              </div>
            </div>
            {virustotalData.permalink && (
              <a href={virustotalData.permalink} target="_blank" rel="noreferrer" className="block text-center text-xs text-indigo-600 hover:text-indigo-800 hover:underline">
                Ver reporte completo en VirusTotal ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* 2. GEMINI AI RESULTS */}
      {analysisData && (
        <>
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="flex items-center gap-2 font-bold text-slate-800 text-sm">
              <Icons.Brain className="h-5 w-5 text-indigo-600" />
              Análisis Inteligente
            </h3>
            <span className="text-xs bg-indigo-50 text-indigo-700 px-2 py-1 rounded font-bold">
              {(analysisData.confidence || analysisData.ai_confidence * 100 || 0).toFixed(0)}% Confianza
            </span>
          </div>

          {/* Risk Score */}
          <div className={`p-5 rounded-xl border-l-4 shadow-sm ${(analysisData.risk_level === 'ALTO' || analysisData.risk_level === 'critical') ? 'bg-red-50 border-red-500' :
              (analysisData.risk_level === 'MEDIO' || analysisData.risk_level === 'high') ? 'bg-orange-50 border-orange-500' :
                'bg-green-50 border-green-500'
            }`}>
            <div className="flex items-center gap-2 mb-2">
              {(analysisData.risk_level === 'ALTO' || analysisData.risk_level === 'critical')
                ? <Icons.Alert className="h-5 w-5 text-red-600" />
                : <Icons.Check className="h-5 w-5 text-green-600" />
              }
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Nivel de Riesgo</span>
            </div>
            <div className="text-2xl font-black capitalize text-slate-900 mb-2">
              {analysisData.risk_level}
            </div>
            <p className="text-sm text-slate-700 leading-relaxed font-medium">
              {analysisData.explanation || analysisData.simple_explanation || analysisData.analysis}
            </p>
          </div>

          {/* Technical Context (Expandable) */}
          {(analysisData.technical_context || analysisData.contexto_tecnico) && (
            <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setShowTechnical(!showTechnical)}
                className="w-full flex justify-between items-center p-3 text-xs font-bold text-slate-600 uppercase hover:bg-slate-100"
              >
                <span>Contexto Técnico</span>
                <Icons.ChevronDown className={`h-4 w-4 transition-transform ${showTechnical ? 'rotate-180' : ''}`} />
              </button>
              {showTechnical && (
                <div className="p-3 pt-0 text-xs text-slate-600 border-t border-slate-200 bg-white leading-relaxed">
                  {analysisData.technical_context || analysisData.contexto_tecnico}
                </div>
              )}
            </div>
          )}

          {/* Indicators */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">Indicadores Detectados</h4>
            {(analysisData.indicators || analysisData.indicadores || []).length > 0 ? (
              <ul className="space-y-2">
                {(analysisData.indicators || analysisData.indicadores).map((ind, i) => (
                  <li key={i} className="flex gap-3 text-sm text-slate-700 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
                    <Icons.Search className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    {ind}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-slate-400 italic bg-white p-3 rounded border border-slate-100">
                No se detectaron indicadores específicos.
              </p>
            )}
          </div>

          {/* Recommendations */}
          {(analysisData.recommendations || analysisData.recommended_action) && (
            <div className="bg-slate-800 text-white p-4 rounded-xl shadow-md">
              <h4 className="flex items-center gap-2 text-xs font-bold text-indigo-300 uppercase mb-2">
                <Icons.Shield className="h-4 w-4" /> Recomendación
              </h4>
              <p className="text-sm font-medium leading-relaxed opacity-90">
                {Array.isArray(analysisData.recommendations)
                  ? analysisData.recommendations.join(" ")
                  : (analysisData.recommendations || analysisData.recommended_action)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};


// 3. Main Dashboard Component
const EmployeeDashboard = () => {
  // Hooks
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // State
  const [incidents, setIncidents] = useState([]);
  const [selectedIncident, setSelectedIncident] = useState(null); // Null = New Report Mode
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Form State
  const [form, setForm] = useState({ url: '', description: '' });
  const [attachedFile, setAttachedFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingText, setLoadingText] = useState(''); // NEW: Dynamic Loading Text
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // AI Analysis State
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [realTimeAnalysis, setRealTimeAnalysis] = useState(null);

  // Initial Load
  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.get('http://localhost:8000/api/incidents/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncidents(res.data.incidents || []);
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  // --- REAL TIME ANALYSIS LOGIC ---
  const debouncedAnalyze = useCallback(
    debounce(async (text, url) => {
      if ((!text || text.length < 10) && !url) {
        setRealTimeAnalysis(null);
        setIsAnalyzing(false);
        return;
      }

      setIsAnalyzing(true);
      try {
        const token = localStorage.getItem('access_token');
        const res = await axios.post('http://localhost:8000/api/incidents/analyze/', {
          description: text,
          url: url
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.data.success) {
          setRealTimeAnalysis(res.data.analysis);
        }
      } catch (err) {
        console.error("Analysis failed:", err);
      } finally {
        setIsAnalyzing(false);
      }
    }, 1200),
    []
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const newForm = { ...form, [name]: value };
    setForm(newForm);
    if (submitSuccess) setSubmitSuccess(false);
    if (name === 'description' || name === 'url') {
      debouncedAnalyze(newForm.description, newForm.url);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files[0]) setAttachedFile(e.target.files[0]);
  };

  // Submit Report with Dynamic States
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingText('Iniciando carga...');
    setSubmitError('');

    if (!form.url && !form.description && !attachedFile) {
      setSubmitError('Ingrese información válida para el reporte.');
      setIsSubmitting(false);
      return;
    }

    // Dynamic Text Cycle
    const loadingMessages = [
      'Subiendo contenido...',
      'Consultando VirusTotal...',
      'Analizando con Gemini AI...',
      'Generando reporte final...'
    ];
    let msgIndex = 0;
    const intervalId = setInterval(() => {
      setLoadingText(loadingMessages[msgIndex]);
      msgIndex = (msgIndex + 1) % loadingMessages.length;
    }, 2000); // Change every 2s

    try {
      const token = localStorage.getItem('access_token');
      const formData = new FormData();

      const title = form.url
        ? `Web: ${new URL(form.url).hostname}`
        : attachedFile ? `Archivo: ${attachedFile.name}` : `Reporte ${new Date().toLocaleDateString()}`;

      formData.append('title', title);
      formData.append('description', form.description);
      formData.append('url', form.url);
      formData.append('incident_type', 'phishing');
      if (attachedFile) formData.append('attached_file', attachedFile);

      await axios.post('http://localhost:8000/api/incidents/create/', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      clearInterval(intervalId); // Stop cycle
      setLoadingText('¡Completado!');

      setSubmitSuccess(true);
      setForm({ url: '', description: '' });
      setAttachedFile(null);
      setRealTimeAnalysis(null);
      fetchIncidents(); // Refresh history

      setTimeout(() => setSubmitSuccess(false), 5000);

    } catch (err) {
      clearInterval(intervalId);
      console.error("Submission failed:", err);
      setSubmitError('Error al procesar reporte. Intente nuevamente.');
    } finally {
      setIsSubmitting(false);
      setLoadingText('');
    }
  };

  const handleNewReportClick = () => {
    setSelectedIncident(null);
    setRealTimeAnalysis(null);
  };

  return (
    <div className="flex h-screen bg-slate-900 font-sans text-slate-100 overflow-hidden">

      {/* --- COLUMN 1: SIDEBAR --- */}
      <aside className={`
          fixed inset-y-0 left-0 z-50 w-[300px] bg-slate-900 flex flex-col border-r border-slate-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
          ${showMobileSidebar ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
      `}>
        {/* Header */}
        <div className="p-6 border-b border-slate-800">
          <BusinessBrand lightMode={true} textSize="text-xl" iconSize="h-8 w-8" />
        </div>

        {/* New Report Action */}
        <div className="p-4 pb-2">
          <button
            onClick={handleNewReportClick}
            disabled={isSubmitting} // Disable if submitting
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-bold text-sm shadow-lg transition-all active:scale-95
              ${isSubmitting ? 'bg-slate-700 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/20'}`}
          >
            <Icons.Plus className="w-5 h-5" /> GENERAR INCIDENTE
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-4 px-2">Historial Reciente</h3>
          {incidents.length === 0 ? (
            <div className="text-center py-10 flex flex-col items-center opacity-50">
              <Icons.File className="h-8 w-8 text-slate-500 mb-2" />
              <p className="text-sm text-slate-500">Sin reportes aún.</p>
            </div>
          ) : (
            incidents.map(inc => (
              <HistoryItem
                key={inc.id}
                incident={inc}
                isSelected={selectedIncident?.id === inc.id}
                onClick={() => {
                  if (!isSubmitting) {
                    setSelectedIncident(inc);
                    setShowMobileSidebar(false);
                  }
                }}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50">
          {/* ... User Info ... */}
          <div className="flex items-center gap-3 rounded-md bg-slate-800 p-3 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-white text-sm font-bold shadow-md">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="truncate text-sm font-bold text-white">{user?.username || 'Usuario'}</p>
              <p className="truncate text-[10px] text-indigo-400 capitalize">{user?.role || 'Empleado'}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center justify-center gap-2 rounded-md bg-transparent px-4 py-2 text-xs font-bold text-slate-400 hover:text-red-400 transition-colors">
            <Icons.Logout className="h-4 w-4" /> CERRAR SESIÓN
          </button>
        </div>
      </aside>

      {/* --- COLUMN 2: MAIN CONTENT --- */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-white relative rounded-l-[30px] shadow-2xl border-l border-slate-200">

        {/* Mobile Toggle */}
        <div className="lg:hidden p-4 border-b flex justify-between items-center bg-white">
          <button onClick={() => setShowMobileSidebar(true)} className="text-slate-800">
            <Icons.Menu className="h-6 w-6" />
          </button>
          <span className="font-bold text-slate-900">Portal de Seguridad</span>
        </div>

        <main className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 lg:p-12 min-h-full">
            {selectedIncident ? (
              // ... (Existing Incident Detail View - No significant logic change needed, just relying on updated data passed to panel)
              <div className="animate-fade-in space-y-8">
                <div className="border-b border-slate-100 pb-6">
                  {/* ... Header ... */}
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border 
                                            ${selectedIncident.status === 'Resolved' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-blue-50 text-blue-700 border-blue-200'}`}>
                      {selectedIncident.status}
                    </span>
                    <span className="text-xs text-slate-400 font-mono">ID: #{selectedIncident.id}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedIncident.title}</h2>
                  <p className="text-sm text-slate-500 mt-2">
                    Reportado el {new Date(selectedIncident.created_at).toLocaleString()}
                  </p>
                </div>

                <div className="prose prose-sm max-w-none text-slate-600">
                  <h3 className="text-slate-900 font-bold mb-2">Descripción del Incidente</h3>
                  <p className="whitespace-pre-wrap leading-relaxed">{selectedIncident.description}</p>
                  {/* ... URL Display ... */}
                  {selectedIncident.url && (
                    <div className="mt-4 not-prose">
                      <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-lg border border-slate-200">
                        <Icons.Link className="h-5 w-5 text-slate-400" />
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-bold text-slate-500 uppercase">URL Reportada</p>
                          <a href={selectedIncident.url} target="_blank" rel="noreferrer" className="text-indigo-600 hover:text-indigo-800 font-mono text-sm truncate block">
                            {selectedIncident.url}
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Mobile Analysis Panel */}
                {selectedIncident.gemini_analysis && (
                  <div className="mt-8 pt-8 border-t border-slate-100 lg:hidden">
                    <AIAnalysisPanel
                      isAnalyzing={false}
                      analysisData={selectedIncident.gemini_analysis}
                      virustotalData={selectedIncident.virustotal_result}
                      incidentCount={0}
                    />
                  </div>
                )}
              </div>
            ) : (
              // --- VIEW: NEW REPORT FORM (Keep existing, update Button) ---
              <div className="animate-fade-in h-full flex flex-col justify-center max-w-2xl mx-auto">
                <div className="mb-10 text-center">
                  <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-3">
                    Nuevo Reporte
                  </h1>
                  <p className="text-slate-500 text-lg leading-relaxed">
                    Describa el incidente de seguridad. Nuestra IA lo analizará en tiempo real.
                  </p>
                </div>

                {/* Success/Error Banners (Keep existing) */}
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 p-4 rounded-xl mb-6 flex items-start gap-4 animate-fade-in-up shadow-sm">
                    <div className="bg-green-100 p-2 rounded-full mt-0.5"><Icons.Check className="h-5 w-5 text-green-700" /></div>
                    <div>
                      <p className="font-bold text-green-900">Reporte Enviado</p>
                      <p className="text-sm text-green-800 mt-1">El equipo de seguridad ha recibido su reporte.</p>
                    </div>
                  </div>
                )}
                {submitError && (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl mb-6 flex items-center gap-3 animate-fade-in">
                    <Icons.Alert className="h-5 w-5 text-red-600" />
                    <span className="text-sm font-medium text-red-800">{submitError}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Inputs (URL, Desc, File) - Keep same structure */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">URL (Opcional)</label>
                    <div className="relative group">
                      <div className="absolute left-4 top-3.5 text-slate-400 group-focus-within:text-indigo-600 transition-colors"><Icons.Link className="h-5 w-5" /></div>
                      <input type="url" name="url" value={form.url} onChange={handleInputChange} placeholder="https://malicioso.com" className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 font-mono text-sm text-slate-900" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Detalles</label>
                    <div className="relative">
                      <textarea name="description" value={form.description} onChange={handleInputChange} rows="6" placeholder="Describa qué sucedió..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-400 resize-none text-base leading-relaxed text-slate-900" />
                      <div className="absolute right-3 bottom-3 bg-white/80 backdrop-blur px-2 py-1 rounded text-[10px] items-center gap-2 flex">
                        {isAnalyzing ? (
                          <span className="text-indigo-600 font-bold flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping"></span>ANALIZANDO</span>
                        ) : (<span className="text-slate-400 font-medium">IA EN ESPERA</span>)}
                      </div>
                    </div>
                  </div>

                  <div className="border border-slate-200 rounded-xl p-1 bg-slate-50">
                    <label className="flex items-center justify-center w-full py-6 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:bg-white hover:border-indigo-300 transition-all group">
                      <input type="file" onChange={handleFileChange} className="hidden" />
                      <div className="text-center">
                        {attachedFile ? (
                          <div className="flex flex-col items-center">
                            <Icons.File className="h-8 w-8 text-indigo-500 mb-2" />
                            <span className="text-sm font-bold text-indigo-900">{attachedFile.name}</span>
                            <span className="text-xs text-slate-500">{(attachedFile.size / 1024).toFixed(1)} KB</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1">
                            <Icons.Paperclip className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                            <span className="text-sm font-medium text-slate-600">Adjuntar Archivo</span>
                          </div>
                        )}
                      </div>
                    </label>
                  </div>

                  {/* UPDATED: Dynamic Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/30 transform transition-all flex items-center justify-center gap-2
                                        ${isSubmitting ? 'bg-indigo-400 cursor-not-allowed translate-y-0 shadow-none' : 'bg-slate-900 hover:bg-indigo-700 hover:-translate-y-0.5'}`}
                  >
                    {isSubmitting ? (
                      <>
                        <Icons.Refresh className="h-5 w-5 animate-spin" /> {loadingText || 'Procesando...'}
                      </>
                    ) : (
                      <>
                        <Icons.Shield className="h-5 w-5" /> GENERAR INCIDENTE
                      </>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- COLUMN 3: AI PANEL (Right) --- */}
      <div className={`hidden lg:block w-[350px] bg-slate-50 border-l border-slate-200 flex-shrink-0`}>
        <div className="h-full overflow-y-auto custom-scrollbar">
          <AIAnalysisPanel
            isAnalyzing={isAnalyzing}
            analysisData={selectedIncident ? selectedIncident.gemini_analysis : realTimeAnalysis}
            virustotalData={selectedIncident ? selectedIncident.virustotal_result : null}
            incidentCount={incidents.length}
          />
        </div>
      </div>
    </div>
  );
};

export default EmployeeDashboard;
