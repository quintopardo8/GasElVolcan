# Backend – Gas El Volcán

Dos microservicios **Spring Boot 3.5 (Java 21)** con **PostgreSQL 17**, autenticación **JWT** con roles y todo levantado con **Docker Compose**.

| Servicio | Puerto | Base de datos | Responsabilidad |
|---|---|---|---|
| `usuarios-service` | 8081 | `gas_usuarios` | Login, registro, usuarios y roles (emite el JWT) |
| `pedidos-service` | 8082 | `gas_pedidos` | Categorías, productos/stock, pedidos y reportes (valida el JWT) |
| `frontend` (nginx) | 8080 | — | React + panel de administración; reenvía `/api/...` a cada servicio |
| `postgres` | 5433 (en tu PC) | — | Un servidor PostgreSQL con una base por microservicio |

## Levantar todo

Requisito: Docker Desktop. Desde la carpeta del proyecto (donde está `docker-compose.yml`):

```bash
docker compose up --build
```

La primera vez tarda unos minutos (descarga imágenes y dependencias de Maven y npm). Después:

- Tienda y panel: http://localhost:8080 → inicia sesión con un usuario del personal y entras directo a `/admin`.
- Para cambiar contraseñas o el secreto JWT: copia `.env.example` como `.env` y edítalo **antes** del primer arranque.

Para borrar la base de datos y empezar de cero: `docker compose down -v`.

Para revisar las tablas: `docker compose exec postgres psql -U volcan -d gas_pedidos` (o con pgAdmin/DBeaver en `localhost:5433`, usuario `volcan`, contraseña `volcan123`).

### Usuarios de prueba (se crean solos la primera vez)

| Rol | Correo | Contraseña |
|---|---|---|
| Administrador | admin@elvolcan.cl | Admin1234 |
| Operadora | operadora@elvolcan.cl | Operadora123 |
| Repartidor | repartidor1@elvolcan.cl (también 2 y 3) | Repartidor123 |
| Cliente | cliente@correo.cl | Cliente123 |

Para no crearlos, pon `DATOS_DEMO=false` en `.env`. El catálogo inicial es el del Excel del curso (14 productos).

## Desarrollo con `npm run dev`

```bash
docker compose up --build postgres usuarios-service pedidos-service   # solo backend
npm run dev                                                         # frontend en http://localhost:5173
```

`vite.config.js` tiene un proxy: `/api/auth` y `/api/usuarios` → 8081, el resto de `/api` → 8082.

## Versiones (todas compatibles entre sí)

- Java 21 (imágenes `maven:3.9-eclipse-temurin-21` y `eclipse-temurin:21-jre`)
- Spring Boot 3.5.6: su BOM fija las versiones de Spring Security, Hibernate, Jackson, Validation y el driver de PostgreSQL (`org.postgresql:postgresql`)
- JJWT 0.12.6 (la única dependencia fuera del BOM, misma versión en ambos servicios)
- PostgreSQL 17 (imagen `postgres:17-alpine`) · Node 22 + Vite 8 + React 19 · nginx 1.27

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

Todas las rutas exigen `Authorization: Bearer <token>`, salvo login y registro. Los errores siempre vienen en JSON:
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
| GET | `/api/categorias` · `/api/productos[?todos=true]` · `/api/productos/{codigo}` | cualquiera |
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
Las tablas las crea Hibernate al arrancar (`ddl-auto=update`). Para producción conviene pasar a migraciones con Flyway.

## Pendiente para completar el proyecto

- Conectar el catálogo, el checkout y el rastreo del frontend a `/api/productos` y `/api/pedidos` (hoy siguen usando `src/data/catalogo.js` y `localStorage`).
- Vista del repartidor (`GET /api/pedidos/mios` + `PATCH /estado`) y el mapa con Leaflet.
- Despliegue en AWS (las mismas imágenes de Docker sirven para ECS o una EC2 con Docker Compose).
