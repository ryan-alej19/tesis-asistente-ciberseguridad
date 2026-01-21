import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BusinessBrand from '../components/BusinessBrand';
import { Icons } from '../components/Icons';

function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(username, password);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.error || '❌ Credenciales inválidas. Intente de nuevo.');
      }
    } catch (err) {
      setError('Error de conexión. Intente más tarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white">
      {/* LEFT SIDE: BRANDING & ART */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 relative overflow-hidden flex-col justify-between p-12 text-white">
        <div className="z-10 relative">
          {/* Brand removed as requested */}
          <h2 className="mt-8 text-4xl font-bold leading-tight">
            Seguridad digital <br />
            <span className="text-indigo-400">inteligente y confiable.</span>
          </h2>
          <p className="mt-4 text-slate-400 max-w-md text-lg">
            Gestione incidentes, analice amenazas con IA y proteja su organización desde una plataforma unificada.
          </p>
        </div>

        {/* Abstract Pattern */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-indigo-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>

        <div className="z-10 relative text-sm text-gray-400">
          © 2026 RyanTech | Sistema Protegido
        </div>
      </div>

      {/* RIGHT SIDE: FORM */}
      <div className="flex w-full lg:w-1/2 flex-col justify-center px-8 lg:px-24 bg-slate-50">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10 lg:hidden">
            <BusinessBrand textSize="text-2xl" />
          </div>

          <h3 className="text-2xl font-bold text-slate-900 mb-2">Bienvenido de nuevo</h3>
          <p className="text-slate-500 mb-8">Por favor ingrese sus credenciales para acceder.</p>

          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r">
                <div className="flex">
                  <Icons.Alert className="h-5 w-5 text-red-500 mr-2" />
                  <p className="text-sm text-red-700 font-medium">{error}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="ej. admin"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Contraseña
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 rounded-lg text-white font-bold tracking-wide transition-all shadow-lg shadow-indigo-500/30 ${loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-600/40 hover:-translate-y-0.5'
                }`}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                  Verificando...
                </span>
              ) : 'Iniciar Sesión'}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-400">
            ¿Olvidó su contraseña? Contacte al administrador.
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
