package cl.elvolcan.pedidos.seguridad;

/** Datos del usuario que vienen dentro del token JWT. Es el "principal" de cada petición. */
public record UsuarioAutenticado(Long id, String correo, String nombre, String rol) {
}
