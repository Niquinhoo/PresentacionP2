# Guía de Estudio: Teoría ↔ Código del Proyecto RestoManager

## Cómo usar esta guía
Cada sección corresponde a un capítulo de teoría. Primero se explica el concepto teórico y luego se muestra **dónde y cómo se aplica** en el código del proyecto.

---

## CH1: POO - Clases, Objetos, Constructores, Encapsulación

### Teoría
- **Clase**: molde/plantilla que define atributos y métodos
- **Objeto**: instancia única de una clase
- **Constructor**: método especial que inicializa el objeto
- **Encapsulación**: ocultar datos con `private` y exponer con getters/setters
- **Paquetes**: organizan clases (convención dominio invertido: `com.restaurant.backend.*`)
- **Modificadores de acceso**: `public`, `private`, `protected`, default (package-private)
- **Miembros static**: pertenecen a la clase, no a la instancia
- **Sobrecarga de métodos**: mismo nombre, distintos parámetros

### En el código

**Clases modelo** (`Backend/src/main/java/com/restaurant/backend/model/`):
```java
// Producto.java - Clase con encapsulación total
public class Producto {
    private Integer idProducto;      // Campo private (encapsulación)
    private String nombre;
    private BigDecimal precio;
    private Categoria categoria;
    private boolean disponible;

    public Producto() {              // Constructor sin args
        this.precio = BigDecimal.ZERO;
        this.disponible = true;
    }

    public Producto(Integer idProducto, String nombre, ...) {  // Constructor sobrecargado
        this.idProducto = idProducto;
        this.nombre = nombre;
        // ...
    }

    public String getNombre() { return nombre; }   // Getter
    public void setNombre(String nombre) { this.nombre = nombre; }  // Setter
}
```

**Paquetes** - El proyecto usa la estructura de paquetes exacta que explica la teoría:
```
com.restaurant.backend
    ├── model/       → Entidades (Producto, Mesa, Pedido...)
    ├── dao/         → Data Access Objects
    ├── service/     → Lógica de negocio
    ├── controller/  → Punto de entrada para la GUI
    └── util/        → Conexión a DB
```

**Miembros static** - `ConexionDB.java`:
```java
public final class ConexionDB {
    private static volatile ConexionDB instance;  // Campo static
    private final HikariDataSource dataSource;

    private ConexionDB() { ... }  // Constructor privado (Singleton)

    public static ConexionDB getInstance() {  // Método static
        // Double-checked locking
    }
}
```

**Sobrecarga de métodos** - `ProductoDAOImpl.java`:
```java
public String insertar() { return "Debe indicar un producto"; }  // Sin args
public String insertar(Producto producto) { /* INSERT real */ }  // Con producto

public String eliminar() { return "Debe indicar el id"; }        // Sin args
public String eliminar(int id) { /* DELETE real */ }              // Con id

public String editar() { return "Debe indicar un producto"; }    // Sin args
public String editar(Producto producto) { /* UPDATE real */ }     // Con producto
```

---

## CH2: POO Parte 2 - Herencia, Interfaces, Polimorfismo, Abstractas

### Teoría
- **Herencia** (`extends`): una clase hereda de otra (única en Java)
- **Interfaces** (`implements`): contrato que define métodos a implementar
- **Clases abstractas**: no se pueden instanciar, pueden tener métodos abstractos y concretos
- **Polimorfismo**: misma interfaz, diferentes implementaciones
- **Casting**: `(Tipo) objeto`, `instanceof`
- **Encapsulación**: datos privados, acceso mediante métodos públicos

### En el código

**Interfaces DAO** - El patrón DAO es un excelente ejemplo de interfaces:
```java
// MesaDAO.java - Interfaz (contrato)
public interface MesaDAO {
    String nuevaMesa(Mesa mesa);
    String borrarMesa(int id);
    String cambiarEstado(int id, EstadoMesa estado);
    List<Mesa> getMesas();
    Mesa getMesaPorId(int id);
}

// MesaDAOImpl.java - Implementación concreta
public class MesaDAOImpl implements MesaDAO {
    @Override
    public String nuevaMesa(Mesa mesa) {
        // ... lógica JDBC
    }
    // ... resto de métodos
}
```

