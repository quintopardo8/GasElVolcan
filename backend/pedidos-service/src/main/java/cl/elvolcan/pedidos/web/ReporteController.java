package cl.elvolcan.pedidos.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import cl.elvolcan.pedidos.dto.ResumenResponse;
import cl.elvolcan.pedidos.servicio.PedidoService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Reportes", description = "Resumen para el panel (ADMINISTRADOR y OPERADORA).")
@RestController
@RequestMapping("/api/reportes")
public class ReporteController {

    private final PedidoService servicio;

    public ReporteController(PedidoService servicio) {
        this.servicio = servicio;
    }

    /** Números del día y productos con stock bajo. */
    @GetMapping("/resumen")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','OPERADORA')")
    public ResumenResponse resumen() {
        return servicio.resumen();
    }
}
