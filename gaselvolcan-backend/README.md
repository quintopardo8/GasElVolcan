# Gas El Volcán · Backend

API REST de la Distribuidora de Gas El Volcán: dos microservicios **Spring Boot 3.5 (Java 21)** con **PostgreSQL 17**, autenticación **JWT con roles**, documentación **Swagger/OpenAPI** y todo levantado con **Docker Compose**.

Frontend (React): carpeta [`../gaselvolcan-frontend`](../gaselvolcan-frontend). Para levantar todo junto, usa el `docker-compose.yml` de la raíz del repositorio.

| Servicio | Puerto | Base de datos | Responsabilidad |
|---|---|---|---|
| `usuarios-service` | 8081 | `gas_usuarios` | Login, registro, usuarios y roles (**emite** el JWT) |
| `pedidos-service` | 8082 | `gas_pedidos` | Categorías, productos/stock, pedidos y reportes (**valida** el JWT) |
| `postgres` | 5433 (solo 127.0.0.1) | — | Un servidor PostgreSQL con una base por microservicio |

## Levantar en local

Requisito: Docker Desktop.

```bash
cp .env.example .env        # opcional: cambia contraseñas y el secreto JWT
docker compose up -d --build
```

- Swagger usuarios: http://localhost:8081/swagger-ui.html
- Swagger pedidos: http://localhost:8082/swagger-ui.html
- Borrar la base y empezar de cero: `docker compose down -v`
- Revisar las tablas: `docker compose exec postgres psql -U volcan -d gas_pedidos`

### Usuarios de prueba (se crean solos la primera vez)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@elvolcan.cl | Admin1234 |
| Operadora | operadora@elvolcan.cl | Operadora123 |
| Repartidor | repartidor1@elvolcan.cl (también 2 y 3) | Repartidor123 |
| Cliente | cliente@correo.cl | Cliente123 |

Para no crearlos, pon `DATOS_DEMO=false` en `.env`. El catálogo inicial son los 14 productos del Excel del curso.

## Swagger: probar un endpoint protegido

1. Abre `http://<host>:8081/swagger-ui.html` → **Autenticación** → `POST /api/auth/login` → *Try it out* con `{"correo":"admin@elvolcan.cl","contrasena":"Admin1234"}` → copia el `token` de la respuesta.
2. Abre `http://<host>:8082/swagger-ui.html` → botón **Authorize** → pega el token (sin la palabra *Bearer*).
3. Ejecuta, por ejemplo, `GET /api/reportes/resumen` → **200**. Sin token → **401**. Con el token de `cliente@correo.cl` → **403**.

## Seguridad

- **JWT HS256** firmado por usuarios-service con `JWT_SECRET` (≥ 32 caracteres); pedidos-service lo valida con el mismo secreto, sin llamar al otro servicio. Claims: `sub` (id), `correo`, `nombre`, `rol`, `iat`, `exp` (`JWT_MINUTOS`, por defecto 480).
- **Roles**: `ADMINISTRADOR`, `OPERADORA`, `REPARTIDOR`, `CLIENTE`, aplicados con `@PreAuthorize` en cada endpoint.
- **401** (sin token, token inválido, alterado o vencido) y **403** (rol insuficiente) siempre responden JSON.
- **Sin sesión en el servidor** (`STATELESS`), CSRF desactivado (no hay cookies), contraseñas con **BCrypt**.
- **CORS**: orígenes permitidos en `CORS_ORIGENES`; métodos GET, POST, PUT, PATCH, DELETE, OPTIONS; cabeceras `Authorization` y `Content-Type`.
- PostgreSQL publicado solo en `127.0.0.1`: no es accesible desde internet.

## Roles y permisos

| Acción | Admin | Operadora | Repartidor | Cliente |
|---|:-:|:-:|:-:|:-:|
| CRUD de usuarios y asignar roles | ✅ | | | |
| CRUD de productos, categorías y stock | ✅ | | | |
| Ver catálogo | ✅ | ✅ | ✅ | ✅ |
| Ver todos los pedidos y el resumen | ✅ | ✅ | | |
| Crear pedido | ✅ | ✅ (por teléfono) | | ✅ (el suyo) |
| Editar, asignar repartidor, cambiar estado | ✅ | ✅ | | |
| Marcar "en camino" / "entregado" | ✅ | ✅ | ✅ (solo los suyos) | |
| Cancelar | ✅ | ✅ | | ✅ (si está pendiente) |
| Eliminar pedido | ✅ | | | |

Ciclo del pedido: `PENDIENTE → ASIGNADO → EN_CAMINO → ENTREGADO` (o `CANCELADO`).
Al **entregar** se registra el pago (`pagado = true`); al **cancelar** o **eliminar** un pedido no entregado, el stock vuelve a bodega.

## Endpoints

