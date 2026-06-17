import { jsPDF } from 'jspdf';

// ════════════════════════════════════════════════════════════════════════════
// RestoManager — Generador de Informe Técnico PDF  v2
// Diseño editorial renovado: tipografía clara, jerarquía visual fuerte
// ════════════════════════════════════════════════════════════════════════════

export async function generarInforme() {
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const W  = 210;
  const H  = 297;
  const ML = 18;      // margen izquierdo
  const MR = 18;      // margen derecho
  const CW = W - ML - MR; // 174mm ancho de contenido

  // ─── Paleta de colores ────────────────────────────────────────────────────
  const Navy    = [13,  20,  40];   // fondo oscuro principal
  const NavyMid = [22,  38,  74];   // azul secundario
  const Dark    = [28,  36,  52];   // texto oscuro
  const Mid     = [80,  94, 114];   // texto secundario
  const Muted   = [140, 155, 172];  // texto terciario/captions
  const Orange  = [230,  90,  15];  // acento primario
  const OrangeL = [248, 175, 100];  // acento claro
  const OrangePale=[254, 237, 215]; // fondo muy claro naranja
  const White   = [255, 255, 255];
  const OffWhite= [249, 250, 252];
  const GrayL   = [220, 228, 238];  // borde suave
  const GrayBg  = [244, 247, 251];  // fondo de cards
  const CodeBg  = [22,  30,  52];   // fondo bloque de código (oscuro)
  const CodeFg  = [200, 220, 255];  // texto código principal
  const CodeStr = [135, 220, 140];  // strings en código
  const CodeKw  = [150, 170, 255];  // keywords en código
  const CodeCmt = [100, 120, 150];  // comentarios en código
  const SuccG   = [30,  165,  80];
  const WarnY   = [200, 135,   5];
  const ErrR    = [210,  40,  40];
  const BlueA   = [55,  125, 245];
  const PurpA   = [140,  50, 230];
  const Teal    = [20,  155, 145];

  // ─── Helpers primitivos ───────────────────────────────────────────────────
  const rgb  = (c) => doc.setFillColor(...c);
  const drw  = (c) => doc.setDrawColor(...c);
  const tc   = (c) => doc.setTextColor(...c);
  const fnt  = (s, sz) => { doc.setFont('helvetica', s); doc.setFontSize(sz); };
  const lw   = (w) => doc.setLineWidth(w);

  const wrap = (text, x, sy, mw, lh = 5) => {
    const ls = doc.splitTextToSize(text, mw);
    doc.text(ls, x, sy);
    return sy + ls.length * lh;
  };

  let y = 0;
  let currentPage = 1;

  // ─── Fondo de página (off-white limpio) ───────────────────────────────────
  const pageBg = () => {
    rgb(White); doc.rect(0, 0, W, H, 'F');
    // Franja lateral izquierda muy sutil
    rgb([246, 248, 252]); doc.rect(0, 0, 5, H, 'F');
  };

  // ─── Header interior ──────────────────────────────────────────────────────
  const innerHeader = () => {
    // Banda superior
    rgb(Navy); doc.rect(0, 0, W, 13, 'F');
    // Línea acento naranja
    rgb(Orange); doc.rect(0, 12.2, W, 1.2, 'F');
    // Breadcrumb
    fnt('normal', 5.8); tc(Muted);
    doc.text('RESTOMANAGER  ·  INFORME TÉCNICO  ·  PROGRAMACIÓN II  2026', ML, 8.5);
    // Número de página (badge pill)
    const pgLabel = `${currentPage}`;
    const pgW = doc.getTextWidth(pgLabel) + 6;
    rgb(Orange); doc.roundedRect(W - MR - pgW, 4.5, pgW, 5.5, 2, 2, 'F');
    fnt('bold', 6.5); tc(White);
    doc.text(pgLabel, W - MR - pgW / 2, 8.8, { align: 'center' });
    y = 22;
  };

  const newPage = () => {
    doc.addPage();
    currentPage++;
    pageBg();
    innerHeader();
  };

  const need = (h) => { if (y + h > H - 18) newPage(); };

  // ─── Sección header bar (renovado) ────────────────────────────────────────
  const section = (title, icon = '▸') => {
    need(22);
    // Sombra simulada
    rgb([200, 210, 225]); doc.rect(ML + 0.8, y + 0.8, CW, 13, 'F');
    // Fondo principal
    rgb(Navy); doc.rect(ML, y, CW, 13, 'F');
    // Barra lateral naranja gruesa
    rgb(Orange); doc.rect(ML, y, 5, 13, 'F');
    // Texto del título
    fnt('bold', 9.5); tc(White);
    doc.text(icon + '  ' + title, ML + 10, y + 9);
    // Número de sección (decorativo, top-right)
    fnt('bold', 18); tc([255, 255, 255, 0.05]);
    doc.setTextColor(255, 255, 255, 0.07);
    y += 19;
  };

  // ─── Sub-header renovado ──────────────────────────────────────────────────
  const sub = (title) => {
    need(14);
    y += 2;
    // Dot indicador
    rgb(Orange); doc.circle(ML + 1.5, y - 1.2, 1.5, 'F');
    fnt('bold', 9); tc(Dark);
    doc.text(title, ML + 6, y);
    // Línea divisora
    drw(GrayL); lw(0.3);
    doc.line(ML, y + 2.5, ML + CW, y + 2.5);
    y += 8;
  };

  // ─── Párrafo body ─────────────────────────────────────────────────────────
  const para = (text, lh = 4.8) => {
    need(10);
    fnt('normal', 8); tc(Mid);
    y = wrap(text, ML, y, CW, lh);
    y += 3.5;
  };

  // ─── Bloque de código mejorado ────────────────────────────────────────────
  const code = (lines, label = 'Java') => {
    const lh   = 4;
    const bh   = lines.length * lh + 18;
    need(bh + 6);

    // Sombra
    rgb([180, 195, 215]); doc.roundedRect(ML + 1, y + 1, CW, bh, 3, 3, 'F');
    // Fondo oscuro del bloque
    rgb(CodeBg); doc.roundedRect(ML, y, CW, bh, 3, 3, 'F');

    // Header strip del bloque
    rgb([10, 15, 32]); doc.rect(ML, y, CW, 9, 'F');
    doc.roundedRect(ML, y, CW, 9, 3, 3, 'F');
    doc.rect(ML, y + 4, CW, 5, 'F'); // recorte inferior del roundedRect

    // Traffic lights
    const tlColors = [ErrR, WarnY, SuccG];
    tlColors.forEach((c, i) => {
      rgb(c); doc.circle(ML + 6 + i * 5.5, y + 4.5, 1.6, 'F');
    });

    // Label del lenguaje
    fnt('bold', 5.8); tc(OrangeL);
    doc.text(label.toUpperCase(), ML + 25, y + 6.2);

    // Línea separadora header/body
    rgb([40, 55, 90]); doc.rect(ML, y + 9, CW, 0.4, 'F');

    // Líneas de código con números de línea
    lines.forEach((ln, i) => {
      const lineY = y + 14.5 + i * lh;
      // Número de línea
      fnt('normal', 4.5); tc(CodeCmt);
      doc.text(String(i + 1).padStart(2, ' '), ML + 2.5, lineY);
      // Separador de número de línea
      rgb([35, 48, 78]); doc.rect(ML + 7.5, lineY - 3, 0.3, 4, 'F');
      // Coloreo básico por tipo de línea
      fnt('normal', 5.8);
      if (ln.trimStart().startsWith('//') || ln.trimStart().startsWith('*')) {
        tc(CodeCmt);
      } else if (ln.includes('"') || ln.includes("'")) {
        tc(CodeFg); // texto normal, coloreo de strings es complejo sin parser
      } else {
        tc(CodeFg);
      }
      doc.text(ln, ML + 10, lineY);
    });

    y += bh + 6;
  };

  // ─── Badge pill ───────────────────────────────────────────────────────────
  const badge = (text, bx, by, col, fcol = White) => {
    fnt('bold', 6); tc(fcol);
    const tw = doc.getTextWidth(text) + 6;
    const bh = 5.5;
    rgb(col); doc.roundedRect(bx, by - 3.8, tw, bh, 1.5, 1.5, 'F');
    doc.text(text, bx + 3, by);
    return bx + tw + 2.5;
  };

  // ─── Card de información ──────────────────────────────────────────────────
  const infoCard = (title, body, col = Orange, extraH = 0) => {
    const lines = doc.splitTextToSize(body, CW - 14);
    const h = 8 + lines.length * 4.5 + 10 + extraH;
    need(h + 5);
    // Sombra
    rgb([210, 220, 235]); doc.roundedRect(ML + 1, y + 1, CW, h, 2.5, 2.5, 'F');
    // Card
    rgb(GrayBg); drw(GrayL); lw(0.3);
    doc.roundedRect(ML, y, CW, h, 2.5, 2.5, 'FD');
    // Acento lateral
    rgb(col); doc.roundedRect(ML, y, 4, h, 1.5, 1.5, 'F');
    doc.rect(ML + 2, y, 2, h, 'F'); // aplanado derecho
    // Título
    fnt('bold', 8.5); tc(Dark); doc.text(title, ML + 8, y + 7);
    // Cuerpo
    fnt('normal', 7.5); tc(Mid);
    const startY = y + 13;
    lines.forEach((l, i) => doc.text(l, ML + 8, startY + i * 4.5));
    y += h + 5;
  };

  // ─── Card de fix/hotfix ───────────────────────────────────────────────────
  const fixCard = (title, prob, sol, res, col) => {
    const pLines = doc.splitTextToSize(prob, CW - 30);
    const sLines = doc.splitTextToSize(sol, CW - 30);
    const rLines = res ? doc.splitTextToSize(res, CW - 30) : [];
    const h = 10 + (pLines.length + sLines.length + rLines.length) * 4.2 + 22;
    need(h + 5);

    rgb([210, 220, 235]); doc.roundedRect(ML + 1, y + 1, CW, h, 2.5, 2.5, 'F');
    rgb(GrayBg); drw(col); lw(0.6);
    doc.roundedRect(ML, y, CW, h, 2.5, 2.5, 'FD');
    rgb(col); doc.roundedRect(ML, y, 4.5, h, 1.5, 1.5, 'F');
    doc.rect(ML + 2.5, y, 2, h, 'F');

    fnt('bold', 8.5); tc(Dark);
    doc.text(title, ML + 8, y + 8);

    let fy = y + 15;

    // Label Problema
    rgb(ErrR); doc.roundedRect(ML + 8, fy - 3.5, 20, 5, 1, 1, 'F');
    fnt('bold', 5.8); tc(White); doc.text('PROBLEMA', ML + 9, fy);
    fy += 4;
    fnt('normal', 7); tc(Mid);
    pLines.forEach(l => { doc.text(l, ML + 10, fy); fy += 4.2; });
    fy += 1;

    // Label Solución
    rgb(SuccG); doc.roundedRect(ML + 8, fy - 3.5, 20, 5, 1, 1, 'F');
    fnt('bold', 5.8); tc(White); doc.text('SOLUCIÓN', ML + 9, fy);
    fy += 4;
    fnt('normal', 7); tc(Mid);
    sLines.forEach(l => { doc.text(l, ML + 10, fy); fy += 4.2; });

    if (rLines.length > 0) {
      fy += 1;
      rgb(BlueA); doc.roundedRect(ML + 8, fy - 3.5, 21, 5, 1, 1, 'F');
      fnt('bold', 5.8); tc(White); doc.text('RESULTADO', ML + 9, fy);
      fy += 4;
      fnt('bold', 7); tc(NavyMid);
      rLines.forEach(l => { doc.text(l, ML + 10, fy); fy += 4.2; });
    }

    y += h + 5;
  };

  // ─── Embed imagen ─────────────────────────────────────────────────────────
  const img = async (src, ix, iy, iw, ih, caption = '') => {
    return new Promise(resolve => {
      const el = new Image();
      el.crossOrigin = 'anonymous';
      el.onload = () => {
        try {
          const cv = document.createElement('canvas');
          cv.width = el.naturalWidth; cv.height = el.naturalHeight;
          cv.getContext('2d').drawImage(el, 0, 0);
          // Marco con sombra simulada
          rgb([180, 195, 215]); doc.roundedRect(ix + 1, iy + 1, iw, ih, 2, 2, 'F');
          drw(GrayL); lw(0.4);
          doc.roundedRect(ix, iy, iw, ih, 2, 2, 'S');
          doc.addImage(cv.toDataURL('image/jpeg', 0.88), 'JPEG', ix, iy, iw, ih);
          if (caption) {
            fnt('normal', 5.8); tc(Muted);
            doc.text(caption, ix + iw / 2, iy + ih + 4.5, { align: 'center' });
          }
        } catch (_) {}
        resolve();
      };
      el.onerror = () => {
        rgb(GrayBg); drw(GrayL); lw(0.4);
        doc.roundedRect(ix, iy, iw, ih, 2, 2, 'FD');
        fnt('normal', 6); tc(Muted);
        doc.text('[ imagen ]', ix + iw / 2, iy + ih / 2, { align: 'center' });
        if (caption) {
          fnt('normal', 5.8); tc(Muted);
          doc.text(caption, ix + iw / 2, iy + ih + 4.5, { align: 'center' });
        }
        resolve();
      };
      el.src = src;
    });
  };

  // ─── Footers al final ────────────────────────────────────────────────────
  const footers = () => {
    const total = doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      doc.setPage(i);
      // Franja footer
      rgb(Navy); doc.rect(0, H - 11, W, 11, 'F');
      rgb(Orange); doc.rect(0, H - 11, W, 1.2, 'F');
      fnt('normal', 5.8); tc(Muted);
      doc.text('RestoManager  ·  Informe Técnico  ·  Programación II  ·  2026', ML, H - 4.5);
      // Paginación
      const pg = `${i} / ${total}`;
      const pgW = doc.getTextWidth(pg) + 6;
      rgb(Orange); doc.roundedRect(W - MR - pgW, H - 9, pgW, 6, 1.5, 1.5, 'F');
      fnt('bold', 6); tc(White);
      doc.text(pg, W - MR - pgW / 2, H - 4.8, { align: 'center' });
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 1 — PORTADA
  // ══════════════════════════════════════════════════════════════════════════
  pageBg();

  // Fondo superior navy (2/3 de la página)
  rgb(Navy); doc.rect(0, 0, W, 140, 'F');

  // Patrón de puntos decorativo (grid sutil)
  for (let px = 0; px < W; px += 8) {
    for (let py = 0; py < 140; py += 8) {
      rgb([255, 255, 255]);
      doc.setFillColor(255, 255, 255, 0.04);
      doc.circle(px, py, 0.4, 'F');
    }
  }

  // Forma decorativa naranja diagonal
  rgb(Orange);
  const diagY = 118;
  doc.triangle(0, diagY + 18, W, diagY - 5, W, diagY + 22, 'F');
  rgb([200, 75, 10]);
  doc.triangle(0, diagY + 22, W, diagY + 5, W, diagY + 26, 'F');

  // Título principal
  fnt('bold', 34); tc(White);
  doc.text('RestoManager', ML, 44);

  // Underline naranja bajo el título
  rgb(Orange); doc.rect(ML, 48.5, 78, 2, 'F');

  // Subtítulo
  fnt('normal', 11); tc(OrangeL);
  doc.text('Sistema de Gestión de Restaurante', ML, 60);

  // Meta-texto
  fnt('bold', 7); tc(Muted);
  doc.text('INFORME TÉCNICO  ·  PROGRAMACIÓN II  ·  2026', ML, 70);

  // Chip de fecha — esquina superior derecha
  const today = new Date().toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' });
  const dateW = 56;
  rgb(NavyMid); doc.roundedRect(W - MR - dateW, 13, dateW, 9, 2, 2, 'F');
  drw(Orange); lw(0.5); doc.roundedRect(W - MR - dateW, 13, dateW, 9, 2, 2, 'S');
  fnt('normal', 6); tc(OrangeL);
  doc.text(today, W - MR - dateW / 2, 18.5, { align: 'center' });

  // ── Card de descripción ──────────────────────────────────────────────────
  const descY = 150;
  // Sombra
  rgb([200, 212, 228]); doc.roundedRect(ML + 1.5, descY + 1.5, CW, 56, 3, 3, 'F');
  // Card body
  rgb(White); drw(GrayL); lw(0.3);
  doc.roundedRect(ML, descY, CW, 56, 3, 3, 'FD');
  rgb(Orange); doc.roundedRect(ML, descY, 4.5, 56, 1.5, 1.5, 'F');
  doc.rect(ML + 2.5, descY, 2, 56, 'F');

  fnt('bold', 9.5); tc(Dark);
  doc.text('Descripción del Proyecto', ML + 9, descY + 9);
  fnt('normal', 7.8); tc(Mid);
  const descText = 'RestoManager es una aplicación de escritorio Java (Swing) para la gestión integral de un restaurante. Implementa arquitectura multi-capas (Modelo · DAO · Servicio · Vista) con conexión a MySQL hosteado en TiDB Cloud a través de un pool de conexiones HikariCP, operaciones asíncronas con SwingWorker y empaquetado Maven multi-módulo en un Fat JAR autocontenido de 6.9 MB.';
  let descLineY = descY + 17;
  const descLines = doc.splitTextToSize(descText, CW - 14);
  descLines.forEach(l => { doc.text(l, ML + 9, descLineY); descLineY += 4.8; });

  // Equipo
  descLineY += 2;
  fnt('bold', 7); tc(Dark); doc.text('Equipo:', ML + 9, descLineY); descLineY += 5.5;
  const team = [
    { n: 'Aggs13',          r: 'Backend · DAO · Tests',         c: [180, 80, 20] },
    { n: 'Niquinhoo',       r: 'Integración · Async · Conexión', c: [30, 100, 200] },
    { n: 'EnzoLlanos',      r: 'GUI · Vistas Swing',             c: [20, 140, 80] },
    { n: 'GonzaloBarroso',  r: 'Backend · ProductoDAO',          c: [120, 50, 190] },
  ];
  let bx = ML + 9;
  team.forEach(m => {
    if (bx > W - 60) { bx = ML + 9; descLineY += 6.5; }
    bx = badge(`${m.n}  ·  ${m.r}`, bx, descLineY, m.c);
  });

  // Stack tecnológico
  descLineY += 7;
  fnt('bold', 7); tc(Dark); doc.text('Stack tecnológico:', ML + 9, descLineY); descLineY += 5.5;
  const stack = ['Java 17', 'Swing', 'Maven Multi-módulo', 'HikariCP', 'MySQL / TiDB', 'JUnit 5', 'JFreeChart', 'SwingWorker'];
  bx = ML + 9;
  stack.forEach(s => {
    if (bx > W - 30) { bx = ML + 9; descLineY += 6.5; }
    bx = badge(s, bx, descLineY, NavyMid, OrangeL);
  });

  // ── Índice de contenidos ──────────────────────────────────────────────────
  const tocY = descY + 63;
  rgb(GrayBg); drw(GrayL); lw(0.2);
  doc.roundedRect(ML, tocY, CW, 48, 3, 3, 'FD');
  // Cabecera TOC
  rgb(NavyMid); doc.roundedRect(ML, tocY, CW, 9, 3, 3, 'F');
  doc.rect(ML, tocY + 4, CW, 5, 'F');
  fnt('bold', 7.5); tc(OrangeL); doc.text('Índice de Contenidos', ML + 7, tocY + 6.5);

  const toc = [
    ['1', 'Estructura del Repositorio y Ramas Git',              'pág. 2'],
    ['2', 'Arquitectura en Capas — Código representativo',        'pág. 3'],
    ['3', 'Modelo Entidad-Relación y Esquema SQL',                'pág. 4'],
    ['4', 'Flujo de Eventos: ABM de Productos (capturas)',        'pág. 5'],
    ['5', 'Gestión de Tareas en Notion',                          'pág. 6'],
    ['6', 'Problemas Detectados e Implementaciones',              'pág. 7'],
    ['7', 'Patrones de Diseño y Persistencia Transaccional',      'pág. 8'],
  ];
  fnt('normal', 7); tc(Mid);
  toc.forEach(([num, title, pg], i) => {
    const ty = tocY + 14 + i * 5;
    // Número
    rgb(Orange); doc.roundedRect(ML + 5, ty - 3.5, 5, 5, 1, 1, 'F');
    fnt('bold', 6); tc(White); doc.text(num, ML + 7.5, ty, { align: 'center' });
    // Título
    fnt('normal', 7); tc(Dark); doc.text(title, ML + 14, ty);
    // Puntos y página
    tc(Muted); doc.text('· · · · · · · · · · · · · · · · · · · · · · · · ·', ML + 14 + doc.getTextWidth(title) + 2, ty);
    fnt('bold', 7); tc(Orange); doc.text(pg, ML + CW - 5, ty, { align: 'right' });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 2 — SECCIÓN 1: REPOSITORIO Y RAMAS
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 1  ·  Estructura del Repositorio y Ramas Git');

  sub('1.1  Árbol de directorios del proyecto');
  para('El proyecto es un multi-módulo Maven con dos módulos independientes: Backend (lógica + persistencia) y GUI (vistas Swing). Un POM padre en la raíz orquesta el ciclo de vida de ambos mediante Reactor Build Order. El directorio Documentacion/ contiene reportes técnicos de cada sprint.');

  code([
    'Programacion2-Final/',
    '  ├── pom.xml                    ← Parent POM — orquesta Backend y GUI',
    '  ├── Backend/',
    '  │   └── src/main/java/com/restaurant/backend/',
    '  │       ├── model/             ← POJOs: Mesa, Pedido, Producto, Usuario…',
    '  │       ├── dao/               ← Interfaces + Impl JDBC',
    '  │       ├── service/           ← Lógica de negocio',
    '  │       ├── controller/        ← Stubs puente GUI↔Backend',
    '  │       └── util/              ← ConexionDB (HikariCP Singleton + DCL)',
    '  ├── GUI/',
    '  │   ├── pom.xml                ← POM hijo — hereda parent, fat JAR',
    '  │   ├── lib/                   ← JARs locales (AbsoluteLayout, JFreeChart)',
    '  │   ├── src/assembly/dep.xml   ← Descriptor Fat JAR personalizado',
    '  │   └── src/vistas/            ← Login, Menu, paneles, diálogos Swing',
    '  └── Documentacion/             ← Fix#1, Hotfix, Reporte_Jar, plan_service…',
  ], 'Estructura de directorios');

  sub('1.2  Estrategia de ramas — GitFlow simplificado');
  para('Cada developer trabaja en su propia rama feature/* y abre un Pull Request apuntando a dev. Solo cuando dev pasa revisión se integra a main. Nunca se hace push directo a main.');

  const branches = [
    { nm: 'main',                 lbl: 'PRODUCCIÓN',   desc: 'Rama de producción. Solo recibe merges controlados desde dev tras validación completa. Se usa para tagging de versiones semánticas.', col: [200,60,20] },
    { nm: 'dev',                  lbl: 'INTEGRACIÓN',  desc: 'Rama de integración central. Todo Pull Request del equipo apunta aquí. Es la fuente de verdad del estado actual del proyecto.', col: [30,100,200] },
    { nm: 'feature/nombre-tarea', lbl: 'DESARROLLO',   desc: 'Ramas personales por tarea (ej: feature/checkout-dialog). Se crean desde dev y se eliminan tras el merge aprobado.', col: [20,140,80] },
  ];
  branches.forEach(b => {
    need(22);
    rgb([210,220,235]); doc.roundedRect(ML+1, y+1, CW, 18, 2, 2, 'F');
    rgb(GrayBg); drw(b.col); lw(0.5);
    doc.roundedRect(ML, y, CW, 18, 2, 2, 'FD');
    rgb(b.col); doc.roundedRect(ML, y, 4.5, 18, 1.5, 1.5, 'F');
    doc.rect(ML + 2.5, y, 2, 18, 'F');
    fnt('bold', 8.5); tc(b.col); doc.text(b.nm, ML + 8, y + 7);
    badge(b.lbl, ML + 8 + doc.getTextWidth(b.nm) + 4, y + 7, b.col);
    fnt('normal', 7.5); tc(Mid);
    y = wrap(b.desc, ML + 8, y + 12.5, CW - 12, 4.3);
    y += 4;
  });

  sub('1.3  Flujo de Pull Request paso a paso');
  const prs = [
    ['①', 'Crear rama desde dev',    'git checkout -b feature/mi-tarea  — siempre desde dev actualizado.'],
    ['②', 'Desarrollar y commitear', 'Commits atómicos con mensajes descriptivos. Sin mezclar features.'],
    ['③', 'Abrir PR en GitHub',      'PR apuntando a dev, con descripción, screenshots y link a tarea de Notion.'],
    ['④', 'Code Review',             'Al menos un integrante revisa el código y solicita cambios si hay problemas.'],
    ['⑤', 'Merge Squash a dev',     'Al aprobar, squash para historial limpio. La feature branch se elimina.'],
    ['⑥', 'Release a main',         'Periódicamente dev → main mediante PR de release con tag de versión semántica.'],
  ];
  prs.forEach(([num, t, d]) => {
    need(16);
    // Círculo paso
    rgb(Orange); doc.circle(ML + 5, y + 3, 4.5, 'F');
    fnt('bold', 8); tc(White); doc.text(num, ML + 5, y + 5, { align: 'center' });
    // Línea conectora (excepto el último)
    rgb(GrayL); lw(0.5); doc.line(ML + 5, y + 7.5, ML + 5, y + 16);
    fnt('bold', 8); tc(Dark); doc.text(t, ML + 14, y + 3);
    fnt('normal', 7.5); tc(Mid);
    y = wrap(d, ML + 14, y + 8, CW - 16, 4.2);
    y += 2;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 3 — SECCIÓN 2: ARQUITECTURA EN CAPAS
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 2  ·  Arquitectura en Capas — Código Representativo');

  sub('① Capa Modelo  ·  com.restaurant.backend.model');
  para('POJOs sin lógica de negocio. Encapsulación total con getters/setters. Enums tipados. BigDecimal para precisión monetaria. Constructores sobrecargados.');
  code([
    'public class Producto {',
    '    private Integer idProducto;  // Wrapper → null antes de persistir',
    '    private String nombre;',
    '    private BigDecimal precio;   // Precisión decimal exacta (sin flotantes)',
    '    private boolean disponible;',
    '',
    '    public Producto() { this.precio = BigDecimal.ZERO; this.disponible = true; }',
    '    public Producto(Integer id, String nombre, BigDecimal precio) { /* … */ }',
    '    public String getNombre() { return nombre; }',
    '    public void setNombre(String n) { this.nombre = n; }',
    '}',
    'public enum EstadoMesa { LIBRE, OCUPADA, RESERVADA, FUERA_DE_SERVICIO }',
  ], 'Producto.java + EstadoMesa.java');

  sub('② Capa DAO  ·  com.restaurant.backend.dao');
  para('Interfaz (contrato) + implementación JDBC. PreparedStatement previene SQL Injection. try-with-resources libera la conexión automáticamente.');
  code([
    'public interface ProductoDAO {',
    '    String insertar(Producto p);',
    '    String editar(Producto p);',
    '    String eliminar(int id);',
    '    List<Producto> obtenerTodos();',
    '}',
    'public class ProductoDAOImpl implements ProductoDAO {',
    '    @Override public String insertar(Producto p) {',
    '        String sql = "INSERT INTO productos(nombre,precio,disponible) VALUES(?,?,?)";',
    '        try (Connection c = DatabaseConnection.getConnection();',
    '             PreparedStatement ps = c.prepareStatement(sql)) {',
    '            ps.setString(1, p.getNombre());',
    '            ps.setBigDecimal(2, p.getPrecio());',
    '            ps.executeUpdate();',
    '            return "Producto insertado correctamente";',
    '        } catch (SQLException e) { return "Error: " + e.getMessage(); }',
    '    }',
    '}',
  ], 'ProductoDAOImpl.java');

  sub('③ Capa Servicio  ·  ServicioFactory (Factory + Singleton)');
  code([
    'public final class ServicioFactory {',
    '    private static volatile MesaService mesaService; // volatile → multi-hilo',
    '',
    '    public static MesaService getMesaService() {',
    '        if (mesaService == null) {           // 1era verificación — sin lock',
    '            synchronized (ServicioFactory.class) {',
    '                if (mesaService == null) {   // 2da verificación — con lock (DCL)',
    '                    mesaService = new MesaService(new MesaDAOImpl(), new PedidoDAOImpl());',
    '                }',
    '            }',
    '        }',
    '        return mesaService;',
    '    }',
    '}',
    '// State Machine — Switch Expression (Java 14+)',
    'return switch (actual) {',
    '    case LIBRE     -> nuevo == OCUPADA || nuevo == RESERVADA;',
    '    case OCUPADA   -> nuevo == EstadoMesa.LIBRE;',
    '    case RESERVADA -> nuevo == OCUPADA || nuevo == LIBRE;',
    '    case FUERA_DE_SERVICIO -> nuevo == EstadoMesa.LIBRE;',
    '};',
  ], 'ServicioFactory.java + State Machine');

  sub('④ Capa Vista — AsyncDataLoader (SwingWorker genérico)');
  para('Wrapper genérico sobre SwingWorker. Garantiza que el Event Dispatch Thread (EDT) nunca se bloquee durante consultas SQL a TiDB Cloud.');
  code([
    'public static <T> void load(Component parent, Callable<T> task,',
    '                            Consumer<T> onSuccess, Consumer<Throwable> onError) {',
    '    new SwingWorker<T, Void>() {',
    '        @Override protected T doInBackground() throws Exception {',
    '            return task.call(); // Ejecuta en hilo de fondo — no bloquea UI',
    '        }',
    '        @Override protected void done() {  // Vuelve al EDT automáticamente',
    '            try { onSuccess.accept(get()); }',
    '            catch (Exception e) { onError.accept(e.getCause()); }',
    '        }',
    '    }.execute();',
    '}',
    '// Uso real en MesasPanel:',
    'AsyncDataLoader.load(this,',
    '    () -> ServicioFactory.getMesaService().listar(), // Lambda = Callable',
    '    this::colorearBotonesMesas                        // Method Reference',
    ');',
  ], 'AsyncDataLoader.java');

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 4 — SECCIÓN 3: ER + SCHEMA SQL
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 3  ·  Modelo Entidad-Relación y Esquema SQL');

  sub('3.1  Diagrama Entidad-Relación (restaurante_db en TiDB Cloud)');
  para('La base de datos sigue normalización 3NF con 7 tablas, 6 índices de optimización y 3 vistas SQL automáticas. Las FKs garantizan integridad referencial en TiDB Cloud Serverless.');

  // ── Diagrama ER ──────────────────────────────────────────────────────────
  const erTop = y;
  const erH = 122;
  // Sombra del diagrama
  rgb([190, 205, 225]); doc.roundedRect(ML + 1.5, erTop + 1.5, CW, erH, 3, 3, 'F');
  rgb(GrayBg); drw(GrayL); lw(0.3);
  doc.roundedRect(ML, erTop, CW, erH, 3, 3, 'FD');

  // Helper entidad ER
  const ent = (label, attrs, ex, ey, ew, col) => {
    const eh = 7 + attrs.length * 4.3;
    // Header entidad
    rgb(col); doc.roundedRect(ex, ey, ew, 7.5, 1.5, 1.5, 'F');
    doc.rect(ex, ey + 3, ew, 4.5, 'F');
    fnt('bold', 5.5); tc(White);
    doc.text(label, ex + ew / 2, ey + 5.2, { align: 'center' });
    // Body entidad
    rgb(White); drw([col[0]*0.6, col[1]*0.6, col[2]*0.6]); lw(0.3);
    doc.roundedRect(ex, ey + 7.5, ew, eh - 7.5, 0, 0, 'FD');
    doc.rect(ex, ey + 7.5, ew, 2, 'FD'); // aplanar top
    fnt('normal', 5); tc(Dark);
    attrs.forEach((a, i) => {
      const isPK = a.startsWith('PK');
      const isFK = a.startsWith('FK');
      if (isPK) { fnt('bold', 5); tc([180, 90, 10]); }
      else if (isFK) { fnt('bold', 5); tc([30, 100, 180]); }
      else { fnt('normal', 5); tc(Mid); }
      doc.text(a, ex + 2, ey + 11.5 + i * 4.3);
    });
    return ey + eh;
  };

  // Flecha relación
  const fkLine = (x1, y1, x2, y2) => {
    drw(Orange); lw(0.7);
    doc.line(x1, y1, x2, y2);
    const dx = x2-x1, dy = y2-y1;
    const len = Math.sqrt(dx*dx + dy*dy);
    if (len > 0.1) {
      const ux = dx/len, uy = dy/len;
      const px = -uy, py = ux;
      doc.line(x2, y2, x2 - ux*4 + px*2, y2 - uy*4 + py*2);
      doc.line(x2, y2, x2 - ux*4 - px*2, y2 - uy*4 - py*2);
    }
  };

  const eW = 34;
  const eRoles    = { x: ML + 3,   y: erTop + 6,   col: [40,80,180] };
  const eUsuarios = { x: ML + 3,   y: erTop + 35,  col: Navy };
  const eCats     = { x: ML + 3,   y: erTop + 80,  col: [20,120,70] };
  const eProds    = { x: ML + 42,  y: erTop + 72,  col: [140,60,20] };
  const eMesas    = { x: ML + 82,  y: erTop + 6,   col: [20,120,140] };
  const ePedidos  = { x: ML + 82,  y: erTop + 38,  col: [120,40,160] };
  const eDetalle  = { x: ML + 122, y: erTop + 36,  col: [160,80,20] };

  ent('ROLES',         ['PK id_rol', 'nombre'],                                         eRoles.x,    eRoles.y,    eW, eRoles.col);
  ent('USUARIOS',      ['PK id_usuario', 'nombre_usuario', 'contrasena', 'FK id_rol', 'activo'], eUsuarios.x, eUsuarios.y, eW, eUsuarios.col);
  ent('CATEGORIAS',    ['PK id_categoria', 'nombre', 'activa'],                          eCats.x,     eCats.y,     eW, eCats.col);
  ent('PRODUCTOS',     ['PK id_producto', 'nombre', 'precio', 'FK id_categoria', 'disponible'], eProds.x, eProds.y, eW, eProds.col);
  ent('MESAS',         ['PK id_mesa', 'numero', 'capacidad', 'estado (ENUM)'],           eMesas.x,    eMesas.y,    eW, eMesas.col);
  ent('PEDIDOS',       ['PK id_pedido', 'FK id_mesa', 'FK id_usuario', 'total', 'estado', 'created_at'], ePedidos.x, ePedidos.y, eW, ePedidos.col);
  ent('DETALLE_PEDIDO',['PK id_detalle', 'FK id_pedido', 'FK id_producto', 'cantidad', 'subtotal'], eDetalle.x, eDetalle.y, eW + 5, eDetalle.col);

  // Relaciones
  fkLine(eRoles.x + eW,    eRoles.y + 4,    eUsuarios.x + eW,  eUsuarios.y + 4);
  fkLine(eCats.x + eW,     eCats.y + 4,     eProds.x,          eProds.y + 4);
  fkLine(eMesas.x,         eMesas.y + 12,   ePedidos.x + eW,   ePedidos.y + 4);
  fkLine(eUsuarios.x + eW, eUsuarios.y + 12,ePedidos.x,        ePedidos.y + 12);
  fkLine(ePedidos.x + eW,  ePedidos.y + 8,  eDetalle.x,        eDetalle.y + 8);
  fkLine(eProds.x + eW,    eProds.y + 8,    eDetalle.x + 4,    eDetalle.y + 18);

  // Leyenda ER
  fnt('bold', 5.5); tc(Orange);
  doc.text('PK = Clave Primaria  ·  FK = Clave Foránea  ·  ──▶ = Relación 1:N', ML + 5, erTop + erH - 5);

  y = erTop + erH + 7;

  sub('3.2  Índices y Vistas SQL');
  // Tabla de índices
  need(8);
  rgb(NavyMid); doc.rect(ML, y, CW, 7, 'F');
  fnt('bold', 6.5); tc(White);
  doc.text('Índice', ML + 4, y + 5);
  doc.text('Optimiza', ML + 70, y + 5);
  y += 7;
  [
    ['idx_productos_categoria',  'Filtrado de productos por categoría en el menú del mozo'],
    ['idx_productos_disponible', 'Listado de productos activos (disponible = true)'],
    ['idx_pedidos_mesa',         'Búsqueda de pedidos por mesa en tiempo real'],
    ['idx_pedidos_estado',       'Filtrado de comandas por estado (ABIERTO, EN_COCINA…)'],
    ['idx_pedidos_fecha',        'Reportes de ingresos por rango temporal'],
    ['idx_detalle_pedido',       'Obtención de líneas de detalle por pedido'],
  ].forEach(([ix, d], i) => {
    need(6.5);
    rgb(i % 2 === 0 ? White : GrayBg); doc.rect(ML, y, CW, 6, 'F');
    drw(GrayL); lw(0.2); doc.rect(ML, y, CW, 6, 'S');
    fnt('normal', 6.5); tc(Dark); doc.text(ix, ML + 4, y + 4.2);
    tc(Mid); doc.text(d, ML + 70, y + 4.2);
    y += 6;
  });
  y += 4;

  fnt('bold', 7.5); tc(Dark); doc.text('Vistas SQL automáticas:', ML, y); y += 6;
  [
    ['vw_ventas_por_producto', 'Sumatoria de unidades vendidas y recaudación por producto (excl. CANCELADO).'],
    ['vw_ventas_por_mes',      'Ingresos y número de órdenes agrupados por mes y año.'],
    ['vw_estado_mesas',        'Monitoreo en tiempo real: mesas con sus pedidos activos vinculados.'],
  ].forEach(([v, d]) => {
    need(9);
    fnt('bold', 6.8); tc(Orange); doc.text(v, ML + 2, y);
    fnt('normal', 7); tc(Mid);
    y = wrap(d, ML + 68, y, CW - 70, 4.3);
    y += 1.5;
  });

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 5 — SECCIÓN 4: ABM PRODUCTOS
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 4  ·  Flujo de Eventos: ABM de Productos');

  sub('4.1  Flujo completo GUI → Service → DAO → MySQL');
  para('El módulo ABM de Productos permite listar, dar de alta, modificar disponibilidad y dar de baja productos del catálogo. Todas las operaciones se ejecutan en hilos de fondo (SwingWorker) para no bloquear el EDT.');

  code([
    '// 1. ProductosPanel.java — carga asíncrona de la tabla',
    'AsyncDataLoader.load(this,',
    '    () -> ServicioFactory.getProductoService().obtenerTodos(),',
    '    productos -> renderizarTabla(productos),',
    '    err -> JOptionPane.showMessageDialog(this, err.getMessage())',
    ');',
    '',
    '// 2. ProductoService.java — validación de negocio',
    'public String agregar(Producto p) {',
    '    if (p.getNombre() == null || p.getNombre().isBlank()) return "Nombre requerido";',
    '    if (p.getPrecio().compareTo(BigDecimal.ZERO) <= 0)  return "Precio debe ser > 0";',
    '    return productoDAO.insertar(p);',
    '}',
    '',
    '// 3. ProductoDAOImpl.java — UPDATE con PreparedStatement',
    'public String editar(Producto p) {',
    '    String sql = "UPDATE productos SET nombre=?,precio=?,disponible=? WHERE id_producto=?";',
    '    try (Connection c = DatabaseConnection.getConnection();',
    '         PreparedStatement ps = c.prepareStatement(sql)) {',
    '        ps.setString(1, p.getNombre());',
    '        ps.setBigDecimal(2, p.getPrecio());',
    '        ps.setBoolean(3, p.isDisponible());',
    '        ps.setInt(4, p.getIdProducto());',
    '        ps.executeUpdate();',
    '        return "Producto editado correctamente";',
    '    } catch (SQLException e) { return "Error: " + e.getMessage(); }',
    '}',
  ], 'Flujo completo — GUI → ProductoService → ProductoDAOImpl → MySQL');

  sub('4.2  Capturas del sistema — ABM Productos');
  await img('/imgsistema/ProductosABM/ProductosActuales-1.png',       ML,       y, 85, 54, 'Vista principal: listado de productos');
  await img('/imgsistema/ProductosABM/AltaProducto.png',              ML + 90, y, 82, 54, 'Dialog: alta de nuevo producto');
  y += 60;
  need(60);
  await img('/imgsistema/ProductosABM/ModificacionProducto.png',      ML,       y, 85, 54, 'Dialog: modificación de producto');
  await img('/imgsistema/ProductosABM/ConfirmacionBajaProducto.png',  ML + 90, y, 82, 54, 'Confirmación de baja (JOptionPane)');
  y += 60;

  sub('4.3  Estados de Mesa — State Machine visual');
  para('MesaService.esTransicionPermitida() controla las transiciones válidas. El color de cada botón de mesa en MesasPanel.java se actualiza dinámicamente según el EstadoMesa del objeto.');

  need(58);
  const mesY = y;
  const colW = (CW - 6) / 4;
  await img('/imgsistema/EstadoMesas/MesaLibre.png',            ML,                   mesY, colW, 50, 'LIBRE (verde)');
  await img('/imgsistema/EstadoMesas/MesaOcupada.png',          ML + colW + 2,        mesY, colW, 50, 'OCUPADA (rojo)');
  await img('/imgsistema/EstadoMesas/MesaReservada.png',        ML + (colW + 2)*2,    mesY, colW, 50, 'RESERVADA (naranja)');
  await img('/imgsistema/EstadoMesas/MesaFueraDeServicio.png',  ML + (colW + 2)*3,    mesY, colW, 50, 'FUERA DE SERVICIO');
  y = mesY + 56;

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 6 — SECCIÓN 5: NOTION
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 5  ·  Gestión de Tareas en Notion');

  para('El equipo usó Notion como herramienta principal de gestión. Se creó una base de datos de tareas con estado, asignado, sección (Backend, Frontend, BD, Testing, Documentación), prioridad y enlace al repositorio GitHub. Al finalizar: 43 tareas completadas, 0 pendientes.');

  sub('5.1  Vista "Todas las tareas" — lista completa con filtros');
  need(96);
  await img('/imgsistema/Notion/Screenshot 2026-06-17 185718.png', ML, y, CW, 90, 'Notion — Vista de todas las tareas: estado, asignado, sección, prioridad y repositorio');
  y += 95;

  sub('5.2  Vista "Por estado" — Kanban de progreso del equipo');
  need(82);
  await img('/imgsistema/Notion/Screenshot 2026-06-17 185818.png', ML, y, CW, 76, 'Notion — Vista Kanban: 43 tareas en "Completado" al cierre del proyecto');
  y += 82;

  need(88);
  sub('5.3  Vista "Por sección" — División de responsabilidades');
  await img('/imgsistema/Notion/Screenshot 2026-06-17 185827.png', ML, y, CW, 80, 'Notion — Vista por sección: Backend (Niquinhoo/Aggs13/Gonzalo), Frontend (Enzo), BD (Niquinhoo), Testing (Aggs13/Gonzalo)');
  y += 86;

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 7 — SECCIÓN 6: PROBLEMAS E IMPLEMENTACIONES
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 6  ·  Problemas Detectados e Implementaciones');

  sub('6.1  Fix#1 — Auditoría Inicial (3 brechas cerradas)');
  para('En la primera auditoría se detectaron 3 tareas marcadas como "Completadas" en Notion que estaban ausentes en la base de código real. Se definió el bloque Fix#1 para cerrarlas.');

  fixCard(
    'Tests Unitarios de Capa DAO (JUnit 5)',
    'Solo existía ConexionDBTest con tests genéricos. Faltaban validaciones para ProductoDAOImpl, MesaDAOImpl y PedidoDAOImpl.',
    'Tests de integración reales contra TiDB Cloud con @AfterEach cleanup SQL. Mesa reservada #9990 como entidad de prueba aislada. Tag @Tag("integration") para CI.',
    '35 pruebas — 100% éxito  |  165 segundos contra TiDB Cloud en AWS.',
    BlueA
  );

  fixCard(
    'Autenticación Real de Usuarios — SHA-256 en BD',
    'Login.java tenía un botón "Entrar" que abría directamente Menu sin ninguna validación. Sin UsuarioDAO ni UsuarioService en el backend.',
    'UsuarioDAO + UsuarioDAOImpl con SHA2(?, 256) delegado en SQL. UsuarioService con reglas de negocio. AsyncDataLoader en Login. Sobrecarga de constructor Menu(Usuario).',
    'Login → UsuarioService.iniciarSesion() → SHA2 → retorna Usuario o null → JOptionPane.',
    SuccG
  );

  fixCard(
    'Arquitectura Maven Multi-módulo',
    'GUI era un proyecto puro de Ant/NetBeans. Sin integración formal como módulo Maven del POM padre. mvn package ignoraba la GUI.',
    'Coexistencia: mantener nbproject/ + build.xml para el diseñador visual, más GUI/pom.xml superpuesto. Dependencias locales via systemPath Maven.',
    'mvn clean package -DskipTests compila Backend + GUI y produce RestoManager.jar (6.9 MB autocontenido).',
    Orange
  );

  sub('6.2  Hotfix — Classpath, Liberación y JAR desactualizado');
  fixCard(
    'NoClassDefFoundError: HikariConfig — Classpath manual roto',
    'Al migrar a HikariCP el classpath del README no incluía las nuevas dependencias. Imposible ejecutar la app manualmente.',
    'Se actualizó README.md añadiendo rutas de HikariCP 5.1.0 + slf4j-api 2.0.13 + slf4j-simple 2.0.13 desde .m2 al classpath manual.',
    null, ErrR
  );

  fixCard(
    'Liberación accidental de mesas con pedidos activos',
    'El botón "Liberar" cerraba pedidos activos de forma inmediata e irreversible sin confirmación al usuario.',
    'JOptionPane.showConfirmDialog() diferenciado: WARNING si hay pedidos abiertos, QUESTION si la mesa está limpia. Cancel no altera ningún registro.',
    null, WarnY
  );

  fixCard(
    'Backend-1.0.jar desactualizado en ejecución',
    'Cambios en MesaService.java no se habían recompilado. El binario en uso era obsoleto y mostraba errores en liberación de mesas.',
    'Recompilación forzada: mvn clean package -DskipTests. Siempre usar el JAR de /target/ con los últimos cambios compilados.',
    null, PurpA
  );

  // ══════════════════════════════════════════════════════════════════════════
  // ██  PÁGINA 8 — SECCIÓN 7: PATRONES + PERSISTENCIA
  // ══════════════════════════════════════════════════════════════════════════
  newPage();

  section('Sección 7  ·  Patrones de Diseño y Persistencia Transaccional');

  sub('7.1  Catálogo de patrones aplicados');
  const pats = [
    { nm: 'DAO',                  col: Navy,           d: 'XxxDAO (interfaz) + XxxDAOImpl (JDBC). Separa acceso a datos de lógica de negocio. Facilita mocks en tests.' },
    { nm: 'Singleton (DCL)',      col: PurpA,          d: 'ConexionDB y ServicioFactory con Double-Checked Locking + volatile. Thread-safe para SwingWorkers concurrentes.' },
    { nm: 'Factory',              col: [20, 100, 180], d: 'ServicioFactory centraliza la creación lazy de todos los servicios. Los componentes GUI no conocen dependencias internas.' },
    { nm: 'Dependency Injection', col: SuccG,          d: 'Servicios reciben DAOs por constructor. Cumple DIP. Facilita testing con mocks sin tocar implementación.' },
    { nm: 'State Machine',        col: Orange,         d: 'MesaService.esTransicionPermitida() con switch expression define transiciones válidas de EstadoMesa. Previene estados incoherentes.' },
    { nm: 'Observer (Listener)',  col: ErrR,           d: 'CardProducto.OnAgregarListener es @FunctionalInterface. Notifica al menú cuando el mozo agrega un producto.' },
    { nm: 'DTO',                  col: Teal,           d: 'ResumenGeneralDTO, VentaPorProductoDTO transportan datos entre capas sin exponer entidades de BD.' },
    { nm: 'Template Method',      col: Mid,            d: 'AsyncDataLoader define el esqueleto del flujo asíncrono (doInBackground → done) con variaciones por lambdas.' },
  ];

  // Grid de 2 columnas para patrones
  const patW = (CW - 5) / 2;
  let patCol = 0;
  let patRowY = y;
  pats.forEach((p, idx) => {
    const pLines = doc.splitTextToSize(p.d, patW - 14);
    const ph = 6 + pLines.length * 4 + 8;
    if (patCol === 0) {
      need(ph + 3);
      patRowY = y;
    }
    const px = ML + patCol * (patW + 5);
    // Sombra
    rgb([210, 220, 235]); doc.roundedRect(px + 1, patRowY + 1, patW, ph, 2, 2, 'F');
    // Card
    rgb(GrayBg); drw(GrayL); lw(0.25);
    doc.roundedRect(px, patRowY, patW, ph, 2, 2, 'FD');
    rgb(p.col); doc.roundedRect(px, patRowY, 4, ph, 1.5, 1.5, 'F');
    doc.rect(px + 2.5, patRowY, 1.5, ph, 'F');
    fnt('bold', 7.5); tc(p.col); doc.text(p.nm, px + 7, patRowY + 6);
    fnt('normal', 6.8); tc(Mid);
    pLines.forEach((l, i) => doc.text(l, px + 7, patRowY + 12 + i * 4));

    patCol++;
    if (patCol === 2) {
      patCol = 0;
      y = patRowY + ph + 3;
    }
  });
  if (patCol !== 0) y = patRowY + 50;
  y += 4;

  sub('7.2  Transacción JDBC atómica — Pedido + Detalles en Batch');
  code([
    '// PedidoDAOImpl.java — Inserción atómica (ACID)',
    'public String Insertar(Pedido p, List<DetallePedido> detalles) {',
    '    Connection conn = null;',
    '    try {',
    '        conn = DatabaseConnection.getConnection();',
    '        conn.setAutoCommit(false);  // Inicio de transacción manual',
    '',
    '        // 1. INSERT cabecera + recuperar ID autogenerado',
    '        PreparedStatement ps = conn.prepareStatement(SQL_PEDIDO, RETURN_GENERATED_KEYS);',
    '        ps.executeUpdate();',
    '        ResultSet keys = ps.getGeneratedKeys();',
    '        int pedidoId = keys.next() ? keys.getInt(1) : -1;',
    '',
    '        // 2. INSERT detalles en BATCH (una sola round-trip a BD)',
    '        PreparedStatement psD = conn.prepareStatement(SQL_DETALLE);',
    '        for (DetallePedido d : detalles) {',
    '            psD.setInt(1, pedidoId);',
    '            psD.setInt(2, d.getIdProducto());',
    '            psD.setInt(3, d.getCantidad());',
    '            psD.setBigDecimal(4, d.getSubtotal());',
    '            psD.addBatch();',
    '        }',
    '        psD.executeBatch();',
    '        conn.commit();  // Éxito: confirma todo de forma atómica',
    '        return "Pedido y detalles insertados correctamente";',
    '    } catch (SQLException ex) {',
    '        if (conn != null) try { conn.rollback(); } catch (SQLException e2) {}',
    '        return "Error al insertar pedido: " + ex.getMessage();',
    '    }',
    '}',
  ], 'PedidoDAOImpl.java — Transacción ACID + Batch Insert');

  sub('7.3  Flujo de carga de pedido (capturas)');
  para('El mozo filtra el menú por categorías, selecciona productos y confirma en CheckoutDialog. La inserción es atómica: si falla algún detalle, se hace rollback completo.');

  need(58);
  const cpY = y;
  const cpW = (CW - 6) / 4;
  await img('/imgsistema/CargarPedido/MenuPrincipal-1.png',          ML,                cpY, cpW, 50, '① Menú principal');
  await img('/imgsistema/CargarPedido/MenuFiltradoCategorias-2.png', ML + cpW + 2,      cpY, cpW, 50, '② Filtro categorías');
  await img('/imgsistema/CargarPedido/SeleccionDeProductos-3.png',   ML + (cpW+2)*2,    cpY, cpW, 50, '③ Selección');
  await img('/imgsistema/CargarPedido/Checkout-4.png',               ML + (cpW+2)*3,    cpY, cpW, 50, '④ Checkout');
  y = cpY + 56;

  // ── Footers en todas las páginas
  footers();

  doc.save('RestoManager_Informe_Completo.pdf');
}