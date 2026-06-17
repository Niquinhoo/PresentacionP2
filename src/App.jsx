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
  Check,
  PieChart
} from 'lucide-react';

// Code snippets to display in the Interactive IDE
const CODE_SNIPPETS = {
  conexionDB: {
    name: 'ConexionDB.java',
    path: 'Backend/src/main/java/com/restaurant/backend/util/ConexionDB.java',
    language: 'java',
    desc: 'Implementación del pool de conexiones HikariCP y la inicialización automática de vistas SQL para TiDB Cloud.',
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

        // Hotfix: Inicialización automática de la vista SQL de ventas
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
        <!-- 1. Desempaqueta dependencias runtime estándar de Maven -->
        <dependencySet>
            <outputDirectory>/</outputDirectory>
            <useProjectArtifact>true</useProjectArtifact>
            <unpack>true</unpack>
            <scope>runtime</scope>
        </dependencySet>
        <!-- 2. Desempaqueta y mezcla los JARs locales asignados con alcance system -->
        <dependencySet>
            <outputDirectory>/</outputDirectory>
            <unpack>true</unpack>
            <scope>system</scope>
        </dependencySet>
    </dependencySets>
</assembly>`
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
];

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
        icon: Monitor
      },
      {
        title: 'Despacho Asíncrono',
        actor: 'AsyncDataLoader (SwingWorker)',
        action: 'Se instancia un hilo secundario que invoca a ServicioFactory.getUsuarioService().iniciarSesion(usuario, password). El EDT permanece liberado (la UI no se congela).',
        query: 'N/A (Transición a la capa de servicios)',
        icon: Activity
      },
      {
        title: 'Autenticación con Hash SHA2-256',
        actor: 'UsuarioDAOImpl & Base de Datos',
        action: 'El DAO JDBC ejecuta una consulta preparada inyectando la contraseña y delegando el hashing en la base de datos MySQL de TiDB.',
        query: 'SELECT u.id_usuario, u.nombre, u.id_rol FROM usuarios u WHERE u.usuario = ? AND u.contrasena = SHA2(?, 256) AND u.activo = TRUE',
        icon: Database
      },
      {
        title: 'Carga del Tablero Principal',
        actor: 'Menú Principal (EDT)',
        action: 'La base de datos retorna el objeto Usuario. El SwingWorker finaliza y abre la ventana Menu.java en el hilo EDT, cargando el nombre y el rol en la cabecera.',
        query: 'N/A (Inicialización de paneles de mesas, pedidos y catálogo)',
        icon: UserCheck
      }
    ],
    pedido: [
      {
        title: 'Selección de Productos',
        actor: 'Panel de Menú (EDT)',
        action: 'El mozo selecciona categorías de comidas. Los productos se cargan dinámicamente y se agregan a la comanda actual calculando el total interactivamente.',
        query: 'N/A (Lógica en memoria de Swing)',
        icon: Monitor
      },
      {
        title: 'Checkout y Confirmación',
        actor: 'CheckoutDialog (JDialog)',
        action: 'Se abre el diálogo modal para seleccionar la mesa, digitar descuentos (ej: 10%) e ingresar método de pago y observaciones.',
        query: 'N/A (Captura y validación de campos)',
        icon: UserCheck
      },
      {
        title: 'Registro Transaccional & Descuento de Stock',
        actor: 'PedidoService (Backend)',
        action: 'El backend procesa el pedido en una transacción: inserta la cabecera en pedidos, los ítems en detalle_pedido y reduce el stock de la tabla de productos inmediatamente.',
        query: 'INSERT INTO pedidos (id_mesa, id_usuario, estado, total) ... ; UPDATE productos SET stock = stock - ? WHERE id_producto = ?',
        icon: Database
      },
      {
        title: 'Actualización en Vivo e Impresión de Comanda',
        actor: 'Tablero & JFileChooser (EDT)',
        action: 'La mesa pasa a color ROJO (Ocupada). Se abre el selector de archivos local para guardar el archivo comanda_mesa_X.txt con el formato del ticket.',
        query: 'N/A (Escritura del ticket en el sistema de archivos)',
        icon: Package
      }
    ],
    liberar: [
      {
        title: 'Acción de Liberar Mesa',
        actor: 'DetallesMesasPanel (EDT)',
        action: 'Al presionar "Liberar", la interfaz verifica si jTable1 tiene filas (pedidos activos). Al detectar pedidos activos, solicita confirmación interactiva con JOptionPane.',
        query: 'N/A (Validación local sobre el JTable)',
        icon: Monitor
      },
      {
        title: 'Confirmación del Usuario (JOptionPane)',
        actor: 'Diálogo de Confirmación (EDT)',
        action: 'Se muestra una alerta emergente advirtiendo al usuario: "¿Desea cerrar todos los pedidos abiertos y liberar la mesa?". El mozo selecciona "Sí".',
        icon: AlertTriangle,
        query: 'N/A'
      },
      {
        title: 'Cierre de Comandas & Cambio de Estado',
        actor: 'MesaService (Backend)',
        action: 'El servicio busca los pedidos en estados ABIERTO, EN_COCINA o LISTO y los marca como CERRADO. Finalmente, actualiza el estado de la mesa a LIBRE.',
        query: 'UPDATE pedidos SET estado = \'CERRADO\' WHERE id_mesa = ? AND estado IN (\'ABIERTO\', \'EN_COCINA\', \'LISTO\'); UPDATE mesas SET estado = \'LIBRE\' WHERE id_mesa = ?',
        icon: Database
      },
      {
        title: 'Actualización Visual del Salón',
        actor: 'MesasPanel (EDT)',
        action: 'La base de datos retorna éxito. El panel de mesas se refresca asíncronamente y el botón de la mesa cambia de rojo (Ocupada) a verde (Libre).',
        query: 'N/A (Redibujado del grid de mesas en el EDT)',
        icon: CheckCircle2
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

            {/* Metrics Grid (Inspired by HTML Report) */}
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
                    🖼️ Capa Vista (GUI) — Swing Desktop
                  </h4>
                  <p className="text-secondary text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                    Formularios interactivos construidos con NetBeans GUI Builder. Responsable exclusivo de capturar la interacción del usuario y redibujar componentes. Para garantizar la fluidez de la aplicación bajo latencias de red, todas las llamadas a la base de datos se delegan asíncronamente en hilos de fondo mediante <code>AsyncDataLoader</code> y <code>SwingWorker</code>, previniendo congelamientos del EDT.
                  </p>
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>Login.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>Menu.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>MesasPanel.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>DetallesMesasPanel.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>CheckoutDialog.java</span>
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
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>MesaService.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>PedidoService.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>ProductoService.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>ServicioFactory.java</span>
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
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>MesaDAO.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>PedidoDAO.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>ProductoDAO.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>UsuarioDAO.java</span>
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
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>Mesa.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>Pedido.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>Producto.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>Usuario.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>EstadoMesa.java</span>
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
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>ConexionDB.java</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>db.properties</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>schema.sql</span>
                    <span className="text-xs bg-primary-glow text-primary px-3 py-1.5 rounded-lg border border-primary/20 font-mono" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>seed.sql</span>
                  </div>
                </div>
              )}
            </div>

            {/* Core architecture mapping visually */}
            <div className="bg-card border border-border rounded-3xl p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="text-xl font-bold text-white mb-6">Mapa Interactivo de Módulos Maven</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                {/* 1. Parent POM */}
                <div className="border border-border p-6 rounded-2xl bg-code-bg/60 text-center space-y-2 relative" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--code-bg)' }}>
                  <div className="absolute top-2 right-2 text-[10px] text-muted font-mono" style={{ color: 'var(--text-muted)' }}>pom.xml</div>
                  <Package className="w-8 h-8 text-primary mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                  <h4 className="font-bold text-white">restaurant-parent</h4>
                  <p className="text-xs text-secondary" style={{ color: 'var(--text-secondary)' }}>Orquestador Raíz Maven</p>
                  <span className="inline-block text-[10px] bg-primary-glow text-primary px-2 py-0.5 rounded" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
                    pom packaging
                  </span>
                </div>

                <div className="hidden md:flex justify-center text-muted" style={{ color: 'var(--text-muted)' }}><ChevronRight /></div>

                {/* 2. Backend Module */}
                <div className="border border-border p-6 rounded-2xl bg-code-bg/60 text-center space-y-2 relative" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--code-bg)' }}>
                  <div className="absolute top-2 right-2 text-[10px] text-muted font-mono" style={{ color: 'var(--text-muted)' }}>Backend/</div>
                  <Server className="w-8 h-8 text-primary mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                  <h4 className="font-bold text-white">Módulo Backend</h4>
                  <p className="text-xs text-secondary" style={{ color: 'var(--text-secondary)' }}>Model, DAO, Service & Controllers</p>
                  <span className="inline-block text-[10px] bg-primary-glow text-primary px-2 py-0.5 rounded" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
                    jar packaging
                  </span>
                </div>

                <div className="hidden md:flex justify-center text-muted" style={{ color: 'var(--text-muted)' }}><ChevronRight /></div>

                {/* 3. GUI Module */}
                <div className="border border-border p-6 rounded-2xl bg-code-bg/60 text-center space-y-2 relative" style={{ borderColor: 'var(--border)', backgroundColor: 'var(--code-bg)' }}>
                  <div className="absolute top-2 right-2 text-[10px] text-muted font-mono" style={{ color: 'var(--text-muted)' }}>GUI/</div>
                  <Monitor className="w-8 h-8 text-primary mx-auto mb-2" style={{ color: 'var(--primary)' }} />
                  <h4 className="font-bold text-white">Módulo GUI</h4>
                  <p className="text-xs text-secondary" style={{ color: 'var(--text-secondary)' }}>Vistas Swing & Diseñador NetBeans</p>
                  <span className="inline-block text-[10px] bg-primary-glow text-primary px-2 py-0.5 rounded" style={{ color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' }}>
                    jar-with-dependencies
                  </span>
                </div>
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
          </div>
        )}

        {/* 3. FLOW GALLERY TAB (NEW) */}
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
                  onClick={() => setActiveCodeFile('detallesMesasPanel')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'detallesMesasPanel' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'detallesMesasPanel' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>DetallesMesasPanel.java</span>
                </button>
              </div>

              <div className="space-y-1 pt-4">
                <p className="text-xs text-muted font-mono px-3 mb-1" style={{ color: 'var(--text-muted)' }}>[Empaquetador]</p>
                <button 
                  onClick={() => setActiveCodeFile('depXml')}
                  className={`w-full text-left text-xs font-mono px-3 py-2 rounded-lg flex items-center gap-2 transition ${activeCodeFile === 'depXml' ? 'bg-primary-glow text-primary font-semibold' : 'text-secondary hover:bg-card-hover'}`}
                  style={activeCodeFile === 'depXml' ? { color: 'var(--primary)', backgroundColor: 'var(--primary-glow)' } : {}}
                >
                  <FileCode className="w-3.5 h-3.5" />
                  <span>dep.xml</span>
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
                  Flujo de Comandas (Pedido)
                </button>
                <button 
                  onClick={() => resetSimulator('liberar')}
                  className={`px-4 py-2.5 rounded-xl font-semibold text-sm transition ${simFlow === 'liberar' ? 'bg-primary text-black' : 'border border-border text-secondary hover:bg-card-hover'}`}
                  style={simFlow === 'liberar' ? { backgroundColor: 'var(--primary)', color: '#000' } : { borderColor: 'var(--border)' }}
                >
                  Liberar Mesa (Hotfix)
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

                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-xs text-muted font-bold font-mono uppercase" style={{ color: 'var(--text-muted)' }}>Descripción del Evento:</p>
                    <p className="text-secondary text-base leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                      {flows[simFlow][simStep].action}
                    </p>
                  </div>

                  {flows[simFlow][simStep].query !== 'N/A' && (
                    <div className="bg-code-bg border border-border p-4 rounded-xl space-y-2" style={{ backgroundColor: 'var(--code-bg)', borderColor: 'var(--border)' }}>
                      <p className="text-[10px] text-primary font-bold font-mono tracking-wider" style={{ color: 'var(--primary)' }}>Sentencia SQL / Transacción BD:</p>
                      <code className="text-xs text-secondary font-mono leading-normal" style={{ color: '#d1c7bd' }}>
                        {flows[simFlow][simStep].query}
                      </code>
                    </div>
                  )}
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
