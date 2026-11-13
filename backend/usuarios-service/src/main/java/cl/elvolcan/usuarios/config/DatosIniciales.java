package cl.elvolcan.usuarios.config;

import cl.elvolcan.usuarios.modelo.Rol;
import cl.elvolcan.usuarios.modelo.Usuario;
import cl.elvolcan.usuarios.repositorio.UsuarioRepository;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Al arrancar: crea el administrador inicial (si no existe) y, la primera vez,
 * usuarios de demostración de cada rol para probar el sistema.
 */
@Component
public class DatosIniciales implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatosIniciales.class);

    private final UsuarioRepository repo;
    private final PasswordEncoder encoder;
    private final String adminCorreo;
    private final String adminContrasena;
    private final String adminNombre;
    private final boolean datosDemo;

    public DatosIniciales(UsuarioRepository repo, PasswordEncoder encoder,
                          @Value("${app.admin.correo}") String adminCorreo,
                          @Value("${app.admin.contrasena}") String adminContrasena,
                          @Value("${app.admin.nombre}") String adminNombre,
                          @Value("${app.datos-demo}") boolean datosDemo) {
        this.repo = repo;
        this.encoder = encoder;
        this.adminCorreo = adminCorreo.trim().toLowerCase(Locale.ROOT);
        this.adminContrasena = adminContrasena;
        this.adminNombre = adminNombre;
        this.datosDemo = datosDemo;
    }

    @Override
    @Transactional
    public void run(String... args) {
        boolean baseVacia = repo.count() == 0;
        if (!repo.existsByCorreo(adminCorreo)) {
            crear(adminNombre, adminCorreo, null, adminContrasena, Rol.ADMINISTRADOR);
            log.info("Administrador inicial creado: {}", adminCorreo);
        }
        if (datosDemo && baseVacia) {
            crear("Marta Fuentes", "operadora@elvolcan.cl", "912340001", "Operadora123", Rol.OPERADORA);
            crear("Juan Pérez", "repartidor1@elvolcan.cl", "912340002", "Repartidor123", Rol.REPARTIDOR);
            crear("Luis Muñoz", "repartidor2@elvolcan.cl", "912340003", "Repartidor123", Rol.REPARTIDOR);
            crear("Carlos Soto", "repartidor3@elvolcan.cl", "912340004", "Repartidor123", Rol.REPARTIDOR);
            crear("Camila Rojas", "cliente@correo.cl", "987654321", "Cliente123", Rol.CLIENTE);
            log.info("Usuarios de demostración creados (operadora, 3 repartidores y 1 cliente)");
        }
    }

    private void crear(String nombre, String correo, String telefono, String contrasena, Rol rol) {
        Usuario u = new Usuario();
        u.setNombre(nombre);
        u.setCorreo(correo);
        u.setTelefono(telefono);
        u.setContrasenaHash(encoder.encode(contrasena));
        u.setRol(rol);
        u.setActivo(true);
        repo.save(u);
    }
}