**Todas las interfaces DAO y sus implementaciones** siguen el mismo patrón:
| Interfaz | Implementación |
|----------|---------------|
| `CategoriaDAO` | `CategoriaDAOImpl` |
| `MesaDAO` | `MesaDAOImpl` |
| `PedidoDAO` | `PedidoDAOImpl` |
| `ProductoDAO` | `ProductoDAOImpl` |
| `ReporteDAO` | `ReporteDAOImpl` |
| `UsuarioDAO` | `UsuarioDAOImpl` |

**Inyección de dependencias por constructor** (polimorfismo en acción):
```java
// ProductoService.java - Acepta cualquier implementación de ProductoDAO
public class ProductoService {
    private final ProductoDAO productoDAO;

    public ProductoService() {
        this(new ProductoDAOImpl());  // Default
    }

    public ProductoService(ProductoDAO productoDAO) {  // Inyección
        this.productoDAO = productoDAO;
    }
}
```

**Instanceof** - Aunque no se usa directamente en el backend, el concepto es clave para el patrón state machine en `MesaService.esTransicionPermitida()`.

---

## CH3: Records y Enums

### Teoría
- **Records**: clases inmutables que generan automáticamente constructor, getters, `equals()`, `hashCode()`, `toString()`
- **Enums**: tipo especial para constantes predefinidas con campos y métodos

### En el código

**Enums en el modelo** (`model/`):
```java
// EstadoMesa.java
public enum EstadoMesa {
    LIBRE, OCUPADA, RESERVADA, FUERA_DE_SERVICIO
}

// EstadoPedido.java
public enum EstadoPedido {
    ABIERTO, EN_COCINA, LISTO, CERRADO, CANCELADO
}
```

**Uso de enums en switch/lógica de negocio** (`MesaService.java`):
```java
private boolean esTransicionPermitida(EstadoMesa actual, EstadoMesa nuevo) {
    if (actual == nuevo) {
        return true;
    }

    return switch (actual) {
        case LIBRE -> nuevo == EstadoMesa.OCUPADA
                   || nuevo == EstadoMesa.RESERVADA
                   || nuevo == EstadoMesa.FUERA_DE_SERVICIO;
        case RESERVADA -> nuevo == EstadoMesa.OCUPADA 
                       || nuevo == EstadoMesa.LIBRE;
        case OCUPADA -> nuevo == EstadoMesa.LIBRE;
        case FUERA_DE_SERVICIO -> nuevo == EstadoMesa.LIBRE;
    };
}
```

**DTOs vs Records** - Actualmente en el proyecto los DTOs se definen como clases convencionales para el transporte de datos, pero **son candidatos ideales para convertirse en `record`** de Java 16+ ya que son contenedores de datos inmutables sin lógica compleja.

*Clase DTO convencional:*
```java
// VentaPorProductoDTO.java
public class VentaPorProductoDTO {
    private int idProducto;
    private String producto;
    private String categoria;
    private long unidadesVendidas;
    private BigDecimal totalRecaudado;
    // constructor, getters, setters
}
```

*Refactorización equivalente usando `record` (ideal por inmutabilidad, concisión y auto-generación de constructores, getters, equals, hashCode y toString):*
```java
public record VentaPorProductoDTO(
    int idProducto,
    String producto,
    String categoria,
    long unidadesVendidas,
    BigDecimal totalRecaudado
) {}
```

---

## CH4: Tipos de Datos, Wrappers, Operadores

### Teoría
- **Primitivos**: `int`, `double`, `boolean`, `long`, etc.
- **Wrappers**: `Integer`, `Double`, `Boolean` (autoboxing/unboxing)
- **Operadores**: aritméticos, comparación, lógicos, asignación
- **Precedencia**: `*` antes que `+`, paréntesis para cambiar orden
- **String y StringBuilder**: manipulación de texto

### En el código

