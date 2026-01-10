# Página de Respuestas M3-M5 - Portal Teacher

**Versión:** 1.0
**Fecha:** 2026-01-07
**Estado:** IMPLEMENTADO

---

## Información General

| Campo | Valor |
|-------|-------|
| **Ruta** | `/teacher/responses` |
| **Componente** | `TeacherExerciseResponsesPage.tsx` |
| **Ubicación** | `apps/frontend/src/apps/teacher/pages/` |
| **Estado** | ✅ 100% Funcional |

---

## Descripción

La página de Respuestas de Ejercicios permite a los maestros ver todas las respuestas enviadas por los estudiantes, con énfasis especial en los ejercicios de módulos 3-5 que requieren evaluación manual.

---

## Funcionalidades

### 1. Tabla de Respuestas Paginada

Lista todas las respuestas de ejercicios con:
- Nombre del estudiante
- Ejercicio completado
- Módulo
- Fecha de envío
- Estado (correcto/incorrecto/pendiente)
- Score (si calificado)
- Acciones

### 2. Filtros Avanzados

| Filtro | Tipo | Descripción |
|--------|------|-------------|
| Aula | Select | Filtrar por aula/grupo |
| Estudiante | Search | Buscar por nombre |
| Módulo | Select | M1, M2, M3, M4, M5 |
| Fecha | DateRange | Rango de fechas |
| Estado | Select | Correcto/Incorrecto/Pendiente |

### 3. Stats en Tiempo Real

Panel superior con métricas:
- Total de intentos
- Respuestas correctas
- Respuestas incorrectas
- Score promedio
- Pendientes de revisión (M3-M5)

### 4. Modal de Detalle

Al hacer click en una respuesta:
- Contenido de la respuesta del estudiante
- Comparación con respuesta correcta (si aplica)
- Reproductor de video/audio (si aplica)
- Galería de imágenes (si aplica)
- Métricas: tiempo, pistas usadas, comodines
- Recompensas ganadas (si calificado)

### 5. Integración con Panel de Revisión

Para respuestas pendientes de M3-M5:
- Botón "Revisar" visible
- Redirige a `/teacher/reviews?submissionId=...`
- Permite calificar directamente

---

## Estructura del Componente

```typescript
// TeacherExerciseResponsesPage.tsx

export default function TeacherExerciseResponsesPage() {
  // Estado
  const [filters, setFilters] = useState<ResponseFilters>({});
  const [selectedAttemptId, setSelectedAttemptId] = useState<string | null>(null);

  // Queries
  const { data: responses, isLoading } = useExerciseResponses(filters);
  const { data: stats } = useResponseStats(filters);
  const { data: attempt } = useAttemptDetail(selectedAttemptId);

  return (
    <TeacherLayout>
      {/* Stats Grid */}
      <StatsGrid stats={stats} />

      {/* Filters */}
      <ResponseFilters filters={filters} onChange={setFilters} />

      {/* Table */}
      <ResponsesTable
        responses={responses}
        onSelect={setSelectedAttemptId}
      />

      {/* Detail Modal */}
      <ResponseDetailModal
        attempt={attempt}
        open={!!selectedAttemptId}
        onClose={() => setSelectedAttemptId(null)}
      />
    </TeacherLayout>
  );
}
```

---

## Hooks Utilizados

### useExerciseResponses

```typescript
// apps/teacher/hooks/useExerciseResponses.ts

export function useExerciseResponses(filters: ResponseFilters) {
  return useQuery({
    queryKey: ['teacher', 'responses', filters],
    queryFn: () => teacherApi.getExerciseResponses(filters),
  });
}
```

### useAttemptDetail

```typescript
export function useAttemptDetail(attemptId: string | null) {
  return useQuery({
    queryKey: ['teacher', 'attempt', attemptId],
    queryFn: () => teacherApi.getAttemptDetail(attemptId),
    enabled: !!attemptId,
  });
}
```

---

