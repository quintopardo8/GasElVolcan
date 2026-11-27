package cl.elvolcan.pedidos.servicio;

import cl.elvolcan.pedidos.dto.CategoriaRequest;
import cl.elvolcan.pedidos.dto.CategoriaResponse;
import cl.elvolcan.pedidos.dto.ProductoRequest;
import cl.elvolcan.pedidos.dto.ProductoResponse;
import cl.elvolcan.pedidos.modelo.Categoria;
import cl.elvolcan.pedidos.modelo.Producto;
import cl.elvolcan.pedidos.repositorio.CategoriaRepository;
import cl.elvolcan.pedidos.repositorio.LineaPedidoRepository;
import cl.elvolcan.pedidos.repositorio.ProductoRepository;
import cl.elvolcan.pedidos.web.ApiException;
import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Categorías y productos (catálogo + stock). */
@Service
public class CatalogoService {

    private final CategoriaRepository categorias;
    private final ProductoRepository productos;
    private final LineaPedidoRepository lineas;

    public CatalogoService(CategoriaRepository categorias, ProductoRepository productos, LineaPedidoRepository lineas) {
        this.categorias = categorias;
        this.productos = productos;
        this.lineas = lineas;
    }

    // ---------- Categorías ----------

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listarCategorias() {
        return categorias.findAllByOrderByIdAsc().stream().map(CategoriaResponse::de).toList();
    }

    @Transactional
    public CategoriaResponse crearCategoria(CategoriaRequest req) {
        String nombre = req.nombre().trim();
        if (categorias.findByNombreIgnoreCase(nombre).isPresent()) {
            throw ApiException.conflicto("Ya existe una categoría con ese nombre");
        }
        return CategoriaResponse.de(categorias.save(new Categoria(nombre)));
    }

    @Transactional
    public CategoriaResponse actualizarCategoria(Long id, CategoriaRequest req) {
        Categoria c = buscarCategoria(id);
        String nombre = req.nombre().trim();
        if (categorias.existsByNombreIgnoreCaseAndIdNot(nombre, id)) {
            throw ApiException.conflicto("Ya existe una categoría con ese nombre");
        }
        c.setNombre(nombre);
        return CategoriaResponse.de(c);
    }

    @Transactional
    public void eliminarCategoria(Long id) {
        Categoria c = buscarCategoria(id);
        if (productos.existsByCategoriaId(id)) {
            throw ApiException.conflicto("La categoría tiene productos; muévelos o elimínalos primero");
        }
        categorias.delete(c);
    }

    // ---------- Productos ----------

    /** Clientes y repartidores ven solo los activos; el personal puede pedir todos. */
    @Transactional(readOnly = true)
    public List<ProductoResponse> listarProductos(boolean incluirInactivos) {
        List<Producto> lista = incluirInactivos
                ? productos.findAllByOrderByCodigoAsc()
                : productos.findByActivoTrueOrderByCodigoAsc();
        return lista.stream().map(ProductoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public ProductoResponse obtenerProducto(String codigo) {
        return ProductoResponse.de(buscarProducto(codigo));
    }

    @Transactional
    public ProductoResponse crearProducto(ProductoRequest req) {
        if (req.codigo() == null || req.codigo().isBlank()) {
            throw ApiException.invalido("El código es obligatorio");
        }
        String codigo = req.codigo().trim().toUpperCase(Locale.ROOT);
        if (productos.existsById(codigo)) {
            throw ApiException.conflicto("Ya existe un producto con el código " + codigo);
        }
        Producto p = new Producto();
        p.setCodigo(codigo);
        aplicar(p, req);
        return ProductoResponse.de(productos.save(p));
    }

    @Transactional
    public ProductoResponse actualizarProducto(String codigo, ProductoRequest req) {
        Producto p = buscarProducto(codigo);
        aplicar(p, req);
        return ProductoResponse.de(p);
    }

    @Transactional
    public ProductoResponse cambiarStock(String codigo, int stock) {
        Producto p = buscarProducto(codigo);
        p.setStock(stock);
        return ProductoResponse.de(p);
    }

    @Transactional
    public void eliminarProducto(String codigo) {
        Producto p = buscarProducto(codigo);
        if (lineas.existsByProductoCodigo(p.getCodigo())) {
            throw ApiException.conflicto("El producto aparece en pedidos: desactívalo en vez de eliminarlo para no perder el historial");
        }
        productos.delete(p);
    }

    private void aplicar(Producto p, ProductoRequest req) {
        p.setCategoria(buscarCategoria(req.categoriaId()));
        p.setNombre(req.nombre().trim());
        p.setDescripcion(req.descripcion() == null || req.descripcion().isBlank() ? null : req.descripcion().trim());
        p.setUnidad(req.unidad().trim());
        p.setKg(req.kg());
        p.setPrecio(req.precio());
        p.setPrecioComercial(req.precioComercial());
        p.setStock(req.stock());
        if (req.activo() != null) {
            p.setActivo(req.activo());
        }
    }

    private Categoria buscarCategoria(Long id) {
        return categorias.findById(id).orElseThrow(() -> ApiException.noEncontrado("No existe la categoría " + id));
    }

    private Producto buscarProducto(String codigo) {
        String limpio = codigo == null ? "" : codigo.trim().toUpperCase(Locale.ROOT);
        return productos.findById(limpio).orElseThrow(() -> ApiException.noEncontrado("No existe el producto " + limpio));
    }
}
