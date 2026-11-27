package cl.elvolcan.usuarios.dto;

import cl.elvolcan.usuarios.modelo.Rol;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * Alta y edición de usuarios desde el panel de administración.
 * La contraseña es obligatoria al crear; al editar, si viene vacía se mantiene la actual.
 */
public record UsuarioRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres") String nombre,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Ingresa un correo válido")
        @Size(max = 120, message = "El correo no puede superar 120 caracteres") String correo,
        @Size(max = 20, message = "Teléfono demasiado largo") String telefono,
        @NotNull(message = "El rol es obligatorio") Rol rol,
        @Size(max = 50, message = "La contraseña no puede superar 50 caracteres") String contrasena,
        Boolean activo) {
}
