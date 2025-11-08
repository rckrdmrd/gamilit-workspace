# _MAP: docs/01-requerimientos/interfaces/

**Última actualización:** 2025-11-07
**Propósito:** Wireframes, mockups y especificaciones de interfaz de usuario
**Audiencia:** Diseñadores UX/UI, Desarrolladores Frontend, Product Owners
**Estado:** 🟡 En desarrollo (contenido limitado)

---

## 📁 Contenido de esta Carpeta

### Documentos Principales

| Documento | Descripción | Estado |
|-----------|-------------|--------|
| [README.md](./README.md) | Índice de wireframes y guías de diseño | ✅ |

**Total documentos:** 1

---

## 🔗 Interdependencias

### Módulos Relacionados

**Complementa a:**
- [casos-uso](../casos-uso/) - User flows y casos de uso
- Todos los requerimientos funcionales - Visualización de RFs

**Usado por:**
- Diseñadores UX/UI - Creación de diseños
- Desarrolladores Frontend - Implementación de componentes
- QA Engineers - Validación visual

### Documentación Relacionada

**Requerimientos Funcionales:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Pantallas de login, permisos
- [02-gamificacion](../02-gamificacion/) - UI de achievements, ranks, economy
- [03-contenido-educativo](../03-contenido-educativo/) - UI de 27 mecánicas de ejercicios
- [Teacher Portal](../teacher-portal/) - Dashboard, analytics, gestión
- [Admin Portal](../admin-portal/) - Panel de administración

**Desarrollo:**
- [Frontend Specs](../../02-especificaciones-tecnicas/frontend/) - Guías de implementación
- Frontend Code: `apps/frontend/src/`

---

## 📊 Métricas

- **Total documentos:** 1
- **Wireframes documentados:** 0 (pendiente)
- **Mockups de alta fidelidad:** 0 (pendiente)
- **Guías de diseño:** 0 (pendiente)

---

## 🎯 Interfaces Planeadas (Sin Documentar)

### Portal de Estudiantes

**Pantallas principales:**
1. **Autenticación**
   - Login
   - Registro
   - Recuperación de contraseña

2. **Dashboard / Home**
   - Resumen de progreso
   - Tareas pendientes
   - Logros recientes
   - Racha actual

3. **Biblioteca de Contenido**
   - Listado de módulos educativos
   - Filtros por dificultad, categoría
   - Vista previa de ejercicios

4. **Ejercicios (27 mecánicas)**
   - UI específica por cada tipo de mecánica
   - Barra de progreso
   - Sistema de hints
   - Retroalimentación visual

5. **Gamificación**
   - Galería de achievements
   - Ranking de usuario
   - Tienda de power-ups
   - Historial de ML Coins

6. **Perfil**
   - Información personal
   - Estadísticas detalladas
   - Preferencias

### Portal de Maestros

**Pantallas principales:**
1. **Dashboard**
   - Resumen de aulas
   - Tareas próximas
   - Alertas de estudiantes en riesgo

2. **Gestión de Aulas**
   - Listado de aulas
   - Detalle de aula (estudiantes, estadísticas)
   - Agregar/remover estudiantes

3. **Asignación de Tareas**
   - Crear nueva tarea
   - Asignar a aula/estudiantes
   - Configurar fechas límite

4. **Calificación**
   - Lista de entregas pendientes
   - Vista de ejercicio completado
   - Formulario de feedback

5. **Analytics**
   - Gráficas de progreso por estudiante
   - Comparación de rendimiento
   - Reportes exportables

### Portal de Administradores

**Pantallas principales:**
1. **Dashboard de Métricas**
   - KPIs del sistema
   - Uso por organización
   - Alertas de sistema

2. **Gestión de Usuarios**
   - Listado con filtros
   - Detalle de usuario
   - Asignación de roles

3. **Gestión de Organizaciones**
   - Listado de tenants
   - Configuración por organización
   - Límites y cuotas

4. **Gestión de Contenido**
   - Aprobación de contenido
   - Moderación
   - Biblioteca global

5. **Configuración del Sistema**
   - Feature flags
   - Parámetros del sistema
   - Audit logs

---

## 🚀 Próximos Pasos

### Prioridad Alta
1. [ ] Crear wireframes de portal de estudiantes (15+ pantallas)
2. [ ] Crear wireframes de 27 mecánicas de ejercicios
3. [ ] Crear guía de componentes UI (Design System)

### Prioridad Media
4. [ ] Crear wireframes de portal de maestros (10+ pantallas)
5. [ ] Crear wireframes de portal de admin (8+ pantallas)
6. [ ] Documentar flujos de navegación

### Prioridad Baja
7. [ ] Crear mockups de alta fidelidad
8. [ ] Documentar responsive breakpoints
9. [ ] Especificar animaciones y transiciones

---

## ⚠️ Issues Conocidos

- [ ] Carpeta prácticamente vacía - Solo tiene README.md
- [ ] No hay wireframes documentados
- [ ] No hay guía de diseño (Design System)
- [ ] No hay especificaciones de componentes

---

## 🎨 Design System Planeado

### Componentes Base

**Elementos básicos:**
- Botones (primary, secondary, tertiary, danger)
- Inputs (text, number, select, textarea, file)
- Cards
- Modals
- Toasts / Notifications
- Breadcrumbs
- Tabs
- Badges

**Componentes de Gamificación:**
- AchievementCard
- RankBadge
- ProgressBar
- XPIndicator
- MLCoinsCounter
- StreakTracker

**Componentes Educativos:**
- ExerciseCard
- MechanicRenderer (27 tipos)
- FeedbackDisplay
- HintButton
- SubmitButton

### Paleta de Colores

**Esperada (basada en cultura maya):**
- **Primary:** Tonos de jade/verde (naturaleza maya)
- **Secondary:** Dorado/amarillo (sol, oro maya)
- **Accent:** Rojo/terracota (cerámica maya)
- **Neutral:** Grises para backgrounds

**Semántica:**
- **Success:** Verde
- **Warning:** Amarillo/Naranja
- **Danger:** Rojo
- **Info:** Azul

### Tipografía

**Esperada:**
- **Headings:** Sans-serif moderna (legibilidad)
- **Body:** Sans-serif optimizada para lectura
- **Code/Monospace:** Para feedback técnico

---

## 📚 Herramientas Recomendadas

**Diseño:**
- **Figma** - Wireframes, mockups, prototipos
- **Miro** - User flows, information architecture
- **Adobe XD** - Alternativa a Figma

**Documentación:**
- **Storybook** - Documentación de componentes React
- **Zeroheight** - Design system documentation

**Prototipado:**
- **Figma Prototyping** - Prototipos interactivos
- **Principle** - Animaciones y micro-interacciones

---

## 📖 Recursos Externos

**Inspiración de diseño educativo:**
- [Duolingo](https://www.duolingo.com/) - Gamificación educativa
- [Khan Academy](https://www.khanacademy.org/) - UI de ejercicios
- [ClassDojo](https://www.classdojo.com/) - Portal de maestros

**Design Systems de referencia:**
- [Material Design](https://material.io/design) - Google
- [Ant Design](https://ant.design/) - Alibaba
- [Chakra UI](https://chakra-ui.com/) - Design system para React

**Accesibilidad:**
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [A11y Project](https://www.a11yproject.com/)
