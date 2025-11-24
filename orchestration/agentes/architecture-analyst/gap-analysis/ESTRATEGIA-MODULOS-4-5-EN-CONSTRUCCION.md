# ESTRATEGIA: Módulos 4-5 Visibles con Ejercicios "En Construcción"

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Tipo:** Especificación Técnica
**Relacionado con:** ADR-010, Opción A (MVP Módulos 1-3)

---

## 🎯 OBJETIVO

Permitir que los **Módulos 4 y 5** sean **visibles** en la UI (página principal y página de módulos) mostrando todos sus ejercicios, pero que al hacer clic en cualquier ejercicio de estos módulos, se muestre una **página "En Construcción"** en lugar del ejercicio funcional.

---

## 📋 REQUERIMIENTOS

### Comportamiento Esperado

| Ubicación | Módulos 1-3 | Módulos 4-5 |
|-----------|-------------|-------------|
| **Página Principal** | ✅ Mostrar módulos | ✅ Mostrar módulos (badge "En Construcción") |
| **Página de Módulos** | ✅ Mostrar módulos | ✅ Mostrar módulos (badge "En Construcción") |
| **Lista de Ejercicios** | ✅ Mostrar ejercicios clickeables | ✅ Mostrar ejercicios (badge "Próximamente") |
| **Click en Ejercicio** | ✅ Abrir ejercicio funcional | ⚠️ Mostrar página "En Construcción" |
| **Página de Ejercicio** | ✅ Ejercicio completo jugable | 🚧 Página informativa "En Construcción" |

---

## 🏗️ ARQUITECTURA DE LA SOLUCIÓN

### Enfoque Propuesto

**Usar el campo `is_active` existente en la tabla `exercises` para marcar ejercicios en construcción.**

**Ventajas:**
- ✅ No requiere modificaciones DDL (campo ya existe)
- ✅ Semánticamente correcto (`is_active = false` = ejercicio no funcional)
- ✅ Backend ya soporta filtrado por `is_active`
- ✅ Migración simple (solo seeds)

**Flujo de datos:**
```
Base de Datos
  └─> exercises.is_active = false (M4-M5)
      └─> Backend API devuelve ejercicios con flag
          └─> Frontend detecta is_active = false
              └─> Renderiza UnderConstructionPage
```

---

## 🗄️ CAMBIOS EN BASE DE DATOS

### 1. Modificar Módulos 4-5 (Hacerlos Visibles)

**Archivo:** `apps/database/seeds/prod/educational_content/01-modules.sql`

**Cambios requeridos:**
```sql
-- Módulo 4: Lectura Digital
(
    NULL,
    'Módulo 4: Lectura Digital y Multimodal',
    'Desarrolla habilidades de lectura en medios digitales y multimodales con contenido de Marie Curie',
    4,
    'MOD-04-DIGITAL',
    'intermediate',
    120,
    ARRAY['Navegar contenido hipertextual', 'Evaluar fuentes digitales', 'Sintetizar información multimedia', 'Analizar memes y contenido visual'],
    175,
    85,
    'published',  -- ← CAMBIO: 'draft' → 'published' (hacer visible)
    true,         -- ← CAMBIO: false → true (publicar módulo)
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- Módulo 5: Producción y Expresión
(
    NULL,
    'Módulo 5: Producción y Expresión Lectora',
    'Crea textos diversos y expresiones lectoras basadas en la vida y obra de Marie Curie',
    5,
    'MOD-05-PRODUCCION',
    'advanced',
    120,
    ARRAY['Producir textos argumentativos', 'Crear contenido multimedia', 'Expresar ideas con claridad', 'Desarrollar presentaciones creativas'],
    250,
    125,
    'published',  -- ← CAMBIO: 'draft' → 'published' (hacer visible)
    true,         -- ← CAMBIO: false → true (publicar módulo)
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
```

### 2. Crear Seeds de Ejercicios Módulo 4

