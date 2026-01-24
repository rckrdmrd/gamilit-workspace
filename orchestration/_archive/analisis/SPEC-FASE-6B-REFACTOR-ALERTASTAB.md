# SPEC-FASE-6B: Refactor AlertasTab - Reutilizacion de Componentes

**Fecha:** 2025-12-15
**Version:** 1.0
**Estado:** LISTO PARA IMPLEMENTAR
**Riesgo:** MEDIO

---

## 1. OBJETIVO

Refactorizar AlertasTab para reutilizar componentes existentes (AlertCard, AlertsStats) y eliminar codigo duplicado mediante la creacion de alertUtils.ts.

---

## 2. ANALISIS DE DUPLICIDAD

### 2.1 Funciones Duplicadas Identificadas

| Funcion | AlertasTab | AlertCard | Duplicacion |
|---------|------------|-----------|-------------|
| getSeverityColor | Lineas 37-50 | Lineas 39-47 | 85% |
| getStatusColor | Lineas 55-68 | Lineas 49-57 | 90% |
| formatTimestamp | Lineas 73-87 | formatDate (79-100) | 70% |
| getSeverityLabel | NO | Lineas 59-67 | N/A |
| getStatusLabel | NO | Lineas 69-77 | N/A |

### 2.2 Componentes Duplicados

| Componente | AlertasTab | Componente Existente | Duplicacion |
|------------|------------|----------------------|-------------|
| Stats Cards | Lineas 155-208 | AlertsStats.tsx | 95% |
| Alert Item | Lineas 242-340 | AlertCard.tsx | 60% |

### 2.3 Lineas de Codigo Afectadas

```yaml
AlertasTab.tsx:
  total_lineas: 362
  lineas_duplicadas: ~200
  porcentaje_duplicacion: 55%

Despues_de_refactor:
  lineas_estimadas: ~150
  reduccion: 58%
```

---

## 3. ARQUITECTURA PROPUESTA

### 3.1 Nuevo Archivo: alertUtils.ts

```typescript
// Ubicacion: /apps/admin/components/alerts/alertUtils.ts
// Exports:
//   - getSeverityColor(severity)
//   - getSeverityBgColor(severity)
//   - getStatusColor(status)
//   - getSeverityLabel(severity)
//   - getStatusLabel(status)
//   - formatAlertTimestamp(timestamp)
```

### 3.2 Modificacion: AlertCard.tsx

```yaml
cambio: Agregar prop 'variant'
variantes:
  - full: Comportamiento actual (default)
  - compact: Sin botones de accion, solo status visual
```

### 3.3 Modificacion: AlertasTab.tsx

```yaml
cambio: Usar componentes compartidos
imports_nuevos:
  - alertUtils (funciones)
  - AlertsStats (stats cards)
  - AlertCard (alert items) - NO APLICABLE (variant compact no viable)

decision_final: |
  Tras analisis detallado, AlertasTab tiene logica de acciones inline diferente.
  Se creara alertUtils.ts para funciones compartidas pero NO se usara AlertCard
  porque AlertasTab tiene renderizado con acciones diferentes (inline buttons).
  SI se usara AlertsStats que es identico.
```

---

## 4. CODIGO A CREAR: alertUtils.ts

### 4.1 Codigo Completo

