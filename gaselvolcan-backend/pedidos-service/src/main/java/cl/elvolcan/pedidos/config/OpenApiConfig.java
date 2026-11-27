package cl.elvolcan.pedidos.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Documentación OpenAPI 3 (Swagger UI en /swagger-ui.html, JSON en /v3/api-docs).
 * Define el esquema "bearerAuth" para que el botón "Authorize" de Swagger
 * adjunte "Authorization: Bearer &lt;token&gt;" en cada llamada de prueba.
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI documentacion() {
        return new OpenAPI()
                .info(new Info()
                        .title("Gas El Volcán · pedidos-service")
                        .version("1.0.0")
                        .description("Catálogo (categorías y productos), pedidos y reportes. GET de productos y categorías es público; crear, editar y eliminar exige rol ADMINISTRADOR.")
                        .contact(new Contact().name("Distribuidora de Gas El Volcán")))
                .components(new Components().addSecuritySchemes("bearerAuth", new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Pega aquí el token que devuelve POST /api/auth/login (sin la palabra Bearer).")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