**Archivo NUEVO:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`

**Ejercicios a crear (según DocumentoDeDiseño líneas 768-947):**

1. **Ejercicio 4.1: Verificador de Fake News**
   - `exercise_type`: `'verificador_fake_news'`
   - `order_index`: 1
   - `is_active`: **false** ← CLAVE
   - XP: 100, ML: 20

2. **Ejercicio 4.2: Creación de Infografía Interactiva**
   - `exercise_type`: `'infografia_interactiva'`
   - `order_index`: 2
   - `is_active`: **false**
   - XP: 100, ML: 20

3. **Ejercicio 4.3: Quiz Estilo TikTok**
   - `exercise_type`: `'quiz_tiktok'`
   - `order_index`: 3
   - `is_active`: **false**
   - XP: 100, ML: 20

4. **Ejercicio 4.4: Navegación Hipertextual**
   - `exercise_type`: `'navegacion_hipertextual'`
   - `order_index`: 4
   - `is_active`: **false**
   - XP: 100, ML: 20

5. **Ejercicio 4.5: Análisis de Memes Educativos**
   - `exercise_type`: `'analisis_memes'`
   - `order_index`: 5
   - `is_active`: **false**
   - XP: 100, ML: 20

**Campos `content` y `solution`:**
- Pueden ser JSON mínimo (placeholder) ya que no se ejecutarán
- O copiar estructura completa del DocumentoDeDiseño para futuro

### 3. Crear Seeds de Ejercicios Módulo 5

**Archivo NUEVO:** `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`

**Ejercicios a crear (según DocumentoDeDiseño líneas 950-1097):**

1. **Opción A: Diario Interactivo de Marie**
   - `exercise_type`: `'diario_interactivo'`
   - `order_index`: 1
   - `is_active`: **false**
   - XP: 500, ML: 50

2. **Opción B: Resumen Visual Progresivo (Cómic Digital)**
   - `exercise_type`: `'comic_digital'`
   - `order_index`: 2
   - `is_active`: **false**
   - XP: 500, ML: 50

3. **Opción C: Cápsula del Tiempo Digital**
   - `exercise_type`: `'capsula_tiempo'`
   - `order_index`: 3
   - `is_active`: **false**
   - XP: 500, ML: 50

---

## 💻 CAMBIOS EN FRONTEND

### 1. Modificar ExercisePage para Detectar is_active

**Archivo:** `apps/frontend/src/apps/student/pages/ExercisePage.tsx`

**Lógica requerida:**
```typescript
// En el componente ExercisePage
const { exerciseId } = useParams();
const { exercise, loading } = useExercise(exerciseId);

// Detectar si ejercicio está en construcción
if (!loading && exercise && !exercise.is_active) {
  return <UnderConstructionExercise exercise={exercise} />;
}

// Si está activo, renderizar ejercicio normal
return <ActualExerciseComponent exercise={exercise} />;
```

### 2. Crear Componente UnderConstructionExercise

**Archivo NUEVO:** `apps/frontend/src/apps/student/components/exercise/UnderConstructionExercise.tsx`

**Especificación del componente:**

```typescript
interface UnderConstructionExerciseProps {
  exercise: {
    id: string;
    title: string;
    subtitle?: string;
    description: string;
    module: {
      id: string;
      title: string;
      module_code: string;
    };
    estimated_time_minutes: number;
    xp_reward: number;
    ml_coins_reward: number;
  };
}

