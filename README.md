# RestoManager — Presentación Interactiva de Código

Esta rama (`Presentacion`) contiene una aplicación web interactiva desarrollada en **React + Vite** diseñada para exponer de manera visual la arquitectura, código relevante, flujos de trabajo de concurrencia y los hotfixes aplicados en el proyecto final **RestoManager**.

---

## 🚀 Cómo Iniciar la Presentación Localmente

### Requisitos Previos:
1. **Node.js (Versión 18 o superior):** Comprueba tu versión ejecutando `node -v` en la terminal.
2. **NPM:** El instalador de paquetes de Node.js.

### Instrucciones de Inicio:
1. Instala las dependencias del proyecto (si aún no lo has hecho):
   ```bash
   npm install
   ```
2. Inicia el servidor de desarrollo local de Vite:
   ```bash
   npm run dev
   ```
3. Abre en tu navegador la URL que figura en la consola (usualmente `http://localhost:5173`).

---

## 🛠️ Estructura de la Presentación Interactiva

La aplicación web consta de 5 paneles de control principales accesibles desde la barra lateral:

1. **Resumen del Proyecto:** Visión global de los objetivos de diseño y las tecnologías utilizadas (HikariCP, SwingWorkers, Maven).
2. **Mapa de Arquitectura:** Un diagrama de flujo interactivo del proyecto multi-módulo (`restaurant-parent`, `Backend` y `GUI`).
3. **Explorador de Código (IDE Simulado):** Un visor de código con explicaciones de las clases clave (`ConexionDB`, `ServicioFactory`, `AsyncDataLoader`, `MesaService`, `DetallesMesasPanel` y `dep.xml`).
4. **Simulador de Flujos:** Simulador animado paso a paso que detalla la interacción entre el EDT, los hilos de fondo y la base de datos para los flujos de Login, Creación de Pedido y Liberación de Mesas (con confirmación JOptionPane).
5. **Consola de Construcción:** Un emulador interactivo de terminal donde se puede simular el ciclo de limpieza (`mvn clean`), compilación y empaquetado del Fat JAR (`mvn package`) y la ejecución final (`java -jar`).
