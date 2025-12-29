# 🚪 GUÍA RÁPIDA WINDOWS + GIT + VS CODE

**Para:** Ryan Gallegos Mera  
**Sistema Operativo:** Windows 10/11  
**Herramientas:** Git Bash, VS Code, Python, Node.js  
**Fecha:** 26 de Diciembre, 2025

---

## 🚀 INICIO RÁPIDO (5 MINUTOS)

### Paso 1: Clonar tu repositorio (primera vez)

```bash
# Abrir Git Bash en carpeta deseada
# (Click derecho en carpeta > Git Bash Here)

git clone https://github.com/ryan-alej19/tesis-asistente-ciberseguridad.git
cd tesis-asistente-ciberseguridad
```

### Paso 2: Verificar versiones instaladas

```bash
python --version        # Debe ser 3.8+
npm --version           # Debe ser 6.0+
git --version           # Debe funcionar
```

### Paso 3: Crear ambiente virtual Python

```bash
# En carpeta backend/
cd backend

# Crear venv
python -m venv venv

# Activar (Windows en Git Bash)
source venv/Scripts/activate

# Deberías ver: (venv) $ al inicio de línea
```

### Paso 4: Instalar dependencias backend

```bash
# Asegúrate de tener activado el venv
pip install -r requirements.txt

# Esto instala:
# - Django 4.x
# - djangorestframework
# - django-cors-headers
# - psycopg2-binary
# - python-decouple
```

### Paso 5: Correr migraciones

```bash
python manage.py migrate

# Deberías ver: "Operations to perform... OK"
# Esto crea db.sqlite3
```

### Paso 6: Correr servidor Django

```bash
python manage.py runserver

# Deberías ver:
# Starting development server at http://127.0.0.1:8000/
```

### Paso 7: Instalar frontend en otra terminal

```bash
# NUEVA TERMINAL (Git Bash)
cd frontend

# Instalar dependencias
npm install

# Crear .env
echo "REACT_APP_API_URL=http://localhost:8000" > .env

# Correr React
npm start

# Deberías ver: Compiled successfully!
# Se abre http://localhost:3000 en navegador
```

### ✅ ¡LISTO!

- Frontend: http://localhost:3000
- Backend: http://localhost:8000
- API: http://localhost:8000/api/incidents/

---

## 📚 FLUJO DIARIO DE TRABAJO

### Mañana - Abrir proyecto

```bash
# Terminal 1 - Backend
cd ruta/al/proyecto/backend
source venv/Scripts/activate  # Activar venv
python manage.py runserver

# Terminal 2 - Frontend
cd ruta/al/proyecto/frontend
npm start

# Terminal 3 - Git (opcional, para commits)
cd ruta/al/proyecto
```

### Durante el día - Guardar cambios

```bash
# Ver cambios
git status

# Agregar cambios
git add .

# Hacer commit
git commit -m "feat: Implementar clasificador IA"

# Enviar a GitHub
git push origin main
```

### Noche - Pausar

```bash
# Cerrar servidores
# Terminal backend: Ctrl+C
# Terminal frontend: Ctrl+C

# Desactivar venv
deactivate
```

---

## 🛠️ SETUP INICIAL COMPLETO (Primera vez)

### 1. Instalar herramientas (si falta algo)

**Python 3.9+:**
- Descarga: https://www.python.org/downloads/
- Durante instalación: ✅ "Add Python to PATH"

**Node.js 16+:**
- Descarga: https://nodejs.org/
- LTS version recomendado

**Git:**
- Descarga: https://git-scm.com/
- Usa configuración por defecto

**VS Code (opcional pero recomendado):**
- Descarga: https://code.visualstudio.com/
- Extensiones útiles:
  - Python (Microsoft)
  - ES7+ React/Redux/React-Native snippets
  - REST Client (para probar API)

### 2. Clonar repositorio

```bash
git clone https://github.com/ryan-alej19/tesis-asistente-ciberseguridad.git
cd tesis-asistente-cibersegurid
```

### 3. Setup Backend

