# UX/UI - GAMILIT

Diseno de experiencia de usuario e interfaz.

---

## Contenido

### Portales

#### 1. Portal Estudiante (~100%)
**Objetivo:** Experiencia de aprendizaje gamificada

**Secciones principales:**
- Dashboard personal (progreso, XP, rango)
- 5 modulos de ejercicios interactivos
- Leaderboards (aula, escuela, global)
- Tienda de recompensas (ML Coins)
- Perfil y logros
- Notificaciones

**Componentes clave:**
- Sistema de gamificacion (XP, niveles, rangos maya)
- 23 tipos de ejercicios interactivos
- Feedback inmediato
- Animaciones de logros
- Sistema de ayuda contextual

#### 2. Portal Maestro (~95%)
**Objetivo:** Gestion academica y seguimiento

**Secciones principales:**
- Dashboard de aulas
- Gestion de estudiantes
- Asignacion de ejercicios
- Revision manual de ejercicios
- Reportes de progreso
- Alertas de intervencion

**Componentes clave:**
- Vista de aulas (16 paginas)
- Calendario de asignaciones
- Sistema de calificacion
- Analytics de progreso
- Resource sharing entre docentes

#### 3. Portal Administrador (~90%)
**Objetivo:** Configuracion y gestion del sistema

**Secciones principales:**
- Gestion de contenido educativo
- Configuracion del sistema
- Analytics globales
- Gestion de usuarios y roles
- Auditoria

**Componentes clave:**
- Editor de ejercicios
- Panel de configuracion
- Dashboards de metricas
- Gestion de permisos
- Logs de auditoria

#### 4. Portal Padres (100%)
**Objetivo:** Seguimiento del progreso academico

**Secciones principales:**
- Dashboard de progreso del hijo
- Notificaciones academicas
- Comunicacion con maestros
- Reportes periodicos

**Componentes clave:**
- Vinculacion padre-estudiante
- Graficas de progreso
- Sistema de notificaciones (email, push, SMS)
- Chat con maestros

### Design System

**Tema:** Cultura Maya
- **Colores:** Paleta inspirada en cultura maya
- **Iconografia:** Iconos tematicos maya
- **Tipografia:** Fuentes legibles, accesibles
- **Componentes:** TailwindCSS 4.x custom

**Framework UI:** TailwindCSS 4.x
**Componentes:** 575 componentes React
**Responsivo:** Mobile-first design (38 ejercicios + componentes compartidos con patrones sm: breakpoint)

### Flujos de Usuario

**Estudiante:**
1. Login -> Dashboard -> Seleccionar modulo -> Ejercicio -> Feedback -> XP -> Leaderboard

**Maestro:**
1. Login -> Dashboard aulas -> Seleccionar aula -> Asignar ejercicio -> Revisar progreso

**Admin:**
1. Login -> Panel admin -> Gestion contenido -> Crear/editar ejercicio -> Publicar

**Padre:**
1. Login -> Dashboard hijo -> Ver progreso -> Revisar notificaciones -> Contactar maestro

### Centro de Flujos End-to-End

- Indice central: [flujos/README.md](./flujos/README.md)
- Matriz de trazabilidad: [flujos/TRACEABILITY-MATRIX.md](./flujos/TRACEABILITY-MATRIX.md)
- Matriz de cobertura total: [flujos/COBERTURA-TOTAL-PROCESOS.md](./flujos/COBERTURA-TOTAL-PROCESOS.md)
- Auditoria residual full: [flujos/AUDITORIA-RESIDUAL-FULL.md](./flujos/AUDITORIA-RESIDUAL-FULL.md)
- Validacion analisis vs integracion: [flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md](./flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md)

### Gamificacion Visual

**Elementos visuales:**
- Barra de progreso XP
- Indicador de rango maya (5 niveles)
- Notificaciones de logros (toasts animados)
- Leaderboards interactivos
- Tienda de recompensas
- Sistema de insignias

---

## Wireframes y Mockups

**Herramientas:** Figma
**Design System:** apps/frontend/src/styles/

---

## Recursos Educativos (Media)

Algunos ejercicios requieren recursos multimedia servidos desde `apps/frontend/public/`:

| Tipo | Ubicacion | Ejercicio | Cantidad |
|------|-----------|-----------|----------|
| SVG Memes | `public/memes/*.svg` | M4: Analisis de Memes | 6 (600x500px, flat design) |
| Audio MP3 | `public/audio/*.mp3` | Auxiliar: Comprension Auditiva | 1 (~2 min, gTTS español) |
| Script | `public/audio/narration-script.txt` | (referencia para regenerar audio) | 1 |

**Adapters:** Los recursos se vinculan via `content` JSON en BD. Los adapters en `exerciseAdapter.ts` mapean los campos del JSON a las props que cada componente espera (`memeUrl`, `audioUrl`, etc.).

---

## Referencias

**Design System:** apps/frontend/src/styles/
**Componentes:** apps/frontend/src/components/

575 componentes React documentados en orchestration/inventarios/FRONTEND_INVENTORY.yml
