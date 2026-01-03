import os
from typing import Dict, Any
import google.generativeai as genai


class GeminiService:
    def __init__(self):
        """
        Inicializa el servicio de Gemini para análisis de incidentes.
        Configura la API Key desde variables de entorno.
        """
        api_key = os.getenv('GEMINI_API_KEY')
        
        if not api_key:
            raise ValueError("⚠️ GEMINI_API_KEY no encontrada en variables de entorno")
        
        # Configurar API correctamente
        genai.configure(api_key=api_key)
        
        # Usar modelo actualizado (gemini-1.5-flash es gratuito y rápido)
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        
        print("✅ GeminiService inicializado correctamente")


    def analyze_incident(self, description: str, url: str = None) -> Dict[str, Any]:
        """
        Analiza un incidente de seguridad usando Gemini.
        
        Args:
            description (str): Descripción del incidente
            url (str, optional): URL o archivo relacionado
        
        Returns:
            dict: Resultado del análisis con patrones, explicación y recomendaciones
        """
        try:
            # Construir prompt mejorado para análisis conservador
            prompt = f"""
Eres un analista de ciberseguridad experto. Analiza el siguiente incidente de seguridad:

**Descripción:** {description}
**URL/Archivo:** {url if url else 'No proporcionado'}

CONTEXTO IMPORTANTE:
- Si la descripción es vaga o muy corta (ej: "que es eso", "ayuda"), indica que NO hay suficiente información para análisis.
- Si la URL es .onion, menciona que es de la red Tor y requiere análisis especializado.
- Sé CONSERVADOR: NO clasifiques como peligroso sin evidencia clara.
- Si NO hay indicios de amenaza, dilo explícitamente.

Proporciona ÚNICAMENTE:
1. **Patrones detectados**: Máximo 3 señales técnicas concretas (o "Ninguno identificado" si no hay).
2. **Explicación**: ¿Es realmente malicioso? ¿Por qué? Sé técnico pero claro.
3. **Recomendación**: Acción concreta y proporcional al riesgo real (no exageres).

FORMATO REQUERIDO:
**Patrones detectados:**
- [Patrón 1]
- [Patrón 2]
- [Patrón 3]

**Explicación:**
[Tu análisis técnico aquí]

**Recomendación:**
[Acción específica]
"""

            # Generar respuesta con Gemini
            response = self.model.generate_content(prompt)
            
            # Extraer texto de respuesta
            analysis_text = response.text.strip()
            
            # Parsear respuesta estructurada
            patterns = []
            explanation = ""
            recommendation = ""
            
            # Dividir por líneas
            lines = analysis_text.split('\n')
            current_section = None
            
            for line in lines:
                line = line.strip()
                if not line:
                    continue
                
                # Detectar secciones por marcadores
                line_lower = line.lower()
                if 'patron' in line_lower or 'señal' in line_lower:
                    current_section = 'patterns'
                    continue
                elif 'explicación' in line_lower or 'explicacion' in line_lower or 'análisis' in line_lower:
                    current_section = 'explanation'
                    continue
                elif 'recomendación' in line_lower or 'recomendacion' in line_lower:
                    current_section = 'recommendation'
                    continue
                
                # Agregar contenido a la sección actual
                if current_section == 'patterns':
                    # Extraer patrones de listas
                    if line.startswith('-') or line.startswith('*') or line.startswith('•'):
                        clean_pattern = line.lstrip('-*•').strip()
                        if clean_pattern and clean_pattern.lower() not in ['ninguno', 'ninguno identificado', 'n/a']:
                            patterns.append(clean_pattern)
                    elif line[0].isdigit() and ('.' in line[:3] or ')' in line[:3]):
                        clean_pattern = line.split('.', 1)[-1].split(')', 1)[-1].strip()
                        if clean_pattern and clean_pattern.lower() not in ['ninguno', 'ninguno identificado', 'n/a']:
                            patterns.append(clean_pattern)
                            
                elif current_section == 'explanation':
                    # Evitar copiar encabezados
                    if not line.startswith('**') and not line.startswith('#'):
                        explanation += line + " "
                        
                elif current_section == 'recommendation':
                    # Evitar copiar encabezados
                    if not line.startswith('**') and not line.startswith('#'):
                        recommendation += line + " "
            
            # Limpiar espacios extras
            explanation = explanation.strip()
            recommendation = recommendation.strip()
            
            # Validación: si no se parseó correctamente, usar fallbacks
            if not explanation:
                # Buscar entre "Explicación:" y "Recomendación:"
                if 'explicación' in analysis_text.lower() or 'explicacion' in analysis_text.lower():
                    start = analysis_text.lower().find('explicación')
                    if start == -1:
                        start = analysis_text.lower().find('explicacion')
                    end = analysis_text.lower().find('recomendación', start)
                    if end == -1:
                        end = analysis_text.lower().find('recomendacion', start)
                    if start != -1:
                        explanation = analysis_text[start:end if end != -1 else len(analysis_text)].split(':', 1)[-1].strip()
                        explanation = explanation[:500]  # Limitar a 500 caracteres
                
                if not explanation:
                    explanation = "No se pudo extraer análisis estructurado. Revisa el contexto proporcionado."
            
            if not recommendation:
                # Buscar sección de recomendación
                if 'recomendación' in analysis_text.lower() or 'recomendacion' in analysis_text.lower():
                    start = analysis_text.lower().find('recomendación')
                    if start == -1:
                        start = analysis_text.lower().find('recomendacion')
                    if start != -1:
                        recommendation = analysis_text[start:].split(':', 1)[-1].strip()
                        recommendation = recommendation[:300]  # Limitar a 300 caracteres
                
                if not recommendation:
                    recommendation = "Consulta con el equipo de seguridad antes de interactuar con el contenido reportado."
            
            # Limitar patrones a máximo 3
            patterns = patterns[:3]
            
            return {
                'success': True,
                'patterns_detected': patterns,
                'explanation': explanation,
                'recommendation': recommendation,
                'raw_analysis': analysis_text  # Para debugging
            }
            
        except Exception as e:
            print(f"❌ ERROR en GeminiService.analyze_incident: {e}")
            return {
                'success': False,
                'error': str(e),
                'patterns_detected': [],
                'explanation': 'No se pudo completar el análisis con IA. Error técnico en el servicio.',
                'recommendation': 'Consulta con el equipo de seguridad para análisis manual del incidente.'
            }
