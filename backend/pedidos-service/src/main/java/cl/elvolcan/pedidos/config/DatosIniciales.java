package cl.elvolcan.pedidos.config;

import cl.elvolcan.pedidos.modelo.Categoria;
import cl.elvolcan.pedidos.modelo.Producto;
import cl.elvolcan.pedidos.repositorio.CategoriaRepository;
import cl.elvolcan.pedidos.repositorio.ProductoRepository;
import java.util.LinkedHashMap;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Carga el catálogo de "Catalogo Distribuidora Gas El Volcan.xlsx" la primera vez que arranca
 * (los mismos datos que src/data/catalogo.js del frontend).
 */
@Component
public class DatosIniciales implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DatosIniciales.class);

    private final CategoriaRepository categorias;
    private final ProductoRepository productos;

    public DatosIniciales(CategoriaRepository categorias, ProductoRepository productos) {
        this.categorias = categorias;
        this.productos = productos;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (productos.count() > 0) {
            return;
        }
        Map<String, Categoria> cat = new LinkedHashMap<>();
        for (String nombre : new String[] {"Cilindros de Gas", "Reguladores", "Mangueras y Conexiones", "Accesorios"}) {
            cat.put(nombre, categorias.findByNombreIgnoreCase(nombre).orElseGet(() -> categorias.save(new Categoria(nombre))));
        }

        Categoria cilindros = cat.get("Cilindros de Gas");
        Categoria reguladores = cat.get("Reguladores");
        Categoria mangueras = cat.get("Mangueras y Conexiones");
        Categoria accesorios = cat.get("Accesorios");

        crear("CL001", cilindros, "Cilindro GLP 5 kg", 5, "Cilindro de gas licuado de petróleo 5 kg. Para uso residencial (cocina, calefacción pequeña).", "Unidad", 6500, 6000, 80);
        crear("CL002", cilindros, "Cilindro GLP 11 kg", 11, "Cilindro estándar doméstico. El más utilizado en hogares chilenos. Compatible con reguladores estándar.", "Unidad", 12000, 11000, 200);
        crear("CL003", cilindros, "Cilindro GLP 15 kg", 15, "Cilindro de mayor capacidad para hogares de alto consumo o locales pequeños.", "Unidad", 16000, 14500, 90);
        crear("CL004", cilindros, "Cilindro GLP 45 kg", 45, "Cilindro industrial. Uso comercial: restaurantes, talleres, calefacción de locales.", "Unidad", 45000, 40000, 30);
        crear("RG001", reguladores, "Regulador doméstico estándar", null, "Regulador de 1 etapa para cilindros 5, 11 y 15 kg. Presión de salida 28 mbar.", "Unidad", 8990, 8200, 45);
        crear("RG002", reguladores, "Regulador de alta presión", null, "Regulador para cocinas industriales o equipos de mayor consumo. Presión regulable.", "Unidad", 18990, 17000, 12);
        crear("RG003", reguladores, "Regulador dual (2 salidas)", null, "Permite conectar dos artefactos simultáneamente al mismo cilindro.", "Unidad", 14990, 13500, 18);
        crear("MG001", mangueras, "Manguera gas 1.5 m", null, "Manguera flexible homologada. Diámetro interior 9mm. Compatible con reguladores estándar.", "Unidad", 3990, 3500, 80);
        crear("MG002", mangueras, "Manguera gas 3 m", null, "Manguera larga para instalaciones donde el artefacto está alejado del cilindro.", "Unidad", 6990, 6200, 50);
        crear("MG003", mangueras, "Abrazadera metálica", null, "Abrazadera de acero para asegurar la conexión manguera-regulador y manguera-artefacto.", "Unidad", 990, 800, 200);
        crear("MG004", mangueras, "Kit conexión completo (regulador + manguera 1.5m + abrazaderas)", null, "Todo lo necesario para instalar un cilindro nuevo.", "Kit", 12990, 11500, 25);
        crear("AC001", accesorios, "Carro porta cilindro 11/15 kg", null, "Carro metálico con ruedas para transportar cilindros dentro del hogar con seguridad.", "Unidad", 12990, 11000, 20);
        crear("AC002", accesorios, "Tapa protectora para válvula", null, "Tapa de plástico ABS para proteger la válvula del cilindro durante el transporte.", "Unidad", 1490, 1200, 60);
        crear("AC003", accesorios, "Detector de gas a batería", null, "Sensor electroquímico. Alarma sonora y visual ante fuga de gas GLP o metano.", "Unidad", 19990, 17000, 8);
        log.info("Catálogo inicial cargado: {} productos", productos.count());
    }

    private void crear(String codigo, Categoria categoria, String nombre, Integer kg, String descripcion,
                       String unidad, int precio, int precioComercial, int stock) {
        Producto p = new Producto();
        p.setCodigo(codigo);
        p.setCategoria(categoria);
        p.setNombre(nombre);
        p.setKg(kg);
        p.setDescripcion(descripcion);
        p.setUnidad(unidad);
        p.setPrecio(precio);
        p.setPrecioComercial(precioComercial);
        p.setStock(stock);
        p.setActivo(true);
        productos.save(p);
    }
}
