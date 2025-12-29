# 📋 CONTEXTO COMPLETO DEL PROYECTO - ACTUALIZACIÓN DICIEMBRE 2025

## Asistente Web con IA para Gestión de Incidentes de Ciberseguridad

**Autor:** Ryan Gallegos Mera  
**Tesis:** Tecnología Superior en Desarrollo de Software  
**Empresa:** Talleres Luis Mera (Quito, Ecuador)  
**Universidad:** Pontificia Universidad Católica del Ecuador Sede Ibarra (PUCESI)  
**Estado Actual:** EN DESARROLLO (Fase avanzada)  
**Fecha Actualización:** 26 de Diciembre, 2025  
**Tiempo Estimado a Defensa:** 1-2 meses

---

## 📑 TABLA DE CONTENIDOS

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Estado del Proyecto](#estado-del-proyecto)
3. [Problema & Objetivos](#problema--objetivos)
4. [Stack Tecnológico Confirmado](#stack-tecnológico-confirmado)
5. [Avances Concretos Realizados](#avances-concretos-realizados)
6. [Estructura del Repositorio Git](#estructura-del-repositorio-git)
7. [Plan de Finalización (4-8 semanas)](#plan-de-finalización-4-8-semanas)
8. [Checklist Defensa](#checklist-defensa)
9. [Docker & Deployment](#docker--deployment)
10. [Preguntas Frecuentes](#preguntas-frecuentes)

---

## 🎯 RESUMEN EJECUTIVO

### Qué es
Sistema web inteligente que permite a empleados de pequeñas empresas reportar incidentes de ciberseguridad de forma simple, y analiza automáticamente qué tan grave es cada reporte usando IA local (reglas + scoring), sin dependencias de APIs externas costosas.

### Por qué es importante
- **95% de PYMES ecuatorianas** carecen de sistemas especializados en ciberseguridad
- **Costo promedio de ciberataque:** $50,000 USD
- **IA puede reducir tiempos de detección en 40%**
- **Solución accesible:** $0 de inversión, tecnologías open-source

### Alcance (Fase 1 - Ahora)
✅ Portal web para reportar incidentes (simple, intuitivo)  
✅ Backend Django con API REST  
✅ IA local (clasificador basado en reglas)  
✅ Dashboard de gerencia  
✅ Almacenamiento en base de datos  
✅ Testing funcional  

### Futuro (Fase 2 - Después de defensa)
⏳ VirusTotal API (análisis de URLs/malware)  
⏳ Google Safe Browsing (verificación de dominios)  
⏳ Notificaciones por email  
⏳ Reportes en PDF  
⏳ Integración de datos históricos  

---

## 📊 ESTADO DEL PROYECTO

| Componente | Porcentaje | Estado | Detalles |
|-----------|-----------|--------|----------|
| **Frontend (React)** | 70% | EN PROGRESO | Componentes UI creados, formularios funcionales, falta integración final |
| **Backend (Django)** | 65% | EN PROGRESO | Modelos y endpoints básicos listos, falta refinamiento de vistas |
| **IA Local (Clasificador)** | 40% | PENDIENTE | Arquitectura definida, falta implementación de diccionarios y testing |
| **Base de Datos** | 50% | EN PROGRESO | Schema básico, falta migraciones finales |
| **Integración Frontend-Backend** | 30% | EN PROGRESO | Comunicación inicial funciona, falta casos de uso completos |
| **Testing** | 10% | PENDIENTE | Casos de prueba diseñados, falta ejecución |
| **Docker** | 0% | PENDIENTE | Archivos Dockerfile y docker-compose.yml aún no creados |
| **Documentación** | 50% | EN PROGRESO | Plan de trabajo en PUCESI aprobado, README pendiente |
| **GENERAL** | **43%** | **EN DESARROLLO** | **Entrega estimada en 4-8 semanas** |

---

## 🔍 PROBLEMA & OBJETIVOS

### Problema Científico
> En pequeñas empresas ecuatorianas se evidencia la **ausencia de sistemas especializados** para gestión de incidentes de ciberseguridad, provocando **vulnerabilidad ante amenazas** (ransomware, phishing, accesos no autorizados). Los registros manuales dispersos **impiden análisis histórico confiable**, incrementando riesgos operacionales y financieros. La carencia de herramientas con IA limita la **identificación de patrones de vulnerabilidad** y **respuesta oportuna**.

### Objetivo General
Diseñar e implementar una **aplicación web** para registrar y controlar incidentes de seguridad informática en pequeñas empresas, que permita:
- Centralizar información
- Analizar vulnerabilidades automáticamente
- Mejorar gestión digital de manera eficiente y confiable

### Objetivos Específicos
1. **Analizar:** Procesos actuales de gestión en PYMES ecuatorianas → identificar vulnerabilidades y oportunidades
2. **Diseñar e Implementar:** Arquitectura de software con módulos de registro, alertas y algoritmos IA
3. **Evaluar:** Efectividad y usabilidad mediante pruebas funcionales y retroalimentación de usuarios

---

## 🛠️ STACK TECNOLÓGICO CONFIRMADO

### Backend
```
Django 4.x (Framework Web Python)
├── djangorestframework (API REST)
├── django-cors-headers (CORS habilitado)
├── psycopg2-binary (PostgreSQL)
├── python-decouple (Variables entorno)
└── Python 3.9+
```

**Instalación:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

### Frontend
```
React 18.x (Framework UI)
├── axios (HTTP client)
├── react-router-dom (Navegación)
└── CSS Modules / Tailwind (Estilos)
```

**Instalación:**
```bash
cd frontend
npm install
echo "REACT_APP_API_URL=http://localhost:8000" > .env
npm start
```

### Base de Datos
- **Desarrollo:** SQLite3 (incluido en Django)
- **Producción:** PostgreSQL 13+ (en Docker)

### IA Local
```python
# Python puro, sin librerías externas pesadas
- Reglas + Keywords
- Scoring heurístico (0-1)
- Sin Machine Learning, solo lógica explicable
```

---

## ✅ AVANCES CONCRETOS REALIZADOS

### Frontend (70% - EN PROGRESO)
✅ Estructura React con componentes modulares  
✅ Componente `ReportForm.jsx` - Formulario de reporte  
✅ Componente `IncidentList.jsx` - Listado de incidentes  
✅ Componente `Dashboard.jsx` - Estadísticas en tiempo real  
✅ Servicio `api.js` - Llamadas HTTP preparadas  
✅ Estilos CSS básicos aplicados  
❌ Integración final con API backend  
❌ Validaciones avanzadas en formularios  

### Backend (65% - EN PROGRESO)
✅ Proyecto Django inicializado con estructura correcta  
✅ Modelo `Incident` con campos completos (email, tipo, descripción, severidad, estado)  
✅ Serializers para JSON  
✅ ViewSet básico para CRUD  
✅ Configuración CORS  
✅ Endpoint `/api/incidents/` funcional  
❌ Validaciones de entrada robustas  
❌ Manejo de errores completo  
❌ Paginación en listados  

### IA Local (40% - PENDIENTE)
✅ Arquitectura del clasificador diseñada  
✅ Lógica de severidad planificada (BAJO, MEDIO, ALTO, CRÍTICO)  
❌ Implementación del módulo `classifier.py`  
❌ Diccionarios de palabras clave por tipo  
❌ Integración con backend  
❌ Testing del clasificador  

### Base de Datos (50% - EN PROGRESO)
✅ Schema inicial creado  
✅ Modelo SQLAlchemy/Django definido  
❌ Migraciones finales  
❌ Índices para optimización  
❌ Populate con datos de prueba  

### Integración (30% - EN PROGRESO)
✅ Frontend puede hacer requests a backend (parcialmente)  
✅ Respuestas JSON correctas  
❌ Flujo completo: reporte → BD → respuesta  
❌ Manejo de errores  
❌ Validación en ambos lados  

### Testing (10% - PENDIENTE)
✅ Plan de testing diseñado  
❌ Unit tests backend (models, serializers)  
❌ Integration tests (API endpoints)  
❌ Frontend tests (React Testing Library)  
❌ E2E tests (Cypress o Selenium)  

### Docker (0% - PENDIENTE)
❌ Dockerfile.backend  
❌ Dockerfile.frontend  
❌ docker-compose.yml  

---

## 📁 ESTRUCTURA DEL REPOSITORIO GIT

```
tesis-asistente-ciberseguridad/
│
├── 📄 README.md                              # Documentación principal
├── 📄 TESTING_FASE1.md                       # Plan de testing
├── 📄 CONTEXTO_PROYECTO_ACTUALIZADO.md       # Este archivo (NUEVO)
│
├── 📂 backend/                               # Django (Python)
│   ├── manage.py
│   ├── requirements.txt                      # Dependencias Python
│   ├── db.sqlite3                           # BD desarrollo
│   │
│   ├── 📂 config/                           # Configuración Django
│   │   ├── settings.py
│   │   ├── urls.py
│   │   ├── asgi.py
│   │   └── wsgi.py
│   │
│   ├── 📂 api/                              # App principal
│   │   ├── models.py                        # ✅ HECHO
│   │   ├── views.py                         # ⚠️ EN PROGRESO
│   │   ├── serializers.py                   # ✅ HECHO
│   │   ├── urls.py                          # ✅ HECHO
│   │   ├── tests.py                         # ❌ PENDIENTE
│   │   └── migrations/
│   │
│   └── 📂 ia_classifier/                    # IA Local
│       ├── __init__.py
│       ├── classifier.py                    # ❌ PENDIENTE
│       ├── rules.py                         # ❌ PENDIENTE
│       └── tests.py                         # ❌ PENDIENTE
│
├── 📂 frontend/                              # React (JavaScript)
│   ├── package.json                          # ✅ HECHO
│   ├── package-lock.json
│   ├── .env                                  # ⚠️ CREAR CON URL API
│   │
│   ├── 📂 public/
│   │   └── index.html
│   │
│   └── 📂 src/
│       ├── index.jsx                         # ✅ HECHO
│       ├── App.jsx                           # ⚠️ EN PROGRESO
│       ├── App.css
│       │
│       ├── 📂 components/
│       │   ├── ReportForm.jsx                # ✅ 80% HECHO
│       │   ├── IncidentList.jsx              # ✅ 80% HECHO
│       │   ├── Dashboard.jsx                 # ✅ 70% HECHO
│       │   └── Navbar.jsx                    # ✅ HECHO
│       │
│       ├── 📂 services/
│       │   └── api.js                        # ✅ HECHO
│       │
│       └── 📂 styles/
│           └── main.css                      # ⚠️ EN PROGRESO
│
├── 📂 docker/                                 # Configuración Docker
│   ├── Dockerfile.backend                    # ❌ PENDIENTE
│   ├── Dockerfile.frontend                   # ❌ PENDIENTE
│   └── docker-compose.yml                    # ❌ PENDIENTE
│
└── 📂 docs/                                  # Documentación (OPCIONAL)
    ├── API_REFERENCE.md
    └── INSTALLATION.md
```

---

## 🚀 PLAN DE FINALIZACIÓN (4-8 semanas)

### Semana 1-2: Completar IA Local & Testing

**Prioridad ALTA:**

```python
# backend/ia_classifier/classifier.py
class IncidentClassifier:
    def __init__(self):
        self.rules = {
            'phishing': {
                'keywords': ['click', 'verificar', 'contraseña', 'urgente'],
                'min_severity': 'MEDIO'
            },
            'malware': {
                'keywords': ['virus', 'ransomware', 'executable', 'malware'],
                'min_severity': 'ALTO'
            },
            'acceso_sospechoso': {
                'keywords': ['ip desconocida', 'ubicación', 'acceso no autorizado'],
                'min_severity': 'MEDIO'
            }
        }
    
    def classify(self, description, incident_type):
        """Retorna (severity, confidence_score)"""
        desc_lower = description.lower()
        score = 0
        
        if incident_type in self.rules:
            keywords = self.rules[incident_type]['keywords']
            score = sum(1 for kw in keywords if kw in desc_lower)
        
        # Lógica de severidad
        if score >= 4:
            severity = 'CRÍTICO'
            confidence = 0.95
        elif score >= 3:
            severity = 'ALTO'
            confidence = 0.80
        elif score >= 1:
            severity = 'MEDIO'
            confidence = 0.60
        else:
            severity = 'BAJO'
            confidence = 0.30
        
        return severity, confidence
```

**Tareas:**
- [ ] Implementar `classifier.py` con reglas completas
- [ ] Crear `rules.py` con diccionarios por tipo
- [ ] Escribir tests unitarios para clasificador
- [ ] Verificar casos de prueba (phishing, malware, acceso)
- [ ] Integrar classifier en `views.py` POST endpoint

### Semana 2-3: Integración Completa

**Tareas:**
- [ ] Conectar frontend → backend (ReportForm → POST /api/incidents/)
- [ ] Recibir severidad desde IA en respuesta
- [ ] Mostrar severidad en IncidentList con colores
- [ ] Implementar filtrado por severidad en Dashboard
- [ ] Validación de datos en ambos lados

**Prueba manual:**
```bash
# Terminal 1: Backend
cd backend
python manage.py runserver

# Terminal 2: Frontend
cd frontend
npm start

# Terminal 3: Prueba manual
curl -X POST http://localhost:8000/api/incidents/ \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "incident_type": "phishing",
    "description": "Recibí email pidiendo click para verificar contraseña urgente"
  }'
```

### Semana 3: Testing Completo

**Tareas:**
- [ ] Unit tests backend (models, serializers, classifier)
- [ ] Integration tests API (CRUD endpoints)
- [ ] Frontend tests (componentes React)
- [ ] Ejecutar: `python manage.py test`
- [ ] Ejecutar: `npm test`

### Semana 4: Docker & Documentación

**Tareas:**
- [ ] Crear `Dockerfile.backend` (Python 3.9)
- [ ] Crear `Dockerfile.frontend` (Node.js)
- [ ] Crear `docker-compose.yml` con 3 servicios:
  - Backend (Django)
  - Frontend (React)
  - PostgreSQL
- [ ] Documentar en README.md
- [ ] Crear INSTALLATION.md

**docker-compose.yml básico:**
```yaml
version: '3.8'

services:
  backend:
    build:
      context: .
      dockerfile: docker/Dockerfile.backend
    ports:
      - "8000:8000"
    environment:
      - DEBUG=False
      - DATABASE_URL=postgresql://postgres:password@db:5432/cybersec
    depends_on:
      - db
    command: >
      sh -c "python manage.py migrate &&
             python manage.py runserver 0.0.0.0:8000"

  frontend:
    build:
      context: .
      dockerfile: docker/Dockerfile.frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:8000
    depends_on:
      - backend

  db:
    image: postgres:13-alpine
    environment:
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
      - POSTGRES_DB=cybersec
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

volumes:
  postgres_data:
```

---

## ✅ CHECKLIST DEFENSA

Antes de tu defensa, verifica TODOS estos puntos:

### Código Funcional
- [ ] Frontend corre sin errores: `npm start`
- [ ] Backend corre sin errores: `python manage.py runserver`
- [ ] Puedo reportar un incidente desde web
- [ ] Incidente aparece en lista
- [ ] IA clasifica con severidad correcta
- [ ] Dashboard muestra estadísticas

### Testing
- [ ] Unit tests pasan: `python manage.py test`
- [ ] Casos de prueba documentados
- [ ] Sin errores en console (Frontend y Backend)

### Docker (Importante para defensa)
- [ ] `docker-compose up` levanta todo sin errores
- [ ] Puedo acceder a http://localhost:3000
- [ ] Puedo acceder a http://localhost:8000/api/incidents/

### Documentación
- [ ] README.md completo
- [ ] INSTALLATION.md con pasos claros
- [ ] API_REFERENCE.md con endpoints
- [ ] Código comentado (funciones principales)

### Git
- [ ] Commits limpios y descriptivos
- [ ] README actualizado
- [ ] Sin archivos basura (.env, __pycache__, node_modules)
- [ ] .gitignore correcto

### Presentación (10 minutos)
- [ ] Ensayado: Qué es, problema, solución, demo
- [ ] Demo en vivo mostrando:
  1. Reporte desde web
  2. IA clasificando
  3. Dashboard con resultados
  4. Docker corriendo
- [ ] Respuestas a preguntas comunes (abajo)

---

## 🐳 DOCKER & DEPLOYMENT

### Para desarrollo (Windows con Git Bash)

```bash
# 1. Crear archivos Dockerfile
# docker/Dockerfile.backend
FROM python:3.9-slim
WORKDIR /app/backend
COPY backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY backend/ .
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# docker/Dockerfile.frontend
FROM node:18-alpine
WORKDIR /app/frontend
COPY frontend/package*.json .
RUN npm install
COPY frontend/ .
EXPOSE 3000
CMD ["npm", "start"]

# 2. Crear docker-compose.yml (ver arriba)

# 3. Construir imágenes
docker-compose build

# 4. Levantar servicios
docker-compose up -d

# 5. Ejecutar migraciones
docker-compose exec backend python manage.py migrate

# 6. Acceso
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# PostgreSQL: localhost:5432

# 7. Ver logs
docker-compose logs -f backend
docker-compose logs -f frontend

# 8. Detener
docker-compose down
```

### Para producción (Railway, Heroku, AWS)
- Railway: Gratis con student account
- Heroku: Pago ($7-14/mes)
- AWS: Gratis 12 meses (estudiantes)

Más detalles en DEPLOYMENT.md (crear después)

---

## ❓ PREGUNTAS FRECUENTES

### P: ¿Necesito usar Docker para la defensa?
**R:** NO obligatorio, pero **MUY RECOMENDADO**. Demuestra que entiendes DevOps. Para defensa, tener todo en Docker = impacto profesional ++++

### P: ¿Por qué no usas VirusTotal ahora?
**R:** Fase 1 enfocado en **demostrar que la IA funciona** con reglas locales. APIs externas son Fase 2 después de defensa. Esto demuestra viabilidad académica.

### P: ¿Cómo explico la IA en defensa?
**R:**
> "No es Machine Learning. Es un clasificador **basado en reglas**. Tiene diccionarios de palabras clave para cada tipo de amenaza. Si encuentra 4+ coincidencias = CRÍTICO. 3 = ALTO. 1-2 = MEDIO. 0 = BAJO. Es explicable porque el jurado entiende cada regla."

### P: ¿Cómo dejo la DB lista?
**R:**
```bash
# Opción 1: SQLite (para defensa local)
python manage.py migrate
# Crea db.sqlite3 automáticamente

# Opción 2: PostgreSQL (con Docker)
docker-compose up -d db
docker-compose exec db psql -U postgres -d cybersec < schema.sql
```

### P: ¿Necesito autenticación de usuarios?
**R:** **NO para Fase 1**. Agrégalo en Fase 2. Ahora enfócate en flujo core: reporte → IA → BD.

### P: ¿Cómo valido que todo funciona?
**R:** Checklist arriba. Además:
```bash
# Backend
curl http://localhost:8000/api/incidents/
# Debe retornar: [] (lista vacía)

# Frontend
Navega a http://localhost:3000
Llena formulario y envía
Verifica que aparezca en lista
Verifica que severidad sea correcta
```

### P: ¿Windows vs Mac/Linux?
**R:** Mismo código, mismo proceso. En Windows USA **Git Bash** o **PowerShell** (no CMD). Si tienes problemas, comparte:
```bash
python --version
npm --version
docker --version
git --version
```

### P: ¿Tiempo estimado a defensa?
**R:** Con **dedicación diaria 2-3 horas**: 4-6 semanas. Si avanzas más rápido, integra APIs externas (Fase 2).

---

## 📞 APOYO & CONTACTO

**Tu repositorio:**  
[github.com/ryan-alej19/tesis-asistente-ciberseguridad](https://github.com/ryan-alej19/tesis-asistente-ciberseguridad)

**Tutor:** Requiere actualización  
**Email:** ryangallegosmera1@gmail.com  
**Teléfono:** 0992559394

---

## 🎯 RESUMEN FINAL

| Aspecto | Estado | Próximo Paso |
|---------|--------|-------------|
| **Idea** | ✅ APROBADA | - |
| **Código Frontend** | ⚠️ 70% | Terminar integración |
| **Código Backend** | ⚠️ 65% | Implementar IA, Testing |
| **IA Local** | ❌ 40% | PRIORITARIO esta semana |
| **Testing** | ❌ 10% | Después IA |
| **Docker** | ❌ 0% | Última semana |
| **Documentación** | ⚠️ 50% | Paralelo a desarrollo |
| **Defensa** | ⏳ 4-8 semanas | PREPARARSE AHORA |

**Tu próximo paso esta semana:**  
👉 **Implementar `classifier.py` completamente y testear con 10 ejemplos reales**

---

**Documento creado:** 26 de Diciembre, 2025  
**Última revisión:** 26/12/2025 - 4:13 PM (Quito, Ecuador)  
**Próxima revisión:** A completar Fase IA (máximo 1 semana)

---

*Este es tu documento de referencia. Comparte con tu tutor. Actualízalo conforme avances.*
