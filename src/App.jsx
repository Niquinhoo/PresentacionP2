import { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Layers, 
  Code2, 
  Activity, 
  Terminal as TerminalIcon, 
  Play, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  ChevronRight, 
  ChevronLeft,
  ArrowRight,
  Database,
  Monitor,
  Package,
  FileCode,
  Sparkles,
  Server,
  UserCheck,
  Check
} from 'lucide-react';

// Code snippets to display in the Interactive IDE
const CODE_SNIPPETS = {
  // --- PERSISTENCIA / CONFIGURACIONES ---
  conexionDB: {
    name: 'ConexionDB.java',
    path: 'Backend/src/main/java/com/restaurant/backend/util/ConexionDB.java',
    language: 'java',
    desc: 'Pool de conexiones HikariCP configurado para TiDB Cloud con soporte SSL y cacheado de PreparedStatements.',
    code: `package com.restaurant.backend.util;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import java.sql.Connection;
import java.sql.SQLException;
import java.util.Properties;

public final class ConexionDB {
    private static final String CONFIG_FILE = "db.properties";
    private static volatile ConexionDB instance;
    private final HikariDataSource dataSource;

    private ConexionDB() {
        Properties properties = cargarProperties();
        
        // Configuración del Pool HikariCP
        HikariConfig config = new HikariConfig();
        config.setJdbcUrl(properties.getProperty("db.url"));
        config.setUsername(properties.getProperty("db.user"));
        config.setPassword(properties.getProperty("db.password"));
        config.setMaximumPoolSize(10); // Máximo 10 conexiones simultáneas
        config.setMinimumIdle(2);      // Mínimo 2 conexiones ociosas
        config.setConnectionTimeout(10000); // 10s límite de espera
        config.setPoolName("RestoManager-Pool");

        this.dataSource = new HikariDataSource(config);

        // Hotfix: Vista de ventas SQL inicializada automáticamente
        inicializarVistasBD();
    }

    public static ConexionDB getInstance() {
        if (instance == null) {
            synchronized (ConexionDB.class) {
                if (instance == null) {
                    instance = new ConexionDB();
                }
            }
        }
        return instance;
    }

    public Connection getConnection() throws SQLException {
        return dataSource.getConnection();
    }
}`
  },
  depXml: {
    name: 'dep.xml',
    path: 'GUI/src/assembly/dep.xml',
    language: 'xml',
    desc: 'Descriptor de ensamble de Maven personalizado para desempaquetar y fusionar dependencias tradicionales (HikariCP, MySQL) y de sistema (AbsoluteLayout, LGoodDatePicker, jfreechart) en un Fat JAR.',
    code: `<assembly xmlns="http://maven.apache.org/ASSEMBLY/2.2.0"
          xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
          xsi:schemaLocation="http://maven.apache.org/ASSEMBLY/2.2.0 http://maven.apache.org/xsd/assembly-2.2.0.xsd">
    <id>jar-with-dependencies</id>
    <formats>
        <format>jar</format>
    </formats>
    <includeBaseDirectory>false</includeBaseDirectory>
    <dependencySets>
        <!-- 1. Incluye dependencias de repositorio estándar (Backend y transitivas) -->
        <dependencySet>
            <outputDirectory>/</outputDirectory>
            <useProjectArtifact>true</useProjectArtifact>
            <unpack>true</unpack>
            <scope>runtime</scope>
        </dependencySet>
        <!-- 2. Incluye y desempaqueta los JARs locales (AbsoluteLayout, LGoodDatePicker, jfreechart) -->
        <dependencySet>
            <outputDirectory>/</outputDirectory>
            <unpack>true</unpack>
            <scope>system</scope>
        </dependencySet>
    </dependencySets>
</assembly>`
  },
  rootPom: {
    name: 'pom.xml (Raíz)',
    path: 'pom.xml',
    language: 'xml',
    desc: 'POM Padre orquestador del multi-módulo. Declara las carpetas hijas Backend y GUI y las propiedades de compilación globales.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.restaurant</groupId>
    <artifactId>restaurant-parent</artifactId>
    <version>1.0</version>
    <packaging>pom</packaging>

    <modules>
        <module>Backend</module>
        <module>GUI</module>
    </modules>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>17</maven.compiler.release>
    </properties>
</project>`
  },
  backendPom: {
    name: 'pom.xml (Backend)',
    path: 'Backend/pom.xml',
    language: 'xml',
    desc: 'POM del Módulo Backend. Define dependencias para MySQL, HikariCP, SLF4J, y JUnit para tests unitarios.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.restaurant</groupId>
        <artifactId>restaurant-parent</artifactId>
        <version>1.0</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>Backend</artifactId>
    <packaging>jar</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>17</maven.compiler.release>
    </properties>

    <dependencies>
        <!-- MySQL JDBC Driver -->
        <dependency>
            <groupId>com.mysql</groupId>
            <artifactId>mysql-connector-j</artifactId>
            <version>9.1.0</version>
        </dependency>
        <!-- HikariCP Connection Pool -->
        <dependency>
            <groupId>com.zaxxer</groupId>
            <artifactId>HikariCP</artifactId>
            <version>5.1.0</version>
        </dependency>
        <!-- SLF4J (required by HikariCP for logging) -->
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-api</artifactId>
            <version>2.0.13</version>
        </dependency>
        <dependency>
            <groupId>org.slf4j</groupId>
            <artifactId>slf4j-simple</artifactId>
            <version>2.0.13</version>
            <scope>runtime</scope>
        </dependency>
        <!-- JUnit Jupiter for Unit Testing -->
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-api</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
        <dependency>
            <groupId>org.junit.jupiter</groupId>
            <artifactId>junit-jupiter-engine</artifactId>
            <version>5.10.1</version>
            <scope>test</scope>
        </dependency>
    </dependencies>
</project>`
  },
  guiPom: {
    name: 'pom.xml (GUI)',
    path: 'GUI/pom.xml',
    language: 'xml',
    desc: 'POM del Módulo GUI. Configura el directorio fuente de NetBeans e integra las librerías locales AbsoluteLayout, LGoodDatePicker y jfreechart con alcance system.',
    code: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <parent>
        <groupId>com.restaurant</groupId>
        <artifactId>restaurant-parent</artifactId>
        <version>1.0</version>
        <relativePath>../pom.xml</relativePath>
    </parent>

    <artifactId>GUI</artifactId>
    <packaging>jar</packaging>

    <properties>
        <project.build.sourceEncoding>UTF-8</project.build.sourceEncoding>
        <maven.compiler.release>17</maven.compiler.release>
        <!-- Directorio fuente de NetBeans (sin la estructura src/main/java estándar) -->
        <sourceDirectory>\${project.basedir}/src</sourceDirectory>
    </properties>

    <dependencies>
        <!-- Módulo Backend (clases de modelo, servicio y DAO) -->
        <dependency>
            <groupId>com.restaurant</groupId>
            <artifactId>Backend</artifactId>
            <version>1.0</version>
        </dependency>

        <!-- JARs locales en lib/ usando system scope -->
        <!-- AbsoluteLayout — layout manager de NetBeans -->
        <dependency>
            <groupId>org.netbeans.external</groupId>
            <artifactId>AbsoluteLayout</artifactId>
            <version>local</version>
            <scope>system</scope>
            <systemPath>\${project.basedir}/lib/AbsoluteLayout.jar</systemPath>
        </dependency>

        <!-- LGoodDatePicker — selector de fechas -->
        <dependency>
            <groupId>com.github.lgooddatepicker</groupId>
            <artifactId>LGoodDatePicker</artifactId>
            <version>local</version>
            <scope>system</scope>
            <systemPath>\${project.basedir}/lib/LGoodDatePicker.jar</systemPath>
        </dependency>

        <!-- JFreeChart — gráficos de reportes -->
        <dependency>
            <groupId>org.jfree</groupId>
            <artifactId>jfreechart</artifactId>
            <version>1.5.4</version>
            <scope>system</scope>
            <systemPath>\${project.basedir}/lib/jfreechart-1.5.4.jar</systemPath>
        </dependency>
    </dependencies>

    <build>
        <!-- Apuntar al directorio src/ de NetBeans en lugar del estándar src/main/java -->
        <sourceDirectory>\${project.basedir}/src</sourceDirectory>

        <resources>
            <!-- Incluir recursos (imágenes, etc.) desde el directorio fuente -->
            <resource>
                <directory>\${project.basedir}/src</directory>
                <excludes>
                    <exclude>**/*.java</exclude>
                </excludes>
            </resource>
        </resources>

        <plugins>
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-compiler-plugin</artifactId>
                <version>3.11.0</version>
                <configuration>
                    <release>17</release>
                    <encoding>UTF-8</encoding>
                </configuration>
            </plugin>

            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-jar-plugin</artifactId>
                <version>3.3.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>vistas.Login</mainClass>
                            <addClasspath>true</addClasspath>
                            <classpathPrefix>lib/</classpathPrefix>
                        </manifest>
                    </archive>
                    <finalName>RestoManager-GUI</finalName>
                </configuration>
            </plugin>

            <!-- Maven Assembly Plugin para construir un JAR Único (Fat JAR) con todas las dependencias -->
            <plugin>
                <groupId>org.apache.maven.plugins</groupId>
                <artifactId>maven-assembly-plugin</artifactId>
                <version>3.6.0</version>
                <configuration>
                    <archive>
                        <manifest>
                            <mainClass>vistas.Login</mainClass>
                        </manifest>
                    </archive>
                    <descriptors>
                        <descriptor>src/assembly/dep.xml</descriptor>
                    </descriptors>
                    <finalName>RestoManager</finalName>
                    <appendAssemblyId>false</appendAssemblyId>
                </configuration>
                <executions>
                    <execution>
                        <id>make-assembly</id>
                        <phase>package</phase>
                        <goals>
                            <goal>single</goal>
                        </goals>
                    </execution>
                </executions>
            </plugin>
        </plugins>
    </build>
</project>`
  },

  // --- SERVICIOS & FACTORIES ---
  servicioFactory: {
    name: 'ServicioFactory.java',
    path: 'Backend/src/main/java/com/restaurant/backend/service/ServicioFactory.java',
    language: 'java',
    desc: 'Patrón Double-Checked Locking con variable volatile para garantizar la seguridad entre hilos al instanciar servicios desde SwingWorkers.',
    code: `package com.restaurant.backend.service;

public class ServicioFactory {
    private static final Object LOCK = new Object();
    
    // volatile asegura visibilidad entre hilos de SwingWorker
    private static volatile ProductoService productoService;
    private static volatile MesaService mesaService;
    private static volatile PedidoService pedidoService;

    public static MesaService getMesaService() {
        MesaService result = mesaService;
        if (result == null) {
            synchronized (LOCK) {
                result = mesaService;
                if (result == null) {
                    mesaService = result = new MesaService();
                }
            }
        }
        return result;
    }

    public static PedidoService getPedidoService() {
        PedidoService result = pedidoService;
        if (result == null) {
            synchronized (LOCK) {
                result = pedidoService;
                if (result == null) {
                    pedidoService = result = new PedidoService();
                }
            }
        }
        return result;
    }
}`
  },
  mesaService: {
    name: 'MesaService.java',
    path: 'Backend/src/main/java/com/restaurant/backend/service/MesaService.java',
    language: 'java',
    desc: 'Lógica del servicio de mesas. Cierra automáticamente los pedidos activos cuando se libera una mesa, actualizando la base de datos.',
    code: `package com.restaurant.backend.service;

import com.restaurant.backend.model.EstadoMesa;
import com.restaurant.backend.model.EstadoPedido;
import com.restaurant.backend.model.Pedido;

public class MesaService {
    private final MesaDAO mesaDAO;
    private final PedidoDAO pedidoDAO;

    public String liberar(int mesaId) {
        Mesa mesa = mesaDAO.getMesaPorId(mesaId);
        if (mesa == null) {
            return "No se encontro la mesa";
        }

        // Cierra de manera arbitraria todos los pedidos abiertos vinculados
        for (Pedido pedido : pedidoDAO.getPedidosPorMesa(mesaId)) {
            if (pedido.getEstado() == EstadoPedido.ABIERTO || 
                pedido.getEstado() == EstadoPedido.EN_COCINA || 
                pedido.getEstado() == EstadoPedido.LISTO) {
                
                pedidoDAO.ModificarEstado(pedido.getIdPedido(), EstadoPedido.CERRADO);
            }
        }

        // Cambia el estado de la mesa a libre
        return mesaDAO.cambiarEstado(mesaId, EstadoMesa.LIBRE);
    }
}`
  },
  pedidoService: {
    name: 'PedidoService.java',
    path: 'Backend/src/main/java/com/restaurant/backend/service/PedidoService.java',
    language: 'java',
    desc: 'Control transaccional para la creación de comandas. Valida stock de insumos antes de registrar el pedido y persistirlo.',
    code: `package com.restaurant.backend.service;

import com.restaurant.backend.dao.PedidoDAO;
import com.restaurant.backend.model.DetallePedido;
import com.restaurant.backend.model.Pedido;
import java.util.List;

public class PedidoService {
    private final PedidoDAO pedidoDAO;
    private final MesaService mesaService;
    private final ProductoService productoService;

    // Crear un pedido asociando detalles y descontando stock en caliente
    public String crearPedido(Mesa mesa, Usuario usuario, List<DetallePedido> detalles, String observacion) {
        // Validar stock antes de persistir
        for (DetallePedido detalle : detalles) {
            String validStock = productoService.validarStockDisponible(
                detalle.getProducto().getIdProducto(), 
                detalle.getCantidad()
            );
            if (validStock != null) return validStock; // Error si no hay stock
        }

        Pedido pedido = new Pedido();
        pedido.setMesa(mesa);
        pedido.setUsuario(usuario);
        pedido.setObservacion(observacion);

        // Dispara la transacción en base de datos
        String res = pedidoDAO.Insertar(pedido, detalles);
        if (!res.toLowerCase().contains("correctamente")) return res;

        // Descuenta stock físico de inmediato si la BD guardó el lote con éxito
        for (DetallePedido d : detalles) {
            productoService.descontarStock(d.getProducto().getIdProducto(), d.getCantidad());
        }

        return mesaService.ocupar(mesa.getIdMesa());
    }
}`
  },

  // --- CAPA DAO (ACCESO A DATOS) ---
  pedidoDAO: {
    name: 'PedidoDAOImpl.java',
    path: 'Backend/src/main/java/com/restaurant/backend/dao/PedidoDAOImpl.java',
    language: 'java',
    desc: 'Implementación JDBC transaccional del DAO de pedidos. Garantiza Atomicidad usando setAutoCommit(false) y rollback ante fallos.',
    code: `package com.restaurant.backend.dao;

import com.restaurant.backend.model.DetallePedido;
import com.restaurant.backend.model.Pedido;
import java.sql.*;
import java.util.List;

public class PedidoDAOImpl implements PedidoDAO {

    @Override
    public String Insertar(Pedido p, List<DetallePedido> detalles) {
        String queryPedido = "INSERT INTO pedidos(id_mesa, id_usuario, created_at, total, estado, observacion) VALUES(?,?,?,?,?,?)";
        String queryDetalles = "INSERT INTO detalle_pedido(id_pedido, id_producto, cantidad, precio_unitario, subtotal) VALUES(?,?,?,?,?)";
        Connection conn = null;

        try {
            conn = DatabaseConnection.getConnection();
            conn.setAutoCommit(false); // Inicia transacción atómica

            PreparedStatement ps = conn.prepareStatement(queryPedido, Statement.RETURN_GENERATED_KEYS);
            ps.setInt(1, p.getMesa().getIdMesa());
            ps.setInt(2, p.getUsuario().getIdUsuario());
            ps.setTimestamp(3, Timestamp.valueOf(p.getCreatedAt()));
            ps.setBigDecimal(4, p.getTotal());
            ps.setString(5, p.getEstado().toString());
            ps.setString(6, p.getObservacion());
            ps.executeUpdate();

            // Obtener el ID autogenerado del pedido
            ResultSet rs = ps.getGeneratedKeys();
            int pedidoId = rs.next() ? rs.getInt(1) : -1;

            // Insertar detalles en lote (batch processing)
            PreparedStatement psDetalles = conn.prepareStatement(queryDetalles);
            for (DetallePedido d : detalles) {
                psDetalles.setInt(1, pedidoId);
                psDetalles.setInt(2, d.getProducto().getIdProducto());
                psDetalles.setInt(3, d.getCantidad());
                psDetalles.setBigDecimal(4, d.getPrecioUnitario());
                psDetalles.setBigDecimal(5, d.getSubtotal());
                psDetalles.addBatch();
            }
            psDetalles.executeBatch();

            conn.commit(); // Éxito: confirma cambios
            return "Pedido y detalles insertados correctamente";

        } catch (SQLException ex) {
            try {
                if (conn != null) conn.rollback(); // Falla: vuelve atrás
            } catch (SQLException e) {
                System.out.println("Rollback err: " + e);
            }
            return "Error al insertar pedido: " + ex.getMessage();
        } finally {
            closeConnection(conn);
        }
    }
}`
  },

  // --- CAPA VISTA (VISTAS SWING & PANELES) ---
  asyncDataLoader: {
    name: 'AsyncDataLoader.java',
    path: 'GUI/src/vistas/util/AsyncDataLoader.java',
    language: 'java',
    desc: 'Wrapper genérico sobre SwingWorker para despachar operaciones de base de datos a hilos en segundo plano, evitando congelar el EDT (Event Dispatch Thread).',
    code: `package vistas.util;

import javax.swing.*;
import java.awt.*;

public class AsyncDataLoader {
    
    // Carga asíncrona de datos en segundo plano
    public static <T> void load(Component parent, Callable<T> task, 
                                Consumer<T> onSuccess, Consumer<Throwable> onError) {
        
        // Cambiar cursor a estado de espera y deshabilitar componente
        parent.setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));
        
        SwingWorker<T, Void> worker = new SwingWorker<>() {
            @Override
            protected T doInBackground() throws Exception {
                return task.call(); // Ejecución en hilo de fondo
            }

            @Override
            protected void done() {
                // Restaurar cursor original en el EDT
                parent.setCursor(Cursor.getDefaultCursor());
                try {
                    T result = get();
                    onSuccess.accept(result); // Callback de éxito
                } catch (Exception e) {
                    if (onError != null) onError.accept(e);
                }
            }
        };
        worker.execute();
    }
}`
  },
  loginJava: {
    name: 'Login.java',
    path: 'GUI/src/vistas/Login.java',
    language: 'java',
    desc: 'Lógica del formulario de autenticación. Utiliza AsyncDataLoader para despachar de forma asíncrona la verificación de credenciales.',
    code: `package vistas;

import com.restaurant.backend.model.Usuario;
import com.restaurant.backend.service.ServicioFactory;
import vistas.util.AsyncDataLoader;

public class Login extends javax.swing.JFrame {
    // ... Constructor y componentes NetBeans ...

    private void EntrarActionPerformed(java.awt.event.ActionEvent evt) {
        String nombreUsuario = Usuarioimput.getText().trim();
        String contrasena = String.valueOf(Password.getPassword());

        if (nombreUsuario.isEmpty() || contrasena.isEmpty()) {
            javax.swing.JOptionPane.showMessageDialog(this, "Por favor ingresá usuario y contraseña.");
            return;
        }

        Entrar.setEnabled(false);
        Entrar.setText("Ingresando...");

        // AsyncDataLoader ejecuta en segundo plano para no colgar el EDT de Swing
        AsyncDataLoader.load(
                this,
                () -> ServicioFactory.getUsuarioService().iniciarSesion(nombreUsuario, contrasena),
                usuarioAutenticado -> {
                    Entrar.setEnabled(true);
                    Entrar.setText("ENTRAR");

                    if (usuarioAutenticado == null) {
                        javax.swing.JOptionPane.showMessageDialog(this, "Usuario o contraseña incorrectos.");
                        Password.setText("");
                        return;
                    }

                    // Abrir menú principal con el objeto Usuario obtenido
                    Menu menu = new Menu(usuarioAutenticado);
                    menu.setVisible(true);
                    this.dispose();
                },
                error -> {
                    Entrar.setEnabled(true);
                    Entrar.setText("ENTRAR");
                    javax.swing.JOptionPane.showMessageDialog(this, "Error de conexión: " + error.getMessage());
                }
        );
    }
}`
  },
  menuJava: {
    name: 'Menu.java',
    path: 'GUI/src/vistas/Menu.java',
    language: 'java',
    desc: 'Contenedor principal y catálogo de productos del mozo. Realiza llamadas asíncronas para construir la grilla de productos dinámica.',
    code: `package vistas;

import com.restaurant.backend.model.Producto;
import com.restaurant.backend.service.ServicioFactory;
import vistas.paneles.CardProducto;
import vistas.util.AsyncDataLoader;
import java.awt.GridLayout;
import java.util.List;

public class Menu extends javax.swing.JFrame {
    // ... Constructor e inicialización ...

    private void cargarCategoriasYProductos() {
        mostrarPlaceholderCarga();

        // Consulta asíncrona a TiDB Cloud para obtener catálogo de productos activos
        AsyncDataLoader.load(
                this,
                () -> {
                    List<Producto> todos = ServicioFactory.getProductoService().obtenerTodos();
                    return todos.stream().filter(Producto::isDisponible)
                            .collect(java.util.stream.Collectors.toList());
                },
                productos -> {
                    panelProductos.removeAll();
                    panelProductos.setLayout(new GridLayout(0, 3, 10, 10));

                    for (Producto prod : productos) {
                        CardProducto card = new CardProducto();
                        card.setProducto(prod.getNombre(), prod.getPrecio().doubleValue());
                        card.setOnAgregarListener((nombre, precio) -> agregarProductoTabla(nombre, precio));
                        panelProductos.add(card);
                    }

                    panelProductos.revalidate();
                    panelProductos.repaint();
                },
                error -> {
                    panelProductos.removeAll();
                    panelProductos.add(new javax.swing.JLabel("Error al cargar catálogo."));
                }
        );
    }
}`
  },
  mesasPanelJava: {
    name: 'MesasPanel.java',
    path: 'GUI/src/vistas/paneles/MesasPanel.java',
    language: 'java',
    desc: 'Panel del salón con grid visual de 16 mesas. Colorea asíncronamente los botones de mesas según el estado de la BD.',
    code: `package vistas.paneles;

import vistas.util.AsyncDataLoader;
import java.awt.Color;
import java.util.List;

public class MesasPanel extends javax.swing.JPanel {
    // ... Constructor y componentes ...

    private void actualizarMesasAsync() {
        // Carga de estado de mesas en segundo plano
        AsyncDataLoader.load(
                this,
                () -> com.restaurant.backend.service.ServicioFactory.getMesaService().listar(),
                this::colorearBotonesMesas,
                error -> System.err.println("Error: " + error.getMessage())
        );
    }

    private void colorearBotonesMesas(List<com.restaurant.backend.model.Mesa> listaMesas) {
        javax.swing.JButton[] botones = {
            Mesa1, Mesa2, Mesa3, Mesa4, Mesa5, Mesa6, Mesa7, Mesa8,
            Mesa9, Mesa10, Mesa11, Mesa12, Mesa13, Mesa14, Mesa15, Mesa16
        };

        for (com.restaurant.backend.model.Mesa m : listaMesas) {
            int numero = m.getNumero();
            if (numero >= 1 && numero <= 16) {
                javax.swing.JButton btn = botones[numero - 1];
                btn.setToolTipText("Capacidad: " + m.getCapacidad() + " - Estado: " + m.getEstado());
                
                // Colorización en vivo según estado
                switch (m.getEstado()) {
                    case LIBRE -> btn.setBackground(new Color(51, 204, 0)); // Verde
                    case OCUPADA -> btn.setBackground(new Color(255, 51, 51)); // Rojo
                    case RESERVADA -> btn.setBackground(new Color(249, 155, 32)); // Naranja
                    case FUERA_DE_SERVICIO -> btn.setBackground(new Color(100, 100, 100)); // Gris
                }
            }
        }
    }
}`
  },
  detallesMesasPanel: {
    name: 'DetallesMesasPanel.java',
    path: 'GUI/src/vistas/paneles/DetallesMesasPanel.java',
    language: 'java',
    desc: 'Hotfix de interfaz gráfica. Evalúa la presencia de comandas abiertas en la tabla Swing y solicita una confirmación Sí/No antes de liberar.',
    code: `// GUI/src/vistas/paneles/DetallesMesasPanel.java
private void btnLiberarActionPerformed() {
    if (mesaSeleccionada != null) {
        // Verifica si la tabla de consumos activos tiene pedidos cargados
        boolean tienePedidosActivos = jTable1.getRowCount() > 0;
        
        if (tienePedidosActivos) {
            int opcion = javax.swing.JOptionPane.showConfirmDialog(
                    this,
                    "La mesa tiene pedidos abiertos. ¿Desea cerrar todos los pedidos abiertos y liberar la mesa?",
                    "Confirmar Liberar Mesa",
                    javax.swing.JOptionPane.YES_NO_OPTION,
                    javax.swing.JOptionPane.WARNING_MESSAGE
            );
            if (opcion != javax.swing.JOptionPane.YES_OPTION) {
                return; // Cancela la operación
            }
        } else {
            int opcion = javax.swing.JOptionPane.showConfirmDialog(
                    this,
                    "¿Está seguro de que desea liberar la Mesa " + mesaSeleccionada.getNumero() + "?",
                    "Confirmar Liberar Mesa",
                    javax.swing.JOptionPane.YES_NO_OPTION,
                    javax.swing.JOptionPane.QUESTION_MESSAGE
            );
            if (opcion != javax.swing.JOptionPane.YES_OPTION) {
                return; // Cancela la operación
            }
        }

        // Ejecución en segundo plano de la liberación
        AsyncDataLoader.execute(
                this,
                () -> ServicioFactory.getMesaService().liberar(mesaSeleccionada.getIdMesa()),
                res -> {
                    javax.swing.JOptionPane.showMessageDialog(this, res, "Liberar Mesa", javax.swing.JOptionPane.INFORMATION_MESSAGE);
                    refrescarMesa(); // Actualiza panel de mesas en EDT
                }
        );
    }
}`
  },
  checkoutDialogJava: {
    name: 'CheckoutDialog.java',
    path: 'GUI/src/vistas/CheckoutDialog.java',
    language: 'java',
    desc: 'Diálogo modal de Checkout. Permite realizar descuentos en porcentaje (ej: 10%) o monto fijo y calcula totales en vivo.',
    code: `package vistas;

import java.time.LocalDateTime;
import java.util.List;

public class CheckoutDialog extends javax.swing.JDialog {
    private double subtotalOriginal = 0.0;
    private boolean confirmado = false;

    // Recalcula el total neto aplicando el descuento digitado en el JTextField
    private void recalcularTotalConDescuento() {
        String descText = DescuentoVar.getText().trim();
        double descuento = 0.0;
        if (!descText.isEmpty()) {
            try {
                if (descText.endsWith("%")) {
                    descText = descText.substring(0, descText.length() - 1).trim();
                }
                descuento = Double.parseDouble(descText);
            } catch (NumberFormatException e) {
                descuento = 0.0;
            }
        }
        
        double total = subtotalOriginal;
        if (descuento > 0) {
            if (descuento <= 100) {
                total = subtotalOriginal * (1 - (descuento / 100.0)); // Descuento porcentual
            } else {
                total = Math.max(0.0, subtotalOriginal - descuento); // Descuento fijo
            }
        }
        TotalNum.setText(String.format(java.util.Locale.US, "$%.2f", total));
    }
}`
  }
};

// Flow stages metadata linking to images folder
const PROJECT_FLOW_STAGES = [
  {
    id: 'login',
    title: '1. Login & Registro',
    desc: 'Acceso seguro al sistema con hashing de contraseñas SHA2-256 en base de datos. Control de roles jerárquico.',
    techDetails: {
      layer: 'Capa Vista / Controller',
      component: 'Login.java, Registro.java, UsuarioDAOImpl.java',
      pattern: 'Singleton, DAO Pattern',
      description: 'El flujo de ingreso valida las credenciales ingresadas contra la tabla de usuarios almacenada en TiDB Cloud. Si el usuario no existe, se puede dar de alta desde la pantalla de Registro, asignándole un rol (Mozo o Administrador). La contraseña se encripta mediante SHA2-256 en la consulta SQL.'
    },
    images: [
      { path: 'Login-Register/Login.png', caption: 'Inicio de Sesión (Login) con validación de credenciales activas.' },
      { path: 'Login-Register/Register.png', caption: 'Formulario de registro para dar de alta nuevos empleados con rol asignado.' }
    ]
  },
  {
    id: 'estado-mesas',
    title: '2. Monitoreo de Mesas',
    desc: 'Salón virtual que representa las mesas físicas del restaurante y su estado actual por colores en tiempo real.',
    techDetails: {
      layer: 'Capa Vista (GUI Panel)',
      component: 'MesasPanel.java, MesaDAOImpl.java',
      pattern: 'Observer (refresco visual), SwingWorker',
      description: 'El salón cuenta con mesas interactivas que cambian de color según su estado: Verde (Libre), Rojo (Ocupada), Azul (Reservada) y Gris (Fuera de Servicio). La carga y actualización de los estados se realiza asíncronamente con AsyncDataLoader para evitar retrasos en el hilo principal de Swing.'
    },
    images: [
      { path: 'EstadoMesas/MesaLibre.png', caption: 'Mesa en estado LIBRE (Color Verde) disponible para asignación y comandas.' },
      { path: 'EstadoMesas/MesaOcupada.png', caption: 'Mesa en estado OCUPADA (Color Rojo) que contiene un consumo activo.' },
      { path: 'EstadoMesas/MesaReservada.png', caption: 'Mesa en estado RESERVADA (Color Azul) programada por un cliente.' },
      { path: 'EstadoMesas/MesaFueraDeServicio.png', caption: 'Mesa en estado FUERA DE SERVICIO (Color Gris) inactiva temporalmente.' }
    ]
  },
  {
    id: 'cargar-pedido',
    title: '3. Registro de Pedidos',
    desc: 'Selección dinámica del catálogo de productos, carga interactiva, facturación modal y exportación del ticket comanda.',
    techDetails: {
      layer: 'Capa Servicio & Transaccional',
      component: 'Menu.java, CheckoutDialog.java, PedidoService.java, PedidoDAOImpl.java',
      pattern: 'Transaction Script, Command',
      description: 'El mozo selecciona los productos del menú filtrados por categoría. Al presionar "Checkout", se calcula el total dinámicamente. Al confirmar, se dispara una transacción SQL que inserta el pedido, añade sus detalles, descuenta el stock de productos en base de datos y genera el ticket físico de comanda en disco.'
    },
    images: [
      { path: 'CargarPedido/MenuPrincipal-1.png', caption: '1. Tablero principal del catálogo para la selección de platos y bebidas.' },
      { path: 'CargarPedido/MenuFiltradoCategorias-2.png', caption: '2. Catálogo filtrado dinámicamente por categorías (Bebidas, Platos, Postres).' },
      { path: 'CargarPedido/SeleccionDeProductos-3.png', caption: '3. Selección e incremento de cantidades en la comanda temporal.' },
      { path: 'CargarPedido/Checkout-4.png', caption: '4. Diálogo de Checkout para aplicar descuentos y registrar observaciones.' },
      { path: 'CargarPedido/ADondeSeGuardaLaComanda-5.png', caption: '5. Selector local JFileChooser para guardar el ticket de la comanda en disco.' },
      { path: 'CargarPedido/Confirmacion-6.png', caption: '6. Notificación emergente de éxito confirmando el registro del pedido en base de datos.' }
    ]
  },
  {
    id: 'abm-mesas',
    title: '4. Liberación de Mesas',
    desc: 'Lógica transaccional para cerrar comandas abiertas y actualizar el estado a Libre (Hotfix de JOptionPane).',
    techDetails: {
      layer: 'Capa Servicio & Negocio',
      component: 'DetallesMesasPanel.java, MesaService.java',
      pattern: 'Facade, DAO Wrapper',
      description: 'Hotfix de seguridad: Antes de liberar una mesa, el sistema evalúa si posee consumos activos en la tabla. Si los tiene, muestra un JOptionPane advirtiendo que se cerrarán todos los pedidos activos. Al confirmar, MesaService actualiza los pedidos a CERRADO y cambia la mesa a LIBRE transaccionalmente.'
    },
    images: [
      { path: 'ABMMesas/MesaOcupada-1.png', caption: '1. Mesa ocupada mostrando el detalle de su consumo activo en la tabla.' },
      { path: 'ABMMesas/SePreguntaSiQuiereLiberarLaMesa-2.png', caption: '2. JOptionPane emergente preguntando la confirmación de liberación forzada.' },
      { path: 'ABMMesas/Confirmacion-3.png', caption: '3. JOptionPane informando el éxito de la liberación y cierre de pedidos.' },
      { path: 'ABMMesas/NuevoEstadoDeMesa-4.png', caption: '4. Panel actualizado mostrando que la mesa ha regresado a color verde (Libre).' }
    ]
  },
  {
    id: 'pedidos-view',
    title: '5. Panel de Comandas',
    desc: 'Listado centralizado de pedidos históricos y activos para monitoreo y administración.',
    techDetails: {
      layer: 'Capa Vista / DAO',
      component: 'PedidosPanel.java, PedidoDAOImpl.java',
      pattern: 'MVC Pattern',
      description: 'Permite buscar, filtrar y dar seguimiento a los pedidos del restaurante. Muestra detalles como la fecha, mesa, mozo que atendió, total cobrado y estado actual. Los datos se recuperan asíncronamente conectándose a TiDB Cloud.'
    },
    images: [
      { path: 'PedidosView/VistaPEdidos.png', caption: 'Tabla general de comandas con filtros de búsqueda rápida por estado.' }
    ]
  },
  {
    id: 'productos-abm',
    title: '6. CRUD de Productos',
    desc: 'Administración del catálogo de productos y categorías con actualización dinámica y control de stock mínimo.',
    techDetails: {
      layer: 'Capa DAO & Vista Catálogo',
      component: 'ProductosPanel.java, ProductoDAOImpl.java',
      pattern: 'CRUD Pattern',
      description: 'Los administradores pueden gestionar el menú del restaurante. Incluye el alta, modificación y baja lógica o física de productos. El sistema controla el stock mínimo y deshabilita la venta de productos que no cuenten con unidades disponibles.'
    },
    images: [
      { path: 'ProductosABM/ProductosActuales-1.png', caption: '1. Panel del catálogo mostrando las tarjetas y tabla de productos vigentes.' },
      { path: 'ProductosABM/AltaProducto.png', caption: 'Formulario modal para el alta de un nuevo producto con su stock inicial.' },
      { path: 'ProductosABM/ModificacionProducto.png', caption: 'Formulario de edición para actualizar precio, stock o categoría.' },
      { path: 'ProductosABM/BajaProducto.png', caption: 'Proceso de selección para dar de baja un producto del catálogo.' },
      { path: 'ProductosABM/ConfirmacionBajaProducto.png', caption: 'Diálogo de confirmación que notifica el éxito del borrado lógico.' },
      { path: 'ProductosABM/ActualizacionDeEstados-2.png', caption: '2. Catálogo actualizado con las modificaciones reflejadas de inmediato.' }
    ]
  },
  {
    id: 'stats',
    title: '7. Reportes Analíticos',
    desc: 'Panel estadístico avanzado con gráficos de torta y líneas temporales de facturación generados con JFreeChart.',
    techDetails: {
      layer: 'Capa de Reportes & Base de Datos',
      component: 'GeneralPanel.java, VentasPanel.java, ReporteService.java',
      pattern: 'Data Transfer Object (DTO), SQL Views',
      description: 'El módulo analítico extrae datos a través de vistas SQL optimizadas (ej. vw_ventas_por_producto). JFreeChart renderiza gráficos interactivos: un gráfico de torta con la distribución de ventas por categoría y un gráfico lineal con el historial de ingresos mensuales.'
    },
    images: [
      { path: 'Stats/Stats (1).png', caption: 'Resumen de ventas globales y gráfico circular por categorías de consumo.' },
      { path: 'Stats/Stats (2).png', caption: 'Gráfico histórico de ingresos mensuales que muestra la evolución financiera.' }
    ]
  }
];const DEPENDENCY_DETAILS = {
  mysql: {
    name: 'mysql-connector-j',
    version: '9.1.0',
    scope: 'compile',
    origin: 'Maven Central',
    desc: 'Driver JDBC oficial de MySQL. Habilita la comunicación a bajo nivel entre el código Java de Backend y el servidor de base de datos TiDB Cloud enviando y ejecutando consultas SQL relacionales.'
  },
  hikaricp: {
    name: 'HikariCP',
    version: '5.1.0',
    scope: 'compile',
    origin: 'Maven Central',
    desc: 'Pool de conexiones JDBC de alto rendimiento. Mantiene conexiones persistentes y pre-inicializadas abiertas en caliente. Evita la sobrecarga de handshake SSL de ~500ms al conectarse a TiDB Cloud, logrando consultas en <5ms.'
  },
  slf4j: {
    name: 'slf4j-api',
    version: '2.0.13',
    scope: 'compile',
    origin: 'Maven Central',
    desc: 'API de fachada de registro de logs para Java. Proporciona una interfaz uniforme que es utilizada internamente por el pool de conexiones HikariCP para diagnosticar el estado del pool.'
  },
  slf4jsimple: {
    name: 'slf4j-simple',
    version: '2.0.13',
    scope: 'runtime',
    origin: 'Maven Central',
    desc: 'Implementación básica de logging para SLF4J que escribe los mensajes informativos del pool de conexiones directamente a la consola estándar.'
  },
  junit: {
    name: 'junit-jupiter (api & engine)',
    version: '5.10.1',
    scope: 'test',
    origin: 'Maven Central',
    desc: 'Framework para el desarrollo y ejecución de pruebas unitarias automatizadas. Valida el correcto funcionamiento de los DAOs y lógica transaccional de manera aislada.'
  },
  backend: {
    name: 'com.restaurant:Backend',
    version: '1.0',
    scope: 'compile (Submódulo)',
    origin: 'Módulo Interno',
    desc: 'Dependencia del módulo de lógica. El frontend GUI requiere las clases del Backend (como los modelos, DAOs y Servicios) para orquestar la manipulación de datos.'
  },
  absoluteLayout: {
    name: 'AbsoluteLayout.jar',
    version: 'local (JAR de sistema)',
    scope: 'system',
    origin: 'local (GUI/lib/AbsoluteLayout.jar)',
    desc: 'Gestor de diseño propio de NetBeans GUI Builder. Habilita la colocación absoluta (posicionamiento de coordenadas X,Y) sobre el lienzo del Form Builder de Swing.'
  },
  lgooddatepicker: {
    name: 'LGoodDatePicker.jar',
    version: 'local (JAR de sistema)',
    scope: 'system',
    origin: 'local (GUI/lib/LGoodDatePicker.jar)',
    desc: 'Componente visual avanzado de selector de calendario y hora (DatePicker / TimePicker) integrado en la GUI Swing para seleccionar las fechas de reserva de mesas.'
  },
  jfreechart: {
    name: 'jfreechart-1.5.4.jar',
    version: '1.5.4 (JAR de sistema)',
    scope: 'system',
    origin: 'local (GUI/lib/jfreechart-1.5.4.jar)',
    desc: 'Librería gráfica vectorial. Dibuja y renderiza gráficos circulares de facturación por categoría y gráficos lineales de historial mensual de ventas en el panel administrador.'
  }
};

function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const [activeCodeFile, setActiveCodeFile] = useState('detallesMesasPanel');
  
  // Interactive Simulator States
  const [simStep, setSimStep] = useState(0);
  const [simFlow, setSimFlow] = useState('login'); // 'login', 'pedido', 'liberar'
  
  // Interactive Console States
  const [consoleLogs, setConsoleLogs] = useState([]);
  const [isConsoleBuilding, setIsConsoleBuilding] = useState(false);
  const [activeCommand, setActiveCommand] = useState('');

  // Flow Gallery States
  const [activeStage, setActiveStage] = useState('login');
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Architecture layer selector
  const [selectedLayer, setSelectedLayer] = useState('vista');

  // Interactive Maven Module Card
  const [activatedMavenModule, setActivatedMavenModule] = useState('parent');
  const [buildStep, setBuildStep] = useState(-1);
  const [selectedDep, setSelectedDep] = useState(null);

  // Auto scroll interactive console logs
  useEffect(() => {
    const el = document.getElementById('console-scroll-target');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Handle flow steps in simulator
  const resetSimulator = (flowType) => {
    setSimFlow(flowType);
    setSimStep(0);
  };

  // Flow steps structures for the simulator tab
  const flows = {
    login: [
      {
        title: 'Entrada de Credenciales',
        actor: 'Interfaz Gráfica (EDT)',
        action: 'El mozo ingresa usuario/contraseña en Login.java y hace clic en "Entrar". El botón cambia a "Ingresando..." y se deshabilita.',
        query: 'N/A (Cálculo de validaciones locales en la vista)',
        icon: Monitor,
        image: 'Login-Register/Login.png',
        snippet: `// vistas/Login.java
private void EntrarActionPerformed(java.awt.event.ActionEvent evt) {
    String nombreUsuario = Usuarioimput.getText().trim();
    String contrasena = String.valueOf(Password.getPassword());

    if (nombreUsuario.isEmpty() || contrasena.isEmpty()) {
        javax.swing.JOptionPane.showMessageDialog(this, "Por favor ingresá...");
        return;
    }
    Entrar.setEnabled(false);
    Entrar.setText("Ingresando...");
    // ...
}`
      },
      {
        title: 'Despacho Asíncrono',
        actor: 'AsyncDataLoader (SwingWorker)',
        action: 'Se instancia un hilo secundario que invoca a ServicioFactory.getUsuarioService().iniciarSesion(usuario, password). El EDT permanece liberado (la UI no se congela).',
        query: 'N/A (Transición a la capa de servicios)',
        icon: Activity,
        image: 'Login-Register/Login.png',
        snippet: `// vistas/util/AsyncDataLoader.java
public static <T> void load(Component parent, Callable<T> task, 
                            Consumer<T> onSuccess, Consumer<Throwable> onError) {
    parent.setCursor(Cursor.getPredefinedCursor(Cursor.WAIT_CURSOR));
    SwingWorker<T, Void> worker = new SwingWorker<>() {
        @Override
        protected T doInBackground() throws Exception {
            return task.call(); // Ejecución en segundo plano (hilo background)
        }
        // ...
    };
    worker.execute();
}`
      },
      {
        title: 'Autenticación con Hash SHA2-256',
        actor: 'UsuarioDAOImpl & Base de Datos',
        action: 'El DAO JDBC ejecuta una consulta preparada inyectando la contraseña y delegando el hashing en la base de datos MySQL de TiDB.',
        query: 'SELECT u.id_usuario, u.nombre, u.id_rol FROM usuarios u WHERE u.usuario = ? AND u.contrasena = SHA2(?, 256) AND u.activo = TRUE',
        icon: Database,
        image: 'Login-Register/Register.png',
        snippet: `// com.restaurant.backend.dao.UsuarioDAOImpl
String query = "SELECT id_usuario, nombre FROM usuarios WHERE usuario = ? AND contrasena = SHA2(?, 256)";
try (Connection conn = ConexionDB.getInstance().getConnection();
     PreparedStatement ps = conn.prepareStatement(query)) {
    ps.setString(1, usuario);
    ps.setString(2, password);
    try (ResultSet rs = ps.executeQuery()) {
        // ... retorna datos del usuario ...
    }
}`
      },
      {
        title: 'Carga del Tablero Principal',
        actor: 'Menú Principal (EDT)',
        action: 'La base de datos retorna el objeto Usuario. El SwingWorker finaliza y abre la ventana Menu.java en el hilo EDT, cargando el nombre y el rol en la cabecera.',
        query: 'N/A (Inicialización de paneles de mesas, pedidos y catálogo)',
        icon: UserCheck,
        image: 'CargarPedido/MenuPrincipal-1.png',
        snippet: `// vistas/Login.java
AsyncDataLoader.load(this,
    () -> ServicioFactory.getUsuarioService().iniciarSesion(usuario, password),
    usuarioAutenticado -> {
        // Callback ejecutado en el EDT principal al finalizar la carga
        Menu menu = new Menu(usuarioAutenticado);
        menu.setVisible(true);
        this.dispose(); // Cierra login actual
    },
    error -> showMessageDialog(error)
);`
      }
    ],
    pedido: [
      {
        title: 'Selección de Productos',
        actor: 'Panel de Menú (EDT)',
        action: 'El mozo selecciona categorías de comidas. Los productos se cargan dinámicamente y se agregan a la comanda actual calculando el total interactivamente.',
        query: 'N/A (Lógica en memoria de Swing)',
        icon: Monitor,
        image: 'CargarPedido/MenuFiltradoCategorias-2.png',
        snippet: `// vistas/Menu.java
// Carga catálogo de productos activos filtrados por categoría
for (Producto prod : productos) {
    CardProducto card = new CardProducto();
    card.setProducto(prod.getNombre(), prod.getPrecio().doubleValue());
    card.setOnAgregarListener((nombre, precio) -> agregarProductoTabla(nombre, precio));
    panelProductos.add(card);
}
panelProductos.revalidate();`
      },
      {
        title: 'Checkout y Confirmación',
        actor: 'CheckoutDialog (JDialog)',
        action: 'Se abre el diálogo modal para seleccionar la mesa, digitar descuentos (ej: 10%) e ingresar método de pago y observaciones.',
        query: 'N/A (Captura y validación de campos)',
        icon: UserCheck,
        image: 'CargarPedido/Checkout-4.png',
        snippet: `// vistas/CheckoutDialog.java
private void recalcularTotalConDescuento() {
    double descuento = obtenerDescuento();
    double total = subtotalOriginal;
    if (descuento > 0) {
        if (descuento <= 100) {
            total = subtotalOriginal * (1 - (descuento / 100.0)); // %
        } else {
            total = Math.max(0.0, subtotalOriginal - descuento); // Fijo
        }
    }
    TotalNum.setText(String.format(Locale.US, "$%.2f", total));
}`
      },
      {
        title: 'Registro Transaccional & Descuento de Stock',
        actor: 'PedidoService (Backend)',
        action: 'El backend procesa el pedido en una transacción: inserta la cabecera en pedidos, los ítems en detalle_pedido y reduce el stock de la tabla de productos inmediatamente.',
        query: 'INSERT INTO pedidos (id_mesa, id_usuario, estado, total) ... ; UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
        icon: Database,
        image: 'CargarPedido/Confirmacion-6.png',
        snippet: `// com.restaurant.backend.dao.PedidoDAOImpl
try {
    conn = DatabaseConnection.getConnection();
    conn.setAutoCommit(false); // Inicia transacción atómica
    PreparedStatement ps = conn.prepareStatement(queryPedido, Statement.RETURN_GENERATED_KEYS);
    // ... ejecuta cabecera ...
    PreparedStatement psDetalles = conn.prepareStatement(queryDetalles);
    // ... agrega batch de detalles ...
    psDetalles.executeBatch();
    conn.commit(); // Éxito: confirma cambios
} catch (SQLException ex) {
    conn.rollback(); // Falla: anula cambios
}`
      },
      {
        title: 'Actualización en Vivo e Impresión de Comanda',
        actor: 'Tablero & JFileChooser (EDT)',
        action: 'La mesa pasa a color ROJO (Ocupada). Se abre el selector de archivos local para guardar el archivo comanda_mesa_X.txt con el formato del ticket.',
        query: 'N/A (Escritura del ticket en el sistema de archivos)',
        icon: Package,
        image: 'CargarPedido/ADondeSeGuardaLaComanda-5.png',
        snippet: `// vistas/Menu.java
// Impresión local en archivo comanda_mesa_X.txt
JFileChooser fileChooser = new JFileChooser();
fileChooser.setSelectedFile(new File("comanda_mesa_" + mesaId + ".txt"));
if (fileChooser.showSaveDialog(this) == JFileChooser.APPROVE_OPTION) {
    File archivo = fileChooser.getSelectedFile();
    // Escribe formato de ticket de texto plano
    guardarTicket(archivo, detalles);
}`
      }
    ],
    liberar: [
      {
        title: 'Acción de Liberar Mesa',
        actor: 'DetallesMesasPanel (EDT)',
        action: 'Al presionar "Liberar", la interfaz verifica si jTable1 tiene filas (pedidos activos). Al detectar pedidos activos, solicita confirmación interactiva con JOptionPane.',
        query: 'N/A (Validación local sobre el JTable)',
        icon: Monitor,
        image: 'ABMMesas/MesaOcupada-1.png',
        snippet: `// vistas/paneles/DetallesMesasPanel.java
private void btnLiberarActionPerformed() {
    if (mesaSeleccionada != null) {
        // Valida si la tabla gráfica Swing tiene pedidos cargados en EDT
        boolean tienePedidosActivos = jTable1.getRowCount() > 0;
        // ...
    }
}`
      },
      {
        title: 'Confirmación del Usuario (JOptionPane)',
        actor: 'Diálogo de Confirmación (EDT)',
        action: 'Se muestra una alerta emergente advirtiendo al usuario: "¿Desea cerrar todos los pedidos abiertos y liberar la mesa?". El mozo selecciona "Sí".',
        icon: AlertTriangle,
        query: 'N/A',
        image: 'ABMMesas/SePreguntaSiQuiereLiberarLaMesa-2.png',
        snippet: `// vistas/paneles/DetallesMesasPanel.java
if (tienePedidosActivos) {
    int opcion = javax.swing.JOptionPane.showConfirmDialog(
            this,
            "La mesa tiene pedidos abiertos. ¿Desea cerrarlos y liberar?",
            "Confirmar Liberar Mesa",
            javax.swing.JOptionPane.YES_NO_OPTION,
            javax.swing.JOptionPane.WARNING_MESSAGE
    );
    if (opcion != javax.swing.JOptionPane.YES_OPTION) return; // Cancela
}`
      },
      {
        title: 'Cierre de Comandas & Cambio de Estado',
        actor: 'MesaService (Backend)',
        action: 'El servicio busca los pedidos en estados ABIERTO, EN_COCINA o LISTO y los marca como CERRADO. Finalmente, actualiza el estado de la mesa a LIBRE.',
        query: 'UPDATE pedidos SET estado = \'CERRADO\' WHERE id_mesa = ? AND estado IN (\'ABIERTO\', \'EN_COCINA\', \'LISTO\'); UPDATE mesas SET estado = \'LIBRE\' WHERE id_mesa = ?',
        icon: Database,
        image: 'ABMMesas/Confirmacion-3.png',
        snippet: `// com.restaurant.backend.service.MesaService
public String liberar(int mesaId) {
    // 1. Cierra todos los pedidos activos de la mesa
    pedidoDAO.cerrarPedidosDeMesa(mesaId, EstadoPedido.CERRADO);
    // 2. Modifica el estado de la mesa a libre
    return mesaDAO.cambiarEstado(mesaId, EstadoMesa.LIBRE);
}`
      },
      {
        title: 'Actualización Visual del Salón',
        actor: 'MesasPanel (EDT)',
        action: 'La base de datos retorna éxito. El panel de mesas se refresca asíncronamente y el botón de la mesa cambia de rojo (Ocupada) a verde (Libre).',
        query: 'N/A (Redibujado del grid de mesas en el EDT)',
        icon: CheckCircle2,
        image: 'ABMMesas/NuevoEstadoDeMesa-4.png',
        snippet: `// vistas/paneles/MesasPanel.java (Callback Done)
private void colorearBotonesMesas(List<Mesa> listaMesas) {
    for (Mesa m : listaMesas) {
        JButton btn = botones[m.getNumero() - 1];
        switch (m.getEstado()) {
            case LIBRE -> btn.setBackground(new Color(51, 204, 0)); // Verde
            case OCUPADA -> btn.setBackground(new Color(255, 51, 51)); // Rojo
        }
    }
}`
      }
    ],
    abm: [
      {
        title: 'Visualización de Catálogo',
        actor: 'ProductosPanel (EDT)',
        action: 'El administrador accede a la sección de gestión de productos. Se muestra el listado completo consultando la base de datos de forma dinámica.',
        query: 'SELECT p.id_producto, p.nombre, p.precio, p.stock, p.activo, c.nombre AS categoria FROM productos p JOIN categorias c ON p.id_categoria = c.id_categoria ORDER BY p.id_producto',
        icon: Monitor,
        image: 'ProductosABM/ProductosActuales-1.png',
        snippet: `// vistas/paneles/ProductosPanel.java
private void cargarProductosTabla() {
    List<Producto> lista = productoService.listarTodos();
    DefaultTableModel modelo = (DefaultTableModel) tblProductos.getModel();
    modelo.setRowCount(0);
    for (Producto p : lista) {
        modelo.addRow(new Object[]{
            p.getIdProducto(), p.getNombre(), p.getPrecio(), p.getStock(), p.isActivo() ? "Activo" : "Inactivo"
        });
    }
}`
      },
      {
        title: 'Formulario de Alta',
        actor: 'AltaProductoDialog (JDialog)',
        action: 'Al presionar "Nuevo", se despliega un diálogo modal para ingresar los datos del producto (nombre, precio, stock y categoría).',
        query: 'N/A (Carga de categorías para combobox: SELECT * FROM categorias)',
        icon: FileCode,
        image: 'ProductosABM/AltaProducto.png',
        snippet: `// vistas/paneles/ProductosPanel.java
private void btnNuevoActionPerformed() {
    // Instancia el modal de alta pasándole el parent y seleccionando modo inserción
    AltaProductoDialog dialog = new AltaProductoDialog(this.getFrameParent(), true);
    dialog.setVisible(true);
    if (dialog.isGuardadoExitoso()) {
        cargarProductosTabla(); // Refresca grilla Swing
    }
}`
      },
      {
        title: 'Inserción en Base de Datos',
        actor: 'ProductoDAOImpl (Backend)',
        action: 'El backend procesa la solicitud e inserta el nuevo producto. En caso de éxito, retorna el ID autogenerado por MySQL / TiDB.',
        query: 'INSERT INTO productos (nombre, precio, stock, id_categoria, activo) VALUES (?, ?, ?, ?, TRUE)',
        icon: Database,
        image: 'ProductosABM/AltaProducto.png',
        snippet: `// com.restaurant.backend.dao.ProductoDAOImpl
public int insertar(Producto p) throws SQLException {
    String sql = "INSERT INTO productos (nombre, precio, stock, id_categoria, activo) VALUES (?, ?, ?, ?, ?)";
    try (Connection conn = ConexionDB.getInstance().getConnection();
         PreparedStatement ps = conn.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {
        ps.setString(1, p.getNombre());
        ps.setBigDecimal(2, p.getPrecio());
        ps.setInt(3, p.getStock());
        ps.setInt(4, p.getIdCategoria());
        ps.setBoolean(5, p.isActivo());
        ps.executeUpdate();
        try (ResultSet rs = ps.getGeneratedKeys()) {
            if (rs.next()) return rs.getInt(1); // Retorna ID generado
        }
    }
    return -1;
}`
      },
      {
        title: 'Formulario de Modificación',
        actor: 'AltaProductoDialog (JDialog)',
        action: 'Al seleccionar un registro y pulsar "Editar", se cargan los datos actuales en el formulario modal para permitir cambios en precio o stock.',
        query: 'N/A (Lógica en memoria de Swing)',
        icon: FileCode,
        image: 'ProductosABM/ModificacionProducto.png',
        snippet: `// vistas/paneles/ProductosPanel.java
private void btnEditarActionPerformed() {
    int row = tblProductos.getSelectedRow();
    if (row == -1) return;
    Producto prod = obtenerProductoSeleccionado(row);
    // Abre formulario pre-cargado
    AltaProductoDialog dialog = new AltaProductoDialog(this.getFrameParent(), true, prod);
    dialog.setVisible(true);
    if (dialog.isGuardadoExitoso()) {
        cargarProductosTabla();
    }
}`
      },
      {
        title: 'Confirmación de Baja',
        actor: 'Alerta Gráfica (EDT)',
        action: 'Para eliminar un producto se selecciona el registro y se presiona "Eliminar". Se levanta un diálogo JOptionPane solicitando confirmar la acción.',
        query: 'N/A (Interacción local del EDT)',
        icon: AlertTriangle,
        image: 'ProductosABM/ConfirmacionBajaProducto.png',
        snippet: `// vistas/paneles/ProductosPanel.java
private void btnEliminarActionPerformed() {
    int row = tblProductos.getSelectedRow();
    if (row == -1) return;
    int id = (int) tblProductos.getValueAt(row, 0);
    int confirm = javax.swing.JOptionPane.showConfirmDialog(
        this, 
        "¿Está seguro de eliminar el producto seleccionado?", 
        "Confirmar Baja de Producto", 
        javax.swing.JOptionPane.YES_NO_OPTION
    );
    if (confirm == javax.swing.JOptionPane.YES_OPTION) {
        desactivarProducto(id);
    }
}`
      },
      {
        title: 'Baja Lógica y Actualización',
        actor: 'ProductoDAOImpl & EDT',
        action: 'Se realiza una baja lógica (activo = FALSE) para resguardar la integridad referencial en reportes e históricos. La grilla Swing se actualiza mostrando el estado.',
        query: 'UPDATE productos SET activo = FALSE WHERE id_producto = ?',
        icon: CheckCircle2,
        image: 'ProductosABM/ActualizacionDeEstados-2.png',
        snippet: `// com.restaurant.backend.dao.ProductoDAOImpl (Baja Lógica)
public boolean desactivar(int idProducto) throws SQLException {
    String sql = "UPDATE productos SET activo = FALSE WHERE id_producto = ?";
    try (Connection conn = ConexionDB.getInstance().getConnection();
         PreparedStatement ps = conn.prepareStatement(sql)) {
        ps.setInt(1, idProducto);
        return ps.executeUpdate() > 0;
    }
}`
      }
    ]
  };

  // Simulate console compilation
  const runConsoleCommand = (cmd) => {
    if (isConsoleBuilding) return;
    setIsConsoleBuilding(true);
    setActiveCommand(cmd);
    setConsoleLogs([]);

    const logMessages = {
      clean: [
        'PS C:\\Users\\nicot\\Desktop\\Programacion2-Final> & "F:\\Apache NetBeans\\java\\maven\\bin\\mvn.cmd" clean',
        '[INFO] Scanning for projects...',
        '[INFO] Reactor Build Order:',
        '[INFO]   restaurant-parent [pom]',
        '[INFO]   Backend [jar]',
        '[INFO]   GUI [jar]',
        '[INFO] --- clean:3.2.0:clean (default-clean) @ restaurant-parent ---',
        '[INFO] --- clean:3.2.0:clean (default-clean) @ Backend ---',
        '[INFO] Deleting C:\\Users\\nicot\\Desktop\\Programacion2-Final\\Backend\\target',
        '[INFO] --- clean:3.2.0:clean (default-clean) @ GUI ---',
        '[INFO] Deleting C:\\Users\\nicot\\Desktop\\Programacion2-Final\\GUI\\target',
        '[INFO] ------------------------------------------------------------------------',
        '[INFO] BUILD SUCCESS',
        '[INFO] Total time: 1.450 s',
        '[INFO] Finished at: 2026-06-17T15:01:00-03:00',
        'PS C:\\Users\\nicot\\Desktop\\Programacion2-Final>'
      ],
      package: [
        'PS C:\\Users\\nicot\\Desktop\\Programacion2-Final> & "F:\\Apache NetBeans\\java\\maven\\bin\\mvn.cmd" clean package -DskipTests',
        '[INFO] Scanning for projects...',
        '[INFO] Reactor Build Order:',
        '[INFO]   restaurant-parent [pom]',
        '[INFO]   Backend [jar]',
        '[INFO]   GUI [jar]',
        '[INFO] --- clean:3.2.0:clean (default-clean) @ restaurant-parent ---',
        '[INFO] --- resources:3.4.0:resources (default-resources) @ Backend ---',
        '[INFO] Copying 4 resources from src\\main\\resources to target\\classes',
        '[INFO] --- compiler:3.15.0:compile (default-compile) @ Backend ---',
        '[INFO] Compiling 37 source files with javac [debug release 17] to target\\classes',
        '[INFO] --- jar:3.5.0:jar (default-jar) @ Backend ---',
        '[INFO] Building jar: C:\\Users\\nicot\\Desktop\\Programacion2-Final\\Backend\\target\\Backend-1.0.jar',
        '[INFO] --- resources:3.4.0:resources (default-resources) @ GUI ---',
        '[INFO] Copying 19 resources from src to target\\classes',
        '[INFO] --- compiler:3.11.0:compile (default-compile) @ GUI ---',
        '[INFO] Compiling 15 source files with javac [debug release 17] to target\\classes',
        '[INFO] --- jar:3.3.0:jar (default-jar) @ GUI ---',
        '[INFO] Building jar: C:\\Users\\nicot\\Desktop\\Programacion2-Final\\GUI\\target\\RestoManager-GUI.jar',
        '[INFO] --- maven-assembly-plugin:3.6.0:single (make-assembly) @ GUI ---',
        '[INFO] Reading assembly descriptor: src/assembly/dep.xml',
        '[INFO] Unpacking and merging: C:\\Users\\nicot\\Desktop\\Programacion2-Final\\Backend\\target\\Backend-1.0.jar',
        '[INFO] Unpacking and merging system scopes: AbsoluteLayout.jar, LGoodDatePicker.jar, jfreechart-1.5.4.jar',
        '[INFO] Unpacking and merging remote dependencies: HikariCP-5.1.0.jar, mysql-connector-j-9.1.0.jar, slf4j-api-2.0.13.jar',
        '[INFO] Building jar: C:\\Users\\nicot\\Desktop\\Programacion2-Final\\GUI\\target\\RestoManager.jar',
        '[WARNING] Replacing pre-existing project main-artifact with assembly file.',
        '[INFO] ------------------------------------------------------------------------',
        '[INFO] Reactor Summary for restaurant-parent 1.0:',
        '[INFO]   restaurant-parent .................................. SUCCESS [ 0.160 s]',
        '[INFO]   Backend ............................................ SUCCESS [ 2.450 s]',
        '[INFO]   GUI ................................................ SUCCESS [ 2.720 s]',
        '[INFO] ------------------------------------------------------------------------',
        '[INFO] BUILD SUCCESS',
        '[INFO] Total time: 5.330 s',
        'PS C:\\Users\\nicot\\Desktop\\Programacion2-Final>'
      ],
      run: [
        'PS C:\\Users\\nicot\\Desktop\\Programacion2-Final> java -jar GUI\\target\\RestoManager.jar',
        '[DEBUG] Loading configuration properties from embedded db.properties...',
        '[INFO] com.zaxxer.hikari.HikariDataSource - RestoManager-Pool - Starting...',
        '[INFO] com.zaxxer.hikari.pool.HikariPool - RestoManager-Pool - Added connection com.mysql.cj.jdbc.ConnectionImpl@3da2841a',
        '[INFO] com.zaxxer.hikari.HikariDataSource - RestoManager-Pool - Start completed.',
        '[DEBUG] ConexionDB - Successfully updated SQL view vw_ventas_por_producto.',
        '[INFO] Vistas.Login - Launching Swing desktop interface...',
        '[INFO] AWT-EventQueue-0 - Rendered Main Login Frame.',
        'Email: nicolas@nicolas',
        'Usuario: nicolas',
        'Password: ******',
        '[INFO] Usuario nicolas autenticado con rol ADMINISTRADOR.',
        '[DEBUG] AsyncDataLoader - Fetching active orders for Mesa 1 in background...',
        '[DEBUG] AsyncDataLoader - Rendered mesas grid with real-time states.',
        '[INFO] Application running successfully...'
      ]
    };

    let currentLogIndex = 0;
    const interval = setInterval(() => {
      if (currentLogIndex < logMessages[cmd].length) {
        setConsoleLogs(prev => [...prev, logMessages[cmd][currentLogIndex]]);
        currentLogIndex++;
      } else {
        clearInterval(interval);
        setIsConsoleBuilding(false);
      }
    }, 150);
  };

  return (
    <div className="min-h-screen flex bg-page text-white" style={{ backgroundColor: 'var(--bg-page)' }}>
      {/* Sidebar Navigation */}
      <aside className="w-80 flex flex-col border-r border-border" style={{ backgroundColor: 'var(--bg-sidebar)', borderColor: 'var(--border)' }}>
        {/* Brand Header */}
        <div className="p-6 border-b border-border flex items-center gap-3" style={{ borderColor: 'var(--border)' }}>
          <div className="w-10 h-10 rounded-xl bg-primary-glow flex items-center justify-center border border-primary/30" style={{ backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.3)' }}>
            <Sparkles className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white m-0" style={{ fontSize: '1.25rem', margin: 0 }}>RestoManager</h1>
            <p className="text-xs text-muted font-mono" style={{ color: 'var(--text-muted)' }}>presentación_código</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          <button 
            onClick={() => setActiveTab('inicio')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === 'inicio' ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
            style={activeTab === 'inicio' ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
          >
            <BookOpen className="w-5 h-5" />
            <span>Resumen del Proyecto</span>
          </button>

          <button 
            onClick={() => setActiveTab('arquitectura')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === 'arquitectura' ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
            style={activeTab === 'arquitectura' ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
          >
            <Layers className="w-5 h-5" />
            <span>Mapa de Arquitectura</span>
          </button>

          <button 
            onClick={() => {
              setActiveTab('flujo');
              setActiveStage('login');
              setCarouselIndex(0);
            }}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === 'flujo' ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
            style={activeTab === 'flujo' ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
          >
            <Monitor className="w-5 h-5" />
            <span>Flujo y Pantallas</span>
          </button>

          <button 
            onClick={() => setActiveTab('ide')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === 'ide' ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
            style={activeTab === 'ide' ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
          >
            <Code2 className="w-5 h-5" />
            <span>Explorador de Código</span>
          </button>

          <button 
            onClick={() => setActiveTab('simulador')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === 'simulador' ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
            style={activeTab === 'simulador' ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
          >
            <Activity className="w-5 h-5" />
            <span>Simulador de Flujos</span>
          </button>

          <button 
            onClick={() => setActiveTab('consola')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-medium transition-all duration-200 ${activeTab === 'consola' ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
            style={activeTab === 'consola' ? { backgroundColor: 'var(--primary)', color: '#000' } : {}}
          >
            <TerminalIcon className="w-5 h-5" />
            <span>Consola de Construcción</span>
          </button>
        </nav>

        {/* Footer info */}
        <div className="p-6 border-t border-border" style={{ borderColor: 'var(--border)' }}>
          <div className="bg-card p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-primary bg-primary-glow px-2 py-0.5 rounded mb-1" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
              Hotfix Aplicado
            </span>
            <p className="text-xs text-secondary font-medium" style={{ color: 'var(--text-secondary)' }}>Mesa liberación y classpath corregido.</p>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen overflow-y-auto p-10">
        
        {/* HEADER SECTION */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-extrabold text-white tracking-tight" style={{ fontSize: '1.875rem' }}>
              {activeTab === 'inicio' && 'Descripción General de la Solución'}
              {activeTab === 'arquitectura' && 'Arquitectura de Software y Componentes'}
              {activeTab === 'flujo' && 'Recorrido y Flujo de Pantallas'}
              {activeTab === 'ide' && 'Explorador de Código Interactivo'}
              {activeTab === 'simulador' && 'Simulador Visual de Eventos'}
              {activeTab === 'consola' && 'Consola y Ciclo de Compilación de Maven'}
            </h2>
            <p className="text-secondary mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'inicio' && 'Proyecto final de Programación II estructurado en Java Desktop Multi-capas.'}
              {activeTab === 'arquitectura' && 'Interactúa con los módulos para ver sus responsabilidades y acoplamientos.'}
              {activeTab === 'flujo' && 'Visualiza el ciclo de vida y los flujos del sistema con capturas y detalles técnicos.'}
              {activeTab === 'ide' && 'Inspecciona las clases de persistencia, concurrencia y los arreglos de código.'}
              {activeTab === 'simulador' && 'Simulación paso a paso del Event Dispatch Thread, SwingWorkers y llamadas SQL.'}
              {activeTab === 'consola' && 'Simula la ejecución de comandos Maven y el empaquetado del distribuidor final.'}
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs bg-card px-3 py-1.5 rounded-lg border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
            <span className="w-2 h-2 rounded-full bg-success animate-pulse" style={{ backgroundColor: 'var(--success)' }}></span>
            <span className="text-muted font-mono" style={{ color: 'var(--text-muted)' }}>Vite + React</span>
          </div>
        </header>

        {/* TAB CONTENTS */}

        {/* 1. WELCOME / INICIO TAB */}
        {activeTab === 'inicio' && (
          <div className="space-y-8 animate-slide-up">
            {/* Hero Card */}
            <div className="bg-card border border-border rounded-3xl p-8 relative overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-12 translate-y-12">
                <Sparkles className="w-80 h-80 text-primary" style={{ color: 'var(--primary)' }} />
              </div>
              
              <div className="relative max-w-2xl space-y-4">
                <span className="bg-primary-glow text-primary text-xs font-bold font-mono px-3 py-1 rounded-full border border-primary/20" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>
                  Arquitectura Multi-capas & Conexión Remota
                </span>
                <h3 className="text-4xl font-extrabold tracking-tight text-white" style={{ fontSize: '2.25rem' }}>Sistema RestoManager</h3>
                <p className="text-secondary text-lg leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                  RestoManager es una solución empresarial modular en Java. Resuelve la latencia de base de datos distribuyendo el trabajo asíncronamente fuera del hilo de renderizado principal (EDT), permitiendo un flujo de trabajo portable en un único JAR empaquetado.
                </p>
                <div className="pt-4 flex gap-4">
                  <button 
                    onClick={() => setActiveTab('flujo')}
                    className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <span>Ver Flujo del Sistema</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('arquitectura')}
                    className="border border-border hover:bg-card-hover text-white px-6 py-3 rounded-xl transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Mapa de Arquitectura
                  </button>
                </div>
              </div>
            </div>

            {/* Metrics Grid */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                Métricas Generales del Proyecto
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
                <div className="bg-card border border-border p-4 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" style={{ backgroundColor: 'var(--primary)' }}></div>
                  <div className="text-2xl font-bold font-mono text-primary" style={{ color: 'var(--primary)' }}>37</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>Clases Backend</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-400" style={{ backgroundColor: '#60a5fa' }}></div>
                  <div className="text-2xl font-bold font-mono text-blue-400" style={{ color: '#60a5fa' }}>15</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>Vistas Swing</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-success" style={{ backgroundColor: 'var(--success)' }}></div>
                  <div className="text-2xl font-bold font-mono text-success" style={{ color: 'var(--success)' }}>6+</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>Ramas Git</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-purple-500" style={{ backgroundColor: '#a78bfa' }}></div>
                  <div className="text-2xl font-bold font-mono text-purple-400" style={{ color: '#a78bfa' }}>4</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>Desarrolladores</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-primary" style={{ backgroundColor: 'var(--primary)' }}></div>
                  <div className="text-2xl font-bold font-mono text-primary" style={{ color: 'var(--primary)' }}>5</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>Entidades</div>
                </div>
                <div className="bg-card border border-border p-4 rounded-xl text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="absolute top-0 left-0 w-full h-[3px] bg-blue-400" style={{ backgroundColor: '#60a5fa' }}></div>
                  <div className="text-2xl font-bold font-mono text-blue-400" style={{ color: '#60a5fa' }}>5</div>
                  <div className="text-[10px] text-muted uppercase tracking-wider font-semibold mt-1" style={{ color: 'var(--text-muted)' }}>Capas Software</div>
                </div>
              </div>
            </div>

            {/* Grid of Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
              <div className="bg-card border border-border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                  <Database className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 className="text-lg font-bold text-white font-sans">HikariCP Connection Pool</h4>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Elimina la sobrecarga de handshake SSL/TLS de TiDB Cloud manteniendo 10 conexiones persistentes en caliente y cacheadas.
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                  <Activity className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 className="text-lg font-bold text-white font-sans">Event Dispatch Thread Libre</h4>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Mediante SwingWorkers, la interfaz gráfica Swing nunca se bloquea ni genera cuelgues durante consultas SQL concurrentes.
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                  <Package className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 className="text-lg font-bold text-white font-sans">JAR Único Autocontenido</h4>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Unificación del empaquetado mediante Maven Assembly para generar un distribuidor ejecutable de 6.9MB sin requerir carpetas auxiliares.
                </p>
              </div>
            </div>

            {/* External Libraries */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                Librerías Externas de la GUI
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card border border-border p-6 rounded-2xl space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <h5 className="font-bold text-white text-base">AbsoluteLayout.jar</h5>
                  <p className="text-secondary text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Gestor de layout propietario de NetBeans GUI Builder. Permite el posicionamiento absoluto de componentes en formularios interactivos <code>.form</code>.
                  </p>
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <h5 className="font-bold text-white text-base">jfreechart-1.5.4.jar</h5>
                  <p className="text-secondary text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Motor estadístico para la generación de gráficos vectoriales integrados en la GUI (gráfico circular por categorías e históricos de ingresos de ventas mensuales).
                  </p>
                </div>
                <div className="bg-card border border-border p-6 rounded-2xl space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <h5 className="font-bold text-white text-base">LGoodDatePicker.jar</h5>
                  <p className="text-secondary text-xs leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Selector visual sofisticado de fecha y hora para el módulo de reserva y asignación de mesas del restaurante.
                  </p>
                </div>
              </div>
            </div>

            {/* Developer Team Section */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                Equipo de Desarrollo (Programación II)
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#f97316,#ea580c)' }}>A</div>
                  <div>
                    <div className="text-sm font-bold text-white">Aggs13</div>
                    <div className="text-[10px] text-muted" style={{ color: 'var(--text-muted)' }}>Backend (DAO, Modelo, Tests)</div>
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6)' }}>N</div>
                  <div>
                    <div className="text-sm font-bold text-white">Niquinhoo</div>
                    <div className="text-[10px] text-muted" style={{ color: 'var(--text-muted)' }}>Integración, Async, Conexión</div>
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#34d399,#059669)' }}>E</div>
                  <div>
                    <div className="text-sm font-bold text-white">EnzoLlanos</div>
                    <div className="text-[10px] text-muted" style={{ color: 'var(--text-muted)' }}>GUI (Vistas Swing, Checkout)</div>
                  </div>
                </div>
                <div className="bg-card border border-border p-4 rounded-2xl flex items-center gap-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm" style={{ background: 'linear-gradient(135deg,#a78bfa,#7c3aed)' }}>G</div>
                  <div>
                    <div className="text-sm font-bold text-white">GonzaloBarroso</div>
                    <div className="text-[10px] text-muted" style={{ color: 'var(--text-muted)' }}>Backend (ProductoDAO)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Hotfix Highlight section */}
            <div className="bg-card border border-warning/20 p-6 rounded-2xl flex gap-4 items-start animate-pulse" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>
              <div className="p-3 bg-warning/10 text-primary rounded-xl" style={{ backgroundColor: 'rgba(249, 155, 32, 0.1)', color: 'var(--primary)' }}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Detalle de los Hotfixes Recientes</h4>
                <p className="text-sm text-secondary" style={{ color: 'var(--text-secondary)' }}>
                  Corregimos el fallo de ejecución manual (<code>NoClassDefFoundError: HikariConfig</code>) inyectando SLF4J y HikariCP en el comando classpath. Además, habilitamos la liberación controlada de mesas con advertencia previa: al liberar, se advierte al usuario si la mesa posee comandas abiertas y se cierran automáticamente todos los pedidos en la base de datos de manera transaccional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. ARCHITECTURE TAB */}
        {activeTab === 'arquitectura' && (
          <div className="space-y-8 animate-slide-up">
            <div className="bg-card border border-border rounded-3xl p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="text-xl font-bold text-white mb-6">Mapa Interactivo de Módulos y Capas</h3>
              
              {/* Layers selector buttons */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-8">
                <button
                  onClick={() => setSelectedLayer('vista')}
                  className={`px-4 py-3 rounded-xl font-semibold text-xs transition border flex flex-col items-center gap-1 ${selectedLayer === 'vista' ? 'bg-primary-glow border-primary text-primary' : 'border-border text-secondary hover:bg-card-hover'}`}
                  style={selectedLayer === 'vista' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { borderColor: 'var(--border)' }}
                >
                  <Monitor className="w-4 h-4" />
                  <span>Capa Vista (GUI)</span>
                </button>
                <button
                  onClick={() => setSelectedLayer('servicio')}
                  className={`px-4 py-3 rounded-xl font-semibold text-xs transition border flex flex-col items-center gap-1 ${selectedLayer === 'servicio' ? 'bg-primary-glow border-primary text-primary' : 'border-border text-secondary hover:bg-card-hover'}`}
                  style={selectedLayer === 'servicio' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { borderColor: 'var(--border)' }}
                >
                  <Server className="w-4 h-4" />
                  <span>Capa Servicio</span>
                </button>
                <button
                  onClick={() => setSelectedLayer('dao')}
                  className={`px-4 py-3 rounded-xl font-semibold text-xs transition border flex flex-col items-center gap-1 ${selectedLayer === 'dao' ? 'bg-primary-glow border-primary text-primary' : 'border-border text-secondary hover:bg-card-hover'}`}
                  style={selectedLayer === 'dao' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { borderColor: 'var(--border)' }}
                >
                  <FileCode className="w-4 h-4" />
                  <span>Capa DAO</span>
                </button>
                <button
                  onClick={() => setSelectedLayer('modelo')}
                  className={`px-4 py-3 rounded-xl font-semibold text-xs transition border flex flex-col items-center gap-1 ${selectedLayer === 'modelo' ? 'bg-primary-glow border-primary text-primary' : 'border-border text-secondary hover:bg-card-hover'}`}
                  style={selectedLayer === 'modelo' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { borderColor: 'var(--border)' }}
                >
                  <Package className="w-4 h-4" />
                  <span>Capa Modelo</span>
                </button>
                <button
                  onClick={() => setSelectedLayer('persistencia')}
                  className={`px-4 py-3 rounded-xl font-semibold text-xs transition border flex flex-col items-center gap-1 ${selectedLayer === 'persistencia' ? 'bg-primary-glow border-primary text-primary' : 'border-border text-secondary hover:bg-card-hover'}`}
                  style={selectedLayer === 'persistencia' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { borderColor: 'var(--border)' }}
                >
                  <Database className="w-4 h-4" />
                  <span>Persistencia</span>
                </button>
              </div>

              {/* Dynamic Layer Info Box */}
              {selectedLayer === 'vista' && (
                <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                    🖼️ Capa Vista (GUI) — Swing Desktop (¡Haz clic en los archivos para inspeccionar su código!)
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Formularios interactivos construidos con NetBeans GUI Builder. Responsable exclusivo de capturar la interacción del usuario y redibujar componentes. Para garantizar la fluidez de la aplicación bajo latencias de red, todas las llamadas a la base de datos se delegan asíncronamente en hilos de fondo mediante <code>AsyncDataLoader</code> y <code>SwingWorker</code>, previniendo congelamientos del EDT.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => { setActiveCodeFile('loginJava'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>Login.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('menuJava'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>Menu.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('mesasPanelJava'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>MesasPanel.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('detallesMesasPanel'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>DetallesMesasPanel.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('checkoutDialogJava'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>CheckoutDialog.java</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedLayer === 'servicio' && (
                <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                    ⚙️ Capa de Servicio / Controlador (Lógica de Negocio)
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Actúa como orquestador del negocio. Los servicios validan estados de mesas, ejecutan el control de inventario y organizan las transacciones críticas. La instanciación de los servicios se centraliza en <code>ServicioFactory</code>, implementando el patrón Singleton mediante <em>Double-Checked Locking</em> para evitar problemas de concurrencia al llamarse desde múltiples hilos background.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => { setActiveCodeFile('mesaService'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>MesaService.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('pedidoService'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>PedidoService.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('servicioFactory'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>ServicioFactory.java</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedLayer === 'dao' && (
                <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                    🗄️ Capa DAO (Data Access Object)
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Abstrae y aísla por completo el acceso físico a los datos. Cada entidad expone una interfaz DAO (contrato de operaciones) y una implementación concreta basada en JDBC tradicional. Se utilizan sentencias SQL parametrizadas con <code>PreparedStatement</code> para evitar la inyección de SQL. Las operaciones de guardado de comandas son completamente transaccionales.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => { setActiveCodeFile('pedidoDAO'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>PedidoDAOImpl.java</span>
                    </button>
                  </div>
                </div>
              )}

              {selectedLayer === 'modelo' && (
                <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                    📦 Capa Modelo (Entidades del Dominio)
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    POJOs (Plain Old Java Objects) limpios que representan las tablas relacionales en objetos orientados a objetos. No poseen lógica de negocio. Utilizan enums fuertemente tipados (<code>EstadoMesa</code>, <code>EstadoPedido</code>, <code>Rol</code>) para garantizar la seguridad de tipos y validaciones sintácticas en compilación.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2 text-xs text-muted font-mono">
                    <span>Mesa.java (POJO) · </span>
                    <span>Pedido.java (POJO) · </span>
                    <span>Producto.java (POJO) · </span>
                    <span>Usuario.java (POJO)</span>
                  </div>
                </div>
              )}

              {selectedLayer === 'persistencia' && (
                <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                    🔌 Capa de Persistencia y Base de Datos (TiDB Cloud)
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Motor relacional MySQL hospedado remotamente en TiDB Cloud. La conexión física es administrada de forma centralizada por el pool HikariCP configurado a través de <code>ConexionDB.java</code>. El pool mantiene conexiones pre-establecidas activas para mitigar la sobrecarga de handshake SSL/TLS, reduciendo tiempos de consulta de ~500ms a &lt;5ms.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <button
                      onClick={() => { setActiveCodeFile('conexionDB'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>ConexionDB.java</span>
                    </button>
                    <button
                      onClick={() => { setActiveCodeFile('depXml'); setActiveTab('ide'); }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>dep.xml (Assembly)</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Core architecture mapping visually */}
            <div className="bg-card border border-border rounded-3xl p-8 space-y-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-border pb-4 gap-4" style={{ borderColor: 'var(--border)' }}>
                <div>
                  <h3 className="text-xl font-bold text-white font-sans">Mapa Interactivo de Módulos Maven & Dependencias</h3>
                  <p className="text-secondary text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>Haz clic en los módulos o en sus dependencias para explorar la arquitectura.</p>
                </div>
                <button
                  onClick={() => {
                    if (buildStep >= 0) {
                      setBuildStep(-1);
                    } else {
                      setBuildStep(0);
                    }
                  }}
                  className={`px-4 py-2 rounded-xl text-xs font-bold font-mono border transition flex items-center gap-2 ${buildStep >= 0 ? 'bg-primary-glow border-primary text-primary' : 'border-border text-secondary hover:bg-card-hover hover:text-white'}`}
                  style={buildStep >= 0 ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { borderColor: 'var(--border)' }}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{buildStep >= 0 ? 'Detener Simulación' : 'Simular Reactor Build (Fat JAR)'}</span>
                </button>
              </div>

              {/* REACTOR SIMULATOR VIEW (IF ACTIVE) */}
              {buildStep >= 0 && (
                <div className="bg-code-bg p-6 rounded-2xl border border-primary/20 space-y-4 animate-slide-up shadow-inner relative overflow-hidden" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>
                  <div className="absolute right-4 top-4 text-xs font-mono text-muted" style={{ color: 'var(--text-muted)' }}>
                    Paso {buildStep + 1} de 4
                  </div>
                  <h4 className="text-sm font-bold text-white font-mono uppercase tracking-wider text-primary" style={{ color: 'var(--primary)' }}>
                    Simulador del Reactor de Construcción Maven (mvn clean package)
                  </h4>
                  
                  {/* Compilation timeline steps */}
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { step: 0, title: 'Parent POM', label: '1. Orquestación' },
                      { step: 1, title: 'Backend Módulo', label: '2. Compilar Core' },
                      { step: 2, title: 'GUI Módulo', label: '3. Compilar Vistas' },
                      { step: 3, title: 'Assembly (dep.xml)', label: '4. Generar Fat JAR' }
                    ].map((s) => (
                      <button
                        key={s.step}
                        onClick={() => setBuildStep(s.step)}
                        className={`text-left p-3 rounded-xl border transition-all ${buildStep === s.step ? 'bg-primary-glow border-primary text-white' : 'border-border text-secondary hover:bg-card-hover'}`}
                        style={buildStep === s.step ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : { borderColor: 'var(--border)' }}
                      >
                        <p className="text-[10px] font-mono opacity-60">{s.label}</p>
                        <p className="text-xs font-bold truncate">{s.title}</p>
                      </button>
                    ))}
                  </div>

                  {/* Simulator Step Detail */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2 items-stretch">
                    {/* Description */}
                    <div className="md:col-span-2 space-y-3 bg-card p-5 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <h5 className="font-bold text-white text-sm">
                        {buildStep === 0 && 'Paso 1: restaurant-parent — Inicialización y Orquestación'}
                        {buildStep === 1 && 'Paso 2: Módulo Backend — Compilación de Clases y Generación de JAR'}
                        {buildStep === 2 && 'Paso 3: Módulo GUI — Compilación de Vistas Swing'}
                        {buildStep === 3 && 'Paso 4: maven-assembly-plugin — Desempaquetado y Fusión final (dep.xml)'}
                      </h5>
                      <p className="text-xs text-secondary leading-relaxed font-sans" style={{ color: 'var(--text-secondary)' }}>
                        {buildStep === 0 && 'Maven lee el POM Padre y valida la estructura multi-módulo. Determina el orden de construcción (Reactor Build Order) estableciendo que Backend compilará primero, seguido de GUI. Además, inyecta configuraciones globales compartidas como el release target del compilador (Java 17) y codificación de caracteres UTF-8.'}
                        {buildStep === 1 && 'Se compilan los 37 archivos de código fuente de la capa Backend (Entidades, interfaces DAO, implementaciones JDBC, y servicios). Se ejecutan las pruebas unitarias JUnit (si no se omite con -DskipTests) y se empaqueta la biblioteca en Backend/target/Backend-1.0.jar.'}
                        {buildStep === 2 && 'Se compilan las 15 vistas y paneles visuales Swing de la GUI (incluyendo la lógica del Login, Menú de mozo, salón de mesas y reportes de JFreeChart). Se empaqueta un JAR preliminar en GUI/target/RestoManager-GUI.jar y se copian los archivos de configuración asociados.'}
                        {buildStep === 3 && 'El plugin de ensamble lee el descriptor personalizado src/assembly/dep.xml. Descomprime en una carpeta temporal los contenidos de Backend-1.0.jar, las librerías remotas de Maven (HikariCP, MySQL Driver, SLF4J) y los tres JARs locales de lib/ (AbsoluteLayout, LGoodDatePicker, jfreechart) y los empaqueta juntos en un único archivo consolidado auto-ejecutable: RestoManager.jar (6.9 MB) listo para producción.'}
                      </p>
                      <div className="text-[11px] font-mono text-muted flex items-center gap-1.5" style={{ color: 'var(--text-muted)' }}>
                        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary animate-pulse" style={{ backgroundColor: 'var(--primary)' }}></span>
                        <span>
                          {buildStep === 0 && 'Comando: mvn clean (Fase de limpieza)'}
                          {buildStep === 1 && 'Fase: compile & package (Genera Backend-1.0.jar)'}
                          {buildStep === 2 && 'Fase: compile & resource copying (GUI)'}
                          {buildStep === 3 && 'Fase: maven-assembly-plugin:single (Procesa dep.xml)'}
                        </span>
                      </div>
                    </div>

                    {/* Step Visual Animation */}
                    <div className="bg-card rounded-xl border border-border p-5 flex flex-col justify-center items-center text-center relative overflow-hidden" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      {buildStep === 0 && (
                        <div className="space-y-3 animate-slide-up">
                          <Package className="w-12 h-12 text-primary mx-auto animate-bounce" style={{ color: 'var(--primary)' }} />
                          <div className="text-xs font-bold text-white">restaurant-parent</div>
                          <div className="text-[10px] text-muted leading-tight" style={{ color: 'var(--text-muted)' }}>Analizando dependencias y estableciendo orden de compilación del Reactor.</div>
                        </div>
                      )}
                      {buildStep === 1 && (
                        <div className="space-y-3 animate-slide-up">
                          <Server className="w-12 h-12 text-primary mx-auto" style={{ color: 'var(--primary)' }} />
                          <div className="text-xs font-bold text-white">Backend-1.0.jar</div>
                          <div className="text-[10px] text-success font-mono" style={{ color: 'var(--success)' }}>[INFO] BUILD SUCCESS</div>
                          <div className="text-[10px] text-muted" style={{ color: 'var(--text-muted)' }}>Biblioteca empaquetada con éxito en target/</div>
                        </div>
                      )}
                      {buildStep === 2 && (
                        <div className="space-y-3 animate-slide-up">
                          <Monitor className="w-12 h-12 text-primary mx-auto" style={{ color: 'var(--primary)' }} />
                          <div className="text-xs font-bold text-white">RestoManager-GUI.jar</div>
                          <div className="text-[10px] text-success font-mono" style={{ color: 'var(--success)' }}>[INFO] Compile Java 17 ok</div>
                          <div className="text-[10px] text-muted animate-pulse" style={{ color: 'var(--text-muted)' }}>Esperando ensamble de dependencias...</div>
                        </div>
                      )}
                      {buildStep === 3 && (
                        <div className="space-y-3 animate-slide-up relative w-full h-full flex flex-col justify-center items-center">
                          <div className="flex gap-2 justify-center items-center mb-1">
                            <div className="w-6 h-6 rounded bg-card-hover border border-border flex items-center justify-center text-[8px] font-mono text-muted animate-ping" style={{ animationDuration: '3s' }}>lib</div>
                            <div className="w-6 h-6 rounded bg-card-hover border border-border flex items-center justify-center text-[8px] font-mono text-muted animate-ping" style={{ animationDuration: '2.5s' }}>core</div>
                            <div className="w-6 h-6 rounded bg-card-hover border border-border flex items-center justify-center text-[8px] font-mono text-muted animate-ping" style={{ animationDuration: '2s' }}>gui</div>
                          </div>
                          <div className="w-12 h-12 rounded-xl bg-primary-glow border border-primary flex items-center justify-center animate-pulse" style={{ backgroundColor: 'var(--primary-glow)', borderColor: 'var(--primary)' }}>
                            <Package className="w-6 h-6 text-primary" style={{ color: 'var(--primary)' }} />
                          </div>
                          <div className="text-xs font-bold text-white mt-1 font-sans">RestoManager.jar (6.9MB)</div>
                          <div className="text-[9px] text-muted uppercase font-mono tracking-wider mt-0.5" style={{ color: 'var(--text-muted)' }}>Fat JAR Único</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Simulator Controls */}
                  <div className="flex justify-between items-center pt-2">
                    <button
                      disabled={buildStep === 0}
                      onClick={() => setBuildStep(p => p - 1)}
                      className="px-3 py-1.5 border border-border text-secondary rounded-lg text-xs font-semibold hover:bg-card-hover disabled:opacity-40 transition"
                      style={{ borderColor: 'var(--border)' }}
                    >
                      Paso Anterior
                    </button>
                    <button
                      onClick={() => {
                        if (buildStep === 3) {
                          setBuildStep(-1);
                        } else {
                          setBuildStep(p => p + 1);
                        }
                      }}
                      className="bg-primary hover:bg-primary-hover text-black px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                    >
                      {buildStep === 3 ? 'Finalizar Simulación' : 'Siguiente Paso'}
                    </button>
                  </div>
                </div>
              )}

              {/* INTERACTIVE DEPENDENCY VISUAL GRAPH */}
              <div className="bg-code-bg/30 p-6 rounded-2xl border border-border relative overflow-hidden" style={{ borderColor: 'var(--border)', backgroundColor: 'rgba(26, 21, 17, 0.3)' }}>
                <span className="absolute top-3 left-3 text-[10px] font-mono text-muted uppercase tracking-wider" style={{ color: 'var(--text-muted)' }}>
                  Visualizador de Estructura de Módulos (¡Haz clic en un módulo o dependencia!)
                </span>
                
                {/* Visual Tree */}
                <div className="pt-8 pb-4 flex flex-col items-center gap-6 relative w-full overflow-x-auto">
                  
                  {/* Row 1: Parent Orquestador */}
                  <button
                    onClick={() => {
                      setActivatedMavenModule('parent');
                      setSelectedDep(null);
                    }}
                    className={`p-4 rounded-xl border text-center transition min-w-[200px] z-10 ${activatedMavenModule === 'parent' && !selectedDep ? 'border-primary bg-primary-glow shadow-lg' : 'border-border bg-card hover:border-primary/50'}`}
                    style={activatedMavenModule === 'parent' && !selectedDep ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : { borderColor: 'var(--border)' }}
                  >
                    <Package className="w-5 h-5 text-primary mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                    <div className="text-xs font-bold text-white font-sans">restaurant-parent</div>
                    <div className="text-[9px] text-muted font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>pom.xml (Raíz)</div>
                  </button>

                  {/* Horizontal/Vertical connector line visual trick */}
                  <div className="w-0.5 h-6 bg-border" style={{ backgroundColor: 'var(--border)' }}></div>

                  {/* Row 2: Submodules */}
                  <div className="flex gap-16 md:gap-32 justify-center items-start relative w-full max-w-4xl px-4">
                    {/* SVG Connector line background */}
                    <div className="absolute inset-0 pointer-events-none flex justify-center items-start" style={{ height: '100px' }}>
                      <svg className="w-full h-full opacity-35 stroke-primary" style={{ stroke: 'var(--primary)', strokeWidth: 1.5, fill: 'none' }}>
                        <path d="M 220,0 L 220,20 L 100,20 L 100,60" className="hidden md:block" />
                        <path d="M 220,0 L 220,20 L 340,20 L 340,60" className="hidden md:block" />
                      </svg>
                    </div>

                    {/* Módulo Backend */}
                    <div className="flex flex-col items-center gap-4 z-10">
                      <button
                        onClick={() => {
                          setActivatedMavenModule('backend');
                          setSelectedDep(null);
                        }}
                        className={`p-4 rounded-xl border text-center transition min-w-[180px] ${activatedMavenModule === 'backend' && !selectedDep ? 'border-primary bg-primary-glow shadow-lg' : 'border-border bg-card hover:border-primary/50'}`}
                        style={activatedMavenModule === 'backend' && !selectedDep ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : { borderColor: 'var(--border)' }}
                      >
                        <Server className="w-5 h-5 text-primary mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                        <div className="text-xs font-bold text-white font-sans">Módulo Backend</div>
                        <div className="text-[9px] text-muted font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>Backend/pom.xml (jar)</div>
                      </button>

                      <div className="w-0.5 h-4 bg-border" style={{ backgroundColor: 'var(--border)' }}></div>

                      {/* Backend Dependencies list */}
                      <div className="bg-card/40 rounded-xl border border-border p-3 space-y-2 min-w-[190px]" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-[9px] text-muted uppercase font-bold tracking-wider text-center" style={{ color: 'var(--text-muted)' }}>Dependencias</p>
                        
                        <button
                          onClick={() => setSelectedDep('mysql')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'mysql' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-secondary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'mysql' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : {}}
                        >
                          mysql-connector-j
                        </button>
                        
                        <button
                          onClick={() => setSelectedDep('hikaricp')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'hikaricp' ? 'bg-primary-glow border-primary text-primary font-bold animate-pulse' : 'bg-code-bg border-transparent text-secondary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'hikaricp' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : {}}
                        >
                          HikariCP (Pool)
                        </button>
                        
                        <button
                          onClick={() => setSelectedDep('slf4j')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'slf4j' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-secondary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'slf4j' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : {}}
                        >
                          slf4j-api & simple
                        </button>

                        <button
                          onClick={() => setSelectedDep('junit')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'junit' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-muted hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'junit' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { color: 'var(--text-muted)' }}
                        >
                          junit-jupiter (test)
                        </button>
                      </div>
                    </div>

                    {/* Dependency flow arrow from Backend to GUI */}
                    <div className="hidden md:flex flex-col items-center justify-center self-center" style={{ height: '70px' }}>
                      <span className="text-[10px] font-mono text-primary font-bold bg-primary-glow px-2 py-0.5 rounded border border-primary/20 mb-1" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>Depende</span>
                      <div className="flex items-center gap-1">
                        <div className="w-16 h-0.5 bg-gradient-to-r from-transparent to-primary" style={{ background: 'linear-gradient(to right, transparent, var(--primary))' }}></div>
                        <ArrowRight className="w-4 h-4 text-primary animate-pulse" style={{ color: 'var(--primary)' }} />
                      </div>
                    </div>

                    {/* Módulo GUI */}
                    <div className="flex flex-col items-center gap-4 z-10">
                      <button
                        onClick={() => {
                          setActivatedMavenModule('gui');
                          setSelectedDep(null);
                        }}
                        className={`p-4 rounded-xl border text-center transition min-w-[180px] ${activatedMavenModule === 'gui' && !selectedDep ? 'border-primary bg-primary-glow shadow-lg' : 'border-border bg-card hover:border-primary/50'}`}
                        style={activatedMavenModule === 'gui' && !selectedDep ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : { borderColor: 'var(--border)' }}
                      >
                        <Monitor className="w-5 h-5 text-primary mx-auto mb-1" style={{ color: 'var(--primary)' }} />
                        <div className="text-xs font-bold text-white font-sans">Módulo GUI</div>
                        <div className="text-[9px] text-muted font-mono mt-0.5" style={{ color: 'var(--text-muted)' }}>GUI/pom.xml (jar)</div>
                      </button>

                      <div className="w-0.5 h-4 bg-border" style={{ backgroundColor: 'var(--border)' }}></div>

                      {/* GUI Dependencies list */}
                      <div className="bg-card/40 rounded-xl border border-border p-3 space-y-2 min-w-[190px]" style={{ borderColor: 'var(--border)' }}>
                        <p className="text-[9px] text-muted uppercase font-bold tracking-wider text-center" style={{ color: 'var(--text-muted)' }}>Dependencias</p>
                        
                        <button
                          onClick={() => setSelectedDep('backend')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'backend' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-primary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'backend' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : { color: 'var(--primary)' }}
                        >
                          Backend (Modulo)
                        </button>
                        
                        <button
                          onClick={() => setSelectedDep('absoluteLayout')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'absoluteLayout' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-secondary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'absoluteLayout' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : {}}
                        >
                          AbsoluteLayout.jar
                        </button>
                        
                        <button
                          onClick={() => setSelectedDep('lgooddatepicker')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'lgooddatepicker' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-secondary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'lgooddatepicker' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : {}}
                        >
                          LGoodDatePicker.jar
                        </button>

                        <button
                          onClick={() => setSelectedDep('jfreechart')}
                          className={`w-full text-left p-1.5 rounded text-[10px] font-mono transition border ${selectedDep === 'jfreechart' ? 'bg-primary-glow border-primary text-primary font-bold' : 'bg-code-bg border-transparent text-secondary hover:bg-card-hover hover:text-white'}`}
                          style={selectedDep === 'jfreechart' ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)', color: 'var(--primary)' } : {}}
                        >
                          jfreechart-1.5.4.jar
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              </div>

              {/* MAVEN MODULE DETAILS OR MAVEN DEPENDENCY DETAILS DETAIL BOX */}
              {selectedDep ? (
                /* DEPENDENCY DETAIL VIEW */
                <div className="bg-code-bg p-6 rounded-2xl border border-primary/30 space-y-4 animate-slide-up shadow-inner relative" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'rgba(249, 155, 32, 0.3)' }}>
                  <button
                    onClick={() => setSelectedDep(null)}
                    className="absolute top-4 right-4 text-xs text-muted hover:text-white font-mono"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    [Cerrar Detalle]
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-glow border border-primary/20 flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                      <FileCode className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                    </div>
                    <div>
                      <span className="inline-block text-[10px] uppercase font-bold tracking-wider text-primary bg-primary-glow px-2 py-0.5 rounded" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
                        Alcance Maven: {DEPENDENCY_DETAILS[selectedDep === 'slf4j' ? 'slf4j' : selectedDep].scope}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-1">
                        {DEPENDENCY_DETAILS[selectedDep === 'slf4j' ? 'slf4j' : selectedDep].name} (v{DEPENDENCY_DETAILS[selectedDep === 'slf4j' ? 'slf4j' : selectedDep].version})
                      </h4>
                    </div>
                  </div>

                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    {DEPENDENCY_DETAILS[selectedDep === 'slf4j' ? 'slf4j' : selectedDep].desc}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-card p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Origen del Artefacto</span>
                      <span className="text-xs font-semibold text-white">{DEPENDENCY_DETAILS[selectedDep === 'slf4j' ? 'slf4j' : selectedDep].origin}</span>
                    </div>
                    <div className="bg-card p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Tipo de Carga</span>
                      <span className="text-xs font-semibold text-white">
                        {selectedDep === 'backend' ? 'Dependencia Interna de Módulo' : 
                         DEPENDENCY_DETAILS[selectedDep === 'slf4j' ? 'slf4j' : selectedDep].scope === 'system' ? 'Librería JAR Local Física (GUI/lib/)' : 'Descargada desde Repositorio Maven Central'}
                      </span>
                    </div>
                  </div>

                  {/* Redirection button if applicable */}
                  <div className="pt-2 flex items-center gap-2">
                    <span className="text-xs text-muted font-bold font-mono uppercase mr-2" style={{ color: 'var(--text-muted)' }}>Ver en la configuración:</span>
                    <button
                      onClick={() => {
                        if (selectedDep === 'mysql' || selectedDep === 'hikaricp' || selectedDep === 'slf4j' || selectedDep === 'junit') {
                          setActiveCodeFile('backendPom');
                        } else if (selectedDep === 'backend' || selectedDep === 'absoluteLayout' || selectedDep === 'lgooddatepicker' || selectedDep === 'jfreechart') {
                          setActiveCodeFile('guiPom');
                        }
                        setActiveTab('ide');
                      }}
                      className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                      style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                    >
                      <FileCode className="w-3 h-3" />
                      <span>{selectedDep === 'mysql' || selectedDep === 'hikaricp' || selectedDep === 'slf4j' || selectedDep === 'junit' ? 'Backend/pom.xml' : 'GUI/pom.xml'}</span>
                    </button>
                  </div>
                </div>
              ) : (
                /* STANDARD MODULE DETAILS WINDOW */
                <>
                  {activatedMavenModule === 'parent' && (
                    <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up shadow-inner animate-fade-in" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                        📦 restaurant-parent (POM Raíz) — Orquestador Multi-módulo
                      </h4>
                      <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Actúa como el orquestador principal del proyecto multi-módulo. Declara los sub-módulos para compilar en cascada (<code>Backend</code> y <code>GUI</code>) y define las propiedades globales compartidas, como la codificación de fuentes UTF-8 y la versión de Java compilador compatible (Java 17).
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-card p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Sub-módulos Declarados</span>
                          <span className="text-sm font-semibold text-white">Backend (Lógica y DAO) · GUI (Swing Desktop)</span>
                        </div>
                        <div className="bg-card p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Versión JDK Compilador</span>
                          <span className="text-sm font-semibold text-white">Java 17 (Release target 17)</span>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs text-muted font-bold font-mono uppercase mr-2" style={{ color: 'var(--text-muted)' }}>Ver Configuración:</span>
                        <button
                          onClick={() => { setActiveCodeFile('rootPom'); setActiveTab('ide'); }}
                          className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5 animate-pulse"
                          style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                        >
                          <FileCode className="w-3 h-3" />
                          <span>pom.xml (Raíz)</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activatedMavenModule === 'backend' && (
                    <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up shadow-inner animate-fade-in" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                        ⚙️ Módulo Backend (Negocio & Acceso a Datos) — Configuración pom.xml
                      </h4>
                      <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Módulo empaquetado como JAR tradicional. Aloja la persistencia y la lógica del negocio del restaurante, aislando por completo la interacción directa con TiDB Cloud.
                      </p>
                      <div className="space-y-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted block" style={{ color: 'var(--text-muted)' }}>Dependencias Maven Declaradas (pom.xml) - Haz clic para ver detalles</span>
                        <div className="flex flex-wrap gap-2">
                          <button onClick={() => setSelectedDep('mysql')} className="text-xs bg-card px-2.5 py-1.5 rounded border border-border text-secondary font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>mysql-connector-j: 9.1.0</button>
                          <button onClick={() => setSelectedDep('hikaricp')} className="text-xs bg-card px-2.5 py-1.5 rounded border border-border text-secondary font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>HikariCP: 5.1.0 (Pool en caliente)</button>
                          <button onClick={() => setSelectedDep('slf4j')} className="text-xs bg-card px-2.5 py-1.5 rounded border border-border text-secondary font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>slf4j-api / simple: 2.0.13</button>
                          <button onClick={() => setSelectedDep('junit')} className="text-xs bg-card px-2.5 py-1.5 rounded border border-border text-muted font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>junit-jupiter: 5.10.1 (test)</button>
                        </div>
                      </div>
                      <div className="pt-2 flex items-center gap-2">
                        <span className="text-xs text-muted font-bold font-mono uppercase mr-2" style={{ color: 'var(--text-muted)' }}>Ver Configuración:</span>
                        <button
                          onClick={() => { setActiveCodeFile('backendPom'); setActiveTab('ide'); }}
                          className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5 animate-pulse"
                          style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                        >
                          <FileCode className="w-3 h-3" />
                          <span>Backend/pom.xml</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {activatedMavenModule === 'gui' && (
                    <div className="bg-code-bg p-6 rounded-2xl border border-border space-y-4 animate-slide-up shadow-inner animate-fade-in" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                        🖼️ Módulo GUI (Presentación Swing & Empacado Fat JAR) — Configuración pom.xml
                      </h4>
                      <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        Módulo del cliente Swing. Sobrescribe la estructura por defecto apuntando las fuentes de código a <code>src/</code> para ser compatible con NetBeans GUI Builder. Ejecuta `maven-assembly-plugin` para unir todo en un único JAR final ejecutable.
                      </p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block" style={{ color: 'var(--text-muted)' }}>Dependencia de Módulo Interno</span>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelectedDep('backend')} className="text-xs bg-card px-2.5 py-1 rounded border border-border text-primary font-mono hover:border-primary/45 hover:bg-primary/5 transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--primary)' }}>Backend (com.restaurant:Backend:1.0)</button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <span className="text-[10px] uppercase font-bold tracking-wider text-muted block" style={{ color: 'var(--text-muted)' }}>Librerías de Sistema Embebidas (lib/) - Haz clic para ver detalles</span>
                          <div className="flex flex-wrap gap-2">
                            <button onClick={() => setSelectedDep('absoluteLayout')} className="text-xs bg-card px-2.5 py-1 rounded border border-border text-secondary font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>AbsoluteLayout.jar</button>
                            <button onClick={() => setSelectedDep('lgooddatepicker')} className="text-xs bg-card px-2.5 py-1 rounded border border-border text-secondary font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>LGoodDatePicker.jar</button>
                            <button onClick={() => setSelectedDep('jfreechart')} className="text-xs bg-card px-2.5 py-1 rounded border border-border text-secondary font-mono hover:border-primary/45 hover:text-primary transition" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>jfreechart-1.5.4.jar</button>
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex flex-wrap items-center gap-2">
                        <span className="text-xs text-muted font-bold font-mono uppercase mr-2" style={{ color: 'var(--text-muted)' }}>Ver Configuración:</span>
                        <button
                          onClick={() => { setActiveCodeFile('guiPom'); setActiveTab('ide'); }}
                          className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                          style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                        >
                          <FileCode className="w-3 h-3" />
                          <span>GUI/pom.xml</span>
                        </button>
                        <button
                          onClick={() => { setActiveCodeFile('depXml'); setActiveTab('ide'); }}
                          className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono hover:bg-primary hover:text-black transition flex items-center gap-1.5"
                          style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}
                        >
                          <FileCode className="w-3 h-3" />
                          <span>src/assembly/dep.xml</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Database connector segment */}
            <div className="mt-8 pt-8 border-t border-border flex flex-col items-center gap-3" style={{ borderColor: 'var(--border)' }}>
              <Database className="w-10 h-10 text-primary animate-pulse" style={{ color: 'var(--primary)' }} />
              <h4 className="font-bold text-white">Persistencia Distribuida (TiDB Cloud)</h4>
              <p className="text-center text-secondary text-sm max-w-xl" style={{ color: 'var(--text-secondary)' }}>
                La base de datos MySQL se hospeda de forma remota en TiDB Cloud con seguridad SSL activa. El pool de conexiones mantiene el canal abierto constantemente para evitar retardos.
              </p>
            </div>
          </div>
        )}

        {/* 3. FLOW GALLERY TAB */}
        {activeTab === 'flujo' && (
          <div className="flow-layout animate-slide-up">
            {/* Left: stages vertical list */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', alignSelf: 'start' }}>
              <h3 className="text-xs font-semibold text-muted uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>Etapas del Flujo</h3>
              {PROJECT_FLOW_STAGES.map((stage) => (
                <button
                  key={stage.id}
                  onClick={() => {
                    setActiveStage(stage.id);
                    setCarouselIndex(0);
                  }}
                  className={`w-full text-left text-xs font-semibold px-4 py-3 rounded-xl flex items-center justify-between transition-all duration-200 ${activeStage === stage.id ? 'bg-primary text-black font-semibold' : 'text-secondary hover:bg-card-hover hover:text-white'}`}
                  style={activeStage === stage.id ? { color: '#000', backgroundColor: 'var(--primary)' } : {}}
                >
                  <span>{stage.title}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            {/* Right: Active stage visualization */}
            {(() => {
              const currentStage = PROJECT_FLOW_STAGES.find(s => s.id === activeStage);
              const activeImage = currentStage.images[carouselIndex];
              return (
                <div className="space-y-6 flex flex-col">
                  {/* Header of Stage */}
                  <div className="bg-card border border-border p-6 rounded-2xl" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <h3 className="text-xl font-bold text-white mb-2">{currentStage.title}</h3>
                    <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {currentStage.desc}
                    </p>
                  </div>

                  {/* Carousel Container */}
                  <div className="carousel-container shadow-2xl">
                    <div className="carousel-image-wrapper">
                      {/* Left Button */}
                      {currentStage.images.length > 1 && (
                        <button 
                          onClick={() => setCarouselIndex(prev => (prev - 1 + currentStage.images.length) % currentStage.images.length)}
                          className="carousel-control left"
                          title="Imagen anterior"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                      )}

                      {/* Main Image */}
                      <img 
                        src={`/imgsistema/${activeImage.path}`} 
                        alt={activeImage.caption} 
                        className="carousel-image"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (!parent.querySelector('.image-error-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'image-error-fallback flex flex-col items-center justify-center p-8 text-center text-muted w-full h-full';
                            fallback.style.color = 'var(--text-muted)';
                            fallback.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-12 h-12 text-primary mb-3" style="color:var(--primary); margin-bottom:12px;"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              <p class="text-sm font-semibold text-white">Captura de Pantalla: ${activeImage.path.split('/').pop()}</p>
                              <p class="text-xs mt-1 text-muted" style="color:var(--text-muted)">Ruta: /imgsistema/${activeImage.path}</p>
                            `;
                            parent.appendChild(fallback);
                          }
                        }}
                      />

                      {/* Right Button */}
                      {currentStage.images.length > 1 && (
                        <button 
                          onClick={() => setCarouselIndex(prev => (prev + 1) % currentStage.images.length)}
                          className="carousel-control right"
                          title="Siguiente imagen"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      )}
                    </div>

                    {/* Dots */}
                    {currentStage.images.length > 1 && (
                      <div className="carousel-dots">
                        {currentStage.images.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setCarouselIndex(idx)}
                            className={`carousel-dot ${idx === carouselIndex ? 'active' : ''}`}
                            aria-label={`Ir a imagen ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Caption */}
                    <div className="carousel-caption">
                      {activeImage.caption}
                    </div>
                  </div>

                  {/* Under the hood technical details */}
                  <div className="bg-card border border-border p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                    <h4 className="text-base font-bold text-white flex items-center gap-2 border-b border-border pb-3" style={{ borderColor: 'var(--border)' }}>
                      <Sparkles className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                      <span>Detalles Técnicos & Funcionamiento Interno</span>
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-code-bg p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Capa Arquitectura</span>
                        <span className="text-sm font-semibold text-primary" style={{ color: 'var(--primary)' }}>{currentStage.techDetails.layer}</span>
                      </div>
                      
                      <div className="bg-code-bg p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Clases / Componentes</span>
                        <span className="text-xs font-mono text-white block truncate" title={currentStage.techDetails.component}>{currentStage.techDetails.component}</span>
                      </div>
                      
                      <div className="bg-code-bg p-4 rounded-xl border border-border" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-muted block mb-1" style={{ color: 'var(--text-muted)' }}>Patrón de Diseño</span>
                        <span className="text-sm font-semibold text-white">{currentStage.techDetails.pattern}</span>
                      </div>
                    </div>

                    <div className="space-y-2 pt-2">
                      <p className="text-xs text-muted font-bold font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Descripción del Proceso:</p>
                      <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                        {currentStage.techDetails.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}

        {/* 4. IDE / EXPLORADOR DE CODIGO TAB */}
        {activeTab === 'ide' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up items-stretch">
            {/* File explorer sidebar */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', alignSelf: 'start' }}>
              <h3 className="text-sm font-semibold text-muted uppercase tracking-wider px-3 mb-2" style={{ color: 'var(--text-muted)' }}>Módulos de Código</h3>
              
              <div className="space-y-1">
                <p className="text-xs text-muted font-mono px-3 mb-1" style={{ color: 'var(--text-muted)' }}>[Módulo Backend]</p>
                <button 
                  onClick={() => setActiveCodeFile('conexionDB')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'conexionDB' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'conexionDB' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>ConexionDB.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('servicioFactory')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'servicioFactory' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'servicioFactory' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>ServicioFactory.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('mesaService')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'mesaService' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'mesaService' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>MesaService.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('pedidoService')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'pedidoService' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'pedidoService' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>PedidoService.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('pedidoDAO')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'pedidoDAO' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'pedidoDAO' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>PedidoDAOImpl.java</span>
                </button>
              </div>

              <div className="space-y-1 pt-4">
                <p className="text-xs text-muted font-mono px-3 mb-1" style={{ color: 'var(--text-muted)' }}>[Módulo GUI / Swing]</p>
                <button 
                  onClick={() => setActiveCodeFile('asyncDataLoader')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'asyncDataLoader' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'asyncDataLoader' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>AsyncDataLoader.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('loginJava')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'loginJava' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'loginJava' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Login.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('menuJava')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'menuJava' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'menuJava' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Menu.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('mesasPanelJava')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'mesasPanelJava' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'mesasPanelJava' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>MesasPanel.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('detallesMesasPanel')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'detallesMesasPanel' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'detallesMesasPanel' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>DetallesMesasPanel.java</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('checkoutDialogJava')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'checkoutDialogJava' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'checkoutDialogJava' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>CheckoutDialog.java</span>
                </button>
              </div>

              <div className="space-y-1 pt-4">
                <p className="text-xs text-muted font-mono px-3 mb-1" style={{ color: 'var(--text-muted)' }}>[Empaquetador & Configs]</p>
                <button 
                  onClick={() => setActiveCodeFile('rootPom')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'rootPom' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'rootPom' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>pom.xml (Raíz)</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('backendPom')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'backendPom' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'backendPom' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>Backend/pom.xml</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('guiPom')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'guiPom' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'guiPom' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>GUI/pom.xml</span>
                </button>
                <button 
                  onClick={() => setActiveCodeFile('depXml')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'depXml' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'depXml' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>dep.xml (Assembly)</span>
                </button>
              </div>
            </div>

            {/* Code editor visualization */}
            <div className="md:col-span-3 flex flex-col bg-code-bg rounded-2xl border border-border overflow-hidden shadow-2xl" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
              {/* Editor Tab Header */}
              <div className="bg-card px-6 py-3 border-b border-border flex justify-between items-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-red-500"></span>
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="text-xs font-mono text-secondary ml-3" style={{ color: 'var(--text-secondary)' }}>
                    {CODE_SNIPPETS[activeCodeFile].path}
                  </span>
                </div>
                <span className="text-xs font-mono text-muted" style={{ color: 'var(--text-muted)' }}>
                  {CODE_SNIPPETS[activeCodeFile].language.toUpperCase()}
                </span>
              </div>

              {/* Explanation panel inside editor */}
              <div className="bg-primary-glow/40 p-4 border-b border-border text-xs text-secondary flex items-start gap-2.5" style={{ backgroundColor: 'var(--primary-glow)', borderColor: 'var(--border)', color: 'var(--text-secondary)' }}>
                <HelpCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" style={{ color: 'var(--primary)' }} />
                <span>
                  <strong>Detalle técnico:</strong> {CODE_SNIPPETS[activeCodeFile].desc}
                </span>
              </div>

              {/* Code Container */}
              <div className="flex-1 p-6 overflow-auto font-mono text-xs text-secondary leading-relaxed select-all" style={{ color: '#d1c7bd' }}>
                <pre><code>{CODE_SNIPPETS[activeCodeFile].code}</code></pre>
              </div>
            </div>
          </div>
        )}

        {/* 5. FLUX / SIMULADOR TAB */}
        {activeTab === 'simulador' && (
          <div className="space-y-8 animate-slide-up">
            {/* Flow selection header */}
            <div className="bg-card border border-border p-6 rounded-2xl flex justify-between items-center" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <div className="flex gap-3">
                <button 
                  onClick={() => resetSimulator('login')}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${simFlow === 'login' ? 'bg-primary text-black' : 'border border-border text-secondary hover:bg-card-hover'}`}
                  style={simFlow === 'login' ? { backgroundColor: 'var(--primary)', color: '#000' } : { borderColor: 'var(--border)' }}
                >
                  Flujo de Login
                </button>
                <button 
                  onClick={() => resetSimulator('pedido')}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${simFlow === 'pedido' ? 'bg-primary text-black' : 'border border-border text-secondary hover:bg-card-hover'}`}
                  style={simFlow === 'pedido' ? { backgroundColor: 'var(--primary)', color: '#000' } : { borderColor: 'var(--border)' }}
                >
                  Flujo de Comandas
                </button>
                <button 
                  onClick={() => resetSimulator('liberar')}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${simFlow === 'liberar' ? 'bg-primary text-black' : 'border border-border text-secondary hover:bg-card-hover'}`}
                  style={simFlow === 'liberar' ? { backgroundColor: 'var(--primary)', color: '#000' } : { borderColor: 'var(--border)' }}
                >
                  Liberar Mesa
                </button>
                <button 
                  onClick={() => resetSimulator('abm')}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${simFlow === 'abm' ? 'bg-primary text-black' : 'border border-border text-secondary hover:bg-card-hover'}`}
                  style={simFlow === 'abm' ? { backgroundColor: 'var(--primary)', color: '#000' } : { borderColor: 'var(--border)' }}
                >
                  ABM de Productos
                </button>
              </div>

              <div className="text-xs text-muted font-mono" style={{ color: 'var(--text-muted)' }}>
                Paso {simStep + 1} de {flows[simFlow].length}
              </div>
            </div>

            {/* Simulator Interactive Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
              {/* Stepper Timeline */}
              <div className="bg-card border border-border p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h3 className="text-sm font-bold uppercase tracking-wider text-muted mb-2" style={{ color: 'var(--text-muted)' }}>Pasos del Ciclo</h3>
                
                <div className="space-y-4">
                  {flows[simFlow].map((step, idx) => {
                    const StepIcon = step.icon;
                    return (
                      <button
                        key={idx}
                        onClick={() => setSimStep(idx)}
                        className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${idx === simStep ? 'bg-primary-glow border-primary text-white font-medium' : 'border-border text-secondary hover:bg-card-hover'}`}
                        style={idx === simStep ? { borderColor: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : { borderColor: 'var(--border)' }}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${idx === simStep ? 'bg-primary text-black' : 'bg-code-bg text-secondary'}`}
                             style={idx === simStep ? { backgroundColor: 'var(--primary)', color: '#000' } : { backgroundColor: 'var(--code-bg)' }}>
                          <StepIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[10px] font-semibold uppercase font-mono tracking-wider opacity-60">Paso {idx + 1}</p>
                          <p className="text-xs font-bold truncate">{step.title}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Detailed step simulation display */}
              <div className="md:col-span-2 bg-card border border-border rounded-2xl p-8 space-y-6" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="flex justify-between items-center border-b border-border pb-4" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-[10px] font-bold tracking-widest uppercase text-primary font-mono block" style={{ color: 'var(--primary)' }}>
                      Ejecutando en el Componente:
                    </span>
                    <h3 className="text-xl font-bold text-white mt-1">
                      {flows[simFlow][simStep].actor}
                    </h3>
                  </div>
                  <span className="text-xs bg-code-bg px-3 py-1 rounded-md font-mono text-secondary" style={{ backgroundColor: 'var(--code-bg)', color: 'var(--text-secondary)' }}>
                    {flows[simFlow][simStep].title}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Left Column: Code Snippet & Actions */}
                  <div className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <p className="text-xs text-muted font-bold font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Descripción del Proceso:</p>
                        <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          {flows[simFlow][simStep].action}
                        </p>
                      </div>

                      {flows[simFlow][simStep].query !== 'N/A' && (
                        <div className="bg-code-bg border border-border p-3 rounded-xl space-y-1" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                          <p className="text-[9px] text-primary font-bold font-mono tracking-wider" style={{ color: 'var(--primary)' }}>Consulta SQL ejecutada:</p>
                          <code className="text-[11px] text-secondary font-mono leading-tight block truncate" title={flows[simFlow][simStep].query} style={{ color: '#d1c7bd' }}>
                            {flows[simFlow][simStep].query}
                          </code>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs text-muted font-bold font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Código Clave del Evento:</p>
                      <div className="bg-code-bg border border-border rounded-xl overflow-hidden" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                        <div className="bg-card px-4 py-1.5 border-b border-border flex justify-between items-center text-[10px] font-mono text-muted" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                          <span>java_action_snippet</span>
                          <span>Java / SQL</span>
                        </div>
                        <pre className="p-3 overflow-auto font-mono text-[10px] text-secondary leading-normal max-h-[140px] bg-code-bg" style={{ color: '#d1c7bd', backgroundColor: 'var(--code-bg)' }}>
                          <code>{flows[simFlow][simStep].snippet}</code>
                        </pre>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: UI Interface capture */}
                  <div className="space-y-3">
                    <p className="text-xs text-muted font-bold font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Captura de Interfaz de Usuario:</p>
                    <div className="bg-code-bg rounded-xl border border-border overflow-hidden relative shadow-md flex items-center justify-center p-2" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      <img
                        src={`/imgsistema/${flows[simFlow][simStep].image}`}
                        alt={flows[simFlow][simStep].title}
                        className="rounded-lg object-contain w-full h-auto max-h-[240px] bg-black"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          const parent = e.target.parentElement;
                          if (!parent.querySelector('.image-error-fallback')) {
                            const fallback = document.createElement('div');
                            fallback.className = 'image-error-fallback flex flex-col items-center justify-center p-6 text-center text-muted w-full h-[180px]';
                            fallback.style.color = 'var(--text-muted)';
                            fallback.innerHTML = `
                              <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="w-10 h-10 text-primary mb-2" style="color:var(--primary);"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
                              <p class="text-xs font-semibold text-white">Interfaz: ${flows[simFlow][simStep].image.split('/').pop()}</p>
                              <p class="text-[10px] mt-0.5 text-muted" style="color:var(--text-muted)">Ruta: /imgsistema/${flows[simFlow][simStep].image}</p>
                            `;
                            parent.appendChild(fallback);
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between pt-4 border-t border-border" style={{ borderColor: 'var(--border)' }}>
                  <button 
                    disabled={simStep === 0}
                    onClick={() => setSimStep(p => Math.max(0, p - 1))}
                    className="px-4 py-2 border border-border text-secondary rounded-xl text-sm font-semibold hover:bg-card-hover disabled:opacity-40 transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Anterior
                  </button>
                  <button 
                    disabled={simStep === flows[simFlow].length - 1}
                    onClick={() => setSimStep(p => Math.min(flows[simFlow].length - 1, p + 1))}
                    className="bg-primary hover:bg-primary-hover text-black px-4 py-2 rounded-xl text-sm font-semibold transition"
                    style={{ backgroundColor: 'var(--primary)', color: '#000' }}
                  >
                    Siguiente Paso
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 6. MAVEN / CONSOLE TAB */}
        {activeTab === 'consola' && (
          <div className="space-y-6 animate-slide-up">
            {/* Terminal Actions */}
            <div className="bg-card border border-border p-6 rounded-2xl flex gap-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <button 
                onClick={() => runConsoleCommand('clean')}
                disabled={isConsoleBuilding}
                className="bg-card border border-border text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-card-hover transition disabled:opacity-40"
                style={{ borderColor: 'var(--border)' }}
              >
                <Play className="w-3.5 h-3.5 text-primary" style={{ color: 'var(--primary)' }} />
                <span>mvn clean</span>
              </button>

              <button 
                onClick={() => runConsoleCommand('package')}
                disabled={isConsoleBuilding}
                className="bg-primary hover:bg-primary-hover text-black px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition disabled:opacity-40"
                style={{ backgroundColor: 'var(--primary)', color: '#000' }}
              >
                <Play className="w-3.5 h-3.5" />
                <span>mvn clean package (Compilar JAR Único)</span>
              </button>

              <button 
                onClick={() => runConsoleCommand('run')}
                disabled={isConsoleBuilding}
                className="bg-card border border-border text-white px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 hover:bg-card-hover transition disabled:opacity-40"
                style={{ borderColor: 'var(--border)' }}
              >
                <Play className="w-3.5 h-3.5 text-success" style={{ color: 'var(--success)' }} />
                <span>java -jar RestoManager.jar (Ejecutar)</span>
              </button>
            </div>

            {/* Virtual Console */}
            <div className="bg-code-bg border border-border rounded-2xl p-6 min-h-[400px] max-h-[500px] overflow-y-auto font-mono text-xs flex flex-col space-y-2 shadow-2xl" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2 border-b border-border pb-3 mb-3 text-muted text-[10px]" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <TerminalIcon className="w-3.5 h-3.5 text-primary" style={{ color: 'var(--primary)' }} />
                <span>TERMINAL DE COMPILACIÓN — SIMULADOR INTERACTIVO</span>
              </div>

              {consoleLogs.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-muted" style={{ color: 'var(--text-muted)' }}>
                  <p className="cursor-blink font-mono">Selecciona uno de los comandos superiores para inicializar la consola...</p>
                </div>
              ) : (
                <div className="flex-1 space-y-1.5 font-mono text-[#d1c7bd]" style={{ color: '#d1c7bd' }}>
                  {consoleLogs.map((log, idx) => {
                    let colorClass = 'text-secondary';
                    if (log.startsWith('[INFO]')) colorClass = 'text-blue-400';
                    if (log.startsWith('[WARNING]')) colorClass = 'text-yellow-500';
                    if (log.startsWith('PS C:')) colorClass = 'text-primary font-bold';
                    if (log.toLowerCase().includes('success')) colorClass = 'text-success font-bold';
                    if (log.toLowerCase().includes('failure') || log.toLowerCase().includes('error')) colorClass = 'text-red-500 font-bold';

                    return (
                      <p key={idx} className={`font-mono leading-normal whitespace-pre-wrap ${colorClass}`}>
                        {log}
                      </p>
                    );
                  })}
                  
                  {isConsoleBuilding && (
                    <p className="cursor-blink font-mono text-primary" style={{ color: 'var(--primary)' }}></p>
                  )}
                  <div id="console-scroll-target"></div>
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

export default App;
