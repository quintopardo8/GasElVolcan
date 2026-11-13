package cl.elvolcan.pedidos.servicio;

import cl.elvolcan.pedidos.dto.LineaRequest;
import cl.elvolcan.pedidos.dto.PedidoRequest;
import cl.elvolcan.pedidos.dto.PedidoResponse;
import cl.elvolcan.pedidos.dto.ProductoResponse;
import cl.elvolcan.pedidos.dto.ResumenResponse;
import cl.elvolcan.pedidos.modelo.EstadoPedido;
import cl.elvolcan.pedidos.modelo.LineaPedido;
import cl.elvolcan.pedidos.modelo.MetodoPago;
import cl.elvolcan.pedidos.modelo.Pedido;
import cl.elvolcan.pedidos.modelo.Producto;
import cl.elvolcan.pedidos.repositorio.PedidoRepository;
import cl.elvolcan.pedidos.repositorio.ProductoRepository;
import cl.elvolcan.pedidos.seguridad.UsuarioAutenticado;
import cl.elvolcan.pedidos.web.ApiException;
import jakarta.persistence.criteria.Predicate;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PedidoService {

    /** Comunas donde reparte la empresa (las mismas del checkout del frontend). */
    public static final Set<String> COMUNAS = Set.of(
            "Chillán", "Chillán Viejo", "Coihueco", "Pinto", "Bulnes", "San Carlos");

    /** Desde este stock se considera "stock bajo" (igual que STOCK_BAJO del frontend). */
    public static final int STOCK_BAJO = 15;

    private static final String ADMIN = "ADMINISTRADOR";
    private static final String OPERADORA = "OPERADORA";
    private static final String REPARTIDOR = "REPARTIDOR";
    private static final String CLIENTE = "CLIENTE";

    private final PedidoRepository pedidos;
    private final ProductoRepository productos;

    public PedidoService(PedidoRepository pedidos, ProductoRepository productos) {
        this.pedidos = pedidos;
        this.productos = productos;
    }

    // ---------- Consultas ----------

    /** Vista centralizada para operadora/administración, con filtros opcionales. */
    @Transactional(readOnly = true)
    public List<PedidoResponse> listar(EstadoPedido estado, LocalDate fecha, Long repartidorId) {
        Specification<Pedido> filtro = (root, query, cb) -> {
            List<Predicate> condiciones = new ArrayList<>();
            if (estado != null) {
                condiciones.add(cb.equal(root.get("estado"), estado));
            }
            if (fecha != null) {
                condiciones.add(cb.greaterThanOrEqualTo(root.get("creadoEn"), fecha.atStartOfDay()));
                condiciones.add(cb.lessThan(root.get("creadoEn"), fecha.plusDays(1).atStartOfDay()));
            }
            if (repartidorId != null) {
                condiciones.add(cb.equal(root.get("repartidorId"), repartidorId));
            }
            return cb.and(condiciones.toArray(new Predicate[0]));
        };
        return pedidos.findAll(filtro, Sort.by(Sort.Direction.DESC, "creadoEn")).stream()
                .map(PedidoResponse::de).toList();
    }

    /** Cliente: sus pedidos. Repartidor: los asignados a él. */
    @Transactional(readOnly = true)
    public List<PedidoResponse> misPedidos(UsuarioAutenticado actor) {
        List<Pedido> lista = switch (actor.rol()) {
            case CLIENTE -> pedidos.findByClienteIdOrderByCreadoEnDesc(actor.id());
            case REPARTIDOR -> pedidos.findByRepartidorIdOrderByCreadoEnDesc(actor.id());
            default -> List.of();
        };
        return lista.stream().map(PedidoResponse::de).toList();
    }

    @Transactional(readOnly = true)
    public PedidoResponse obtener(Long id, UsuarioAutenticado actor) {
        Pedido p = buscar(id);
        verificarAcceso(p, actor);
        return PedidoResponse.de(p);
    }

    @Transactional(readOnly = true)
    public ResumenResponse resumen() {
        LocalDateTime inicioDia = LocalDate.now().atStartOfDay();
        List<ProductoResponse> stockBajo = productos.findByActivoTrueAndStockLessThanEqualOrderByStockAsc(STOCK_BAJO)
                .stream().map(ProductoResponse::de).toList();
        return new ResumenResponse(
                pedidos.countByCreadoEnGreaterThanEqual(inicioDia),
                pedidos.countByEstado(EstadoPedido.PENDIENTE),
                pedidos.countByEstadoIn(List.of(EstadoPedido.ASIGNADO, EstadoPedido.EN_CAMINO)),
                pedidos.countByEstadoAndEntregadoEnGreaterThanEqual(EstadoPedido.ENTREGADO, inicioDia),
                pedidos.sumarTotalEntregadosDesde(EstadoPedido.ENTREGADO, inicioDia),
                STOCK_BAJO,
                stockBajo);
    }

    // ---------- Crear / editar / eliminar ----------

    @Transactional
    public PedidoResponse crear(PedidoRequest req, UsuarioAutenticado actor) {
        if (req.lineas() == null || req.lineas().isEmpty()) {
            throw ApiException.invalido("El pedido debe tener al menos un producto");
        }
        Pedido p = new Pedido();
        String nombre = textoONull(req.clienteNombre());
        if (CLIENTE.equals(actor.rol())) {
            p.setClienteId(actor.id());
            if (nombre == null) {
                nombre = actor.nombre();
            }
        }
        if (nombre == null) {
            throw ApiException.invalido("Indica el nombre del cliente");
        }
        p.setClienteNombre(nombre);
        aplicarDatosEntrega(p, req);
        p.setEstado(EstadoPedido.PENDIENTE);
        p.setPagado(false);
        agregarLineas(p, req.lineas());
        return PedidoResponse.de(pedidos.save(p));
    }

    @Transactional
    public PedidoResponse actualizar(Long id, PedidoRequest req) {
        Pedido p = buscar(id);
        if (p.getEstado().esFinal()) {
            throw ApiException.conflicto("No se puede editar un pedido entregado o cancelado");
        }
        String nombre = textoONull(req.clienteNombre());
        if (nombre != null) {
            p.setClienteNombre(nombre);
        }
        aplicarDatosEntrega(p, req);
        if (req.lineas() != null) {
            if (req.lineas().isEmpty()) {
                throw ApiException.invalido("El pedido debe tener al menos un producto");
            }
            if (p.getEstado() == EstadoPedido.EN_CAMINO) {
                throw ApiException.conflicto("No se pueden cambiar los productos de un pedido que ya va en camino");
            }
            devolverStock(p);
            p.getLineas().clear();
            agregarLineas(p, req.lineas());
        }
        return PedidoResponse.de(p);
    }

    @Transactional
    public PedidoResponse asignar(Long id, Long repartidorId, String repartidorNombre) {
        Pedido p = buscar(id);
        if (p.getEstado() != EstadoPedido.PENDIENTE && p.getEstado() != EstadoPedido.ASIGNADO) {
            throw ApiException.conflicto("Solo se puede asignar un pedido pendiente o reasignar uno ya asignado");
        }
        p.setRepartidorId(repartidorId);
        p.setRepartidorNombre(repartidorNombre.trim());
        p.setEstado(EstadoPedido.ASIGNADO);
        return PedidoResponse.de(p);
    }

    /**
     * Reglas por rol:
     * - Repartidor: solo sus pedidos, ASIGNADO → EN_CAMINO → ENTREGADO.
     * - Cliente: solo cancelar su pedido mientras está PENDIENTE.
     * - Operadora/Admin: cualquier cambio mientras el pedido no esté entregado o cancelado.
     * Al ENTREGAR se registra el pago; al CANCELAR se devuelve el stock.
     */
    @Transactional
    public PedidoResponse cambiarEstado(Long id, EstadoPedido nuevo, UsuarioAutenticado actor) {
        Pedido p = buscar(id);
        EstadoPedido actual = p.getEstado();
        verificarAcceso(p, actor);
        if (actual == nuevo) {
            return PedidoResponse.de(p);
        }
        if (actual.esFinal()) {
            throw ApiException.conflicto("El pedido ya fue " + (actual == EstadoPedido.ENTREGADO ? "entregado" : "cancelado") + " y no puede cambiar de estado");
        }
        switch (actor.rol()) {
            case REPARTIDOR -> {
                boolean permitido = (actual == EstadoPedido.ASIGNADO && nuevo == EstadoPedido.EN_CAMINO)
                        || (actual == EstadoPedido.EN_CAMINO && nuevo == EstadoPedido.ENTREGADO);
                if (!permitido) {
                    throw ApiException.conflicto("Como repartidor solo puedes marcar el pedido \"en camino\" y luego \"entregado\"");
                }
            }
            case CLIENTE -> {
                if (!(actual == EstadoPedido.PENDIENTE && nuevo == EstadoPedido.CANCELADO)) {
                    throw ApiException.conflicto("Solo puedes cancelar tu pedido mientras está pendiente");
                }
            }
            case ADMIN, OPERADORA -> {
                if (nuevo == EstadoPedido.PENDIENTE) {
                    // Vuelve a la cola sin repartidor.
                    p.setRepartidorId(null);
                    p.setRepartidorNombre(null);
                } else if (nuevo != EstadoPedido.CANCELADO && p.getRepartidorId() == null) {
                    throw ApiException.conflicto("Primero asigna un repartidor al pedido");
                }
            }
            default -> throw new ApiException(HttpStatus.FORBIDDEN, "No tienes permisos para cambiar el estado");
        }
        if (nuevo == EstadoPedido.CANCELADO) {
            devolverStock(p);
        }
        if (nuevo == EstadoPedido.ENTREGADO) {
            p.setPagado(true);
            p.setEntregadoEn(LocalDateTime.now());
        }
        p.setEstado(nuevo);
        return PedidoResponse.de(p);
    }

    @Transactional
    public void eliminar(Long id) {
        Pedido p = buscar(id);
        if (!p.getEstado().esFinal()) {
            devolverStock(p);
        }
        pedidos.delete(p);
    }

    // ---------- Apoyo ----------

    private void verificarAcceso(Pedido p, UsuarioAutenticado actor) {
        boolean permitido = switch (actor.rol()) {
            case ADMIN, OPERADORA -> true;
            case REPARTIDOR -> actor.id().equals(p.getRepartidorId());
            case CLIENTE -> actor.id().equals(p.getClienteId());
            default -> false;
        };
        if (!permitido) {
            throw new ApiException(HttpStatus.FORBIDDEN, "No tienes acceso a este pedido");
        }
    }

    private void aplicarDatosEntrega(Pedido p, PedidoRequest req) {
        String comuna = req.comuna().trim();
        if (!COMUNAS.contains(comuna)) {
            throw ApiException.invalido("Comuna no válida. Repartimos en: " + String.join(", ", COMUNAS));
        }
        p.setTelefono(normalizarTelefono(req.telefono()));
        p.setCalle(req.calle().trim());
        p.setDepto(textoONull(req.depto()));
        p.setComuna(comuna);
        p.setReferencia(textoONull(req.referencia()));
        p.setFranja(textoONull(req.franja()));
        p.setMetodoPago(req.metodoPago() == null ? MetodoPago.EFECTIVO : req.metodoPago());
    }

    /** Valida productos y stock, descuenta el stock y recalcula el total. */
    private void agregarLineas(Pedido p, List<LineaRequest> lineas) {
        Map<String, Integer> cantidades = new LinkedHashMap<>();
        for (LineaRequest l : lineas) {
            cantidades.merge(l.codigo().trim().toUpperCase(Locale.ROOT), l.cantidad(), Integer::sum);
        }
        cantidades.forEach((codigo, cantidad) -> {
            Producto producto = productos.findById(codigo)
                    .orElseThrow(() -> ApiException.invalido("No existe el producto " + codigo));
            if (!producto.isActivo()) {
                throw ApiException.invalido("El producto " + producto.getNombre() + " no está disponible");
            }
            if (producto.getStock() < cantidad) {
                throw ApiException.conflicto("Stock insuficiente de " + producto.getNombre() + " (quedan " + producto.getStock() + ")");
            }
            producto.setStock(producto.getStock() - cantidad);
            p.getLineas().add(new LineaPedido(p, producto, cantidad, producto.getPrecio()));
        });
        p.recalcularTotal();
    }

    private void devolverStock(Pedido p) {
        for (LineaPedido l : p.getLineas()) {
            Producto producto = l.getProducto();
            producto.setStock(producto.getStock() + l.getCantidad());
        }
    }

    private Pedido buscar(Long id) {
        return pedidos.findById(id).orElseThrow(() -> ApiException.noEncontrado("No existe el pedido " + id));
    }

    /** Acepta 912345678, +56912345678, "9 1234 5678"... y guarda solo los 9 dígitos. */
    private static String normalizarTelefono(String telefono) {
        String digitos = telefono == null ? "" : telefono.replaceAll("\\D", "");
        if (digitos.length() == 11 && digitos.startsWith("569")) {
            digitos = digitos.substring(2);
        }
        if (digitos.length() != 9 || !digitos.startsWith("9")) {
            throw ApiException.invalido("Ingresa un celular chileno válido (ej: 912345678)");
        }
        return digitos;
    }

    private static String textoONull(String texto) {
        return texto == null || texto.isBlank() ? null : texto.trim();
    }
}
