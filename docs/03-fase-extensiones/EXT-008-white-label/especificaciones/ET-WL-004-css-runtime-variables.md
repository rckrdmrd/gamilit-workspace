# ET-WL-004: CSS Runtime Variables (Dynamic Custom Properties)

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-WL-004 |
| **Modulo** | White Label |
| **Titulo** | Variables CSS Dinamicas en Runtime por Tenant |
| **Prioridad** | Alta |
| **Estado** | Parcialmente Implementado |
| **Completitud** | 50% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Estado de Implementacion

### Progreso General: 50%

| Componente | Estado | Completitud |
|------------|--------|-------------|
| CSS Variables Base (:root) | COMPLETO | 100% |
| detective-theme.css | COMPLETO | 100% |
| theme-light.ts / theme-dark.ts | COMPLETO | 100% |
| colors.ts constants | COMPLETO | 100% |
| index.css variables | COMPLETO | 100% |
| BrandingProvider (aplicar vars) | NO INICIADO | 0% |
| API endpoint para branding colors | NO INICIADO | 0% |
| Color validation utilities | NO INICIADO | 0% |
| CSS-in-JS integration | PARCIAL | 40% |
| Dark mode + branding | NO INICIADO | 0% |

---

## Referencias

### Requerimiento Funcional
- RF-WL-003: Temas personalizados

### User Stories
- [US-WL-001: Branding Configuration](../historias-usuario/US-WL-001-branding-config.md)
- [US-WL-002: Logo and Colors](../historias-usuario/US-WL-002-logo-colors.md)

### Especificaciones Relacionadas
- [ET-WL-001: Theming System](./ET-WL-001-theming.md)
- [ET-WL-002: Tenant Customization](./ET-WL-002-tenant-customization.md)

---

## Descripcion Funcional

Sistema de variables CSS dinamicas que permite a cada tenant personalizar colores en tiempo de ejecucion, sin necesidad de recompilacion del frontend.

### Comportamiento Esperado

1. Usuario accede a GAMILIT
2. App detecta tenant (via JWT o dominio)
3. App obtiene configuracion de branding del tenant
4. App inyecta CSS custom properties en `:root`
5. UI renderiza con colores del tenant
6. Admin cambia colores -> se reflejan en tiempo real

### Variables Soportadas (Tier 1)

| Variable CSS | Descripcion | Default |
|--------------|-------------|---------|
| `--brand-primary` | Color principal (botones, links) | #f97316 |
| `--brand-secondary` | Color secundario (badges, highlights) | #ea580c |
| `--brand-accent` | Color de acento (opcional) | #f59e0b |
| `--brand-text` | Color de texto sobre brand colors | #ffffff |

### Variables Futuras (Tier 2+)

| Variable CSS | Descripcion | Tier |
|--------------|-------------|------|
| `--brand-background` | Fondo personalizado | 2 |
| `--brand-surface` | Superficies/cards | 2 |
| `--brand-font-primary` | Fuente principal | 3 |
| `--brand-font-secondary` | Fuente secundaria | 3 |

---

## Arquitectura

### Flujo de Aplicacion de Colores

```
Usuario se autentica
        |
        v
JWT contiene tenant_id
        |
        v
Frontend: useAuth() obtiene tenant_id
        |
        v
Frontend: BrandingProvider
  - Llama GET /api/v1/branding/{tenantId}
  - Recibe: { primaryColor, secondaryColor, ... }
        |
        v
BrandingProvider.applyColors()
  - document.documentElement.style.setProperty('--brand-primary', color)
  - document.documentElement.style.setProperty('--brand-secondary', color)
        |
        v
CSS utiliza las variables:
  .btn-primary { background: var(--brand-primary); }
        |
        v
UI renderizada con colores del tenant
```

