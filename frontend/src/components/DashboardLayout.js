import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icons } from './Icons';
import BusinessBrand from './BusinessBrand';

const DashboardLayout = ({ children, role }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    const navItems = [
        { name: 'Dashboard', path: '/dashboard', icon: Icons.Home },
        { name: 'Incidentes', path: '/incidents', icon: Icons.File },
        { name: 'Reportes', path: '/reporting', icon: Icons.ChartBar },
    ];

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
            {/* MOBILE OVERLAY */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* SIDEBAR */}
            <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col border-r border-slate-800
      `}>
                {/* Sidebar Header - Corporate Branding */}
                <div className="flex flex-col justify-center px-6 py-4 border-b border-slate-800 bg-slate-900">
                    <div className="flex items-center gap-3 mb-2">
                        <img
                            src="/logo_transparent.png"
                            alt="Logo Tecnicontrol"
                            className="h-10 w-auto object-contain"
                        />
                        <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                            TECNICONTROL <br />
                            <span className="text-indigo-400">AUTOMOTRIZ</span>
                        </h1>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto px-3 py-6 space-y-0.5">
                    <p className="px-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-3">
                        Menu Principal
                    </p>

                    {/* Dashboard Link */}
                    <button
                        onClick={() => navigate('/dashboard')}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200
               ${location.pathname === '/dashboard'
                                ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                                : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <Icons.Home className="h-3.5 w-3.5" />
                        Dashboard
                    </button>


                </nav>

                {/* User Info & Logout */}
                <div className="border-t border-slate-800 p-4">
                    <div className="flex items-center gap-3 rounded-md bg-slate-800/50 p-2 mb-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white text-xs font-bold">
                            {user?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="overflow-hidden">
                            <p className="truncate text-xs font-medium text-white">{user?.username || 'Usuario'}</p>
                            <p className="truncate text-[10px] text-slate-400 capitalize">{role || 'Usuario'}</p>
                        </div>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center justify-center gap-2 rounded-md bg-transparent px-4 py-2 text-xs font-medium text-slate-400 hover:bg-white/5 hover:text-white transition-colors"
                    >
                        <Icons.Logout className="h-3 w-3" />
                        Cerrar Sesión
                    </button>
                </div>
            </aside>

            {/* MAIN CONTENT WRAPPER */}
            <div className="flex flex-1 flex-col overflow-hidden">
                {/* TOP HEADER (Mobile Menu Trigger + Page Title) */}
                <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6 shadow-sm lg:hidden">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="text-slate-500 hover:text-slate-700"
                    >
                        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <BusinessBrand textSize="text-sm" iconSize="h-4 w-4" />
                    <div className="w-6" /> {/* Spacer */}
                </header>

                {/* SCROLLABLE CONTENT */}
                <main className="flex-1 overflow-y-auto bg-slate-50 p-4 lg:p-6">
                    <div className="mx-auto max-w-7xl animate-fade-in">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
