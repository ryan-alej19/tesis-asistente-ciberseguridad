# Dockerfile Frontend - Tesis Ciberseguridad
# Finalidad: Demostración Académica y Reproducibilidad

# ETAPA 1: Construcción
FROM node:18-alpine as build

WORKDIR /app

# Instalar dependencias
COPY package.json package-lock.json ./
RUN npm ci --silent

# Copiar código y construir
COPY . .
RUN npm run build

# ETAPA 2: Servidor Web (Nginx)
FROM nginx:alpine

# Copiar build de React a directorio de Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Configuración básica de Nginx para React Router
RUN echo 'server { \
    listen 80; \
    location / { \
    root /usr/share/nginx/html; \
    index index.html index.htm; \
    try_files $uri $uri/ /index.html; \
    } \
    }' > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