**Uso de primitivas y wrappers** - En todo el modelo:
```java
public class Producto {
    private Integer idProducto;    // Wrapper (puede ser null en DB)
    private int stock;             // Primitiva
    private BigDecimal precio;     // Clase para precisión decimal
    private boolean disponible;    // Primitiva
}
```

**BigDecimal para cálculos monetarios** (`DetallePedido.java`):
```java
public void recalcularSubtotal() {
    if (precioUnitario == null) {
        subtotal = BigDecimal.ZERO;
        return;
    }
    subtotal = precioUnitario.multiply(BigDecimal.valueOf(cantidad));
}
```

**Operadores y autoboxing** - En `Pedido.java`:
```java
public void recalcularTotal() {
    total = detalles.stream()
            .map(DetallePedido::getSubtotal)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);  // Operación de reducción
}
```

**String** - En validaciones (`ProductoDAOImpl.java`):
```java
private String validarProducto(Producto producto, boolean requiereId) {
    if (requiereId && (producto.getIdProducto() == null || producto.getIdProducto() <= 0))
        return "ID de producto inválido";
    if (producto.getNombre() == null || producto.getNombre().isBlank())
        return "El nombre del producto es obligatorio";
    // ...
}
```

---

## CH5: Control de Flujo - if/else, switch, bucles

### Teoría
- **if/else**: ejecución condicional
- **switch**: múltiples caminos según valor (switch expression con `->`)
- **while/do-while**: bucles con condición
- **for/for-each**: iteración con contador o sobre colecciones
- **break/continue**: interrumpir o saltar iteraciones

### En el código

**Switch expression** (Java 14+) - `MesaService.java`:
```java
private boolean esTransicionPermitida(EstadoMesa actual, EstadoMesa nuevo) {
    return switch (actual) {           // Switch expression con ->
        case LIBRE -> /* ... */;
        case OCUPADA -> nuevo == EstadoMesa.LIBRE;
        case RESERVADA -> /* ... */;
        case FUERA_DE_SERVICIO -> nuevo == EstadoMesa.LIBRE;
    };
}
```

**if/else** - `MesaService.liberar()`:
```java
public String liberar(int mesaId) {
    Mesa mesa = mesaDAO.getMesaPorId(mesaId);
    if (mesa == null) return "Mesa no encontrada";
    if (mesa.getEstado() == EstadoMesa.LIBRE) return "La mesa ya está libre";

    for (Pedido pedido : pedidoDAO.getPedidosPorMesa(mesaId)) {   // for-each
        if (ESTADOS_PEDIDO_ACTIVO.contains(pedido.getEstado())) {  // if
            pedidoDAO.ModificarEstado(pedido.getIdPedido(), EstadoPedido.CERRADO);
        }
    }
    return mesaDAO.cambiarEstado(mesaId, EstadoMesa.LIBRE);
}
```

**Bucle for-each con stream** - `PedidoService.crearPedido()`:
```java
for (DetallePedido detalle : detalles) {   // for-each
    Producto producto = productoService.obtenerPorId(detalle.getProducto().getIdProducto());
    if (producto == null) return "Producto no encontrado: " + detalle.getProducto().getNombre();
    String validacionStock = productoService.validarStockDisponible(
        producto.getIdProducto(), detalle.getCantidad());
    if (validacionStock != null) return validacionStock;
}
```

---

## CH6: Arrays, Genéricos y Colecciones

### Teoría
- **Arrays**: tamaño fijo, acceso por índice
- **Genéricos**: `<T>` parámetros de tipo, type safety
- **Colecciones**: List, Set, Map, Deque, Queue
- **ArrayList, HashSet, HashMap**: implementaciones principales
- **Comparable vs Comparator**: orden natural vs personalizado
- **Collections.sort()**, **binarySearch()**

### En el código

**List y ArrayList** - En todas las capas:
```java
// CategoriaDAOImpl.java
public List<Categoria> getCategorias() {
    List<Categoria> categorias = new ArrayList<>();  // Generic: List<Categoria>
    // ...
    while (rs.next()) {
        Categoria c = new Categoria();
        // mapeo...
        categorias.add(c);
    }
    return categorias;
}
```