```bash
cd backend

# Crear venv
python -m venv venv

# Activar
source venv/Scripts/activate

# Instalar dependencias
pip install -r requirements.txt

# Crear .env (opcional)
echo "DEBUG=True" > .env
echo "SECRET_KEY=dev-key-solo-para-desarrollo" >> .env

# Migraciones
python manage.py migrate

# Crear superuser (opcional)
python manage.py createsuperuser
# Username: admin
# Email: admin@example.com
# Password: admin123
```

### 4. Setup Frontend

```bash
cd ../frontend

# Instalar
npm install

# Crear .env
echo "REACT_APP_API_URL=http://localhost:8000" > .env
```

### 5. Verificar

```bash
# Terminal 1
cd backend
source venv/Scripts/activate
python manage.py runserver

# Terminal 2
cd frontend
npm start

# Terminal 3 - Probar
curl http://localhost:8000/api/incidents/
# Debe retornar: {"results":[]} o lista vacía
```

---

## 🐛 SOLUCIONAR PROBLEMAS COMUNES

### Problema: "python: command not found"

**Solución:**
```bash
# Verifica que Python está en PATH
python --version

# Si no funciona, descarga de nuevo:
# https://www.python.org/downloads/
# ✅ Marca "Add Python to PATH"

# O usa:
python3 --version
python3 -m venv venv
```

### Problema: "npm: command not found"

**Solución:**
```bash
# Descarga Node.js: https://nodejs.org/
# En Windows ejecuta el .msi
# Reinicia Git Bash después

npm --version
```

### Problema: "venv not activated"

**Solución:**
```bash
# En Windows Git Bash:
source venv/Scripts/activate

# Debes ver: (venv) $ en el prompt

# Si no funciona, intenta:
. venv/Scripts/activate

# O en PowerShell:
venv\Scripts\Activate.ps1
```

### Problema: "ModuleNotFoundError: No module named 'django'"

**Solución:**
```bash
# Asegúrate que venv está activado
source venv/Scripts/activate

# Reinstala dependencias
pip install -r requirements.txt

# Verifica
python -c "import django; print(django.__version__)"
```

### Problema: "Port 8000 already in use"

**Solución:**
```bash
# Encuentra proceso usando puerto
netstat -ano | findstr :8000

# O corre en puerto diferente:
python manage.py runserver 8001

# Después actualiza .env de frontend:
# REACT_APP_API_URL=http://localhost:8001
```

### Problema: "Port 3000 already in use"

**Solución:**
```bash
# Corre en puerto diferente
npm start -- --port 3001
```

### Problema: CORS error en Frontend

**Solución:**
```bash
# En backend/config/settings.py, verifica:
INSTALLED_APPS = [
    ...
    'corsheaders',  # ✅ Debe estar
    'rest_framework',
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',  # ✅ Debe estar primero
    ...
]

CORS_ALLOWED_ORIGINS = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
]
```

### Problema: "No such table: api_incident"

**Solución:**
```bash
# Correr migraciones
python manage.py migrate

# Crear tabla manualmente (si falla):
python manage.py makemigrations api
python manage.py migrate
```

---

## 📝 COMANDO ÚTILES DIARIOS

### Git

```bash
# Ver estado
git status

# Ver cambios
git diff

# Agregar todos los cambios
git add .

# Commit
git commit -m "feat: descripción del cambio"

# Enviar a GitHub
git push origin main

# Traer cambios del servidor
git pull origin main

# Ver historial
git log --oneline

# Crear rama nueva
git checkout -b feature/nueva-feature

# Cambiar rama
git checkout main

# Ver ramas
git branch -a
```

### Django

```bash
# Activar venv
source venv/Scripts/activate

# Crear migraciones
python manage.py makemigrations

# Aplicar migraciones
python manage.py migrate

# Crear usuario admin
python manage.py createsuperuser

# Acceder a admin: http://localhost:8000/admin/

# Shell interactivo
python manage.py shell

# Tests
python manage.py test

# Servidor
python manage.py runserver

# Recopilar archivos estáticos
python manage.py collectstatic
```

### npm (React)

```bash
# Instalar dependencias
npm install

# Instalar paquete nuevo
npm install nombre-paquete

# Desinstalar
npm uninstall nombre-paquete

# Actualizar
npm update

# Iniciar dev
npm start

# Build para producción
npm run build

# Tests
npm test

# Linting (si existe)
npm run lint
```

---

