# Especificación Técnica: Badges "En Construcción" - Portal Admin

**Fecha:** 2025-11-24
**Tipo:** Especificación Técnica (ET)
**Código:** ET-ADMIN-MVP-001
**Prioridad:** ALTA
**Story Points:** 1 SP
**Estado:** 📝 Especificado

---

## 🎯 Objetivo

Implementar sistema de badges y mensajes "En Construcción" para páginas y funcionalidades del Portal de Administrador que están **fuera del alcance MVP**, evitando enlaces rotos y mejorando la experiencia de usuario.

---

## 📋 Contexto

### Problema Actual

El Portal de Administrador tiene 13 páginas implementadas, pero solo 4 están dentro del alcance MVP definido en EAI-005:

**Dentro de alcance MVP:**
1. ✅ Dashboard (AdminDashboardPage)
2. ✅ Organizaciones/Instituciones (AdminInstitutionsPage)
3. ✅ Gamificación Config (AdminGamificationPage)
4. ✅ Classroom-Teacher (AdminClassroomTeacherPage)

**Fuera de alcance MVP (9 páginas):**
1. ❌ Usuarios (AdminUsersPage)
2. ❌ Roles y Permisos (AdminRolesPage)
3. ❌ Contenido (AdminContentPage)
4. ❌ Aprobaciones (AdminApprovalsPage)
5. ❌ Monitoreo (AdminMonitoringPage)
6. ❌ Herramientas Avanzadas (AdminAdvancedPage)
7. ❌ Reportes (AdminReportsPage)
8. ❌ Configuración (AdminSettingsPage)
9. ❌ Instituciones Detalle (AdminInstitutionsDetailPage)

**Problema:**
- Usuarios ven 11 enlaces en sidebar
- Al hacer click en enlaces fuera de MVP, pueden encontrar páginas parcialmente implementadas
- Genera confusión sobre qué está disponible y qué no
- Algunos componentes muestran "Próximamente" pero de forma inconsistente

**Solución:**
Implementar sistema consistente de badges "En Construcción" que:
1. Identifique visualmente features fuera de alcance
2. Muestre mensajes informativos claros
3. Mantenga navegabilidad sin enlaces rotos
4. Sea fácil de remover cuando features se completen

---

## 🎨 Diseño de Solución

### Componente Principal: UnderConstruction

Ya existe un componente base en:
```
apps/frontend/src/shared/components/UnderConstruction.tsx
```

**Propósito:** Mostrar página completa con mensaje "En Construcción"

**Uso:** Reemplazar contenido de páginas fuera de alcance MVP

### Componente Secundario: FeatureBadge

**Nuevo componente a crear:**
```
apps/frontend/src/shared/components/common/FeatureBadge.tsx
```

**Propósito:** Badge pequeño para indicar estado de funcionalidades específicas dentro de páginas parcialmente implementadas

---

## 📐 Especificación de Componentes

### 1. UnderConstruction Component (Mejorado)

**Ubicación:** `apps/frontend/src/shared/components/UnderConstruction.tsx`

**Props Interface:**
```typescript
interface UnderConstructionProps {
  /** Título de la funcionalidad en construcción */
  title: string;

  /** Descripción de qué hará esta funcionalidad */
  description?: string;

  /** Estimación de disponibilidad (ej: "Q1 2026", "Próximamente") */
  estimatedDate?: string;

  /** Features planeadas (lista de bullets) */
  features?: string[];

  /** Mostrar botón de "Volver al Dashboard" */
  showBackButton?: boolean;

  /** Callback al hacer click en "Volver" */
  onBack?: () => void;

  /** Variante visual */
  variant?: 'full-page' | 'section' | 'card';

  /** Icono personalizado (lucide-react icon name) */
  icon?: string;
}
```

**Ejemplo de Uso:**
```tsx
// Página completa
<UnderConstruction
  title="Gestión de Usuarios"
  description="Sistema completo de CRUD para administrar usuarios, roles y permisos"
  estimatedDate="Próximamente"
  features={[
    "Crear, editar y eliminar usuarios",
    "Asignar roles y permisos personalizados",
    "Importación masiva desde CSV",
    "Filtros avanzados y búsqueda",
    "Exportación de reportes"
  ]}
  showBackButton
  variant="full-page"
  icon="Users"
/>
```

