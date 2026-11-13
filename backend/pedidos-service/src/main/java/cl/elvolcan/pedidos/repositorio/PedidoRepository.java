package cl.elvolcan.pedidos.repositorio;

import cl.elvolcan.pedidos.modelo.EstadoPedido;
import cl.elvolcan.pedidos.modelo.Pedido;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PedidoRepository extends JpaRepository<Pedido, Long>, JpaSpecificationExecutor<Pedido> {

    List<Pedido> findByClienteIdOrderByCreadoEnDesc(Long clienteId);

    List<Pedido> findByRepartidorIdOrderByCreadoEnDesc(Long repartidorId);

    long countByCreadoEnGreaterThanEqual(LocalDateTime desde);

    long countByEstado(EstadoPedido estado);

    long countByEstadoIn(Collection<EstadoPedido> estados);

    long countByEstadoAndEntregadoEnGreaterThanEqual(EstadoPedido estado, LocalDateTime desde);

    @Query("select coalesce(sum(p.total), 0L) from Pedido p where p.estado = :estado and p.entregadoEn >= :desde")
    long sumarTotalEntregadosDesde(@Param("estado") EstadoPedido estado, @Param("desde") LocalDateTime desde);
}
