package cl.elvolcan.usuarios.dto;

import jakarta.validation.constraints.NotNull;

public record CambioActivoRequest(@NotNull(message = "Indica si el usuario queda activo") Boolean activo) {
}
