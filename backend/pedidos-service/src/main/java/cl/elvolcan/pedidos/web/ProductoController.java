package cl.elvolcan.pedidos.web;

import cl.elvolcan.pedidos.dto.ProductoRequest;
import cl.elvolcan.pedidos.dto.ProductoResponse;
import cl.elvolcan.pedidos.dto.StockRequest;
import cl.elvolcan.pedidos.seguridad.UsuarioAutenticado;
import cl.elvolcan.pedidos.servicio.CatalogoService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/productos")
public class ProductoController {

    private final CatalogoService servicio;

    public ProductoController(CatalogoService servicio) {
        this.servicio = servicio;
    }

    /** GET /api/productos → activos. ?todos=true incluye inactivos (solo personal interno). */
    @GetMapping
    public List<ProductoResponse> listar(@RequestParam(defaultValue = "false") boolean todos,
                                         @AuthenticationPrincipal UsuarioAutenticado actual) {
        boolean esPersonal = "ADMINISTRADOR".equals(actual.rol()) || "OPERADORA".equals(actual.rol());
        return servicio.listarProductos(todos && esPersonal);
    }

    @GetMapping("/{codigo}")
    public ProductoResponse obtener(@PathVariable String codigo) {
        return servicio.obtenerProducto(codigo);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public ProductoResponse crear(@Valid @RequestBody ProductoRequest req) {
        return servicio.crearProducto(req);
    }

    @PutMapping("/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ProductoResponse actualizar(@PathVariable String codigo, @Valid @RequestBody ProductoRequest req) {
        return servicio.actualizarProducto(codigo, req);
    }

    /** Ajuste rápido de stock (conteo de bodega). */
    @PatchMapping("/{codigo}/stock")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public ProductoResponse cambiarStock(@PathVariable String codigo, @Valid @RequestBody StockRequest req) {
        return servicio.cambiarStock(codigo, req.stock());
    }

    @DeleteMapping("/{codigo}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable String codigo) {
        servicio.eliminarProducto(codigo);
    }
}
