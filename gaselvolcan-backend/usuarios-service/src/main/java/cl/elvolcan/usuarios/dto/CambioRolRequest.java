package cl.elvolcan.usuarios.dto;

import cl.elvolcan.usuarios.modelo.Rol;
import jakarta.validation.constraints.NotNull;

public record CambioRolRequest(@NotNull(message = "El rol es obligatorio") Rol rol) {
}
