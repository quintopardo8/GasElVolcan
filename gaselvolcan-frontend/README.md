# Gas El Volcán · Frontend

Tienda web y panel de administración de la Distribuidora de Gas El Volcán: **React 19 + Vite 8 + React Router 7 + Bootstrap 5**, servida con **nginx** en Docker.

Backend (Spring Boot + PostgreSQL + JWT): carpeta [`../gaselvolcan-backend`](../gaselvolcan-backend). Para levantar todo junto, usa el `docker-compose.yml` de la raíz del repositorio.

## Qué hace

| Interfaz | Ruta | Acceso |
|---|---|---|
| Inicio | `/` | Pública |
| Catálogo (datos de `GET /api/productos`) | `/catalogo` | Pública |
| Contacto | `/contacto` | Pública |
| Iniciar sesión · Registro · Recuperar contraseña | `/iniciar-sesion` · `/registro` · `/recuperar-contrasena` | Pública |
| Checkout (crea el pedido con `POST /api/pedidos`) | `/checkout` | Con sesión |
| Rastreo del pedido | `/rastreo` | Con sesión |
| Panel: resumen y pedidos | `/admin` · `/admin/pedidos` | ADMINISTRADOR, OPERADORA |
| Panel: usuarios y productos (CRUD) | `/admin/usuarios` · `/admin/productos` | ADMINISTRADOR |

## Sesión y seguridad en el frontend

- **Login**: `POST /api/auth/login` devuelve `{ token, usuario }`. Se guarda `{ token, rol, id, correo, nombre }` en `localStorage` (`gev:sesion`), así la sesión **sobrevive a recargar la página**.
- **Token en cada llamada**: `src/utils/api.js` agrega `Authorization: Bearer <token>`.
- **Expiración**: `src/utils/sesion.js` lee el `exp` del JWT; si venció, descarta la sesión. `<VigilanteSesion>` (en `App.jsx`) programa el cierre para el momento exacto del vencimiento y vuelve al login con el aviso “Tu sesión expiró”. Si la API responde **401** con un token, también se cierra la sesión.
- **Rutas protegidas**: `<Privada>` exige sesión (y después del login vuelve a la página pedida); `<SoloRoles>` exige rol y, si no alcanza, muestra **“Acceso restringido (403)”**. El menú solo muestra “Administración” al personal.
- El frontend **solo oculta**; quien realmente protege es el backend (401/403).

## Desarrollo

```bash
npm install
npm run dev        # http://localhost:5173 (el proxy de Vite manda /api al backend en 8081/8082)
npm test           # tests con Vitest + Testing Library
npm run lint
```

Necesita el backend corriendo (`docker compose up -d --build` en `../gaselvolcan-backend`, o el de la raíz).

## Docker (local)

```bash
docker compose up -d --build    # http://localhost:8080 (usa el backend de la misma PC)
```

`nginx/default.conf.template` reenvía `/api/auth` y `/api/usuarios` a usuarios-service y el resto de `/api` a pedidos-service. Para el navegador todo es el **mismo origen**, por eso no hay problemas de CORS.

## Despliegue en AWS (EC2)

1. Despliega primero el backend y anota su **IP privada** (EC2 → Detalles → *Private IPv4*).
2. Lanza una EC2 **Ubuntu 24.04** `t3.micro`. *Security group*: 80 (HTTP) desde cualquier lugar, 22 (SSH) solo desde tu IP.
3. Por SSH:

```bash
curl -fsSL https://raw.githubusercontent.com/quintopardo8/GasElVolcan/main/gaselvolcan-frontend/deploy/ec2-frontend.sh -o ec2-frontend.sh
bash ec2-frontend.sh https://github.com/quintopardo8/GasElVolcan.git <IP-PRIVADA-BACKEND>
```

4. Abre `http://<IP-PUBLICA-FRONTEND>`.

## Estructura

```
src/
  App.jsx                 rutas públicas, privadas y por rol + VigilanteSesion
  utils/api.js            cliente HTTP (token, errores, 401 → login)
  utils/sesion.js         estado de sesión en localStorage + expiración del JWT
  context/                CatalogoProvider (API) y CarritoProvider (localStorage)
  pages/                  Inicio, Catalogo, Contacto, Checkout, Rastreo, IniciarSesion, Admin, SinPermiso
nginx/default.conf.template
deploy/ec2-frontend.sh
```
