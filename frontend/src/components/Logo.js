import React from 'react';

const Logo = ({ className = "h-12 w-12", textColor = "text-slate-900" }) => (
    <div className="flex items-center gap-3">
        <div className={`${className} bg-blue-900 rounded-lg flex items-center justify-center shadow-lg`}>
            <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-2/3 h-2/3 text-white"
            >
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <path d="M12 8v4" />
                <path d="M12 16h.01" />
            </svg>
        </div>
        <div className="flex flex-col">
            <span className={`font-bold text-xl tracking-tight leading-none ${textColor}`}>CyberShield</span>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Security Suite</span>
        </div>
    </div>
);

export default Logo;
