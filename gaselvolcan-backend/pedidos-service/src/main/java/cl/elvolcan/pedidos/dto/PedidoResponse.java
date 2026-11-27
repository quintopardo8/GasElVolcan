package cl.elvolcan.pedidos.dto;

import cl.elvolcan.pedidos.modelo.EstadoPedido;
import cl.elvolcan.pedidos.modelo.MetodoPago;
import cl.elvolcan.pedidos.modelo.Pedido;
import java.time.LocalDateTime;
import java.util.List;

public record PedidoResponse(
        Long id,
        String codigo,
        Long clienteId,
        String clienteNombre,
        String telefono,
        String calle,
        String depto,
        String comuna,
        String referencia,
        String franja,
        MetodoPago metodoPago,
        EstadoPedido estado,
        Long repartidorId,
        String repartidorNombre,
        int total,
        boolean pagado,
        LocalDateTime creadoEn,
        LocalDateTime actualizadoEn,
        LocalDateTime entregadoEn,
        List<LineaResponse> lineas) {

    public static PedidoResponse de(Pedido p) {
        return new PedidoResponse(p.getId(), p.getCodigo(), p.getClienteId(), p.getClienteNombre(),
                p.getTelefono(), p.getCalle(), p.getDepto(), p.getComuna(), p.getReferencia(), p.getFranja(),
                p.getMetodoPago(), p.getEstado(), p.getRepartidorId(), p.getRepartidorNombre(), p.getTotal(),
                p.isPagado(), p.getCreadoEn(), p.getActualizadoEn(), p.getEntregadoEn(),
                p.getLineas().stream().map(LineaResponse::de).toList());
    }
}
