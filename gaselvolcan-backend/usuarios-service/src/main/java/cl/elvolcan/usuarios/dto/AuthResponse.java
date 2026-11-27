package cl.elvolcan.usuarios.dto;

public record AuthResponse(String token, UsuarioResponse usuario) {
}
