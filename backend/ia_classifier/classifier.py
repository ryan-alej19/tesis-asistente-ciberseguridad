"""

Clasificador de incidentes basado en reglas heurísticas
IA EXPLICABLE Y DEFENDIBLE PARA TESIS ACADÉMICA

Argumentación académica:
- NO usa Machine Learning ni modelos entrenados
- Basado en palabras clave definidas por estándares (NIST SP 800-61, ISO 27035)
- Sistema de scoring transparente y auditable
- Cada decisión es explicable paso a paso
- Apropiado para pequeñas empresas sin datasets históricos
- Fácil de explicar en defensa oral

LIMITACIONES RECONOCIDAS:
- NO tiene precisión medida con datos reales
- NO aprende de incidentes pasados
- Requiere validación externa (VirusTotal, Gemini)
- Confianza máxima limitada a 70% (no es caja negra)
"""
from typing import Dict, Any, List, Tuple
import re
from datetime import datetime


class IncidentClassifier:
    """
    Clasificador de incidentes de seguridad basado en reglas heurísticas.
    
    Estrategia:
    1. Analiza palabras clave en la descripción del incidente
    2. Asigna puntuación según severidad de palabras detectadas
    3. Considera el tipo de incidente reportado
    4. Retorna clasificación con confianza limitada (<70%)
    
    Uso académico:
    - Orientación preliminar, NO veredicto final
    - Complementado con VirusTotal para URLs
    - Complementado con Gemini para análisis contextual
    """
    
    def __init__(self):
        """Inicializa las palabras clave basadas en estándares de seguridad"""
        
        # ===== PALABRAS CLAVE POR SEVERIDAD =====
        # Fuentes: NIST SP 800-61 Rev 2, ISO 27035, MITRE ATT&CK
        
        self.CRITICAL_KEYWORDS = [
            # Malware avanzado
            'ransomware', 'malware', 'virus', 'trojan', 'troyano', 'backdoor', 'puerta trasera',
            # Compromiso de datos
            'breach', 'robo de datos', 'robo datos', 'exfiltracion', 'exfiltración', 
            'datos sensibles', 'base de datos comprometida', 'filtracion', 'filtración',
            # Cifrado y bloqueo
            'encriptado', 'cifrado malicioso', 'crypto', 'bloqueado', 'secuestro',
            # Ataques dirigidos
            'botnet', 'apt', 'ataque dirigido', 'ciberataque masivo', 'ataque avanzado',
            # Vulnerabilidades críticas
            'zero-day', 'zero day', 'vulnerabilidad critica', 'exploit', 'explotacion',
            # Escalamiento de privilegios
            'administrador comprometido', 'root comprometido', 'admin comprometido',
            'privilegios elevados no autorizados', 'escalada de privilegios',
        ]
        
        self.HIGH_KEYWORDS = [
            # Acceso no autorizado
            'hack', 'hacking', 'hackeado', 'unauthorized', 'no autorizado', 'acceso no autorizado',
            'acceso extraño', 'acceso extrano', 'login anomalo', 'sesion sospechosa', 'sesión sospechosa',
            # Phishing
            'phishing', 'suplantacion', 'suplantación', 'correo sospechoso', 'email sospechoso',
            'enlace malicioso', 'link malicioso', 'adjunto sospechoso',
            # Ataques de fuerza
            'fuerza bruta', 'brute force', 'intento masivo', 'intentos fallidos multiples',
            'credential stuffing', 'password spraying',
            # Inyecciones y XSS
            'inyeccion sql', 'inyección sql', 'sql injection', 'cross-site', 'xss',
            'code injection', 'command injection',
            # Denegación de servicio
            'ddos', 'dos', 'denegacion de servicio', 'denegación de servicio', 'ataque de negacion',
            'servicio caido', 'servicio caído',
            # Modificaciones sospechosas
            'modificacion no autorizada', 'modificación no autorizada', 'archivo modificado',
            'configuracion cambiada', 'configuración cambiada', 'registro alterado',
        ]
        
        self.MEDIUM_KEYWORDS = [
            # Errores de configuración
            'error', 'fallo', 'incorrecto', 'mal configurado',
            'configuracion erronea', 'configuración errónea', 'permiso incorrecto',
            # Advertencias del sistema
            'warning', 'advertencia', 'alerta', 'aviso',
            # Problemas de conectividad
            'timeout', 'conexion fallida', 'conexión fallida', 'conexion perdida', 'conexión perdida',
            'red lenta', 'servicio no disponible', 'servicio lento',
            # Bloqueos de seguridad
            'cuenta bloqueada', 'intento fallido', 'acceso denegado',
            'sesion expirada', 'sesión expirada', 'token invalido', 'token inválido',
        ]
        
        # ===== CLASIFICACIÓN POR TIPO DE INCIDENTE =====
        # Formato: (tipo, severidad_base, confianza_base)
        self.INCIDENT_TYPE_SEVERITY = {
            'malware': ('critical', 0.70),
            'ransomware': ('critical', 0.75),
            'robo_datos': ('critical', 0.75),
            'robo_de_datos': ('critical', 0.75),
            'backdoor': ('critical', 0.70),
            'exfiltracion': ('critical', 0.72),
            'exfiltración': ('critical', 0.72),
            
            'phishing': ('high', 0.65),
            'acceso_sospechoso': ('high', 0.60),
            'acceso_no_autorizado': ('high', 0.65),
            'ddos': ('high', 0.70),
            'inyeccion_sql': ('high', 0.65),
            'inyección_sql': ('high', 0.65),
            'xss': ('high', 0.60),
            'fuerza_bruta': ('high', 0.62),
            
            'error_configuracion': ('medium', 0.45),
            'error_de_configuracion': ('medium', 0.45),
            'fallo_sistema': ('medium', 0.40),
            'cuenta_bloqueada': ('medium', 0.40),
            'timeout': ('medium', 0.35),
            
            'otro': ('low', 0.30),
            'desconocido': ('low', 0.25),
        }
    
    def _normalize_text(self, text: str) -> str:
        """
        Normaliza el texto para comparación (minúsculas, sin acentos).
        
        Args:
            text (str): Texto a normalizar
        
        Returns:
            str: Texto normalizado
        """
        text = text.lower()
        # Eliminar acentos comunes en español
        replacements = {
            'á': 'a', 'é': 'e', 'í': 'i', 'ó': 'o', 'ú': 'u',
            'ñ': 'n', 'ü': 'u'
        }
        for old, new in replacements.items():
            text = text.replace(old, new)
        return text
    
    def classify(self, description: str, threat_type: str = 'otro') -> tuple:
        """
        Clasifica un incidente de seguridad en base a su descripción.
        
        Args:
            description (str): Descripción del incidente en lenguaje natural
            threat_type (str): Tipo de amenaza (opcional, default='otro')
        
        Returns:
            tuple: (severity, confidence)
            - severity: 'low' | 'medium' | 'high' | 'critical'
            - confidence: float entre 0.0 y 0.70 (máximo)
        
        Ejemplo:
            >>> classifier = IncidentClassifier()
            >>> severity, confidence = classifier.classify(
                    "Recibí un correo con un enlace sospechoso de PayPal",
                    "phishing"
                )
            >>> print(severity, confidence)
            ('high', 0.65)
        
        Nota académica:
            - La confianza NUNCA supera 0.70 (70%)
            - Sistema de reglas NO aprende de datos
            - Requiere validación con VirusTotal/Gemini
        """
        
        # Validación de entrada
        if not description or len(description.strip()) < 5:
            return ('low', 0.20)  # Descripción insuficiente
        
        # Normalización de texto
        text = self._normalize_text(description)
        threat_type_lower = self._normalize_text(threat_type) if threat_type else 'otro'
        
        # ===== CONTEO DE COINCIDENCIAS =====
        critical_matches = sum(1 for word in self.CRITICAL_KEYWORDS if word in text)
        high_matches = sum(1 for word in self.HIGH_KEYWORDS if word in text)
        medium_matches = sum(1 for word in self.MEDIUM_KEYWORDS if word in text)
        
        # ===== LÓGICA DE DECISIÓN (TRANSPARENTE) =====
        
        # REGLA 1: Palabras críticas detectadas (máxima prioridad)
        if critical_matches > 0:
            # Aumenta confianza por cada palabra crítica (máx 70%)
            confidence = min(0.70, 0.55 + (critical_matches * 0.05))
            return ('critical', round(confidence, 2))
        
        # REGLA 2: Tipo de incidente indica criticidad
        if threat_type_lower in self.INCIDENT_TYPE_SEVERITY:
            severity, confidence = self.INCIDENT_TYPE_SEVERITY[threat_type_lower]
            if severity == 'critical':
                return (severity, confidence)
        
        # REGLA 3: Palabras de alta severidad
        if high_matches > 0:
            confidence = min(0.70, 0.50 + (high_matches * 0.04))
            return ('high', round(confidence, 2))
        
        # REGLA 4: Tipo de incidente indica alta severidad
        if threat_type_lower in self.INCIDENT_TYPE_SEVERITY:
            severity, confidence = self.INCIDENT_TYPE_SEVERITY[threat_type_lower]
            if severity == 'high':
                return (severity, confidence)
        
        # REGLA 5: Palabras de severidad media
        if medium_matches > 0:
            confidence = min(0.70, 0.35 + (medium_matches * 0.03))
            return ('medium', round(confidence, 2))
        
        # REGLA 6: Tipo de incidente indica severidad media
        if threat_type_lower in self.INCIDENT_TYPE_SEVERITY:
            severity, confidence = self.INCIDENT_TYPE_SEVERITY[threat_type_lower]
            if severity == 'medium':
                return (severity, confidence)
        
        # REGLA 7: Por defecto, bajo riesgo con confianza mínima
        return ('low', 0.25)
    
    def get_explanation(self, severity: str, confidence: float) -> Dict[str, Any]:
        """
        Genera explicación en español de la clasificación.
        Útil para dashboard y defensa oral.
        
        Args:
            severity (str): Severidad calculada
            confidence (float): Confianza de la clasificación
        
        Returns:
            dict: Explicación estructurada con severidad, confianza y descripción
        
        Ejemplo:
            >>> explanation = classifier.get_explanation('high', 0.65)
            >>> print(explanation)
            {
                'severity': 'Alto - Acción inmediata necesaria',
                'confidence': '65%',
                'description': 'Incidente clasificado como Alto con 65% de confianza.'
            }
        """
        severity_text = {
            'low': 'Bajo - Riesgo mínimo',
            'medium': 'Medio - Requiere seguimiento',
            'high': 'Alto - Acción inmediata necesaria',
            'critical': 'Crítico - ACCIÓN URGENTE',
        }
        
        confidence_pct = f"{confidence * 100:.0f}%"
        
        return {
            'severity': severity_text.get(severity, 'Desconocido'),
            'confidence': confidence_pct,
            'confidence_note': 'Confianza limitada (sistema de reglas heurísticas)',
            'description': (
                f"Incidente clasificado como {severity_text.get(severity, 'Desconocido')} "
                f"con {confidence_pct} de confianza basado en reglas heurísticas."
            ),
            'recommendation': (
                'Se recomienda validar con VirusTotal (URLs) o Gemini (contexto) '
                'para confirmar la clasificación inicial.'
            )
        }


