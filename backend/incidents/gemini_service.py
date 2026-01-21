"""
SERVICIO DE GEMINI - ANÁLISIS CONTEXTUAL
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()


class GeminiService:
    """
    Servicio para análisis contextual de incidentes usando Gemini 1.5 Flash
    """
    
    def __init__(self):
        """
        Inicializa el servicio de Gemini
        """
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            raise ValueError(" GEMINI_API_KEY no está configurada en .env")
        
        genai.configure(api_key=api_key)
        
        # CAMBIADO A GEMINI 1.5 FLASH (MÁS RÁPIDO Y COMPATIBLE)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        print("GeminiService inicializado correctamente con Gemini 1.5 Flash")


    def analyze_incident(self, url, description, threat_type, severity):
        """
        Analiza un incidente de ciberseguridad usando Gemini para determinar riesgo y contexto.
        """
        try:
            print(f"\n[GEMINI] Iniciando análisis contextual...")
            print(f"   - URL: {url or 'No especificada'}")
            print(f"   - Tipo reportado: {threat_type}")
            
            prompt = f"""
Actúa como un experto Analista de Ciberseguridad (SOC Nivel 2).
Analiza el siguiente reporte de incidente:

DATOS DEL INCIDENTE:
- Tipo Reportado: {threat_type}
- Descripción: {description or "No proporcionada"}
- URL sospechosa: {url or "N/A"}

TAREA:
1. Evalúa la SEVERIDAD y CONFIANZA del incidente basándote en indicadores técnicos y heurística.
2. Explica técnicamente el por qué de la evaluación.
3. Recomienda acciones de contención inmediatas.

FORMATO DE RESPUESTA REQUERIDO (Estricto):
Severidad: [Bajo/Medio/Alto/Crítico]
Confianza: [0-100]
Explicación: [Análisis técnico conciso, máximo 3 líneas]
Patrones: [Lista de IoCs o comportamientos observados, separados por comas]
Recomendación: [Acción técnica inmediata]
"""
            
            response = self.model.generate_content(prompt)
            
            if not response or not response.text:
                raise Exception("Respuesta vacía del proveedor de IA")
            
            analysis_text = response.text.strip()
            
            # Parsear respuesta estructurada
            result = self._parse_gemini_response(analysis_text)
            
            print(f"[GEMINI] Análisis completado. Riesgo detectado: {result.get('risk_level', 'N/A')}")
            
            return {
                'success': True,
                'risk_level': result.get('risk_level', 'Medio'),
                'confidence': result.get('confidence', 0.5), # 0.0 - 1.0
                'explanation': result.get('explanation', analysis_text),
                'patterns_detected': result.get('patterns', []),
                'recommendation': result.get('recommendation', 'Revisión manual requerida'),
                'raw_analysis': analysis_text
            }
        
        except Exception as e:
            error_msg = str(e)
            print(f"[ERROR] Fallo en GeminiService: {error_msg}")
            
            # Fallback seguro para cualquier error (no bloquear guardado)
            return {
                'success': True, # Decimos True para que el frontend muestre el resultado fallback
                'risk_level': 'Medio',
                'confidence': 0.0,
                'explanation': f"El servicio de IA no estuvo disponible: {error_msg}. Se requiere revisión manual.",
                'patterns_detected': ["Error de servicio"],
                'recommendation': "Revisar logs del sistema.",
                'raw_analysis': "Service Error",
            }

    def _parse_gemini_response(self, text):
        """
        Parsea la respuesta de texto estructurado a diccionario.
        """
        result = {
            'risk_level': 'Medio',
            'confidence': 0.5,
            'explanation': '',
            'patterns': [],
            'recommendation': ''
        }
        
        try:
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                if not line: continue
                
                lower_line = line.lower()
                
                if line.startswith('Severidad:'):
                    result['risk_level'] = line.split(':', 1)[1].strip()
                elif line.startswith('Confianza:'):
                    try:
                        val = line.split(':', 1)[1].strip().replace('%', '')
                        result['confidence'] = float(val) / 100.0
                    except:
                        result['confidence'] = 0.5
                elif line.startswith('Explicación:'):
                    result['explanation'] = line.split(':', 1)[1].strip()
                elif line.startswith('Patrones:'):
                    patterns = line.split(':', 1)[1].strip()
                    result['patterns'] = [p.strip() for p in patterns.split(',')]
                elif line.startswith('Recomendación:'):
                    result['recommendation'] = line.split(':', 1)[1].strip()
            
            # Respaldo si el parsing falla parcialmente
            if not result['explanation']:
                result['explanation'] = text[:200]
                
            return result
            
        except Exception as e:
            print(f"[WARNING] Error parseando respuesta LLM: {e}")
            result['explanation'] = text[:200]
            return result
