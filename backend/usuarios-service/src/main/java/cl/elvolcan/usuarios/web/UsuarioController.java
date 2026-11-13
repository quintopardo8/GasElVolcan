package cl.elvolcan.usuarios.web;

import cl.elvolcan.usuarios.dto.CambioActivoRequest;
import cl.elvolcan.usuarios.dto.CambioRolRequest;
import cl.elvolcan.usuarios.dto.UsuarioRequest;
import cl.elvolcan.usuarios.dto.UsuarioResponse;
import cl.elvolcan.usuarios.modelo.Rol;
import cl.elvolcan.usuarios.seguridad.UsuarioAutenticado;
import cl.elvolcan.usuarios.servicio.UsuarioService;
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

/** CRUD de usuarios. Solo el rol ADMINISTRADOR, salvo la lista de repartidores. */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService servicio;

    public UsuarioController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public List<UsuarioResponse> listar(@RequestParam(required = false) Rol rol,
                                        @RequestParam(required = false) String buscar) {
        return servicio.listar(rol, buscar);
    }

    /** La operadora la necesita para asignar pedidos. */
    @GetMapping("/repartidores")
    @PreAuthorize("hasAnyRole('ADMINISTRADOR','OPERADORA')")
    public List<UsuarioResponse> repartidores() {
        return servicio.repartidoresActivos();
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse obtener(@PathVariable Long id) {
        return servicio.obtener(id);
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.CREATED)
    public UsuarioResponse crear(@Valid @RequestBody UsuarioRequest req) {
        return servicio.crear(req);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse actualizar(@PathVariable Long id, @Valid @RequestBody UsuarioRequest req,
                                      @AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.actualizar(id, req, actual.id());
    }

    /** Activar o desactivar (la forma recomendada de "dar de baja" sin perder historial). */
    @PatchMapping("/{id}/activo")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse cambiarActivo(@PathVariable Long id, @Valid @RequestBody CambioActivoRequest req,
                                         @AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.cambiarActivo(id, req.activo(), actual.id());
    }

    @PatchMapping("/{id}/rol")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    public UsuarioResponse cambiarRol(@PathVariable Long id, @Valid @RequestBody CambioRolRequest req,
                                      @AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.cambiarRol(id, req.rol(), actual.id());
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMINISTRADOR')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void eliminar(@PathVariable Long id, @AuthenticationPrincipal UsuarioAutenticado actual) {
        servicio.eliminar(id, actual.id());
    }
}
