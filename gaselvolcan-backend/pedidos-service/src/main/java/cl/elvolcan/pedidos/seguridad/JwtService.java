package cl.elvolcan.pedidos.seguridad;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import javax.crypto.SecretKey;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

/**
 * Este microservicio NO emite tokens: solo valida los que firma usuarios-service
 * con el mismo secreto compartido (JWT_SECRET).
 */
@Service
public class JwtService {

    private final SecretKey clave;

    public JwtService(@Value("${app.jwt.secreto}") String secreto) {
        byte[] bytes = secreto.getBytes(StandardCharsets.UTF_8);
        if (bytes.length < 32) {
            throw new IllegalStateException("JWT_SECRET debe tener al menos 32 caracteres");
        }
        this.clave = Keys.hmacShaKeyFor(bytes);
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