```typescript
/**
 * Alert Utilities
 *
 * Shared utility functions for alert components.
 * Used by AlertasTab and AlertCard to ensure consistency.
 *
 * @module alertUtils
 */

import type { SystemAlertSeverity, SystemAlertStatus } from '@/services/api/adminTypes';

/**
 * Get severity badge color classes (background + text)
 */
export function getSeverityColor(severity: SystemAlertSeverity): string {
  const colors: Record<SystemAlertSeverity, string> = {
    critical: 'bg-red-500 text-white',
    high: 'bg-orange-500 text-white',
    medium: 'bg-yellow-500 text-gray-900',
    low: 'bg-blue-500 text-white',
  };
  return colors[severity];
}

/**
 * Get severity color for AlertasTab style (transparent bg with border)
 */
export function getSeverityColorWithBorder(severity: SystemAlertSeverity): string {
  const colors: Record<SystemAlertSeverity, string> = {
    critical: 'bg-red-500/20 text-red-400 border-red-500/50',
    high: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50',
    low: 'bg-blue-500/20 text-blue-400 border-blue-500/50',
  };
  return colors[severity];
}

/**
 * Get status color classes
 */
export function getStatusColor(status: SystemAlertStatus): string {
  const colors: Record<SystemAlertStatus, string> = {
    open: 'bg-red-500/20 text-red-400 border-red-500/50',
    acknowledged: 'bg-orange-500/20 text-orange-400 border-orange-500/50',
    resolved: 'bg-green-500/20 text-green-400 border-green-500/50',
    suppressed: 'bg-gray-500/20 text-gray-400 border-gray-500/50',
  };
  return colors[status];
}

/**
 * Get status text color only (for inline text)
 */
export function getStatusTextColor(status: SystemAlertStatus): string {
  const colors: Record<SystemAlertStatus, string> = {
    open: 'text-red-400',
    acknowledged: 'text-yellow-400',
    resolved: 'text-green-400',
    suppressed: 'text-gray-400',
  };
  return colors[status];
}

/**
 * Get severity label in Spanish
 */
export function getSeverityLabel(severity: SystemAlertSeverity): string {
  const labels: Record<SystemAlertSeverity, string> = {
    critical: 'Critica',
    high: 'Alta',
    medium: 'Media',
    low: 'Baja',
  };
  return labels[severity];
}

/**
 * Get status label in Spanish
 */
export function getStatusLabel(status: SystemAlertStatus): string {
  const labels: Record<SystemAlertStatus, string> = {
    open: 'Abierta',
    acknowledged: 'Reconocida',
    resolved: 'Resuelta',
    suppressed: 'Suprimida',
  };
  return labels[status];
}

/**
 * Format timestamp for relative display (hace X minutos/horas)
 */
export function formatAlertTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 60) {
    return `Hace ${minutes}m`;
  } else if (hours < 24) {
    return `Hace ${hours}h`;
  } else if (days < 7) {
    return `Hace ${days}d`;
  } else {
    return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
  }
}

/**
 * Format timestamp with more detail (for AlertCard)
 */
export function formatAlertTimestampDetailed(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `Hace ${diffMins} min`;
  } else if (diffHours < 24) {
    return `Hace ${diffHours} horas`;
  } else if (diffDays < 7) {
    return `Hace ${diffDays} dias`;
  } else {
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }
}
```

---

## 5. CODIGO A MODIFICAR: AlertCard.tsx

### 5.1 Agregar Import de alertUtils

**ANTES (lineas 1-23):**
```typescript
import React from 'react';
import { Eye, Check, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type {
  SystemAlert,
  SystemAlertSeverity,
  SystemAlertStatus,
} from '@/services/api/adminTypes';
```

**DESPUES:**
```typescript
import React from 'react';
import { Eye, Check, CheckCircle, XCircle, Clock, Users } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { SystemAlert } from '@/services/api/adminTypes';
import {
  getSeverityColor,
  getStatusColor,
  getSeverityLabel,
  getStatusLabel,
  formatAlertTimestampDetailed,
} from './alertUtils';
```

### 5.2 Eliminar Funciones Duplicadas

**ELIMINAR (lineas 39-100):**
```typescript
  const getSeverityColor = (severity: SystemAlertSeverity): string => {
    // ... codigo duplicado
  };

  const getStatusColor = (status: SystemAlertStatus): string => {
    // ... codigo duplicado
  };

  const getSeverityLabel = (severity: SystemAlertSeverity): string => {
    // ... codigo duplicado
  };

  const getStatusLabel = (status: SystemAlertStatus): string => {
    // ... codigo duplicado
  };

  const formatDate = (dateString: string): string => {
    // ... codigo duplicado
  };
```

### 5.3 Actualizar Referencias

**CAMBIAR:**
```typescript
// Linea 146: formatDate -> formatAlertTimestampDetailed
<span>{formatAlertTimestampDetailed(alert.triggered_at)}</span>
```

---

## 6. CODIGO A MODIFICAR: AlertasTab.tsx

### 6.1 Actualizar Imports