### Diagrama de Capas

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  +----------------------------------------------------+  |
|  |  BrandingProvider (NUEVO)                          |  |
|  |  - useBranding() hook                              |  |
|  |  - applyColors()                                   |  |
|  |  - getContrastColor()                              |  |
|  +----------------------------------------------------+  |
|                          |                                |
|  +----------------------------------------------------+  |
|  |  CSS Variables (index.css)                         |  |
|  |  - :root { --brand-primary: #f97316; }            |  |
|  +----------------------------------------------------+  |
|                          |                                |
|  +----------------------------------------------------+  |
|  |  Components                                        |  |
|  |  - .btn-detective { background: var(--brand-...); }|  |
|  +----------------------------------------------------+  |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### CSS Variables Base

**Ubicacion:** `apps/frontend/src/shared/styles/index.css`

```css
:root {
  /* Colores principales - CANDIDATOS A OVERRIDE */
  --detective-orange: #f97316;
  --detective-orange-dark: #ea580c;
  --detective-blue: #1e3a8a;
  --detective-gold: #f59e0b;

  /* Fondos */
  --detective-bg: #fff7ed;
  --detective-bg-secondary: #fffbeb;

  /* Texto */
  --detective-text: #1f2937;
  --detective-text-secondary: #6b7280;

  /* Estados */
  --detective-success: #10b981;
  --detective-danger: #ef4444;
  --detective-neutral: #6b7280;

  /* Rangos Maya */
  --rank-detective-from: #60a5fa;
  --rank-detective-to: #2563eb;
  /* ... */
}
```

**Estado:** COMPLETO (100%) - Variables definidas, listas para override

### Detective Theme CSS

**Ubicacion:** `apps/frontend/src/shared/styles/detective-theme.css`

**Estado:** COMPLETO (100%)

**Uso de variables:**
```css
.btn-detective {
  background: linear-gradient(to bottom right, var(--detective-orange), var(--detective-orange-dark));
}

.progress-detective .progress-fill {
  background: linear-gradient(to right, #f97316, #ea580c);
  /* NOTA: Deberia usar variables */
}
```

**Gap identificado:** Algunos estilos usan valores hardcodeados en lugar de variables.

### Theme TypeScript Files

**Ubicacion:** `apps/frontend/src/shared/themes/theme-light.ts`

```typescript
export const lightTheme: Theme = {
  colors: {
    brand: {
      primary: colors.primary[600],  // #f97316
      secondary: colors.secondary[600],  // #ea580c
    },
    // ...
  },
};
```

**Estado:** COMPLETO (100%) - Estructura lista para integracion

---

## Lo que Falta para Completar (50%)

### 1. BrandingProvider con CSS Variables (25% de lo faltante)

```tsx
// providers/BrandingProvider.tsx (NUEVO)
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { brandingService } from '@/services/branding.service';

interface BrandingConfig {
  tenantId: string;
  platformName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

interface BrandingContextValue {
  branding: BrandingConfig | null;
  isLoading: boolean;
  error: string | null;
  refreshBranding: () => Promise<void>;
  updateColors: (colors: Partial<Pick<BrandingConfig, 'primaryColor' | 'secondaryColor'>>) => void;
}

const BrandingContext = createContext<BrandingContextValue | undefined>(undefined);

// Mapping de colores de branding a CSS variables
const CSS_VARIABLE_MAP: Record<string, string[]> = {
  primaryColor: [
    '--brand-primary',
    '--detective-orange',
  ],
  secondaryColor: [
    '--brand-secondary',
    '--detective-orange-dark',
  ],
  accentColor: [
    '--brand-accent',
    '--detective-gold',
  ],
};

export const BrandingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [branding, setBranding] = useState<BrandingConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar branding cuando cambia el tenant
  useEffect(() => {
    if (user?.tenantId) {
      loadBranding(user.tenantId);
    } else {
      setIsLoading(false);
    }
  }, [user?.tenantId]);

  // Aplicar branding cuando cambia
  useEffect(() => {
    if (branding) {
      applyBranding(branding);
    }
  }, [branding]);

  const loadBranding = async (tenantId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const config = await brandingService.getBranding(tenantId);
      setBranding(config);
    } catch (err) {
      setError('Failed to load branding');
      console.error('Branding load error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const applyBranding = (config: BrandingConfig) => {
    const root = document.documentElement;

    // Aplicar colores
    Object.entries(CSS_VARIABLE_MAP).forEach(([configKey, cssVars]) => {
      const value = config[configKey as keyof BrandingConfig];
      if (value && typeof value === 'string') {
        cssVars.forEach(cssVar => {
          root.style.setProperty(cssVar, value);
        });
      }
    });

    // Aplicar platform name en title
    if (config.platformName) {
      document.title = config.platformName;
    }

    // Aplicar favicon
    if (config.faviconUrl) {
      const favicon = document.querySelector("link[rel='icon']") as HTMLLinkElement;
      if (favicon) {
        favicon.href = config.faviconUrl;
      }
    }
  };

  const refreshBranding = async () => {
    if (user?.tenantId) {
      await loadBranding(user.tenantId);
    }
  };

  const updateColors = (colors: Partial<Pick<BrandingConfig, 'primaryColor' | 'secondaryColor'>>) => {
    if (branding) {
      const updated = { ...branding, ...colors };
      setBranding(updated);
    }
  };

  return (
    <BrandingContext.Provider value={{ branding, isLoading, error, refreshBranding, updateColors }}>
      {children}
    </BrandingContext.Provider>
  );
};

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within BrandingProvider');
  }
  return context;
};
```

### 2. Color Utilities (10% de lo faltante)

```typescript
// utils/color.utils.ts (NUEVO)

/**
 * Valida que un string sea un color hex valido
 */
export function isValidHexColor(color: string): boolean {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);
}

/**
 * Convierte hex a RGB
 */
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

/**
 * Calcula luminosidad de un color (0-1)
 */
export function getLuminance(hex: string): number {
  const rgb = hexToRgb(hex);
  if (!rgb) return 0;

  const { r, g, b } = rgb;
  const [rs, gs, bs] = [r, g, b].map(c => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Determina si el texto debe ser claro u oscuro sobre un color de fondo
 */
export function getContrastTextColor(backgroundColor: string): 'light' | 'dark' {
  const luminance = getLuminance(backgroundColor);
  return luminance > 0.179 ? 'dark' : 'light';
}

/**
 * Genera variantes de un color (lighter, darker)
 */
export function generateColorVariants(baseColor: string): {
  lighter: string;
  light: string;
  base: string;
  dark: string;
  darker: string;
} {
  // Implementacion con manipulacion HSL
  // ...
}
```

### 3. Branding Service Frontend (5% de lo faltante)

```typescript
// services/branding.service.ts (NUEVO)
import { apiClient } from '@/lib/api-client';

export interface BrandingConfig {
  tenantId: string;
  platformName: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export const brandingService = {
  async getBranding(tenantId: string): Promise<BrandingConfig> {
    const response = await apiClient.get<BrandingConfig>(`/branding/${tenantId}`);
    return response.data;
  },

  async updateBranding(tenantId: string, data: Partial<BrandingConfig>): Promise<BrandingConfig> {
    const response = await apiClient.patch<BrandingConfig>(`/branding/${tenantId}`, data);
    return response.data;
  },
};
```

### 4. Color Picker Component (5% de lo faltante)

```tsx
// components/admin/ColorPicker.tsx (NUEVO)
import React, { useState } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { isValidHexColor, getContrastTextColor } from '@/utils/color.utils';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (color: string) => void;
  presetColors?: string[];
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  label,
  value,
  onChange,
  presetColors = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ef4444']
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="color-picker">
      <label className="text-sm font-medium text-gray-700">{label}</label>

      <div className="flex items-center gap-2 mt-1">
        <button
          type="button"
          className="w-10 h-10 rounded-lg border-2 border-gray-200"
          style={{ backgroundColor: value }}
          onClick={() => setIsOpen(!isOpen)}
        />
        <HexColorInput
          color={value}
          onChange={onChange}
          className="input-detective input-detective-sm w-28"
          prefixed
        />
      </div>

      {isOpen && (
        <div className="absolute z-10 mt-2 p-3 bg-white rounded-lg shadow-lg">
          <HexColorPicker color={value} onChange={onChange} />

          <div className="flex gap-1 mt-2">
            {presetColors.map(color => (
              <button
                key={color}
                type="button"
                className="w-6 h-6 rounded"
                style={{ backgroundColor: color }}
                onClick={() => onChange(color)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
```

### 5. Migracion de Hardcoded Colors (5% de lo faltante)

**Archivos a migrar:**

| Archivo | Lineas con hardcoded | Accion |
|---------|---------------------|--------|
| detective-theme.css | ~15 | Reemplazar por variables |
| tailwind.config.js | - | Extender con CSS variables |
| Componentes varios | ~10 | Usar utilidades CSS |

**Ejemplo de migracion:**

```css
/* ANTES */
.progress-detective .progress-fill {
  background: linear-gradient(to right, #f97316, #ea580c);
}

/* DESPUES */
.progress-detective .progress-fill {
  background: linear-gradient(to right, var(--brand-primary), var(--brand-secondary));
}
```

---

## Integracion con Dark Mode

### Estrategia

El sistema debe soportar:
1. Light mode + branding colors
2. Dark mode + branding colors

```css
:root {
  --brand-primary: #f97316;
  --brand-secondary: #ea580c;
  --brand-on-primary: #ffffff; /* Texto sobre primary */
}

:root.dark {
  /* Mantener brand colors pero ajustar otros */
  --detective-bg: #1f2937;
  --detective-text: #f3f4f6;
  /* Brand colors NO cambian en dark mode */
}
```

---

## API REST Endpoints Relacionados

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/branding/:tenantId` | Obtener configuracion de branding |
| PATCH | `/branding/:tenantId` | Actualizar colores/nombre |

### Response Schema

```typescript
interface BrandingResponse {
  tenantId: string;
  platformName: string;
  primaryColor: string;      // Hex: "#f97316"
  secondaryColor: string;    // Hex: "#ea580c"
  accentColor?: string;      // Hex opcional
  logoUrl?: string;
  faviconUrl?: string;
  cssVariables?: Record<string, string>; // Pre-calculado por backend
}
```

---

## Criterios de Aceptacion

### Funcionales
- [ ] Admin puede cambiar color primario desde UI
- [ ] Admin puede cambiar color secundario desde UI
- [ ] Preview en tiempo real de cambios de color
- [ ] Colores aplican inmediatamente sin reload
- [ ] Colores persisten entre sesiones
- [ ] Color picker muestra presets sugeridos
- [ ] Input manual de codigo hex

### No Funcionales
- [ ] Aplicacion de colores < 50ms
- [ ] Sin parpadeo (FOUC) al cargar
- [ ] Colores validos (contraste accesible)
- [ ] Compatible con dark mode

### Seguridad
- [ ] Validacion de formato hex en backend
- [ ] Solo admin puede cambiar colores de su tenant
- [ ] No XSS via inyeccion de CSS

---

## Dependencias

### Bloqueado Por
- CSS Variables base (COMPLETO)
- Theme files (COMPLETO)
- BrandingController backend (EN PROCESO)

### Bloquea
- Admin branding settings page
- Preview de branding

### Dependencias Tecnicas
- react-colorful (npm) - Color picker
- Contrast checking utilities

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| BrandingProvider | 4h |
| Color utilities | 2h |
| Branding service frontend | 1h |
| ColorPicker component | 2h |
| Migracion hardcoded colors | 2h |
| Dark mode integration | 2h |
| Tests | 2h |
| **Total** | **15h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-WL-004-css-runtime-variables.md*
*Generado: 2026-01-27*