**List + Genéricos en Pedido**:
```java
public class Pedido {
    private final List<DetallePedido> detalles;  // Lista genérica tipada

    public Pedido() {
        this.detalles = new ArrayList<>();
    }

    public void agregarDetalle(DetallePedido detalle) { detalles.add(detalle); }
    public void quitarDetalle(DetallePedido detalle) { detalles.remove(detalle); }
}
```

**EnumSet** (colección especializada para enums) - `MesaService.java`:
```java
private static final Set<EstadoMesa> ESTADOS_OCUPABLES =
    EnumSet.of(EstadoMesa.LIBRE, EstadoMesa.RESERVADA);  // Set con genéricos

private static final Set<EstadoPedido> ESTADOS_PEDIDO_ACTIVO =
    EnumSet.of(EstadoPedido.ABIERTO, EstadoPedido.EN_COCINA, EstadoPedido.LISTO);
```

**Colecciones en la GUI** - `Menu.java`:
```java
Map<JPanel, String> panelesCategoria = new HashMap<>();  // HashMap
// ...
```

**Arrays** - Reportes:
```java
// ReporteDAOImpl.java - Uso de arrays para agrupar resultados
// Las vistas SQL devuelven resultados que se mapean a listas de DTOs
```

---

## CH7: Manejo de Excepciones

### Teoría
- **try/catch/finally**: capturar y manejar errores
- **try-with-resources**: auto-close de recursos (AutoCloseable)
- **Checked vs Unchecked**: las checked se deben declarar con `throws`
- **Excepciones personalizadas**: extender `Exception` o `RuntimeException`
- **Multi-catch**: `catch (Tipo1 | Tipo2 e)`

### En el código

**Try-with-resources** (Java 7+) - En todos los DAOs:
```java
// CategoriaDAOImpl.java
@Override
public List<Categoria> getCategorias() {
    List<Categoria> categorias = new ArrayList<>();
    String sql = "SELECT * FROM categorias WHERE activa = TRUE ORDER BY nombre";
    try (Connection conn = DatabaseConnection.getConnection();   // AutoCloseable
         PreparedStatement ps = conn.prepareStatement(sql);
         ResultSet rs = ps.executeQuery()) {
        while (rs.next()) {
            // mapeo...
        }
    } catch (SQLException ex) {         // Catch checked exception
        System.out.println("Error al obtener categorias: " + ex.getMessage());
    }
    return categorias;
}
```

**Transacciones con rollback** - `PedidoDAOImpl.java`:
```java
public String Insertar(Pedido p, List<DetallePedido> detalles) {
    Connection conn = null;
    try {
        conn = DatabaseConnection.getConnection();
        conn.setAutoCommit(false);     // Inicio de transacción

        // INSERT pedido...
        // INSERT detalles...

        conn.commit();                  // Commit si todo ok
    } catch (SQLException ex) {
        if (conn != null) {
            try { conn.rollback(); } catch (SQLException ex2) { /* log */ }
        }
        return "Error al insertar pedido: " + ex.getMessage();
    }
}
```

**Excepción no soportada** (Unchecked) - `MesaDAOImpl.java`:
```java
@Override
public String borrarMesa(int id) {
    throw new UnsupportedOperationException("Unimplemented method 'borrarMesa'");
    // RuntimeException - no obliga a quien llama a capturarla
}
```

**Validación + excepción** - `ProductoDAOImpl.java`:
```java
private String validarProducto(Producto producto, boolean requiereId) {
    // No lanza excepciones, devuelve String de error (approach alternativo válido)
    if (producto.getNombre() == null || producto.getNombre().isBlank())
        return "El nombre del producto es obligatorio";
    return null; // null = validación exitosa
}
```

**Manejo de excepciones en la GUI** - `Login.java`:
```java
AsyncDataLoader.load(this,
    () -> ServicioFactory.getUsuarioService().iniciarSesion(nombreUsuario, contrasena),
    usuarioAutenticado -> { /* éxito */ },
    error -> JOptionPane.showMessageDialog(this, "Error de conexión: " + error.getMessage())
);
```

