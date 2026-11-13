package cl.elvolcan.pedidos.dto;

import cl.elvolcan.pedidos.modelo.Categoria;

public record CategoriaResponse(Long id, String nombre) {

    public static CategoriaResponse de(Categoria c) {
        return new CategoriaResponse(c.getId(), c.getNombre());
    }
}