**ANTES (lineas 1-24):**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle, CheckCircle, ExternalLink, Clock, Shield } from 'lucide-react';
import type { SystemAlert, AlertsStats, SystemAlertSeverity } from '@/services/api/adminTypes';
```

**DESPUES:**
```typescript
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle, CheckCircle, ExternalLink, Shield } from 'lucide-react';
import { AlertsStats } from '../alerts/AlertsStats';
import {
  getSeverityColorWithBorder,
  getStatusTextColor,
  getStatusLabel,
  formatAlertTimestamp,
} from '../alerts/alertUtils';
import type { SystemAlert, AlertsStats as AlertsStatsType, SystemAlertSeverity } from '@/services/api/adminTypes';
```

### 6.2 Eliminar Funciones Duplicadas

**ELIMINAR (lineas 34-87):**
```typescript
/**
 * Get severity color
 */
function getSeverityColor(severity: SystemAlertSeverity): string {
  // ... eliminar
}

/**
 * Get status color
 */
function getStatusColor(status: string): string {
  // ... eliminar
}

/**
 * Format timestamp
 */
function formatTimestamp(timestamp: string): string {
  // ... eliminar
}
```

### 6.3 Modificar Props Interface

**CAMBIAR (linea 26-32):**
```typescript
interface AlertasTabProps {
  alerts: SystemAlert[];
  stats: AlertsStatsType | null;  // Renombrar para evitar conflicto
  isLoading: boolean;
  onRefresh: () => Promise<void>;
  onAcknowledge: (id: string, note?: string) => Promise<void>;
  onResolve: (id: string, note: string) => Promise<void>;
}
```

### 6.4 Reemplazar Stats Cards con AlertsStats Component

**ANTES (lineas 154-209):**
```typescript
      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Open Alerts */}
          <DetectiveCard className="p-6">
            // ... 50 lineas de stats cards duplicadas
          </DetectiveCard>
          // ... mas cards
        </div>
      )}
```

**DESPUES:**
```typescript
      {/* Statistics Cards - Reutilizando AlertsStats */}
      <AlertsStats stats={stats} isLoading={isLoading} />
```

### 6.5 Actualizar Referencias en Alert Items

**CAMBIAR (lineas 249-267):**
```typescript
// ANTES:
<span className={`rounded border px-2 py-1 text-xs font-semibold ${getSeverityColor(alert.severity)}`}>
  {alert.severity.toUpperCase()}
</span>
<span className={`text-sm font-semibold ${getStatusColor(alert.status)}`}>
  {alert.status === 'open' && 'ABIERTA'}
  {alert.status === 'acknowledged' && 'RECONOCIDA'}
  {alert.status === 'resolved' && 'RESUELTA'}
  {alert.status === 'suppressed' && 'SUPRIMIDA'}
</span>
<span className="text-xs text-gray-500">
  {formatTimestamp(alert.triggered_at)}
</span>

// DESPUES:
<span className={`rounded border px-2 py-1 text-xs font-semibold ${getSeverityColorWithBorder(alert.severity)}`}>
  {alert.severity.toUpperCase()}
</span>
<span className={`text-sm font-semibold ${getStatusTextColor(alert.status)}`}>
  {getStatusLabel(alert.status).toUpperCase()}
</span>
<span className="text-xs text-gray-500">
  {formatAlertTimestamp(alert.triggered_at)}
</span>
```

---

## 7. DEPENDENCIAS

### 7.1 Matriz de Dependencias

```yaml
alertUtils.ts (NUEVO):
  importado_por:
    - AlertCard.tsx
    - AlertasTab.tsx

  importa:
    - adminTypes.ts (tipos)

AlertCard.tsx (MODIFICAR):
  importado_por:
    - AlertsList.tsx

  importa_nuevo:
    - alertUtils.ts

AlertasTab.tsx (MODIFICAR):
  importado_por:
    - AdminMonitoringPage.tsx

  importa_nuevo:
    - alertUtils.ts
    - AlertsStats.tsx

AlertsStats.tsx (SIN CAMBIOS):
  importado_por:
    - AdminAlertsPage.tsx
    - AlertasTab.tsx (NUEVO)
