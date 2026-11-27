package cl.elvolcan.pedidos.dto;

import cl.elvolcan.pedidos.modelo.EstadoPedido;
import jakarta.validation.constraints.NotNull;

public record EstadoRequest(@NotNull(message = "Indica el nuevo estado") EstadoPedido estado) {
}
