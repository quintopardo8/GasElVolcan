#!/usr/bin/env bash
# =============================================================================
# Despliegue del BACKEND en una EC2 Ubuntu 24.04 (PostgreSQL + 2 microservicios).
#
# Uso (dentro de la EC2, por SSH):
#   curl -fsSL https://raw.githubusercontent.com/quintopardo8/GasElVolcan/main/gaselvolcan-backend/deploy/ec2-backend.sh -o ec2-backend.sh
#   bash ec2-backend.sh https://github.com/quintopardo8/GasElVolcan.git http://<IP-PUBLICA-FRONTEND>
#
# También sirve como "User data" al lanzar la instancia (agrega las dos variables arriba).
# Se puede ejecutar de nuevo para actualizar: hace git pull y reconstruye.
# =============================================================================
set -euo pipefail

REPO_URL="${1:-${REPO_URL:-}}"
FRONTEND_URL="${2:-${FRONTEND_URL:-}}"
DIR=/opt/gaselvolcan                 # repositorio completo (frontend + backend)
APP="$DIR/gaselvolcan-backend"      # carpeta del backend dentro del repositorio

if [[ -z "$REPO_URL" ]]; then
  echo "Falta la URL del repositorio. Uso: bash ec2-backend.sh <url-repo> <url-frontend>" >&2
  exit 1
fi

echo "==> 1/5 Instalando Docker y git"
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2 git openssl
sudo systemctl enable --now docker
sudo usermod -aG docker "${SUDO_USER:-$USER}" || true

echo "==> 2/5 Memoria swap de 2 GB (Maven y las JVM no caben en 1 GB de RAM)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 2G /swapfile
  sudo chmod 600 /swapfile
  sudo mkswap /swapfile
  sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
fi

echo "==> 3/5 Descargando el código"
if [[ -d "$DIR/.git" ]]; then
  sudo git -C "$DIR" pull --ff-only
else
  sudo git clone "$REPO_URL" "$DIR"
fi

echo "==> 4/5 Creando .env con secretos aleatorios (solo la primera vez)"
if [[ ! -f "$APP/.env" ]]; then
  sudo cp "$APP/.env.example" "$APP/.env"
  sudo sed -i "s|^DB_PASSWORD=.*|DB_PASSWORD=$(openssl rand -hex 16)|" "$APP/.env"
  sudo sed -i "s|^JWT_SECRET=.*|JWT_SECRET=$(openssl rand -base64 48 | tr -d '\n')|" "$APP/.env"
  if [[ -n "$FRONTEND_URL" ]]; then
    sudo sed -i "s|^CORS_ORIGENES=.*|CORS_ORIGENES=${FRONTEND_URL}|" "$APP/.env"
  fi
  echo "    .env creado en $APP/.env (revisa ADMIN_CONTRASENA antes de la presentación)"
fi

echo "==> 5/5 Construyendo y levantando los contenedores (la primera vez tarda ~10 min)"
cd "$APP"
sudo docker compose up -d --build
sudo docker compose ps

IP=$(curl -s --max-time 3 http://checkip.amazonaws.com || echo "<IP-PUBLICA>")
echo
echo "Listo. En 1-2 minutos estarán arriba:"
echo "  Swagger usuarios: http://${IP}:8081/swagger-ui.html"
echo "  Swagger pedidos:  http://${IP}:8082/swagger-ui.html"
echo "Logs: sudo docker compose -f $APP/docker-compose.yml logs -f"
