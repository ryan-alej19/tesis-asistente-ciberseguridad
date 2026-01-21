import React from 'react';
import { Icons } from './Icons';

/**
 * Componente de Marca "Talleres Luis Mera"
 * Adaptable para Sidebar y Headers
 */
const BusinessBrand = ({
    className = "",
    textSize = "text-base",
    iconSize = "h-5 w-5",
    lightMode = false
}) => {
    // Si lightMode es true (para fondos oscuros), texto blanco
    const textColor = lightMode ? "text-white" : "text-slate-800";
    const subTextColor = lightMode ? "text-indigo-300" : "text-slate-500";
    const iconColor = lightMode ? "text-indigo-400" : "text-indigo-600";

    // Versión compacta y moderna sin fondo
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            <div className={`flex items-center justify-center`}>
                <Icons.Tool className={`${iconSize} ${iconColor}`} />
            </div>
            <div className="flex flex-col">
                <h1 className={`font-semibold tracking-tight leading-none ${textSize} ${textColor}`}>
                    Talleres Mera
                </h1>
                <span className={`text-[10px] uppercase font-bold tracking-wider mt-0.5 ${subTextColor}`}>
                    Gestión para Pequeñas Empresas
                </span>
            </div>
        </div>
    );
};

export default BusinessBrand;