---

## CH8: Interfaces Funcionales y Lambdas

### Teoría
- **FunctionalInterface**: interfaz con un solo método abstracto
- **Lambda**: `(params) -> expresión` o `(params) -> { sentencias; }`
- **Method references**: `Clase::metodo`
- **Built-in**: `Predicate<T>`, `Consumer<T>`, `Function<T,R>`, `Supplier<T>`

### En el código

**Uso de lambda con streams** - `Pedido.java`:
```java
public void recalcularTotal() {
    total = detalles.stream()
            .map(DetallePedido::getSubtotal)      // Method reference
            .filter(Objects::nonNull)             // Predicate (lambda)
            .reduce(BigDecimal.ZERO, BigDecimal::add);  // Reducción con method reference
}
```

**Lambda en AsyncDataLoader** (GUI) - Uso de `Callable<T>` (interfaz funcional):
```java
// AsyncDataLoader.java - Recibe Callable (FI) y Consumer (FI)
public static <T> void load(Component component, Callable<T> task, Consumer<T> onSuccess) {
    // ...
}

// Uso en MesasPanel.java:
AsyncDataLoader.load(this,
    () -> ServicioFactory.getMesaService().listar(),      // Lambda: Callable<List<Mesa>>
    this::colorearBotonesMesas                             // Method reference: Consumer
);

AsyncDataLoader.execute(this,
    () -> mesaService.ocupar(id),                          // Lambda: Callable<String>
    res -> JOptionPane.showMessageDialog(this, res)        // Lambda: Consumer<String>
);
```

**Lambda en CardProducto** - Patrón Observer con interfaz funcional:
```java
// CardProducto.java - Interfaz funcional personalizada
public interface OnAgregarListener {
    void onAgregar(String nombre, double precio);   // Único método abstracto
}

// Uso con lambda en Menu.java:
cardProducto.setOnAgregarListener((nombre, precio) -> agregarProductoTabla(nombre, precio));
```

**Comparator con lambda** - Aunque no explícito en el proyecto, el patrón está presente en la ordenación:
```java
// Conceptualmente, se podría ordenar con:
productos.sort((p1, p2) -> p1.getNombre().compareTo(p2.getNombre()));
```

---

## CH9: Streams API

### Teoría
- **Stream**: pipeline de operaciones sobre datos (no almacena, no reutiliza)
- **Operaciones intermedias**: `filter()`, `map()`, `sorted()`, `distinct()`
- **Operaciones terminales**: `collect()`, `forEach()`, `reduce()`, `count()`
- **Collectors**: `toList()`, `groupingBy()`, `partitioningBy()`
- **Optional**: contenedor para valores que pueden ser null

### En el código

**Stream con filter, map, reduce** - `Pedido.java`:
```java
public void recalcularTotal() {
    total = detalles.stream()                          // Crear stream
            .map(DetallePedido::getSubtotal)           // Intermedia: transformar
            .filter(Objects::nonNull)                  // Intermedia: filtrar
            .reduce(BigDecimal.ZERO, BigDecimal::add); // Terminal: reducir
}
```

**Stream en MesaService** (implícito en bucles for-each):
```java
public String liberar(int mesaId) {
    // Podría reescribirse con streams:
    pedidoDAO.getPedidosPorMesa(mesaId).stream()
        .filter(p -> ESTADOS_PEDIDO_ACTIVO.contains(p.getEstado()))
        .forEach(p -> pedidoDAO.ModificarEstado(p.getIdPedido(), EstadoPedido.CERRADO));
}
```

**Optional** - Aunque el proyecto no usa `Optional` explícitamente, el patrón de null-checking es equivalente:
```java
// En lugar de Optional, el proyecto retorna null y lo verifica:
Mesa mesa = mesaDAO.getMesaPorId(id);
if (mesa == null) return "Mesa no encontrada";
```

---

## CH10: Concurrencia y Multithreading

### Teoría
- **Threads**: hilos de ejecución paralelos
- **SwingWorker**: para tareas en background en Swing
- **ExecutorService**: pool de hilos
- **Virtual threads** (Java 21): hilos livianos
- **Thread-safe**: synchronized, volatile, atomic, locks
- **Race condition, deadlock, starvation**

