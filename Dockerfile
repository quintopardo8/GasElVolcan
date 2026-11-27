# ---------- Etapa 1: compilar el frontend (React + Vite) ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Etapa 2: servir con nginx ----------
# nginx entrega la SPA y reenvía /api/... a cada microservicio (mismo origen para el navegador: sin CORS).
FROM nginx:1.27-alpine
# Valores por defecto; se cambian con variables de entorno (docker-compose.yml / .env).
ENV USUARIOS_API=http://host.docker.internal:8081 \
    PEDIDOS_API=http://host.docker.internal:8082
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
