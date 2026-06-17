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

  // Auto scroll interactive console logs
  useEffect(() => {
    const el = document.getElementById('console-scroll-target');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [consoleLogs]);

  // Handle flow steps
  const resetSimulator = (flowType) => {
    setSimFlow(flowType);
    setSimStep(0);
  };

  // Flow steps structures
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
              {activeTab === 'ide' && 'Explorador de Código Interactivo'}
              {activeTab === 'simulador' && 'Simulador Visual de Eventos'}
              {activeTab === 'consola' && 'Consola y Ciclo de Compilación de Maven'}
            </h2>
            <p className="text-secondary mt-1" style={{ color: 'var(--text-secondary)' }}>
              {activeTab === 'inicio' && 'Proyecto final de Programación II estructurado en Java Desktop Multi-capas.'}
              {activeTab === 'arquitectura' && 'Interactúa con los módulos para ver sus responsabilidades y acoplamientos.'}
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
                    onClick={() => setActiveTab('arquitectura')}
                    className="bg-primary hover:bg-primary-hover text-black font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition"
                    style={{ backgroundColor: 'var(--primary)' }}
                  >
                    <span>Ver Arquitectura</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={() => setActiveTab('simulador')}
                    className="border border-border hover:bg-card-hover text-white px-6 py-3 rounded-xl transition"
                    style={{ borderColor: 'var(--border)' }}
                  >
                    Simular Procesos
                  </button>
                </div>
              </div>
            </div>

            {/* Grid of Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-card border border-border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                  <Database className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 className="text-lg font-bold text-white">HikariCP Connection Pool</h4>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Elimina la sobrecarga de handshake SSL/TLS de TiDB Cloud manteniendo 10 conexiones persistentes en caliente y cacheadas.
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                  <Activity className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 className="text-lg font-bold text-white">Event Dispatch Thread Libre</h4>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Mediante SwingWorkers, la interfaz gráfica Swing nunca se bloquea ni genera cuelgues durante consultas SQL concurrentes.
                </p>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl space-y-3" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <div className="w-10 h-10 rounded-lg bg-primary-glow flex items-center justify-center" style={{ backgroundColor: 'var(--primary-glow)' }}>
                  <Package className="w-5 h-5 text-primary" style={{ color: 'var(--primary)' }} />
                </div>
                <h4 className="text-lg font-bold text-white">JAR Único Autocontenido</h4>
                <p className="text-secondary text-sm" style={{ color: 'var(--text-secondary)' }}>
                  Unificación del empaquetado mediante Maven Assembly para generar un distribuidor ejecutable de 6.9MB sin requerir carpetas auxiliares.
                </p>
              </div>
            </div>

            {/* Hotfix Highlight section */}
            <div className="bg-card border border-warning/20 p-6 rounded-2xl flex gap-4 items-start" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'rgba(249, 155, 32, 0.2)' }}>
              <div className="p-3 bg-warning/10 text-primary rounded-xl" style={{ backgroundColor: 'rgba(249, 155, 32, 0.1)', color: 'var(--primary)' }}>
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-base font-bold text-white">Detalle de los Hotfixes Recientes</h4>
                <p className="text-sm text-secondary" style={{ color: 'var(--text-secondary)' }}>
                  Corregimos el fallo de ejecución manual (`NoClassDefFoundError: HikariConfig`) inyectando SLF4J y HikariCP en el comando classpath. Además, habilitamos la liberación controlada de mesas con advertencia previa: al liberar, se advierte al usuario si la mesa posee comandas abiertas y se cierran automáticamente todos los pedidos en la base de datos de manera transaccional.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 2. ARCHITECTURE TAB */}
        {activeTab === 'arquitectura' && (
          <div className="space-y-8 animate-slide-up">
            {/* Interactive Architecture Schema */}
            <div className="bg-card border border-border rounded-3xl p-8" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
              <h3 className="text-xl font-bold text-white mb-6">Mapa Interactivo de Módulos</h3>
              
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

            {/* Class diagram description cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-card border border-border p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                  Capa de Servicios y Controladores (Backend)
                </h4>
                <ul className="space-y-2 text-sm text-secondary" style={{ color: 'var(--text-secondary)' }}>
                  <li><strong>MesaService:</strong> Rige las reglas de estado y liberaciones manuales.</li>
                  <li><strong>PedidoService:</strong> Gestiona stock transaccional en creación y devoluciones por cancelación.</li>
                  <li><strong>ServicioFactory:</strong> Contenedor Thread-safe que evita colisiones en consultas concurrentes.</li>
                </ul>
              </div>

              <div className="bg-card border border-border p-6 rounded-2xl space-y-4" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
                <h4 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-primary" style={{ backgroundColor: 'var(--primary)' }}></span>
                  Capa de Presentación Gráfica (Swing Frontend)
                </h4>
                <ul className="space-y-2 text-sm text-secondary" style={{ color: 'var(--text-secondary)' }}>
                  <li><strong>Menu:</strong> Tablero asíncrono para mozos con listado de productos dinámicos.</li>
                  <li><strong>DetallesMesasPanel:</strong> Panel contextual para verificar pedidos de la mesa seleccionada.</li>
                  <li><strong>CheckoutDialog:</strong> Capturador dinámico de cobros y facturación.</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. IDE / EXPLORADOR DE CODIGO TAB */}
        {activeTab === 'ide' && (
          <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-6 animate-slide-up items-stretch">
            {/* File explorer sidebar */}
            <div className="bg-card border border-border rounded-2xl p-4 flex flex-col space-y-2" style={{ backgroundColor: 'var(--bg-card)', borderColor: 'var(--border)' }}>
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
                <span className="text-[10px] font-mono text-muted" style={{ color: 'var(--text-muted)' }}>
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

        {/* 4. FLUX / SIMULADOR TAB */}
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
                          <p className="text-xs font-semibold uppercase font-mono tracking-wider opacity-60">Paso {idx + 1}</p>
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

        {/* 5. MAVEN / CONSOLE TAB */}
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
