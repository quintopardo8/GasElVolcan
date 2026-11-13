package cl.elvolcan.pedidos.repositorio;

import cl.elvolcan.pedidos.modelo.Producto;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProductoRepository extends JpaRepository<Producto, String> {

    List<Producto> findAllByOrderByCodigoAsc();

    List<Producto> findByActivoTrueOrderByCodigoAsc();

    List<Producto> findByActivoTrueAndStockLessThanEqualOrderByStockAsc(int stock);

    boolean existsByCategoriaId(Long categoriaId);
}
