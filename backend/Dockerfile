# Dockerfile Backend - Tesis Ciberseguridad
# Finalidad: Demostración Académica y Reproducibilidad

# 1. Imagen base oficial de Python (ligera)
FROM python:3.11-slim

# 2. Variables de entorno para optimizar Python en Docker
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Directorio de trabajo
WORKDIR /app

# 4. Instalar dependencias del sistema (si se requieren para compilar)
RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# 5. Instalar dependencias de Python
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 6. Copiar el código fuente
COPY . .

# 7. Exponer puerto (Documentación: puerto 8000)
EXPOSE 8000

# 8. Comando de inicio (Migrar y Correr)
# Nota: En producción real se usaría gunicorn, para demo académica runserver es aceptado
CMD ["sh", "-c", "python manage.py migrate && python manage.py runserver 0.0.0.0:8000"]