Todas las rutas exigen `Authorization: Bearer <token>`, salvo login, registro y la lectura del catálogo (GET de productos y categorías). Los errores siempre vienen en JSON:
`{ "estado": 409, "error": "Conflict", "mensaje": "...", "ruta": "...", "campos": { ... } }`.

**usuarios-service**

| Método | Ruta | Rol |
|---|---|---|
| POST | `/api/auth/login` · `/api/auth/registro` | público |
| GET | `/api/auth/yo` | cualquiera |
| GET | `/api/usuarios?rol=&buscar=` | admin |
| GET | `/api/usuarios/repartidores` | admin, operadora |
| GET · PUT · DELETE | `/api/usuarios/{id}` | admin |
| POST | `/api/usuarios` | admin |
| PATCH | `/api/usuarios/{id}/activo` · `/api/usuarios/{id}/rol` | admin |

**pedidos-service**

| Método | Ruta | Rol |
|---|---|---|
| GET | `/api/categorias` · `/api/productos[?todos=true]` · `/api/productos/{codigo}` | público (`?todos=true` solo personal) |
| POST · PUT · DELETE | `/api/categorias[/{id}]` · `/api/productos[/{codigo}]` | admin |
| PATCH | `/api/productos/{codigo}/stock` | admin |
| GET | `/api/pedidos?estado=&fecha=AAAA-MM-DD&repartidorId=` | admin, operadora |
| GET | `/api/pedidos/mios` | cliente, repartidor |
| GET | `/api/pedidos/{id}` | según dueño/rol |
| POST | `/api/pedidos` | cliente, admin, operadora |
| PUT | `/api/pedidos/{id}` · PATCH `/api/pedidos/{id}/asignar` | admin, operadora |
| PATCH | `/api/pedidos/{id}/estado` | según reglas de arriba |
| DELETE | `/api/pedidos/{id}` | admin |
| GET | `/api/reportes/resumen` | admin, operadora |

Ejemplo rápido (PowerShell o bash):

```bash
curl -X POST http://localhost:8081/api/auth/login -H "Content-Type: application/json" \
  -d '{"correo":"admin@elvolcan.cl","contrasena":"Admin1234"}'
```

## Modelo de datos (3FN)

- `gas_usuarios.usuarios` (id, nombre, correo único, teléfono, contrasena_hash BCrypt, rol, activo, creado_en)
- `gas_pedidos.categorias` (id, nombre único)
- `gas_pedidos.productos` (codigo PK, categoria_id FK, nombre, descripción, unidad, kg, precio, precio_comercial, stock, activo, version)
- `gas_pedidos.pedidos` (id, cliente_id, datos de contacto/entrega, metodo_pago, estado, repartidor_id, total, pagado, fechas)
- `gas_pedidos.lineas_pedido` (id, pedido_id FK, producto_codigo FK, cantidad, precio_unitario)

`cliente_id` y `repartidor_id` apuntan a usuarios del otro microservicio (cada uno tiene su propia base, por eso no hay FK entre bases). El nombre del repartidor y el precio unitario se guardan en el pedido como foto del momento.
Las tablas las crea Hibernate al arrancar (`ddl-auto=update`).

## Despliegue en AWS (EC2)

Arquitectura: **EC2 frontend** (nginx + React) → **EC2 backend** (este repo: PostgreSQL + 2 microservicios). Guía completa en el *Documento de integración*.

1. Lanza una EC2 **Ubuntu 24.04**, `t3.small` (o `t3.micro` con el swap que crea el script), 20 GB de disco.
2. *Security group* del backend:
   - 22 (SSH) solo desde tu IP.
   - 8081 y 8082 desde el *security group* del frontend y desde tu IP (para Swagger en la demo).
   - **No** abras 5432/5433.
3. Por SSH:

```bash
curl -fsSL https://raw.githubusercontent.com/quintopardo8/GasElVolcan/main/gaselvolcan-backend/deploy/ec2-backend.sh -o ec2-backend.sh
bash ec2-backend.sh https://github.com/quintopardo8/GasElVolcan.git http://<IP-PUBLICA-FRONTEND>
```

El script instala Docker, crea el `.env` con una contraseña de base de datos y un `JWT_SECRET` aleatorios y levanta los contenedores. Para actualizar después de un `git push`, vuelve a ejecutarlo.

## Versiones (todas compatibles entre sí)

- Java 21 (imágenes `maven:3.9-eclipse-temurin-21` y `eclipse-temurin:21-jre`)
- Spring Boot 3.5.6: su BOM fija las versiones de Spring Security, Hibernate, Jackson, Validation y el driver de PostgreSQL (`org.postgresql:postgresql`)
- JJWT 0.12.6 y springdoc-openapi 2.8.11 (alineada con Spring Boot 3.5): las únicas dependencias fuera del BOM
- PostgreSQL 17 (imagen `postgres:17-alpine`)