### En el código

**AsyncDataLoader con SwingWorker** (patrón de concurrencia en GUI):
```java
public class AsyncDataLoader {
    public static <T> void load(Component component, Callable<T> task, Consumer<T> onSuccess) {
        Window window = SwingUtilities.getWindowAncestor(component);
        component.setEnabled(false);
        if (window != null) window.setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));

        new SwingWorker<T, Void>() {           // SwingWorker = thread background
            @Override
            protected T doInBackground() {     // Ejecuta en otro hilo
                return task.call();
            }

            @Override
            protected void done() {            // Vuelve al EDT (Event Dispatch Thread)
                component.setEnabled(true);
                if (window != null) window.setCursor(Cursor.getDefaultCursor());
                try {
                    T result = get();
                    onSuccess.accept(result);
                } catch (Exception e) {
                    // error handling
                }
            }
        }.execute();
    }
}
```

**Singleton thread-safe (Double-checked locking)** - `ConexionDB.java`:
```java
public static ConexionDB getInstance() {
    ConexionDB result = instance;
    if (result == null) {                               // Primera verificación
        synchronized (ConexionDB.class) {               // Bloqueo (thread-safe)
            result = instance;
            if (result == null) {                       // Segunda verificación
                instance = result = new ConexionDB();
            }
        }
    }
    return result;
}
```

**Singleton thread-safe en ServicioFactory**:
```java
public static ProductoService getProductoService() {
    ProductoService result = productoService;
    if (result == null) {
        synchronized (LOCK) {
            result = productoService;
            if (result == null) {
                productoService = result = new ProductoService();
            }
        }
    }
    return result;
}
```

---

## CH11: Date/Time API

### Teoría
- **LocalDate, LocalTime, LocalDateTime**: fechas y horas sin zona horaria
- **Instant**: punto en la línea de tiempo
- **Period** (días/meses/años) vs **Duration** (segundos/nanos)
- **DateTimeFormatter**: formateo/parseo
- **Clases inmutables y thread-safe**

### En el código

**LocalDateTime en el modelo**:
```java
public class Pedido {
    private LocalDateTime createdAt;    // java.time.LocalDateTime
    private LocalDateTime updatedAt;
}

public class Producto {
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}

public class Usuario {
    private LocalDateTime createdAt;
}
```

**Conversión de Timestamp a LocalDateTime** - `ProductoDAOImpl.java`:
```java
private LocalDateTime toLocalDateTime(Timestamp timestamp) {
    if (timestamp == null) return null;
    return timestamp.toLocalDateTime();
}

// Uso en mapeo:
producto.setCreatedAt(toLocalDateTime(rs.getTimestamp("created_at")));
```

---

## CH12: File I/O

### Teoría
- **InputStream/OutputStream**: bytes
- **Reader/Writer**: caracteres
- **BufferedReader/BufferedWriter**: con buffer
- **File, Path, Files** (NIO.2): manipulación de archivos
- **Serialización**: ObjectOutputStream/ObjectInputStream

### En el código

**Lectura de archivo de propiedades** - `ConexionDB.java`:
```java
private ConexionDB() {
    Properties properties = new Properties();
    try (InputStream inputStream = Thread.currentThread()
            .getContextClassLoader()
            .getResourceAsStream(CONFIG_FILE)) {   // Lectura desde classpath
        if (inputStream == null) {
            throw new IllegalStateException("No se encontro " + CONFIG_FILE);
        }
        properties.load(inputStream);              // Carga de propiedades
    } catch (IOException exception) {
        throw new IllegalStateException("No se pudo cargar la configuracion", exception);
    }
}
```

**File I/O en la GUI** - `Menu.java`:
```java
private void guardarComanda() {
    JFileChooser fileChooser = new JFileChooser();
    if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
        File file = fileChooser.getSelectedFile();
        try (BufferedWriter writer = new BufferedWriter(new FileWriter(file))) {
            writer.write(generarTextoComanda());   // Escritura de archivo
        } catch (IOException ex) {
            JOptionPane.showMessageDialog(this, "Error al guardar: " + ex.getMessage());
        }
    }
}
```

