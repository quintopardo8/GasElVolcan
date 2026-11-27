package cl.elvolcan.pedidos.modelo;

/**
 * Ciclo de vida del pedido:
 * PENDIENTE → (operadora asigna) ASIGNADO → (repartidor) EN_CAMINO → ENTREGADO.
 * CANCELADO puede ocurrir antes de la entrega. ENTREGADO y CANCELADO son finales.
 */
public enum EstadoPedido {
    PENDIENTE,
    ASIGNADO,
    EN_CAMINO,
    ENTREGADO,
    CANCELADO;

    public boolean esFinal() {
        return this == ENTREGADO || this == CANCELADO;
    }
}
