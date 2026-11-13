package cl.elvolcan.pedidos.dto;

import cl.elvolcan.pedidos.modelo.MetodoPago;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.List;

/**
 * Crear o editar un pedido.
 * - Cliente: clienteNombre es opcional (se usa el nombre de su cuenta).
 * - Operadora/Admin: pedido tomado por teléfono, clienteNombre obligatorio.
 * - Al editar, si "lineas" viene null se mantienen los productos actuales.
 */
public record PedidoRequest(
        @Size(max = 100, message = "Máximo 100 caracteres") String clienteNombre,
        @NotBlank(message = "El teléfono es obligatorio para la entrega") String telefono,
        @NotBlank(message = "Debes ingresar calle y número")
        @Size(min = 5, max = 150, message = "La dirección debe tener entre 5 y 150 caracteres") String calle,
        @Size(max = 50, message = "Máximo 50 caracteres") String depto,
        @NotBlank(message = "Selecciona una comuna") String comuna,
        @Size(max = 200, message = "Máximo 200 caracteres") String referencia,
        @Size(max = 40, message = "Máximo 40 caracteres") String franja,
        MetodoPago metodoPago,
        @Valid List<LineaRequest> lineas) {
}
