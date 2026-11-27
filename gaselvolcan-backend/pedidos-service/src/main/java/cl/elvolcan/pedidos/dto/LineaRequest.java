package cl.elvolcan.pedidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record LineaRequest(
        @NotBlank(message = "Indica el código del producto") String codigo,
        @NotNull(message = "Indica la cantidad")
        @Min(value = 1, message = "La cantidad mínima es 1")
        @Max(value = 50, message = "La cantidad máxima por producto es 50") Integer cantidad) {
}