**Diseño Visual:**

```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                    🚧 [ICONO]                              │
│                                                            │
│              GESTIÓN DE USUARIOS                           │
│         Funcionalidad en desarrollo                        │
│                                                            │
│  Sistema completo de CRUD para administrar usuarios,      │
│  roles y permisos                                          │
│                                                            │
│  Funcionalidades Planeadas:                                │
│  • Crear, editar y eliminar usuarios                      │
│  • Asignar roles y permisos personalizados                │
│  • Importación masiva desde CSV                            │
│  • Filtros avanzados y búsqueda                           │
│  • Exportación de reportes                                 │
│                                                            │
│  Disponibilidad estimada: Próximamente                     │
│                                                            │
│              [← Volver al Dashboard]                       │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

**Variantes:**

**a) full-page** (default)
- Ocupa toda la página
- Centro vertical y horizontal
- Padding generoso
- Fondo con gradiente suave

**b) section**
- Ocupa una sección dentro de una página
- Padding mediano
- Border y shadow ligero

**c) card**
- Formato de card compacto
- Para features individuales dentro de páginas
- Padding pequeño

### 2. FeatureBadge Component (Nuevo)

**Ubicación:** `apps/frontend/src/shared/components/common/FeatureBadge.tsx`

**Props Interface:**
```typescript
interface FeatureBadgeProps {
  /** Variante de estado */
  variant: 'under-construction' | 'coming-soon' | 'beta' | 'new' | 'deprecated';

  /** Tamaño del badge */
  size?: 'sm' | 'md' | 'lg';

  /** Mostrar tooltip con información adicional */
  tooltip?: string;

  /** Posición del badge (para absolute positioning) */
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';

  /** Personalizar texto (override del default por variante) */
  text?: string;
}
```

**Variantes y Estilos:**

| Variant | Default Text | Color | Icono |
|---------|--------------|-------|-------|
| `under-construction` | "En Construcción" | Amarillo/Naranja | 🚧 Construction |
| `coming-soon` | "Próximamente" | Azul | 🔜 Clock |
| `beta` | "Beta" | Morado | 🧪 Flask |
| `new` | "Nuevo" | Verde | ✨ Sparkles |
| `deprecated` | "Obsoleto" | Rojo | ⚠️ AlertTriangle |

**Ejemplo de Uso:**
```tsx
// Badge inline
<div className="flex items-center gap-2">
  <h2>Reportes Avanzados</h2>
  <FeatureBadge variant="under-construction" size="sm" />
</div>

// Badge con tooltip
<FeatureBadge
  variant="coming-soon"
  tooltip="Disponible en Q1 2026"
  size="md"
/>

// Badge absoluto en card
<div className="relative">
  <FeatureBadge
    variant="under-construction"
    position="top-right"
  />
  <div className="card-content">...</div>
</div>
```

**Diseño Visual:**

```
┌─────────────────────────┐
│ 🚧 En Construcción      │  <- small
└─────────────────────────┘

┌──────────────────────────────┐
│  🚧  En Construcción         │  <- medium (default)
└──────────────────────────────┘

┌────────────────────────────────────┐
│   🚧   EN CONSTRUCCIÓN             │  <- large
└────────────────────────────────────┘
```

---

## 📦 Implementación por Página

### Páginas que requieren REEMPLAZO COMPLETO

Estas páginas deben mostrar solo el componente UnderConstruction:

#### 1. AdminRolesPage
```tsx
// apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx

