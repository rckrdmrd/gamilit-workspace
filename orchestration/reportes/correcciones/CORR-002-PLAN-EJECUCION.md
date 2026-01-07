---
id: "CORR-002-PLAN"
title: "Plan de Ejecucion - Correccion LeaderboardPage y Limpieza AchievementsPage"
type: "Plan"
status: "Approved"
priority: "P0"
assignee: "@Orquestador"
related_task: "CORR-002"
affected_files:
  - "apps/frontend/src/apps/student/pages/LeaderboardPage.tsx"
  - "apps/frontend/src/apps/student/pages/AchievementsPage.tsx"
labels: ["plan", "correccion", "frontend", "aprobado"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# PLAN DE EJECUCION: CORR-002

**Prioridad:** P0 (Critico)
**Fecha creacion:** 2026-01-07
**Estado:** APROBADO PARA EJECUCION

---

## RESUMEN DEL PLAN

| Paso | Descripcion | Archivo | Prioridad |
|------|-------------|---------|-----------|
| 1 | Agregar useEffect para carga inicial | LeaderboardPage.tsx | P0 |
| 2 | Eliminar archivo duplicado no usado | AchievementsPage.tsx (student) | P2 |
| 3 | Validar build | - | P0 |
| 4 | Documentar ejecucion | CORR-002-REPORTE | P2 |

---

## PASO 1: CORREGIR LEADERBOARDPAGE (CRITICO)

### Archivo
`/apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`

### Ubicacion del cambio
**Despues de la linea 80** (despues de los hooks de estado local)

### Codigo actual (lineas 77-81)
```typescript
  // Local State
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const [showRealtimeIndicator, setShowRealtimeIndicator] = useState(false);
  const userEntryRef = useRef<HTMLDivElement>(null);
```

### Codigo a agregar (despues de linea 81)
```typescript
  // Auto-fetch leaderboard on component mount
  useEffect(() => {
    setLeaderboardType('global');
  }, [setLeaderboardType]);
```

### Justificacion
- El store `leaderboardsStore` inicia con `loading: true` y datos vacios
- Nadie dispara la carga inicial de datos
- `setLeaderboardType('global')` llamara a `getLeaderboard()` via API
- El dependency array `[setLeaderboardType]` es estable (funcion del store)

### Verificacion
- [ ] El leaderboard muestra datos del backend
- [ ] No hay console errors
- [ ] El loading state funciona correctamente
- [ ] WebSocket actualiza correctamente despues

---

## PASO 2: ELIMINAR ARCHIVO DUPLICADO (OPCIONAL)

### Archivo a eliminar
`/apps/frontend/src/apps/student/pages/AchievementsPage.tsx`

### Razon
- No esta en uso (App.tsx importa de `/pages/`)
- Causa confusion para desarrolladores
- Codigo muerto

### Verificacion previa
```bash
# Confirmar que no hay imports de este archivo
grep -r "apps/student/pages/AchievementsPage" --include="*.tsx" --include="*.ts"
# Resultado esperado: Solo el archivo mismo, no imports
```

### Nota
El archivo `/pages/AchievementsPage.tsx` es el que esta EN USO y NO debe modificarse.

---

## PASO 3: VALIDAR BUILD

### Comando
```bash
cd /home/isem/workspace-v1/projects/gamilit/apps/frontend
npm run build
```

### Criterios de exito
- Build exitoso sin errores
- Sin warnings criticos nuevos

---

## PASO 4: DOCUMENTACION

### Crear archivo
`/orchestration/reportes/correcciones/CORR-002-REPORTE-EJECUCION.md`

### Contenido
- Cambios realizados
- Lineas modificadas
- Resultado del build
- Checklist de verificacion

---

## VALIDACION DEL PLAN

### Cobertura de Requisitos (US-GAM-007)

| CA | Requisito | Cubierto por |
|----|-----------|--------------|
| CA-01 | Top 10 por XP | Paso 1 (carga datos) |
| CA-02 | Actualizacion tiempo real | Ya funciona (WS) |
| CA-03 | Posicion, nombre, XP, rango | Paso 1 (datos disponibles) |
| CA-04 | Resalta usuario actual | Ya implementado |
| CA-05 | Posicion si no en top 10 | Ya implementado |
| CA-06 | Accesible desde navbar | Ya funciona |
| CA-07 | Responsive design | Ya funciona |

### Analisis de Dependencias

| Archivo | Impacto |
|---------|---------|
| leaderboardsStore.ts | Ninguno (usa funcion existente) |
| useLeaderboards.ts | Ninguno |
| socialAPI.ts | Ninguno |
| GamifiedHeader.tsx | Ninguno |
| LeaderboardLayout.tsx | Ninguno |

### Riesgos Mitigados

| Riesgo | Mitigacion |
|--------|------------|
| Loop infinito | `setLeaderboardType` es funcion estable de Zustand |
| API fail | Store ya maneja errores y muestra estado |
| Regresion | Cambio aislado, solo agrega useEffect |

---

## ORDEN DE EJECUCION

```
1. Modificar LeaderboardPage.tsx (agregar useEffect)
      |
      v
2. Ejecutar build para validar
      |
      v
3. Si build OK -> Eliminar archivo duplicado (opcional)
      |
      v
4. Ejecutar build final
      |
      v
5. Crear reporte de ejecucion
```

---

## CHECKLIST PRE-EJECUCION

- [x] Analisis completado
- [x] Causa raiz identificada
- [x] Solucion validada
- [x] Dependencias verificadas
- [x] Riesgos evaluados
- [x] Plan documentado

---

## APROBACION FINAL

**Estado:** APROBADO PARA EJECUCION INMEDIATA

**Aprobado por:** Orquestador
**Fecha:** 2026-01-07

---

## NOTAS DE IMPLEMENTACION

### Patron correcto (referencia MissionsPage)
```typescript
// MissionsPage.tsx - Lineas 75-81
useEffect(() => {
  if (user?.id) {
    refreshMissions();
  }
}, [user?.id, refreshMissions]);
```

### Patron a implementar (LeaderboardPage)
```typescript
// No necesita user?.id porque el global leaderboard es publico
useEffect(() => {
  setLeaderboardType('global');
}, [setLeaderboardType]);
```

---
