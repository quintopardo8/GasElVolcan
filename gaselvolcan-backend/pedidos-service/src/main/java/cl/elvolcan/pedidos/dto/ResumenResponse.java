package cl.elvolcan.pedidos.dto;

import java.util.List;

/** Datos del panel de inicio de administración. */
public record ResumenResponse(
        long pedidosHoy,
        long pendientes,
        long enCurso,
        long entregadosHoy,
        long ventasHoy,
        int umbralStockBajo,
        List<ProductoResponse> stockBajo) {
}