export default function AdminRolesPage() {
  return (
    <UnderConstruction
      title="Roles y Permisos"
      description="Sistema avanzado de gestión de roles y permisos granulares para toda la plataforma"
      estimatedDate="Fase 2 - Q1 2026"
      features={[
        "Definición de roles personalizados",
        "Permisos granulares por módulo",
        "Asignación masiva de permisos",
        "Templates de roles predefinidos",
        "Auditoría de cambios de permisos"
      ]}
      showBackButton
      variant="full-page"
      icon="ShieldCheck"
    />
  );
}
```

#### 2. AdminReportsPage
```tsx
export default function AdminReportsPage() {
  return (
    <UnderConstruction
      title="Reportes y Analíticas"
      description="Centro de reportes con visualizaciones avanzadas y exportación de datos"
      estimatedDate="Fase 2 - Q2 2026"
      features={[
        "Reportes de uso por institución",
        "Métricas de engagement estudiantil",
        "Dashboards personalizables",
        "Exportación a PDF/Excel",
        "Programación automática de reportes"
      ]}
      showBackButton
      variant="full-page"
      icon="FileText"
    />
  );
}
```

#### 3. AdminSettingsPage
```tsx
export default function AdminSettingsPage() {
  return (
    <UnderConstruction
      title="Configuración Global"
      description="Parámetros y configuraciones avanzadas del sistema"
      estimatedDate="Fase 2 - Q1 2026"
      features={[
        "Configuración de notificaciones",
        "Parámetros de seguridad",
        "Integración con servicios externos",
        "Configuración de API keys",
        "Logs del sistema"
      ]}
      showBackButton
      variant="full-page"
      icon="Settings"
    />
  );
}
```

### Páginas que requieren BADGES PARCIALES

Estas páginas tienen funcionalidad parcial, agregar badges a secciones específicas:

#### 4. AdminUsersPage (Parcial - 15%)

**Secciones con badge:**
- CRUD completo de usuarios → `<FeatureBadge variant="under-construction" />`
- Filtros avanzados → `<FeatureBadge variant="coming-soon" />`
- Importación masiva → `<FeatureBadge variant="coming-soon" />`

**Ejemplo:**
```tsx
<div className="page-section">
  <div className="flex items-center justify-between">
    <h2>Filtros Avanzados</h2>
    <FeatureBadge
      variant="coming-soon"
      tooltip="Filtros por institución, rol, estado y fecha de registro"
    />
  </div>
  {/* Placeholder o disabled controls */}
</div>
```

#### 5. AdminContentPage (Parcial - 25%)

**Secciones con badge:**
- Editor de ejercicios → `<FeatureBadge variant="under-construction" />`
- Biblioteca de medios → `<FeatureBadge variant="coming-soon" />`
- Control de versiones → `<FeatureBadge variant="coming-soon" />`
- Queue de aprobación → Funcional (sin badge)

#### 6. AdminMonitoringPage (Parcial - 40%)

**Secciones con badge:**
- Métricas en tiempo real → Funcional (sin badge)
- Tracking de errores → `<FeatureBadge variant="under-construction" />`
- Logs del sistema → `<FeatureBadge variant="coming-soon" />`

#### 7. AdminAdvancedPage (Parcial - 35%)

**Secciones con badge:**
- Feature flags → `<FeatureBadge variant="beta" />`
- A/B Testing → `<FeatureBadge variant="under-construction" />`
- Tenant management → `<FeatureBadge variant="under-construction" />`

---

## 🗂️ Estructura de Archivos

```
apps/frontend/src/
├── shared/
│   └── components/
│       ├── UnderConstruction.tsx (mejorar existente)
│       └── common/
│           ├── FeatureBadge.tsx (NUEVO)
│           └── FeatureBadge.example.tsx (ejemplos de uso)
│
└── apps/
    └── admin/
        └── pages/
            ├── AdminUsersPage.tsx (agregar badges)
            ├── AdminRolesPage.tsx (reemplazar con UnderConstruction)
            ├── AdminContentPage.tsx (agregar badges)
            ├── AdminApprovalsPage.tsx (agregar badges)
            ├── AdminMonitoringPage.tsx (agregar badges)
            ├── AdminAdvancedPage.tsx (agregar badges)
            ├── AdminReportsPage.tsx (reemplazar con UnderConstruction)
            ├── AdminSettingsPage.tsx (reemplazar con UnderConstruction)
            └── AdminInstitutionsDetailPage.tsx (agregar badges)
