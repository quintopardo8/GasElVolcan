-- Se ejecuta solo la primera vez que se crea el volumen de PostgreSQL.
-- Cada microservicio tiene su propia base de datos:
--   gas_usuarios la crea la imagen de PostgreSQL (POSTGRES_DB en docker-compose.yml)
--   gas_pedidos se crea aquí, con dueño 'volcan' (el usuario que ejecuta este script).
CREATE DATABASE gas_pedidos;