## 📃 ESTRUCTURA CARPETAS EXPLICADA

```
tesis-asistente-ciberseguridad/
├── backend/                 # Django (Python)
│   ├── venv/               # Ambiente virtual (NO HACER PUSH)
│   ├── config/             # Configuración Django
│   ├── api/                # App principal
│   ├── ia_classifier/      # Módulo IA
│   ├── manage.py           # Comando principal
│   ├── requirements.txt     # Dependencias Python
│   └── db.sqlite3          # Base de datos (NO HACER PUSH)
│
├── frontend/                # React (JavaScript)
│   ├── node_modules/       # Dependencias Node (NO HACER PUSH)
│   ├── public/             # Archivos estáticos
│   ├── src/                # Código fuente
│   ├── .env                # Variables entorno (NO HACER PUSH)
│   ├── package.json        # Dependencias
│   └── package-lock.json   # Lock file
│
├── docker/                  # Configuración Docker
│   ├── Dockerfile.backend
│   ├── Dockerfile.frontend
│   └── docker-compose.yml
│
├── .gitignore              # Archivos a ignorar
├── README.md               # Documentación
└── CONTEXTO_PROYECTO_ACTUALIZADO.md
```

---

## 🔐 ARCHIVOS A IGNORAR (NO HACER PUSH)

**Tu .gitignore ya debe tener:**

```
# Python
__pycache__/
*.py[cod]
*$py.class
venv/
env/
*.egg-info/
dist/
build/

# Django
*.sqlite3
*.db
.env

# Node
node_modules/
npm-debug.log
yarn-error.log

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
.DS_Store
Thumbs.db
```

**Verificar:**
```bash
git status
# NO deben aparecer:
# - venv/
# - node_modules/
# - __pycache__/
# - *.sqlite3
# - .env
```

---

## 📄 TIPS FINALES

### Commit Messages bien hechos

```bash
# ✅ BUENO
git commit -m "feat: Implementar clasificador IA básico"
git commit -m "fix: Corregir CORS error en frontend"
git commit -m "docs: Agregar instrucciones Docker"
git commit -m "test: Escribir tests para classifier.py"

# ❌ MALO
git commit -m "cambios"
git commit -m "update"
git commit -m "asd"
```

### Mantener código limpio

```python
# ✅ BUENO - Comentarios útiles
def classify(self, description):
    """Clasifica incidente por severidad
    
    Args:
        description (str): Descripción del incidente
    
    Returns:
        tuple: (severity, confidence_score)
    """

# ❌ MALO - Sin comentarios
def classify(self,desc):
    x = 0
    # ... código sin explicar
```

### Probar antes de hacer push

```bash
# 1. Asegúrate que todo corre
# Backend: python manage.py runserver
# Frontend: npm start

# 2. Prueba manualmente en navegador
# http://localhost:3000 - ¿Aparece?
# Llena formulario - ¿Envía sin errores?
# Mira http://localhost:8000/api/incidents/ - ¿Aparece el reporte?

# 3. Recién entonces haz push
git add .
git commit -m "feat: [descripción]"
git push origin main
```

---

## ✅ CHECKLIST DIARIO

- [ ] Venv activado: `(venv) $` en prompt
- [ ] Backend corriendo: http://localhost:8000 sin errores
- [ ] Frontend corriendo: http://localhost:3000 sin errores
- [ ] Cambios guardados en Git cada 30 minutos
- [ ] Commits descriptivos
- [ ] Sin archivos basura en cambios pendientes

---

## 📞 AYUDA RÁPIDA

**Si todo se quiebra:**

```bash
# 1. Pausar servidores (Ctrl+C en cada terminal)

# 2. Ir a carpeta del proyecto
cd ruta/al/proyecto

# 3. Limpiar
rm -rf backend/venv
rm -rf frontend/node_modules
rm -f backend/db.sqlite3
rm -f frontend/.env

# 4. Reinstalar (ver paso 3-4 arriba)

# 5. Reiniciar
python manage.py migrate
python manage.py runserver  # Terminal 1
npm start                    # Terminal 2
```

---

**Guardado:** 26 de Diciembre, 2025  
**Última actualización:** Hoy  
**Próximo paso:** Implementar classifier.py

¡Éxito con tu tesis! 🚀
