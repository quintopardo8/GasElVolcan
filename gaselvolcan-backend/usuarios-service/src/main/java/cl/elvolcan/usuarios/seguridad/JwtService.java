package cl.elvolcan.usuarios.seguridad;

import cl.elvolcan.usuarios.modelo.Usuario;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Crea y valida los tokens JWT (HMAC). El mismo secreto se configura en
 * pedidos-service para que ese microservicio pueda validar los tokens sin llamar a este.
 */
@Service
public class JwtService {

    private final SecretKey clave;
    private final long minutosValidez;

    public JwtService(@Value("${app.jwt.secreto}") String secreto,
                      @Value("${app.jwt.minutos}") long minutosValidez) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
        this.minutosValidez = minutosValidez;
    }

    public String generar(Usuario usuario) {
        Instant ahora = Instant.now();
        return Jwts.builder()
                .subject(String.valueOf(usuario.getId()))
                .claim("correo", usuario.getCorreo())
                .claim("nombre", usuario.getNombre())
                .claim("rol", usuario.getRol().name())
                .issuedAt(Date.from(ahora))
                .expiration(Date.from(ahora.plus(minutosValidez, ChronoUnit.MINUTES)))
                .signWith(clave)
                .compact();
    }

    /** Lanza JwtException si el token es inválido, está alterado o expiró. */
    public UsuarioAutenticado leer(String token) {
        Claims claims = Jwts.parser().verifyWith(clave).build().parseSignedClaims(token).getPayload();
        return new UsuarioAutenticado(
                Long.valueOf(claims.getSubject()),
                claims.get("correo", String.class),
                claims.get("nombre", String.class),
                claims.get("rol", String.class));
    }
}
