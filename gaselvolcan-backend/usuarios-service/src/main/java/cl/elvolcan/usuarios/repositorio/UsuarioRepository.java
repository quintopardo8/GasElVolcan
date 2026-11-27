package cl.elvolcan.usuarios.repositorio;

import cl.elvolcan.usuarios.modelo.Rol;
import cl.elvolcan.usuarios.modelo.Usuario;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByCorreo(String correo);

    boolean existsByCorreo(String correo);

    boolean existsByCorreoAndIdNot(String correo, Long id);

    List<Usuario> findAllByOrderByNombreAsc();

    List<Usuario> findByRolOrderByNombreAsc(Rol rol);

    List<Usuario> findByRolAndActivoTrueOrderByNombreAsc(Rol rol);

    long countByRolAndActivoTrue(Rol rol);
}
