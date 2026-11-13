package cl.elvolcan.usuarios.servicio;

import cl.elvolcan.usuarios.dto.AuthResponse;
import cl.elvolcan.usuarios.dto.LoginRequest;
import cl.elvolcan.usuarios.dto.RegistroRequest;
import cl.elvolcan.usuarios.dto.UsuarioRequest;
import cl.elvolcan.usuarios.dto.UsuarioResponse;
import cl.elvolcan.usuarios.modelo.Rol;
import cl.elvolcan.usuarios.modelo.Usuario;
import cl.elvolcan.usuarios.repositorio.UsuarioRepository;
import cl.elvolcan.usuarios.seguridad.JwtService;
import cl.elvolcan.usuarios.web.ApiException;
import java.util.List;
import java.util.Locale;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class UsuarioService {

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;

    public UsuarioService(UsuarioRepository repo, PasswordEncoder encoder, JwtService jwtService) {
        this.repo = repo;
        this.encoder = encoder;
        this.jwtService = jwtService;
    }

    // ---------- Autenticación ----------

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest req) {
        Usuario usuario = repo.findByCorreo(normalizarCorreo(req.correo()))
                .filter(u -> encoder.matches(req.contrasena(), u.getContrasenaHash()))
                // Mismo mensaje si no existe el correo o la clave es incorrecta: no se revela cuál falló.
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Correo o contraseña incorrectos"));
        if (!usuario.isActivo()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Tu cuenta está desactivada. Contacta a la administración.");
        }
        return new AuthResponse(jwtService.generar(usuario), UsuarioResponse.de(usuario));
    }

    @Transactional
    public AuthResponse registrar(RegistroRequest req) {
        String correo = normalizarCorreo(req.correo());
        if (repo.existsByCorreo(correo)) {
            throw ApiException.conflicto("Ya existe una cuenta con ese correo");
        }
        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setCorreo(correo);
        u.setTelefono(normalizarTelefono(req.telefono()));
        u.setContrasenaHash(encoder.encode(req.contrasena()));
        u.setRol(Rol.CLIENTE);
        u.setActivo(true);
        Usuario guardado = repo.save(u);
        return new AuthResponse(jwtService.generar(guardado), UsuarioResponse.de(guardado));
    }

    // ---------- CRUD (panel de administración) ----------

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar(Rol rol, String buscar) {
        List<Usuario> usuarios = rol == null ? repo.findAllByOrderByNombreAsc() : repo.findByRolOrderByNombreAsc(rol);
        String texto = buscar == null ? "" : buscar.trim().toLowerCase(Locale.ROOT);
        return usuarios.stream()
                .filter(u -> texto.isEmpty()
                        || u.getNombre().toLowerCase(Locale.ROOT).contains(texto)
                        || u.getCorreo().contains(texto))
                .map(UsuarioResponse::de)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> repartidoresActivos() {
        return repo.findByRolAndActivoTrueOrderByNombreAsc(Rol.REPARTIDOR).stream().map(UsuarioResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id) {
        return UsuarioResponse.de(buscar(id));
    }

    @Transactional
    public UsuarioResponse crear(UsuarioRequest req) {
        String correo = normalizarCorreo(req.correo());
        if (repo.existsByCorreo(correo)) {
            throw ApiException.conflicto("Ya existe un usuario con ese correo");
        }
        if (req.contrasena() == null || req.contrasena().length() < 6) {
            throw ApiException.invalido("La contraseña es obligatoria y debe tener al menos 6 caracteres");
        }
        Usuario u = new Usuario();
        u.setNombre(req.nombre().trim());
        u.setCorreo(correo);
        u.setTelefono(normalizarTelefono(req.telefono()));
        u.setRol(req.rol());
        u.setActivo(req.activo() == null || req.activo());
        u.setContrasenaHash(encoder.encode(req.contrasena()));
        return UsuarioResponse.de(repo.save(u));
    }

    @Transactional
    public UsuarioResponse actualizar(Long id, UsuarioRequest req, Long idActual) {
        Usuario u = buscar(id);
        String correo = normalizarCorreo(req.correo());
        if (repo.existsByCorreoAndIdNot(correo, id)) {
            throw ApiException.conflicto("Ya existe otro usuario con ese correo");
        }
        boolean activo = req.activo() == null ? u.isActivo() : req.activo();
        protegerAdministrador(u, req.rol(), activo, idActual);

        u.setNombre(req.nombre().trim());
        u.setCorreo(correo);
        u.setTelefono(normalizarTelefono(req.telefono()));
        u.setRol(req.rol());
        u.setActivo(activo);
        if (req.contrasena() != null && !req.contrasena().isBlank()) {
            if (req.contrasena().length() < 6) {
                throw ApiException.invalido("La contraseña debe tener al menos 6 caracteres");
            }
            u.setContrasenaHash(encoder.encode(req.contrasena()));
        }
        return UsuarioResponse.de(u);
    }

    @Transactional
    public UsuarioResponse cambiarActivo(Long id, boolean activo, Long idActual) {
        Usuario u = buscar(id);
        protegerAdministrador(u, u.getRol(), activo, idActual);
        u.setActivo(activo);
        return UsuarioResponse.de(u);
    }

    @Transactional
    public UsuarioResponse cambiarRol(Long id, Rol rol, Long idActual) {
        Usuario u = buscar(id);
        protegerAdministrador(u, rol, u.isActivo(), idActual);
        u.setRol(rol);
        return UsuarioResponse.de(u);
    }

    @Transactional
    public void eliminar(Long id, Long idActual) {
        Usuario u = buscar(id);
        if (u.getId().equals(idActual)) {
            throw ApiException.conflicto("No puedes eliminar tu propia cuenta");
        }
        protegerAdministrador(u, Rol.CLIENTE, false, idActual);
        repo.delete(u);
    }

    // ---------- Apoyo ----------

    /**
     * Evita que el sistema quede sin administradores activos y que un administrador
     * se quite a sí mismo el acceso por error.
     */
    private void protegerAdministrador(Usuario u, Rol nuevoRol, boolean nuevoActivo, Long idActual) {
        boolean pierdeAdmin = u.getRol() == Rol.ADMINISTRADOR && u.isActivo()
                && (nuevoRol != Rol.ADMINISTRADOR || !nuevoActivo);
        if (!pierdeAdmin) {
            return;
        }
        if (u.getId().equals(idActual)) {
            throw ApiException.conflicto("No puedes quitarte el rol de administrador ni desactivar tu propia cuenta");
        }
        if (repo.countByRolAndActivoTrue(Rol.ADMINISTRADOR) <= 1) {
            throw ApiException.conflicto("Debe quedar al menos un administrador activo");
        }
    }

    private Usuario buscar(Long id) {
        return repo.findById(id).orElseThrow(() -> ApiException.noEncontrado("No existe el usuario " + id));
    }

    private static String normalizarCorreo(String correo) {
        return correo == null ? null : correo.trim().toLowerCase(Locale.ROOT);
    }

    /** Guarda solo dígitos (y el + inicial). Vacío se guarda como null. */
    private static String normalizarTelefono(String telefono) {
        if (telefono == null || telefono.isBlank()) {
            return null;
        }
        String limpio = telefono.trim().replaceAll("[^0-9+]", "");
        return limpio.isEmpty() ? null : limpio;
    }
}