```

### 7.2 Orden de Implementacion

```yaml
1. Crear alertUtils.ts
2. Modificar AlertCard.tsx (imports + eliminar duplicados)
3. Modificar AlertasTab.tsx (imports + usar componentes + eliminar duplicados)
4. Verificar build y lint
5. Pruebas visuales
```

---

## 8. PRUEBAS REQUERIDAS

### 8.1 Prueba AlertCard

```yaml
test_alert_card:
  ubicacion: /admin/alerts
  pasos:
    1. Navegar a /admin/alerts
    2. Verificar alertas se renderizan
    3. Verificar badges de severidad con colores correctos
    4. Verificar badges de estado con colores correctos
    5. Verificar timestamp formateado
    6. Verificar botones de accion funcionan

  resultado_esperado:
    - UI identica a version anterior
    - Funcionalidad sin cambios
```

### 8.2 Prueba AlertasTab

```yaml
test_alertas_tab:
  ubicacion: /admin/monitoring (tab Alertas)
  pasos:
    1. Navegar a /admin/monitoring
    2. Click en tab "Alertas"
    3. Verificar stats cards se muestran
    4. Verificar lista de alertas recientes
    5. Filtrar por severidad
    6. Click Reconocer en una alerta open
    7. Click Resolver en una alerta acknowledged
    8. Click "Ver Todas las Alertas"

  resultado_esperado:
    - Stats cards con AlertsStats component
    - UI identica a version anterior
    - Acciones funcionan correctamente
    - Link navega a /admin/alerts
```

### 8.3 Prueba No Regresion Visual

```yaml
test_visual_regression:
  comparar:
    - Captura antes del refactor
    - Captura despues del refactor

  areas_a_verificar:
    - Stats cards (colores, numeros, iconos)
    - Alert items (badges, timestamps, botones)
    - Hover states
    - Loading states
```

---

## 9. ROLLBACK

### 9.1 Procedimiento

```yaml
pasos:
  1. Eliminar alertUtils.ts
  2. Restaurar AlertCard.tsx desde backup
  3. Restaurar AlertasTab.tsx desde backup

archivos_backup:
  - AlertCard.tsx.bak
  - AlertasTab.tsx.bak

tiempo_estimado: 10 minutos
```

### 9.2 Archivos Originales a Preservar

```bash
# Antes de implementar, crear backups:
cp AlertCard.tsx AlertCard.tsx.bak
cp AlertasTab.tsx AlertasTab.tsx.bak
```

---

## 10. CRITERIOS DE ACEPTACION

- [ ] alertUtils.ts creado con todas las funciones exportadas
- [ ] AlertCard.tsx usa funciones de alertUtils
- [ ] AlertasTab.tsx usa funciones de alertUtils
- [ ] AlertasTab.tsx usa componente AlertsStats
- [ ] UI de AdminAlertsPage sin cambios visuales
- [ ] UI de AlertasTab en AdminMonitoringPage sin cambios visuales
- [ ] Funcionalidad acknowledge/resolve funciona en ambos lugares
- [ ] Build sin errores
- [ ] Lint sin errores
- [ ] No hay advertencias de imports no usados

---

## 11. BENEFICIOS ESPERADOS

```yaml
reduccion_codigo:
  lineas_eliminadas: ~200
  archivos_simplificados: 2

mantenibilidad:
  - Funciones centralizadas en alertUtils
  - Cambios de estilo aplicados una sola vez
  - Menor riesgo de inconsistencias

consistencia:
  - Colores identicos en todas las vistas
  - Formatos de fecha identicos
  - Labels identicos
```

---

## 12. NOTAS DE IMPLEMENTACION

1. **No usar AlertCard en AlertasTab:** El renderizado de alerts en AlertasTab tiene acciones inline diferentes (sin modal de detalles, acciones directas). Mantener el renderizado actual pero usar funciones compartidas.

2. **SI usar AlertsStats:** El componente es identico y puro (solo props), perfecto para reutilizar.

3. **Tipos en imports:** Usar `AlertsStats as AlertsStatsType` para evitar conflicto con el componente.

4. **Testing visual:** Es crucial comparar capturas antes/despues para detectar regresiones sutiles de color o espaciado.

5. **Clock icon removido:** En AlertasTab se usa Clock de los stats cards que ahora vienen de AlertsStats, no es necesario importarlo.

---

**Documento generado:** 2025-12-15
**Por:** Requirements-Analyst Agent
**Estado:** LISTO PARA IMPLEMENTAR
