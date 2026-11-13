package cl.elvolcan.pedidos.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/** Alta/edición de producto. Al editar, el código va en la URL y el del cuerpo se ignora. */
public record ProductoRequest(
        @Pattern(regexp = "^[A-Za-z0-9]{3,10}$", message = "El código debe tener de 3 a 10 letras o números") String codigo,
        @NotNull(message = "La categoría es obligatoria") Long categoriaId,
        @NotBlank(message = "El nombre es obligatorio")
        @Size(max = 120, message = "Máximo 120 caracteres") String nombre,
        @Size(max = 500, message = "Máximo 500 caracteres") String descripcion,
        @NotBlank(message = "La unidad es obligatoria")
        @Size(max = 20, message = "Máximo 20 caracteres") String unidad,
        @Min(value = 1, message = "Los kg deben ser mayores a 0") @Max(value = 100, message = "Máximo 100 kg") Integer kg,
        @NotNull(message = "El precio es obligatorio") @Min(value = 0, message = "El precio no puede ser negativo") Integer precio,
        @NotNull(message = "El precio comercial es obligatorio") @Min(value = 0, message = "El precio no puede ser negativo") Integer precioComercial,
        @NotNull(message = "El stock es obligatorio") @Min(value = 0, message = "El stock no puede ser negativo") Integer stock,
        Boolean activo) {
}
