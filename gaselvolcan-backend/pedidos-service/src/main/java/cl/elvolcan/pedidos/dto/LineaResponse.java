package cl.elvolcan.pedidos.dto;

import cl.elvolcan.pedidos.modelo.LineaPedido;

public record LineaResponse(String codigo, String nombre, int cantidad, int precioUnitario, int subtotal) {

    public static LineaResponse de(LineaPedido l) {
        return new LineaResponse(l.getProducto().getCodigo(), l.getProducto().getNombre(),
                l.getCantidad(), l.getPrecioUnitario(), l.getSubtotal());
    }
}
