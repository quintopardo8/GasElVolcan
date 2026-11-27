# Gas El Volcán

Sistema web de la Distribuidora de Gas El Volcán: tienda en línea para pedir cilindros de gas y panel de administración, con una API REST en microservicios.

| Carpeta | Contenido | Tecnología |
| --- | --- | --- |
| [`gaselvolcan-frontend`](gaselvolcan-frontend) | Tienda, checkout, seguimiento con mapa y panel de administración | React 19, Vite, React Router, Bootstrap, Leaflet, nginx |
| [`gaselvolcan-backend`](gaselvolcan-backend) | `usuarios-service` (login, JWT, usuarios y roles) y `pedidos-service` (catálogo, stock, pedidos, reportes) | Spring Boot 3.5, Java 21, Spring Security, JPA, PostgreSQL 17, Swagger |

## Levantar todo con Docker (desde esta carpeta)

Requisito: Docker Desktop.

```bash
cp .env.example .env          # opcional: contraseñas y secreto JWT
docker compose up -d --build  # construye las 3 imágenes y levanta los 4 contenedores
```

| Servicio | URL |
| --- | --- |
| Tienda y panel de administración | http://localhost:8080 |
| Swagger usuarios-service | http://localhost:8081/swagger-ui.html |
| Swagger pedidos-service | http://localhost:8082/swagger-ui.html |
| PostgreSQL | 127.0.0.1:5433 (usuario `volcan`) |

La primera vez tarda varios minutos (Maven y npm descargan dependencias). Comandos útiles: `docker compose ps`, `docker compose logs -f`, `docker compose down` (con `-v` también borra la base de datos).

### Usuarios de prueba

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Administrador | admin@elvolcan.cl | Admin1234 |
| Operadora | operadora@elvolcan.cl | Operadora123 |
| Repartidor | repartidor1@elvolcan.cl | Repartidor123 |
| Cliente | cliente@correo.cl | Cliente123 |

## Despliegue en AWS

Dos EC2 (Ubuntu 24.04): una para el frontend y otra para el backend con PostgreSQL. Cada carpeta trae su script en `deploy/`, que clona este repositorio y levanta solo su parte. Detalles en el README de cada carpeta.

## Ramas

- `main`: versión entregada y desplegada.
- `develop`: integración del equipo.
- `feature/*`: cambios puntuales; se fusionan a `develop` con Pull Request.
