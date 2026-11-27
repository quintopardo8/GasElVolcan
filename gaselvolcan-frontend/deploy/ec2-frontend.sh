#!/usr/bin/env bash
# =============================================================================
# Despliegue del FRONTEND en una EC2 Ubuntu 24.04 (React compilado + nginx en el puerto 80).
#
# Uso (dentro de la EC2, por SSH):
#   curl -fsSL https://raw.githubusercontent.com/quintopardo8/GasElVolcan/main/gaselvolcan-frontend/deploy/ec2-frontend.sh -o ec2-frontend.sh
#   bash ec2-frontend.sh https://github.com/quintopardo8/GasElVolcan.git <IP-PRIVADA-BACKEND>
#
# Se puede ejecutar de nuevo para actualizar: hace git pull y reconstruye.
# =============================================================================
set -euo pipefail

REPO_URL="${1:-${REPO_URL:-}}"
BACKEND_IP="${2:-${BACKEND_IP:-}}"
DIR=/opt/gaselvolcan                 # repositorio completo (frontend + backend)
APP="$DIR/gaselvolcan-frontend"     # carpeta del frontend dentro del repositorio

if [[ -z "$REPO_URL" || -z "$BACKEND_IP" ]]; then
  echo "Uso: bash ec2-frontend.sh <url-repo> <ip-privada-del-backend>" >&2
  exit 1
fi

echo "==> 1/5 Instalando Docker y git"
sudo apt-get update -y
sudo apt-get install -y docker.io docker-compose-v2 git
sudo systemctl enable --now docker
sudo usermod -aG docker "${SUDO_USER:-$USER}" || true

echo "==> 2/5 Memoria swap de 1 GB (npm ci en instancias de 1 GB de RAM)"
if ! swapon --show | grep -q /swapfile; then
  sudo fallocate -l 1G /swapfile
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

echo "==> 4/5 Configurando la dirección del backend ($BACKEND_IP)"
sudo tee "$APP/.env" >/dev/null <<ENV
USUARIOS_API=http://${BACKEND_IP}:8081
PEDIDOS_API=http://${BACKEND_IP}:8082
FRONTEND_PORT=80
ENV

echo "==> 5/5 Construyendo y levantando nginx"
cd "$APP"
sudo docker compose up -d --build
sudo docker compose ps

echo "Comprobando que el backend responde a través de nginx..."
sleep 3
if curl -fsS http://localhost/api/productos >/dev/null; then
  echo "  OK: /api/productos responde."
else
  echo "  AVISO: /api/productos no responde todavía. Revisa que el backend esté arriba y que su"
  echo "  security group permita 8081/8082 desde este frontend."
fi

IP=$(curl -s --max-time 3 http://checkip.amazonaws.com || echo "<IP-PUBLICA>")
echo
echo "Listo: tienda en http://${IP}"