---

## CH13: JDBC y Base de Datos

*Nota: En la teoría, JDBC se trata en el capítulo de File I/O (ch12) y secciones de base de datos.*

### Teoría
- **DriverManager / DataSource**: conexión a DB
- **Connection, Statement, PreparedStatement, ResultSet**
- **Transacciones**: setAutoCommit(false), commit(), rollback()
- **SQLException**: checked exception para errores de DB
- **Connection Pool**: HikariCP

### En el código

**Pool de conexiones con HikariCP** - `ConexionDB.java`:
```java
private ConexionDB() {
    HikariConfig config = new HikariConfig();
    config.setJdbcUrl(properties.getProperty("db.url"));
    config.setUsername(properties.getProperty("db.user"));
    config.setPassword(properties.getProperty("db.password"));
    config.setMaximumPoolSize(10);       // Pool de hasta 10 conexiones
    config.setMinimumIdle(2);            // 2 conexiones inactivas mínimo
    config.setIdleTimeout(300000);
    config.setMaxLifetime(600000);
    config.setConnectionTimeout(10000);
    config.setPoolName("RestoManager-Pool");
    // Optimizaciones:
    config.addDataSourceProperty("cachePrepStmts", "true");
    config.addDataSourceProperty("prepStmtCacheSize", "250");
    config.addDataSourceProperty("useServerPrepStmts", "true");
    this.dataSource = new HikariDataSource(config);
}
```

**HikariCP (ConexionDB) y el wrapper de conexión (DatabaseConnection)**:
El proyecto utiliza un pool de conexiones gestionado por **HikariCP** en `ConexionDB.java` (implementado como Singleton thread-safe). Sin embargo, para desacoplar el acceso directo al Singleton, se utiliza una clase utilitaria llamada `DatabaseConnection.java` que expone un método estático:
```java
// DatabaseConnection.java
public class DatabaseConnection {
    public static Connection getConnection() throws SQLException {
        return ConexionDB.getInstance().getConnection(); // Obtiene conexión del pool HikariCP
    }
}
```
Esto simplifica el código de obtención de conexiones en todas las implementaciones DAO.

**PreparedStatement (protección contra SQL injection)** - En todos los DAOs:
```java
// MesaDAOImpl.java
public String nuevaMesa(Mesa mesa) {
    String sql = "INSERT INTO mesas (numero, capacidad, estado) VALUES (?, ?, ?)";
    try (Connection conn = DatabaseConnection.getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {   // PreparedStatement
        ps.setInt(1, mesa.getNumero());          // Parámetros con setType
        ps.setInt(2, mesa.getCapacidad());
        ps.setString(3, mesa.getEstado().name());
        ps.executeUpdate();
        return "Mesa creada exitosamente";
    } catch (SQLException ex) {
        return "Error al crear mesa: " + ex.getMessage();
    }
}
```

**Transacciones** - `PedidoDAOImpl.java`:
```java
conn.setAutoCommit(false);     // Inicio transacción manual
// ... múltiples INSERTs ...
conn.commit();                 // Confirmar cambios
// En catch: conn.rollback()   // Revertir si hay error
```

**Mapeo ResultSet a objetos** - En todos los DAOs:
```java
private Mesa mapearMesa(ResultSet result) throws SQLException {
    Mesa mesa = new Mesa();
    mesa.setIdMesa(result.getInt("id_mesa"));           // getInt, getString, etc.
    mesa.setNumero(result.getInt("numero"));
    mesa.setCapacidad(result.getInt("capacidad"));
    mesa.setEstado(EstadoMesa.valueOf(result.getString("estado")));  // String a Enum
    return mesa;
}
```

