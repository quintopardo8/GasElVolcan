package cl.elvolcan.pedidos.modelo;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Version;

@Entity
@Table(name = "productos")
public class Producto {

    /** Código del catálogo (ej: CL002). */
    @Id
    @Column(length = 10)
    private String codigo;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "categoria_id", nullable = false)
    private Categoria categoria;

    @Column(nullable = false, length = 120)
    private String nombre;

    @Column(length = 500)
    private String descripcion;

    @Column(nullable = false, length = 20)
    private String unidad;

    /** Capacidad en kg (solo cilindros). */
    private Integer kg;

    /** Precio residencial en CLP. */
    @Column(nullable = false)
    private int precio;

    @Column(name = "precio_comercial", nullable = false)
    private int precioComercial;

    @Column(nullable = false)
    private int stock;

    @Column(nullable = false)
    private boolean activo = true;

    /** Bloqueo optimista: evita que dos pedidos simultáneos descuenten mal el stock. */
    @Version
    private Long version;

    public String getCodigo() { return codigo; }
    public void setCodigo(String codigo) { this.codigo = codigo; }
    public Categoria getCategoria() { return categoria; }
    public void setCategoria(Categoria categoria) { this.categoria = categoria; }
    public String getNombre() { return nombre; }
    public void setNombre(String nombre) { this.nombre = nombre; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getUnidad() { return unidad; }
    public void setUnidad(String unidad) { this.unidad = unidad; }
    public Integer getKg() { return kg; }
    public void setKg(Integer kg) { this.kg = kg; }
    public int getPrecio() { return precio; }
    public void setPrecio(int precio) { this.precio = precio; }
    public int getPrecioComercial() { return precioComercial; }
    public void setPrecioComercial(int precioComercial) { this.precioComercial = precioComercial; }
    public int getStock() { return stock; }
    public void setStock(int stock) { this.stock = stock; }
    public boolean isActivo() { return activo; }
    public void setActivo(boolean activo) { this.activo = activo; }
    public Long getVersion() { return version; }
}