export const UnderConstructionExercise: React.FC<UnderConstructionExerciseProps> = ({ exercise }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
      {/* Header con información del ejercicio */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-8"
        >
          {/* Icono de construcción grande */}
          <div className="text-center mb-6">
            <Construction className="w-24 h-24 mx-auto text-amber-500" />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
            {exercise.title}
          </h1>
          {exercise.subtitle && (
            <p className="text-lg text-center text-gray-600 mb-6">
              {exercise.subtitle}
            </p>
          )}

          {/* Badge "En Construcción" */}
          <div className="flex justify-center mb-6">
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100 text-amber-800 rounded-full font-semibold">
              <Construction className="w-5 h-5" />
              Ejercicio en Construcción
            </span>
          </div>

          {/* Descripción */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-gray-900 mb-2">
              ¿De qué trata este ejercicio?
            </h3>
            <p className="text-gray-700">
              {exercise.description}
            </p>
          </div>

          {/* Información del ejercicio */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <Zap className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <p className="text-sm text-gray-600">Recompensa XP</p>
              <p className="text-xl font-bold text-blue-700">{exercise.xp_reward} XP</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-purple-600 mb-2" />
              <p className="text-sm text-gray-600">Tiempo estimado</p>
              <p className="text-xl font-bold text-purple-700">{exercise.estimated_time_minutes} min</p>
            </div>
            <div className="bg-amber-50 rounded-lg p-4 text-center">
              <Gift className="w-6 h-6 mx-auto text-amber-600 mb-2" />
              <p className="text-sm text-gray-600">ML Coins</p>
              <p className="text-xl font-bold text-amber-700">{exercise.ml_coins_reward} ML</p>
            </div>
          </div>

          {/* Mensaje informativo */}
          <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-6 mb-6">
            <h3 className="font-semibold text-amber-900 mb-2 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Este ejercicio estará disponible próximamente
            </h3>
            <p className="text-amber-800 text-sm">
              Actualmente estamos trabajando en implementar este ejercicio interactivo.
              Mientras tanto, te invitamos a completar los módulos 1, 2 y 3 que ya están disponibles.
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate(`/modules/${exercise.module.id}`)}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Volver al Módulo
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate('/modules')}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-lg"
            >
              <BookOpen className="w-5 h-5" />
              Ver Todos los Módulos
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
```

**Iconos necesarios (de lucide-react):**
- `Construction`
- `AlertCircle`
- `Zap`
- `Clock`
- `Gift`
- `ArrowLeft`
- `BookOpen`

### 3. Actualizar ModulesSection para Badge "En Construcción"

**Archivo:** `apps/frontend/src/apps/student/components/dashboard/ModulesSection.tsx`

**Cambio requerido:** El código actual ya soporta módulos con status diferente y tiene styling para "backlog"/"draft". Solo asegurarse de que funciona con `status: 'published'` pero mostrando badge especial si todos los ejercicios tienen `is_active: false`.

**Posible mejora:**
```typescript
// Detectar si módulo tiene solo ejercicios inactivos
const allExercisesInactive = module.exercises?.every(ex => !ex.is_active);

const getModuleBadge = () => {
  if (allExercisesInactive) {
    return (
      <div className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-white">
        🚧 Próximamente
      </div>
    );
  }
  // ... resto del código existente
};
```

---

## 📊 VALIDACIÓN DE LA SOLUCIÓN

### Checklist de Validación

#### Base de Datos
- [ ] Módulos 4-5 tienen `status = 'published'` y `is_published = true`
- [ ] Ejercicios 4.1-4.5 creados con `is_active = false`
- [ ] Ejercicios 5.1-5.3 creados con `is_active = false`
- [ ] Query devuelve módulos 4-5 desde API
- [ ] Query devuelve ejercicios 4.x y 5.x desde API

**Query de validación:**
```sql
-- Verificar módulos visibles
SELECT module_code, title, status, is_published
FROM educational_content.modules
ORDER BY order_index;

-- Verificar ejercicios módulos 4-5
SELECT
    m.module_code,
    e.order_index,
    e.title,
    e.is_active
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.module_code IN ('MOD-04-DIGITAL', 'MOD-05-PRODUCCION')
ORDER BY m.order_index, e.order_index;
```

**Resultado esperado:**
```
 module_code      | order | title                          | is_active
------------------+-------+--------------------------------+-----------
 MOD-04-DIGITAL   |   1   | Verificador de Fake News       | false
 MOD-04-DIGITAL   |   2   | Infografía Interactiva         | false
 MOD-04-DIGITAL   |   3   | Quiz Estilo TikTok             | false
 MOD-04-DIGITAL   |   4   | Navegación Hipertextual        | false
 MOD-04-DIGITAL   |   5   | Análisis de Memes              | false
 MOD-05-PRODUCCION|   1   | Diario Interactivo             | false
 MOD-05-PRODUCCION|   2   | Cómic Digital                  | false
 MOD-05-PRODUCCION|   3   | Cápsula del Tiempo             | false
```

#### Frontend

**Página Principal:**
- [ ] Módulos 1-5 visibles en dashboard
- [ ] Módulos 4-5 muestran badge "🚧 Próximamente" o similar
- [ ] Click en módulos 4-5 navega a página de detalle del módulo

**Página de Módulo:**
- [ ] Lista de ejercicios 4.x/5.x visible
- [ ] Ejercicios muestran badge "Próximamente" o similar
- [ ] Click en ejercicio navega a `/exercises/:id`

**Página de Ejercicio (módulos 4-5):**
- [ ] Detecta `is_active = false`
- [ ] Renderiza componente `UnderConstructionExercise`
- [ ] Muestra título, descripción, recompensas del ejercicio
- [ ] Botón "Volver al Módulo" funciona
- [ ] Botón "Ver Todos los Módulos" funciona
- [ ] NO muestra componente de ejercicio funcional

**Página de Ejercicio (módulos 1-3):**
- [ ] Detecta `is_active = true`
- [ ] Renderiza ejercicio funcional normal
- [ ] Sin cambios en comportamiento

---

## 📝 ESTRUCTURA DE DATOS MÍNIMA

Para ejercicios "en construcción", usar estructura JSON mínima pero válida:

### Ejemplo: Ejercicio 4.1 (Verificador Fake News)

```sql
INSERT INTO educational_content.exercises (
    module_id,
    title,
    subtitle,
    description,
    instructions,
    objective,
    exercise_type,
    order_index,
    config,
    content,
    solution,
    difficulty_level,
    max_points,
    passing_score,
    estimated_time_minutes,
    xp_reward,
    ml_coins_reward,
    is_active,  -- ← CLAVE: false
    version
) VALUES (
    mod_id,
    'Verificador de Fake News',
    'Identifica noticias falsas sobre Marie Curie',
    'Identifica noticias falsas sobre Marie Curie usando herramientas de verificación digital.',
    'Este ejercicio estará disponible próximamente.',
    'Desarrollar pensamiento crítico para identificar noticias falsas.',
    'verificador_fake_news',
    1,
    '{}'::jsonb,  -- Config vacío o mínimo
    '{
        "placeholder": true,
        "message": "Contenido en desarrollo"
    }'::jsonb,
    '{}'::jsonb,
    'intermediate',
    100,
    70,
    20,
    100,
    20,
    false,  -- ← NO ACTIVO
    '1.0'
);
```

**Ventaja:** Al estar en BD, el ejercicio puede:
- Listarse en API de ejercicios
- Mostrarse en UI
- Tener datos básicos (título, desc, recompensas)
- Actualizarse a `is_active = true` cuando esté listo

---

## 🎯 PLAN DE IMPLEMENTACIÓN

### Fase 1: Base de Datos (Database-Developer)

**Timeline:** 1 día

**Tareas:**
1. Modificar seed `01-modules.sql` (módulos 4-5 published)
2. Crear seed `05-exercises-module4.sql` (5 ejercicios)
3. Crear seed `06-exercises-module5.sql` (3 ejercicios)
4. Ejecutar `drop-and-recreate-database.sh`
5. Validar queries de verificación

**Entregables:**
- 3 archivos de seeds modificados/creados
- Validación de 23 ejercicios en BD (15 activos + 8 inactivos)

### Fase 2: Frontend (Frontend-Developer)

**Timeline:** 1-2 días

**Tareas:**
1. Crear componente `UnderConstructionExercise.tsx`
2. Modificar `ExercisePage.tsx` para detectar `is_active`
3. (Opcional) Mejorar badges en `ModulesSection.tsx`
4. Testing manual de flujo completo
5. Screenshots para validación

**Entregables:**
- 1 componente nuevo
- 1 archivo modificado (ExercisePage)
- Screenshots de UX

### Fase 3: Validación (Architecture-Analyst)

**Timeline:** 0.5 días

**Tareas:**
1. Validar coherencia BD-Frontend
2. Validar UX completa (navegación M1→M5)
3. Generar reporte de validación
4. Aprobar para merge

---

## 🔄 FLUJO DE USUARIO COMPLETO

### Escenario 1: Usuario en Dashboard

1. **Ve 5 módulos** en ModulesSection
2. Módulos 1-3: badge "Disponible" / "En Progreso" / "Completado"
3. Módulos 4-5: badge "🚧 Próximamente"

### Escenario 2: Click en Módulo 4

1. Navega a `/modules/:moduleId`
2. **Ve 5 ejercicios** listados:
   - 4.1 Verificador Fake News (badge "Próximamente")
   - 4.2 Infografía Interactiva (badge "Próximamente")
   - 4.3 Quiz TikTok (badge "Próximamente")
   - 4.4 Navegación Hipertextual (badge "Próximamente")
   - 4.5 Análisis Memes (badge "Próximamente")

### Escenario 3: Click en Ejercicio 4.1

1. Navega a `/exercises/:exerciseId`
2. **Frontend detecta `is_active = false`**
3. **Renderiza `UnderConstructionExercise`:**
   - Icono construcción grande 🚧
   - Título: "Verificador de Fake News"
   - Descripción del ejercicio
   - Recompensas (100 XP, 20 ML)
   - Mensaje "Este ejercicio estará disponible próximamente"
   - Botones: "Volver al Módulo" / "Ver Todos los Módulos"
4. Usuario puede navegar de vuelta sin frustración

### Escenario 4: Click en Ejercicio 1.1 (Comparación)

1. Navega a `/exercises/:exerciseId`
2. **Frontend detecta `is_active = true`**
3. **Renderiza ejercicio funcional normal** (Crucigrama)
4. Usuario puede completar ejercicio

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### 1. No Otorgar XP por Ejercicios Inactivos

El backend debe validar que solo ejercicios con `is_active = true` otorguen XP/ML Coins al completarse.

**Validación en Backend:**
```typescript
// En el servicio de completar ejercicio
async completeExercise(userId, exerciseId) {
  const exercise = await this.exercisesRepository.findOne({ where: { id: exerciseId }});

  if (!exercise.is_active) {
    throw new BadRequestException('Este ejercicio no está disponible actualmente');
  }

  // ... resto de lógica de completar ejercicio
}
```

### 2. Progreso de Módulos 4-5

Los módulos 4-5 **NO deben considerarse completables** hasta que sus ejercicios estén activos.

**Cálculo de progreso:**
```typescript
// Filtrar solo ejercicios activos para progreso
const activeExercises = module.exercises.filter(ex => ex.is_active);
const completedActiveExercises = activeExercises.filter(ex => ex.userProgress?.completed);

const progress = (completedActiveExercises.length / activeExercises.length) * 100;
```

### 3. Mensajes de Error

Si alguien intenta acceder directamente a la API del ejercicio inactivo:

**Respuesta API:**
```json
{
  "statusCode": 400,
  "message": "Este ejercicio no está disponible actualmente. Está en desarrollo.",
  "error": "Bad Request",
  "exerciseId": "uuid-here"
}
```

---

## 📈 MÉTRICAS DE ÉXITO

### Post-Implementación

**Base de Datos:**
- ✅ 5 módulos publicados (todos visibles)
- ✅ 23 ejercicios en total (15 activos + 8 inactivos)
- ✅ Módulos 4-5: `is_published = true`
- ✅ Ejercicios M4-M5: `is_active = false`

**Frontend:**
- ✅ Módulos 1-5 visibles en dashboard
- ✅ Ejercicios M4-M5 visibles en listas
- ✅ Página "En Construcción" funcional
- ✅ Navegación fluida sin errores
- ✅ UX clara (usuario entiende que M4-M5 no están listos)

**Usuario:**
- ✅ Puede ver todo el contenido planificado
- ✅ Entiende qué está disponible vs en desarrollo
- ✅ No se frustra al hacer click en M4-M5
- ✅ Puede navegar de vuelta fácilmente

---

## 🚀 PRÓXIMOS PASOS (Implementación)

1. **Database-Developer:** Crear seeds ejercicios M4-M5 (**delegado en siguiente mensaje**)
2. **Frontend-Developer:** Implementar UnderConstructionExercise (**delegado en siguiente mensaje**)
3. **Architecture-Analyst:** Validar implementación completa
4. **QA:** Testing de flujo completo M1→M5

---

**Versión:** 1.0
**Estado:** Especificación Completa
**Listo para:** Delegación a Database-Developer y Frontend-Developer
**Próxima Acción:** Delegar tareas usando Task tool
