package cl.elvolcan.usuarios.web;

import io.swagger.v3.oas.annotations.tags.Tag;
import cl.elvolcan.usuarios.dto.AuthResponse;
import cl.elvolcan.usuarios.dto.LoginRequest;
import cl.elvolcan.usuarios.dto.RegistroRequest;
import cl.elvolcan.usuarios.dto.UsuarioResponse;
import cl.elvolcan.usuarios.seguridad.UsuarioAutenticado;
import cl.elvolcan.usuarios.servicio.UsuarioService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@Tag(name = "Autenticación", description = "Login y registro (públicos): devuelven el JWT con el rol del usuario.")
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService servicio;

    public AuthController(UsuarioService servicio) {
        this.servicio = servicio;
    }

    /** POST /api/auth/login → { token, usuario } */
    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest req) {
        return servicio.login(req);
    }

    /** POST /api/auth/registro → crea un CLIENTE y devuelve su sesión. */
    @PostMapping("/registro")
    @ResponseStatus(HttpStatus.CREATED)
    public AuthResponse registro(@Valid @RequestBody RegistroRequest req) {
        return servicio.registrar(req);
    }

    /** GET /api/auth/yo → datos del usuario del token. */
    @GetMapping("/yo")
    public UsuarioResponse yo(@AuthenticationPrincipal UsuarioAutenticado actual) {
        return servicio.obtener(actual.id());
    }
}