## API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/teacher/attempts` | Lista paginada de intentos |
| GET | `/api/teacher/attempts/:id` | Detalle de un intento |
| GET | `/api/teacher/attempts/stats` | Estadísticas agregadas |
| GET | `/api/teacher/exercises/:id/responses` | Respuestas por ejercicio |

### Query Parameters

```
GET /api/teacher/attempts?
  page=1&
  limit=20&
  classroomId=uuid&
  studentId=uuid&
  moduleId=3&
  dateFrom=2026-01-01&
  dateTo=2026-01-07&
  isCorrect=true
```

---

## Filtrado por Módulo M3-M5

Para ver específicamente respuestas de módulos con revisión manual:

1. Usar filtro de Módulo: M3, M4 o M5
2. Estado: "Pendiente" para ver los que necesitan revisión
3. Click en "Revisar" para ir al panel de calificación

### Constante de Módulos

```typescript
// apps/teacher/constants/modules.ts
export const MODULES_WITH_MANUAL_REVIEW = ['M3', 'M4', 'M5'];

export const MODULE_LABELS = {
  M1: 'Comprensión Literal',
  M2: 'Comprensión Inferencial',
  M3: 'Lectura Crítica',
  M4: 'Lectura Digital',
  M5: 'Producción Creativa',
};
```

---

## Estados de Respuesta

| Estado | Color | Descripción |
|--------|-------|-------------|
| `correct` | Verde | Respuesta correcta (calificada) |
| `incorrect` | Rojo | Respuesta incorrecta (calificada) |
| `pending` | Amarillo | Pendiente de revisión (M3-M5) |
| `in_review` | Azul | En proceso de revisión |

---

## Columnas de la Tabla

| Columna | Descripción |
|---------|-------------|
| Estudiante | Nombre + avatar |
| Ejercicio | Tipo y título |
| Módulo | M1-M5 |
| Fecha | Fecha de envío |
| Tiempo | Tiempo invertido |
| Score | Puntuación (si calificado) |
| Estado | Badge de estado |
| Acciones | Ver / Revisar |

---

## Integración con Panel de Revisión

Cuando una respuesta de M3-M5 está pendiente:

1. Se muestra badge "Pendiente" en amarillo
2. Botón de acción cambia a "Revisar"
3. Al hacer click:
   ```typescript
   const handleReview = (submissionId: string) => {
     navigate(`/teacher/reviews?submissionId=${submissionId}`);
   };
   ```
4. Se abre el panel de revisión con la submission cargada

---

## Ejemplo de Respuesta (M3-M5)

### Análisis de Fuentes (M3)

```json
{
  "attemptId": "uuid",
  "exerciseType": "analisis_fuentes",
  "studentName": "María García",
  "submittedAt": "2026-01-07T10:30:00Z",
  "status": "pending",
  "answers": {
    "ranking": ["src-3", "src-1", "src-5", "src-2", "src-4"]
  },
  "requiresManualReview": true
}
```

### Video-Carta (M5)

```json
{
  "attemptId": "uuid",
  "exerciseType": "video_carta",
  "studentName": "Carlos López",
  "submittedAt": "2026-01-07T11:45:00Z",
  "status": "pending",
  "answers": {
    "videoUrl": "https://storage.../video.mp4",
    "duration": 145,
    "transcript": "..."
  },
  "requiresManualReview": true
}
```

---

## Accesibilidad

- Tabla con headers semánticos
- Navegación por teclado
- Labels descriptivos en filtros
- Contraste adecuado en badges
- Reproductor de video con controles accesibles

---

## Rendimiento

- Paginación server-side (20 items por página)
- Query caching con TanStack Query
- Lazy loading de detalles
- Debounce en búsqueda (300ms)

---

## Referencias

- `TeacherReviewPanelPage.tsx` - Panel de revisión manual
- `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` - Flujo completo
- `Manual_Portal_Maestros_ACTUALIZADO.md` - Capítulo 7

---

*Documento creado como parte de la documentación del Portal Teacher*
