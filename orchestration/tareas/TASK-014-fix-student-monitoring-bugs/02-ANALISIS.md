# TASK-014: Análisis

## Fecha: 2026-01-25
## Agente: CLAUDE-CODE (claude-opus-4-5-20251101)

---

## Bug 1: "Última actividad" mal mostrada

### Síntoma
El campo "Última actividad" en los cards mostraba valores incorrectos como "Hace 55 años" o comportamiento impredecible.

### Causa Raíz

**Discrepancia de tipos Backend vs Frontend:**

| Capa | Definición | Nullable |
|------|------------|----------|
| Backend DTO | `last_activity?: Date` | SÍ |
| Backend Service | `userStats?.last_activity_at ?? member.updated_at` | SÍ |
| Frontend Type | `last_activity: string` | NO |

**Código problemático (`StudentStatusCard.tsx:81-96`):**
```typescript
const getTimeSinceLastActivity = (lastActivity: string) => {
  const last = new Date(lastActivity);  // Si null → epoch 1970
  // ...
};
```

**Comportamiento con valores null:**
- `new Date(null)` → **1970-01-01T00:00:00** → "Hace ~55 años"
- `new Date(undefined)` → **Invalid Date** → `NaN`

---

## Bug 2: Pantalla negra al hacer clic

### Síntoma
Al hacer clic en un card de estudiante, solo se veía una pantalla negra (el overlay del modal).

### Causa Raíz

**Factor 1: Mapeo de ID puede fallar**
```typescript
// useStudentMonitoring.ts:157
id: (student as any).user_id || student.id,
// Si ambos son undefined → id = undefined
```

**Factor 2: APIs llamadas con ID undefined**
```typescript
// StudentDetailModal.tsx:56-59
await studentProgressApi.getStudentProgress(student.id);  // undefined
```

**Factor 3: Propiedades undefined causan errores de render**
```typescript
// StudentDetailModal.tsx:179
{Math.floor(student.time_spent_minutes / 60)}h  // undefined / 60 = NaN
```

El modal tiene `bg-black bg-opacity-50` como overlay. Si el contenido falla al renderizar, solo se ve el fondo negro.

---

## Plan de Corrección

### Archivos a Modificar

1. **types/index.ts**: Cambiar `last_activity: string` → `string | null`
2. **useStudentMonitoring.ts**: Añadir validaciones y valores por defecto
3. **StudentStatusCard.tsx**: Validar null en funciones de fecha
4. **StudentDetailModal.tsx**: Validar ID y propiedades antes de usar
5. **StudentMonitoringPanel.tsx**: Validar null en getStudentStatus()

### Validaciones Post-Fix
- Build: `npm run build`
- Lint: `npm run lint`

---

*Documentado según @SIMCO-TAREA*