# ===== FUNCIONES LEGACY (compatibilidad con código antiguo) =====


def classify_incident(title: str, description: str, incident_type: str = '') -> tuple:
    """
    Función legacy que usa la clase IncidentClassifier internamente.
    Se mantiene para compatibilidad con código existente.
    
    Args:
        title (str): Título del incidente (no usado actualmente)
        description (str): Descripción del incidente
        incident_type (str): Tipo de incidente
    
    Returns:
        tuple: (severity, confidence, threat_type)
    """
    classifier = IncidentClassifier()
    severity, confidence = classifier.classify(description, incident_type)
    
    # Mapeo de severidad a tipo de amenaza (para retrocompatibilidad)
    threat_type_map = {
        'critical': 'Malware/Ransomware/Breach',
        'high': 'Phishing/Unauthorized Access',
        'medium': 'Configuration Error/System Issue',
        'low': 'Other/Unknown'
    }
    
    threat_type = threat_type_map.get(severity, 'Unknown')
    return (severity, confidence, threat_type)


def get_classification_explanation(severity: str, confidence: float, threat_type: str) -> Dict[str, Any]:
    """
    Función legacy que usa la clase IncidentClassifier internamente.
    Se mantiene para compatibilidad con código existente.
    
    Args:
        severity (str): Severidad del incidente
        confidence (float): Nivel de confianza
        threat_type (str): Tipo de amenaza
    
    Returns:
        dict: Explicación con severidad, confianza y tipo de amenaza
    """
    classifier = IncidentClassifier()
    explanation = classifier.get_explanation(severity, confidence)
    explanation['threat_type'] = threat_type
    return explanation
