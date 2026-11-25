package cl.elvolcan.pedidos.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import cl.elvolcan.pedidos.dto.AsignarRequest;
import cl.elvolcan.pedidos.dto.EstadoRequest;
import cl.elvolcan.pedidos.dto.PedidoRequest;
import cl.elvolcan.pedidos.dto.PedidoResponse;
import cl.elvolcan.pedidos.modelo.EstadoPedido;
import cl.elvolcan.pedidos.seguridad.UsuarioAutenticado;
import cl.elvolcan.pedidos.servicio.PedidoService;
import jakarta.validation.Valid;
import java.time.LocalDate;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
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

@Tag(name = "Pedidos", description = "Ciclo del pedido: PENDIENTE → ASIGNADO → EN_CAMINO → ENTREGADO / CANCELADO.")
@RestController
@RequestMapping("/api/pedidos")
public class PedidoController {

    private final PedidoService servicio;

    public PedidoController(PedidoService servicio) {
        this.servicio = servicio;
    }

    /** Todos los pedidos (filtros opcionales: estado, fecha=AAAA-MM-DD, repartidorId). */
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','OPERADORA')")
    public List<PedidoResponse> listar(@RequestParam(required = false) EstadoPedido estado,
                                       @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fecha,
                                       @RequestParam(required = false) Long repartidorId) {
        return servicio.listar(estado, fecha, repartidorId);
    }

    /** Cliente: sus pedidos. Repartidor: los que tiene asignados. */
    @GetMapping("/mios")
    @PreAuthorize("hasAnyRole('CLIENTE','REPARTIDOR')")
    public List<PedidoResponse> mios(@AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.misPedidos(actual);
    }

    @GetMapping("/{id}")
    public PedidoResponse obtener(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.obtener(id, actual);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('CLIENTE','ADMINISTRADOR','OPERADORA')")
    @ResponseStatus(HttpStatus.CREATED)
    public PedidoResponse crear(@Valid @RequestBody PedidoRequest req, @AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.crear(req, actual);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','OPERADORA')")
    public PedidoResponse actualizar(@PathVariable Long id, @Valid @RequestBody PedidoRequest req) {
        return servicio.actualizar(id, req);
    }

    @PatchMapping("/{id}/asignar")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','OPERADORA')")
    public PedidoResponse asignar(@PathVariable Long id, @Valid @RequestBody AsignarRequest req) {
        return servicio.asignar(id, req.repartidorId(), req.repartidorNombre());
    }

    /** Las reglas de qué rol puede pasar a qué estado están en PedidoService.cambiarEstado. */
    @PatchMapping("/{id}/estado")
    public PedidoResponse cambiarEstado(@PathVariable Long id, @Valid @RequestBody EstadoRequest req,
                                        @AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.cambiarEstado(id, req.estado(), actual);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id) {
        servicio.eliminar(id);
    }
}
