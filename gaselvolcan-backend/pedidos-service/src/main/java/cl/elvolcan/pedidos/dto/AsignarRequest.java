package cl.elvolcan.pedidos.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** El nombre se envía junto al id porque los usuarios viven en otro microservicio. */
public record AsignarRequest(
        @NotNull(message = "Selecciona un repartidor") Long repartidorId,
        @NotBlank(message = "Falta el nombre del repartidor")
        @Size(max = 100, message = "Máximo 100 caracteres") String repartidorNombre) {
}
