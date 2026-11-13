package cl.elvolcan.pedidos.web;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.LocalDateTime;
import java.util.Map;
import org.springframework.http.HttpStatus;

/** Formato JSON único para todos los errores de la API. */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record RespuestaError(
        int estado,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> campos,
        LocalDateTime fecha) {

    public static RespuestaError de(HttpStatus estado, String mensaje, String ruta, Map<String, String> campos) {
        return new RespuestaError(estado.value(), estado.getReasonPhrase(), mensaje, ruta, campos, LocalDateTime.now());
    }
}
