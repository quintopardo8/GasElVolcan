package cl.elvolcan.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Registro público: siempre crea una cuenta con rol CLIENTE. */
public record RegistroRequest(
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 100, message = "El nombre no puede superar 100 caracteres") String nombre,
        @NotBlank(message = "El correo es obligatorio")
        @Email(message = "Ingresa un correo válido")
        @Size(max = 120, message = "El correo no puede superar 120 caracteres") String correo,
        @Size(max = 20, message = "Teléfono demasiado largo") String telefono,
        @NotBlank(message = "La contraseña es obligatoria")
        @Size(min = 6, max = 50, message = "La contraseña debe tener entre 6 y 50 caracteres") String contrasena) {
}