**Vista SQL** - `ConexionDB.java` crea vistas al iniciar:
```java
stmt.execute("CREATE OR REPLACE VIEW vw_ventas_por_producto AS "
    + "SELECT p.id_producto, p.nombre AS producto, c.nombre AS categoria, "
    + "SUM(dp.cantidad) AS unidades_vendidas, SUM(dp.subtotal) AS total_recaudado "
    + "FROM detalle_pedido dp "
    + "JOIN productos p ON dp.id_producto = p.id_producto "
    + "JOIN categorias c ON p.id_categoria = c.id_categoria "
    + "JOIN pedidos pe ON dp.id_pedido = pe.id_pedido "
    + "WHERE pe.estado != 'CANCELADO' "
    + "GROUP BY p.id_producto, p.nombre, c.nombre "
    + "ORDER BY total_recaudado DESC");
```

---

## Patrones de Diseño (transversal a varios capítulos)

### 1. DAO (Data Access Object)
**Teoría**: Patrón que separa la lógica de acceso a datos de la lógica de negocio.

**Código**: Cada entidad tiene `XxxDAO` (interfaz) y `XxxDAOImpl` (implementación JDBC).

### 2. Singleton
**Teoría**: Garantiza una única instancia de una clase.

**Código**: `ConexionDB` y `ServicioFactory` usan double-checked locking.

### 3. Factory
**Teoría**: Centraliza la creación de objetos.

**Código**: `ServicioFactory` provee acceso a todos los servicios.

### 4. Dependency Injection (DI)
**Teoría**: Pasar dependencias por constructor en lugar de crearlas internamente.

**Código**: 
```java
public ProductoService(ProductoDAO productoDAO) {
    this.productoDAO = productoDAO;  // Inyección por constructor
}
```

### 5. State Machine
**Teoría**: Controla transiciones entre estados.

**Código**: `MesaService.esTransicionPermitida()` define qué transiciones de estado son válidas.

### 6. Observer
**Teoría**: Un objeto notifica a otros sobre cambios.

**Código**: `CardProducto.OnAgregarListener` para notificar al menú cuando se agrega un producto.

### 7. DTO (Data Transfer Object)
**Teoría**: Objeto que transporta datos entre capas.

**Código**: `ResumenGeneralDTO`, `VentaPorMesDTO`, `VentaPorProductoDTO` en `service/dto/`.

---

## Mapa Rápido: Pregunta de examen → Dónde buscarlo

| Si te preguntan sobre... | Mirá en... |
|--------------------------|-----------|
| Clases, objetos, constructores | `model/*.java` - Todos los modelos |
| Encapsulación (private + getters/setters) | `model/*.java` - Todos los campos son private |
| Interfaces | `dao/*DAO.java` - 6 interfaces |
| Herencia / Implements | `dao/*Impl.java implements *DAO` |
| Polimorfismo | `Service` constructores que aceptan cualquier `DAO` |
| Enums | `EstadoMesa.java`, `EstadoPedido.java` |
| Switch expression | `MesaService.esTransicionPermitida()` |
| Try-with-resources | Todos los DAOs en cada método |
| Transacciones | `PedidoDAOImpl.Insertar()` |
| Lambdas | `AsyncDataLoader`, `Pedido.recalcularTotal()` |
| Streams | `Pedido.recalcularTotal()` con .map().filter().reduce() |
| Method references | `DetallePedido::getSubtotal`, `this::colorearBotonesMesas` |
| Genéricos | `List<DetallePedido>`, `Set<EstadoMesa>`, `Callable<T>` |
| Singleton | `ConexionDB.getInstance()`, `ServicioFactory` |
| Thread safety | Double-checked locking en Singleton |
| SwingWorker | `AsyncDataLoader` |
| LocalDateTime | `Pedido.createdAt`, `Producto.createdAt` |
| PreparedStatement | Todos los DAOs |
| File I/O | `ConexionDB` (load properties), `Menu` (guardar comanda) |
| Connection Pool | HikariCP en `ConexionDB` |
| Sobrecarga de métodos | `ProductoDAOImpl.insertar()`, `.eliminar()`, `.editar()` |
| Static members | `ConexionDB.getInstance()`, `ServicioFactory` |
| BigDecimal | `DetallePedido.subtotal`, `Pedido.total` |
