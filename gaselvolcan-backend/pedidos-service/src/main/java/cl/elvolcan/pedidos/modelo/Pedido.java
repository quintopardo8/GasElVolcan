package cl.elvolcan.pedidos.modelo;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.OneToMany;
import jakarta.persistence.OrderBy;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "pedidos", indexes = {
        @Index(name = "idx_pedidos_estado", columnList = "estado"),
        @Index(name = "idx_pedidos_creado_en", columnList = "creado_en"),
        @Index(name = "idx_pedidos_cliente", columnList = "cliente_id"),
        @Index(name = "idx_pedidos_repartidor", columnList = "repartidor_id")
})
public class Pedido {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Id del usuario cliente en usuarios-service (null si la operadora lo tomó por teléfono). */
    @Column(name = "cliente_id")
    private Long clienteId;

    /** Datos de contacto para ESTA entrega. */
    @Column(name = "cliente_nombre", nullable = false, length = 100)
    private String clienteNombre;

    @Column(nullable = false, length = 15)
    private String telefono;

    @Column(nullable = false, length = 150)
    private String calle;

    @Column(length = 50)
    private String depto;

    @Column(nullable = false, length = 40)
    private String comuna;

    @Column(length = 200)
    private String referencia;

    /** Franja horaria preferida (texto libre, ej: "Mañana (9:00 - 13:00)"). */
    @Column(length = 40)
    private String franja;

    @Enumerated(EnumType.STRING)
    @Column(name = "metodo_pago", nullable = false, length = 20, columnDefinition = "varchar(20)")
    private MetodoPago metodoPago;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, columnDefinition = "varchar(20)")
    private EstadoPedido estado;

    /** Id del usuario repartidor en usuarios-service. */
    @Column(name = "repartidor_id")
    private Long repartidorId;

    @Column(name = "repartidor_nombre", length = 100)
    private String repartidorNombre;

    @Column(nullable = false)
    private int total;

    /** Se marca automáticamente al confirmar la entrega. */
    @Column(nullable = false)
    private boolean pagado;

    @Column(name = "creado_en", nullable = false, updatable = false)
    private LocalDateTime creadoEn;

    @Column(name = "actualizado_en", nullable = false)
    private LocalDateTime actualizadoEn;

    @Column(name = "entregado_en")
    private LocalDateTime entregadoEn;

    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("id")
    private List<LineaPedido> lineas = new ArrayList<>();

    @PrePersist
    void alCrear() {
        creadoEn = LocalDateTime.now();
        actualizadoEn = creadoEn;
    }

    @PreUpdate
    void alActualizar() {
        actualizadoEn = LocalDateTime.now();
    }

    public void recalcularTotal() {
        total = lineas.stream().mapToInt(LineaPedido::getSubtotal).sum();
    }

    /** Código visible para el cliente, ej: EV-00042. */
    public String getCodigo() {
        return id == null ? null : String.format("EV-%05d", id);
    }

    public Long getId() { return id; }
    public Long getClienteId() { return clienteId; }
    public void setClienteId(Long clienteId) { this.clienteId = clienteId; }
    public String getClienteNombre() { return clienteNombre; }
    public void setClienteNombre(String clienteNombre) { this.clienteNombre = clienteNombre; }
    public String getTelefono() { return telefono; }
    public void setTelefono(String telefono) { this.telefono = telefono; }
    public String getCalle() { return calle; }
    public void setCalle(String calle) { this.calle = calle; }
    public String getDepto() { return depto; }
    public void setDepto(String depto) { this.depto = depto; }
    public String getComuna() { return comuna; }
    public void setComuna(String comuna) { this.comuna = comuna; }
    public String getReferencia() { return referencia; }
    public void setReferencia(String referencia) { this.referencia = referencia; }
    public String getFranja() { return franja; }
    public void setFranja(String franja) { this.franja = franja; }
    public MetodoPago getMetodoPago() { return metodoPago; }
    public void setMetodoPago(MetodoPago metodoPago) { this.metodoPago = metodoPago; }
    public EstadoPedido getEstado() { return estado; }
    public void setEstado(EstadoPedido estado) { this.estado = estado; }
    public Long getRepartidorId() { return repartidorId; }
    public void setRepartidorId(Long repartidorId) { this.repartidorId = repartidorId; }
    public String getRepartidorNombre() { return repartidorNombre; }
    public void setRepartidorNombre(String repartidorNombre) { this.repartidorNombre = repartidorNombre; }
    public int getTotal() { return total; }
    public boolean isPagado() { return pagado; }
    public void setPagado(boolean pagado) { this.pagado = pagado; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public LocalDateTime getActualizadoEn() { return actualizadoEn; }
    public LocalDateTime getEntregadoEn() { return entregadoEn; }
    public void setEntregadoEn(LocalDateTime entregadoEn) { this.entregadoEn = entregadoEn; }
    public List<LineaPedido> getLineas() { return lineas; }
}
