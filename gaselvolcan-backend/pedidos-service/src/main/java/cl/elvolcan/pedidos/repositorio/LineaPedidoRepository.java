package cl.elvolcan.pedidos.repositorio;

import cl.elvolcan.pedidos.modelo.LineaPedido;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LineaPedidoRepository extends JpaRepository<LineaPedido, Long> {

    boolean existsByProductoCodigo(String codigo);
}
