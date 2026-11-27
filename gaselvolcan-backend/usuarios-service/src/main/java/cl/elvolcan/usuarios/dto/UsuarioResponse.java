package cl.elvolcan.usuarios.dto;

import cl.elvolcan.usuarios.modelo.Rol;
import cl.elvolcan.usuarios.modelo.Usuario;
import java.time.LocalDateTime;

/** Lo que la API devuelve de un usuario (sin el hash de la contraseña). */
public record UsuarioResponse(
        Long id,
        String nombre,
        String correo,
        String telefono,
        Rol rol,
        boolean activo,
        LocalDateTime creadoEn) {

    public static UsuarioResponse de(Usuario u) {
        return new UsuarioResponse(u.getId(), u.getNombre(), u.getCorreo(), u.getTelefono(),
                u.getRol(), u.isActivo(), u.getCreadoEn());
    }
}
