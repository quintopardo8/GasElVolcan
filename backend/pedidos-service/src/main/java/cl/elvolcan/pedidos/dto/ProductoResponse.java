package cl.elvolcan.pedidos.dto;

import cl.elvolcan.pedidos.modelo.Producto;

public record ProductoResponse(
        String codigo,
        Long categoriaId,
        String categoria,
        String nombre,
        String descripcion,
        String unidad,
        Integer kg,
        int precio,
        int precioComercial,
        int stock,
        boolean activo) {

    public static ProductoResponse de(Producto p) {
        return new ProductoResponse(p.getCodigo(), p.getCategoria().getId(), p.getCategoria().getNombre(),
                p.getNombre(), p.getDescripcion(), p.getUnidad(), p.getKg(), p.getPrecio(),
                p.getPrecioComercial(), p.getStock(), p.isActivo());
    }
}