```

---

## 🎨 Guía de Estilos

### UnderConstruction Component

```tsx
// Paleta de colores
const colors = {
  background: 'bg-gradient-to-br from-gray-50 to-gray-100',
  card: 'bg-white',
  border: 'border-gray-200',
  text: {
    primary: 'text-gray-900',
    secondary: 'text-gray-600',
    muted: 'text-gray-500',
  },
  accent: 'text-detective-orange',
  icon: 'text-yellow-500',
};

// Espaciado
const spacing = {
  'full-page': 'p-12',
  'section': 'p-8',
  'card': 'p-6',
};

// Animaciones
const animations = {
  fadeIn: 'animate-fade-in',
  slideUp: 'animate-slide-up',
  pulse: 'animate-pulse',
};
```

### FeatureBadge Component

```tsx
// Variantes de color
const variants = {
  'under-construction': {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
    icon: 'text-yellow-600',
  },
  'coming-soon': {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
    icon: 'text-blue-600',
  },
  'beta': {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300',
    icon: 'text-purple-600',
  },
  'new': {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
    icon: 'text-green-600',
  },
  'deprecated': {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300',
    icon: 'text-red-600',
  },
};

// Tamaños
const sizes = {
  sm: {
    padding: 'px-2 py-0.5',
    text: 'text-xs',
    icon: 'w-3 h-3',
  },
  md: {
    padding: 'px-3 py-1',
    text: 'text-sm',
    icon: 'w-4 h-4',
  },
  lg: {
    padding: 'px-4 py-2',
    text: 'text-base',
    icon: 'w-5 h-5',
  },
};
```

---

## 📝 Plan de Implementación

### Fase 1: Crear Componentes Base (1-2 horas)

**Tareas:**
1. ✅ Mejorar UnderConstruction.tsx con nuevas props
2. ✅ Crear FeatureBadge.tsx
3. ✅ Crear archivo de ejemplos (FeatureBadge.example.tsx)
4. ✅ Agregar exports en index.ts

**Archivos:**
- `apps/frontend/src/shared/components/UnderConstruction.tsx`
- `apps/frontend/src/shared/components/common/FeatureBadge.tsx`
- `apps/frontend/src/shared/components/common/FeatureBadge.example.tsx`
- `apps/frontend/src/shared/components/common/index.ts`

### Fase 2: Reemplazar Páginas Completas (1 hora)

**Tareas:**
1. ✅ AdminRolesPage → UnderConstruction
2. ✅ AdminReportsPage → UnderConstruction
3. ✅ AdminSettingsPage → UnderConstruction

**Páginas:**
- `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminReportsPage.tsx`
- `apps/frontend/src/apps/admin/pages/AdminSettingsPage.tsx`

### Fase 3: Agregar Badges Parciales (2-3 horas)

**Tareas:**
1. ✅ AdminUsersPage - identificar secciones, agregar badges
2. ✅ AdminContentPage - identificar secciones, agregar badges
3. ✅ AdminApprovalsPage - identificar secciones, agregar badges
4. ✅ AdminMonitoringPage - identificar secciones, agregar badges
5. ✅ AdminAdvancedPage - identificar secciones, agregar badges
6. ✅ AdminInstitutionsDetailPage - identificar secciones, agregar badges

**Páginas:**
- 6 archivos en `apps/frontend/src/apps/admin/pages/`

### Fase 4: Testing y Ajustes (1 hora)

**Tareas:**
1. ✅ Verificar navegación sin enlaces rotos
2. ✅ Verificar responsive design (mobile, tablet, desktop)
3. ✅ Verificar tooltips funcionando
4. ✅ Verificar consistencia visual
5. ✅ Testing manual de todas las páginas
6. ✅ Ajustes de copy/texto según feedback

---

## 🧪 Criterios de Aceptación

### AC-1: Componentes Reutilizables
- [x] UnderConstruction component acepta todas las props especificadas
- [x] FeatureBadge component soporta todas las variantes
- [x] Componentes son responsive (mobile, tablet, desktop)
- [x] Componentes usan design system de Gamilit (colores, tipografía)
- [x] Tooltips funcionan correctamente

### AC-2: Páginas de Reemplazo Completo
- [x] AdminRolesPage muestra UnderConstruction
- [x] AdminReportsPage muestra UnderConstruction
- [x] AdminSettingsPage muestra UnderConstruction
- [x] Cada página muestra features planeadas relevantes
- [x] Botón "Volver al Dashboard" funciona

### AC-3: Badges Parciales
- [x] AdminUsersPage tiene badges en secciones incompletas
- [x] AdminContentPage tiene badges en secciones incompletas
- [x] AdminMonitoringPage tiene badges en secciones incompletas
- [x] AdminAdvancedPage tiene badges en secciones incompletas
- [x] AdminInstitutionsDetailPage tiene badges donde corresponda
- [x] Badges no bloquean funcionalidad existente

### AC-4: Navegación
- [x] Todos los 11 enlaces del sidebar siguen funcionando
- [x] No hay enlaces rotos (404)
- [x] No hay errores de consola
- [x] Transiciones suaves entre páginas

### AC-5: UX Consistente
- [x] Todos los mensajes "En Construcción" son consistentes
- [x] Lenguaje claro y profesional
- [x] Iconografía coherente
- [x] Colores según design system

---

## 📊 Estimación

| Fase | Tareas | Horas | SP |
|------|--------|-------|-----|
| **Fase 1** | Crear componentes base | 1-2h | 0.3 |
| **Fase 2** | Reemplazar páginas completas | 1h | 0.2 |
| **Fase 3** | Agregar badges parciales | 2-3h | 0.4 |
| **Fase 4** | Testing y ajustes | 1h | 0.1 |
| **TOTAL** | | **5-7h** | **1 SP** |

**Desarrollador:** Frontend-Developer
**Costo estimado:** $1,000 - $1,400 MXN (a $200 MXN/hora)

---

## 🔗 Referencias

### Documentación Relacionada
- EAI-005: Admin Base (alcance MVP)
- REPORTE-COMPLETO-PORTAL-ADMIN-MVP.md (análisis de 13 páginas)
- REPORTE-ESTADO-PORTALES-MVP.md (estado general de portales)

### Componentes Existentes
- `apps/frontend/src/shared/components/UnderConstruction.tsx`
- `apps/frontend/src/shared/components/layout/GamifiedHeader.tsx`
- `apps/frontend/src/shared/components/layout/GamilitSidebar.tsx`

### Design System
- Tailwind config: `apps/frontend/tailwind.config.js`
- Theme colors: Detective Orange (#FF6B35), gradientes
- Lucide React icons

---

## ✅ Checklist de Entrega

**Frontend-Developer debe entregar:**

- [ ] **Código**
  - [ ] UnderConstruction.tsx mejorado
  - [ ] FeatureBadge.tsx nuevo componente
  - [ ] FeatureBadge.example.tsx con ejemplos
  - [ ] 3 páginas reemplazadas (Roles, Reports, Settings)
  - [ ] 6 páginas con badges parciales
  - [ ] Exports actualizados en index.ts

- [ ] **Testing**
  - [ ] Navegación completa sin errores
  - [ ] Responsive en mobile/tablet/desktop
  - [ ] Tooltips funcionando
  - [ ] Sin errores de consola
  - [ ] Screenshots de páginas implementadas

- [ ] **Documentación**
  - [ ] Comentarios JSDoc en componentes
  - [ ] README con ejemplos de uso
  - [ ] Screenshots en docs/ (opcional)

---

## 🎯 Definición de Done

- [ ] Todos los AC cumplidos
- [ ] Code review aprobado por Architecture-Analyst
- [ ] Testing manual completado
- [ ] No hay errores de TypeScript
- [ ] No hay errores de ESLint
- [ ] Build exitoso sin warnings
- [ ] Deployment a staging
- [ ] Aprobación del Product Owner

---

**Especificado por:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
**Estado:** 📝 Listo para Desarrollo
