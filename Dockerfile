# ---------- Etapa 1: compilar el frontend (React + Vite) ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---------- Etapa 2: servir con nginx ----------
# nginx entrega la SPA y reenvía /api/... a cada microservicio (mismo origen: sin problemas de CORS).
FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
