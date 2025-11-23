# Análisis Pre-Correcciones: BD Origen vs Implementación Actual

**Agente:** ATLAS-DATABASE
**Versión:** 2.0
**Fecha:** 2025-11-03
**Fuente de Verdad:** `/home/isem/workspace/projects/glit/database` (BD origen)

---

## 🎯 Objetivo

Comparar la **base de datos de origen** (fuente de verdad) con la **implementación actual** para determinar qué correcciones son necesarias antes de proceder con cambios.

---

## 📊 Base de Datos de Origen (Fuente de Verdad)

### Ubicación
```
/home/isem/workspace/projects/glit/database/
├── seed_data/
│   ├── 03_educational_modules_seed.sql (92 KB - 8 módulos INSERT, 27 ejercicios)
│   └── 04_demo_users_and_data_seed.sql (30 KB - 10 usuarios)
└── question_bank/
    └── module_01_literal/ (preguntas del módulo 1)
```

### 1. Usuarios de Prueba

**Archivo:** `seed_data/04_demo_users_and_data_seed.sql`
**Líneas:** 67-310

| Email | Password | Hash bcrypt | Role | Rango Inicial |
|-------|----------|-------------|------|---------------|
| admin@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | super_admin | nacom |
| teacher1@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | admin_teacher | nacom |
| teacher2@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | admin_teacher | nacom |
| student1@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |
| student2@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |
| student3@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |
| student4@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |
| student5@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |
| student6@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |
| student7@glit.com | Glit2024! | $2a$10$Xk5WmK8F... | student | nacom |

**Total:** 10 usuarios (1 admin, 2 teachers, 7 students)

### 2. Módulos Educativos

**Archivo:** `seed_data/03_educational_modules_seed.sql`
**Líneas:** 11-1702

| Módulo | Código | Título | Ejercicios | Estado |
|--------|--------|--------|------------|--------|
| 1 | MOD-01-LITERAL | Comprensión Literal | 5 | ✅ Implementado |
| 2 | MOD-02-INFERENCIAL | Comprensión Inferencial | 5 | ✅ Implementado |
| 3 | MOD-03-CRITICA | Comprensión Crítica | 5 | ✅ Implementado |
| 4 | MOD-04-DIGITAL | Textos Digitales | 9 | ✅ Implementado |
| 5 | MOD-05-CREATIVO | Producción Creativa | 3 | ✅ Implementado |
| 6-8 | - | Marie Curie Story | 0 | ❌ Placeholder |

**Total implementado:** 5 módulos, 27 ejercicios

### 3. Ejercicios por Módulo

#### Módulo 1: Comprensión Literal (5 ejercicios)
1. `crossword` - Crucigrama Científico
2. `timeline` - Línea de Tiempo
3. `wordsearch` - Sopa de Letras
4. `concept_map` - Mapa Conceptual
5. `matching` - Emparejamiento

#### Módulo 2: Comprensión Inferencial (5 ejercicios)
1. `textual_detective` - Detective Textual
2. `hypothesis` - Construcción de Hipótesis
3. `narrative_prediction` - Predicción Narrativa
4. `context_puzzle` - Puzzle de Contexto
5. `inference_wheel` - Rueda de Inferencias

#### Módulo 3: Comprensión Crítica (5 ejercicios)
1. `source_analysis` - Análisis de Fuentes
2. `digital_debate` - Debate Digital
3. `perspective_matrix` - Matriz de Perspectivas
4. `argumentative_podcast` - Podcast Argumentativo
5. `opinion_tribunal` - Tribunal de Opiniones

#### Módulo 4: Textos Digitales (9 ejercicios)
1. `fakenews_verifier` - Verificador de Fake News
2. `tiktok_quiz` - Quiz estilo TikTok
3. `hypertext_navigation` - Navegación Hipertextual
4. `meme_analysis` - Análisis de Memes
5. `infographic_interactive` - Infografía Interactiva
6. `web_search_guided` - Búsqueda Guiada Web
7. `multimodal_navigation` - Navegación Multimodal
8. `source_credibility` - Credibilidad de Fuentes
9. `graph_analysis` - Análisis de Gráficos

#### Módulo 5: Producción Creativa (3 ejercicios)
1. `multimedia_diary` - Diario Multimedia
2. `digital_comic` - Cómic Digital
3. `video_letter` - Video Carta

### 4. Rangos Mayas

**Archivo:** `seed_data/04_demo_users_and_data_seed.sql`
**Líneas:** 535-546

```sql
INSERT INTO gamification_system.user_ranks (...) VALUES
('admin001...', 'aaaaaaaa-...', 'nacom', 0, true),  -- admin
('teacher1...', 'aaaaaaaa-...', 'nacom', 0, true),  -- teacher1
('teacher2...', 'aaaaaaaa-...', 'nacom', 0, true),  -- teacher2
('student1...', 'aaaaaaaa-...', 'nacom', 45, true), -- student1
('student2...', 'aaaaaaaa-...', 'nacom', 25, true), -- student2
...
```

**Rango inicial en BD origen:** `'nacom'` (TODOS los usuarios)

---

## 📊 Implementación Actual

### Ubicación
```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/seeds/dev/
├── auth/
│   └── 01-demo-users.sql
├── educational_content/
│   ├── 01-modules.sql
│   ├── 02-exercises-module1.sql
│   ├── 03-exercises-module2.sql
│   ├── 04-exercises-module3.sql
│   ├── 05-exercises-module4.sql
│   └── 06-exercises-module5.sql
└── gamification_system/
    └── 04-initialize_user_gamification.sql
```

### 1. Usuarios Implementados

**Archivo:** `auth/01-demo-users.sql`

| Email | Password | Role | Count |
|-------|----------|------|-------|
| admin@glit.edu.mx | Admin123! | super_admin | 1 |
| instructor@demo.glit.edu.mx | Instructor123! | admin_teacher | 1 |
| estudiante1@demo.glit.edu.mx | Student123! | student | 1 |
| estudiante2@demo.glit.edu.mx | Student123! | student | 1 |
| estudiante3@demo.glit.edu.mx | Student123! | student | 1 |

**Total:** 5 usuarios (1 admin, 1 teacher, 3 students)

### 2. Módulos Implementados

**Archivo:** `educational_content/01-modules.sql`

| Módulo | Código | Ejercicios | Archivo |
|--------|--------|------------|---------|
| 1 | MOD-01-LITERAL | 5 | 02-exercises-module1.sql |
| 2 | MOD-02-INFERENCIAL | 5 | 03-exercises-module2.sql |
| 3 | MOD-03-CRITICA | 5 | 04-exercises-module3.sql |
| 4 | MOD-04-DIGITAL | 3 | 05-exercises-module4.sql |
| 5 | MOD-05-PRODUCCION | 3 | 06-exercises-module5.sql |
| 6 | MOD-06-BIOGRAFIA-1 | 0 | ❌ No tiene exercises |
| 7 | MOD-07-BIOGRAFIA-2 | 0 | ❌ No tiene exercises |
| 8 | MOD-08-BIOGRAFIA-3 | 0 | ❌ No tiene exercises |

**Total:** 8 módulos, 21 ejercicios implementados

### 3. Rangos Mayas Implementados

**Archivo:** `gamification_system/04-initialize_user_gamification.sql`
**Línea:** 98

```sql
current_rank: 'Ajaw',  -- Rango inicial Maya (nivel 1)
```

**Rango inicial implementado:** `'Ajaw'`

---

## ⚠️ Requerimientos del Usuario

El usuario especificó los siguientes requerimientos:

1. **Dominio de usuarios:** `@gamilit.com` (NO `@glit.com` ni `@glit.edu.mx`)
2. **Módulos:** 4 módulos (posiblemente referencia a los primeros 4)
3. **Ejercicios por módulo:** ~5 ejercicios cada uno
4. **Rangos:** Empiezan con Ajaw

---

## 🔍 Análisis Comparativo

### Categoría 1: USUARIOS

| Aspecto | BD Origen | Implementación Actual | Requerimiento Usuario | Acción |
|---------|-----------|----------------------|----------------------|--------|
| **Dominio** | @glit.com | @glit.edu.mx / @demo.glit.edu.mx | @gamilit.com | 🔴 CAMBIAR A @gamilit.com |
| **Password** | Glit2024! | Admin123! / Student123! | (no especificado) | 🟡 DECIDIR |
| **Cantidad** | 10 (1+2+7) | 5 (1+1+3) | 3 usuarios mencionados | 🟡 DECIDIR |
| **Emails** | admin, teacher1-2, student1-7 | admin, instructor, estudiante1-3 | student, teacher, admin | 🔴 CAMBIAR |

**Recomendación:**
- **Cambiar dominio:** `@glit.com` → `@gamilit.com` (según usuario)
- **Emails específicos:**
  - `admin@gamilit.com`
  - `teacher@gamilit.com` (o teacher1@gamilit.com si se mantienen 2)
  - `student@gamilit.com` (o student1@gamilit.com)
- **Password:** ¿Mantener Glit2024! o usar Test1234 como mencionó el usuario anteriormente?

### Categoría 2: MÓDULOS

| Aspecto | BD Origen | Implementación Actual | Requerimiento Usuario | Estado |
|---------|-----------|----------------------|----------------------|--------|
| **Total módulos** | 5 implementados | 8 declarados | 4 módulos | 🟡 CLARIFICAR |
| **Módulos 1-4** | MOD-01 a MOD-04 (24 ejercicios) | MOD-01 a MOD-04 (18 ejercicios) | 4 módulos ~5 c/u | 🔴 FALTAN 6 |
| **Módulo 5** | MOD-05-CREATIVO (3 ejercicios) | MOD-05-PRODUCCION (3 ejercicios) | No mencionado | ✅ OK |
| **Módulos 6-8** | Placeholder (0 ejercicios) | Declarados (0 ejercicios) | No mencionados | 🟡 REVISAR |

**Análisis:**
- Si usuario dijo "4 módulos", puede referirse a MOD-01 a MOD-04
- MOD-05 es bonus (implementado en ambos)
- MOD-06 a MOD-08 son placeholders (no tienen contenido real)

### Categoría 3: EJERCICIOS POR MÓDULO

| Módulo | BD Origen | Implementación | Diferencia | Gap |
|--------|-----------|----------------|------------|-----|
| **Módulo 1** | 5 ejercicios | 5 ejercicios | 0 | ✅ OK |
| **Módulo 2** | 5 ejercicios | 5 ejercicios | 0 | ✅ OK |
| **Módulo 3** | 5 ejercicios | 5 ejercicios | 0 | ✅ OK |
| **Módulo 4** | 9 ejercicios | 3 ejercicios | -6 | 🔴 CRÍTICO |
| **Módulo 5** | 3 ejercicios | 3 ejercicios | 0 | ✅ OK |
| **TOTAL** | **27 ejercicios** | **21 ejercicios** | **-6** | **22% faltante** |

**Detalle Módulo 4 (CRÍTICO):**

**Implementados (3):**
1. ❓ Ejercicio 1 (tipo desconocido)
2. ❓ Ejercicio 2 (tipo desconocido)
3. ❓ Ejercicio 3 (tipo desconocido)

**Faltantes de BD origen (6):**
4. `infographic_interactive` - Infografía Interactiva
5. `web_search_guided` - Búsqueda Guiada Web
6. `multimodal_navigation` - Navegación Multimodal
7. `source_credibility` - Credibilidad de Fuentes
8. `graph_analysis` - Análisis de Gráficos
9. (1 ejercicio más por confirmar en BD origen)

### Categoría 4: RANGOS MAYAS

| Aspecto | BD Origen | Implementación | Requerimiento Usuario | Acción |
|---------|-----------|----------------|----------------------|--------|
| **Rango inicial** | nacom | Ajaw | Ajaw | 🔴 CONFLICTO |
| **Definición** | Todos usuarios con nacom | User_ranks con Ajaw | Empiezan con Ajaw | 🟡 DECIDIR |

**⚠️ CONFLICTO CRÍTICO:**

- **BD origen:** Usa `'nacom'` como rango inicial (línea 535-546)
- **Implementación:** Usa `'Ajaw'` como rango inicial (línea 98)
- **Usuario:** Dijo "rangos son mayas y empiezan con ajaw"

**Interpretación posible:**
- BD origen puede estar desactualizada
- El sistema de rangos cambió de `nacom` inicial a `Ajaw` inicial
- Usuario confirmó que debe ser `Ajaw`

**Recomendación:** Mantener `'Ajaw'` como está en implementación actual ✅

---

## 🚨 Discrepancias Críticas Identificadas

### DISCREPANCIA 1: Dominios de Email (CRÍTICA)

**Problema:**
- BD origen: `@glit.com`
- Implementación: `@glit.edu.mx` / `@demo.glit.edu.mx`
- Requerimiento: `@gamilit.com`

**Ninguna fuente usa el dominio correcto**

**Impacto:** CRÍTICO - Los usuarios no coinciden con ninguna fuente
**Solución:** Crear usuarios con dominio `@gamilit.com` desde cero

### DISCREPANCIA 2: Módulo 4 Incompleto (CRÍTICA)

**Problema:**
- BD origen: 9 ejercicios
- Implementación: 3 ejercicios
- Faltantes: 6 ejercicios (66%)

**Impacto:** CRÍTICO - Módulo 4 no completable
**Solución:** Migrar 6 ejercicios faltantes desde BD origen

### DISCREPANCIA 3: Contraseñas Diferentes (MEDIA)

**Problema:**
- BD origen: Glit2024!
- Implementación: Admin123! / Student123!
- Usuario mencionó: Test1234 (en validación anterior)

**Impacto:** MEDIO - Confusión en testing
**Solución:** Definir password estándar y aplicar a todos

### DISCREPANCIA 4: Cantidad de Usuarios (BAJA)

**Problema:**
- BD origen: 10 usuarios (1+2+7)
- Implementación: 5 usuarios (1+1+3)

**Impacto:** BAJO - Más usuarios para testing es positivo
**Solución:** Implementar al menos 3 usuarios principales (admin, teacher, student)

### DISCREPANCIA 5: Rango Inicial (RESUELTA)

**Problema:**
- BD origen: nacom
- Implementación: Ajaw ✅
- Usuario: Ajaw ✅

**Impacto:** NINGUNO - Implementación actual correcta
**Solución:** Mantener Ajaw (BD origen desactualizada)

---

## 📋 Plan de Corrección Pre-Aprobado

### Fase 1: Clarificaciones con Usuario (5 min)

**Preguntas críticas a confirmar:**

1. **Dominio de emails:**
   - ¿Confirmas que debe ser `@gamilit.com` (NO @glit.com ni @glit.edu.mx)?

2. **Password estándar:**
   - ¿Usar Glit2024! (BD origen) o Test1234 (mencionado antes) o crear uno nuevo?

3. **Emails específicos:**
   - ¿Prefieres `admin@gamilit.com` o `admin@test.gamilit.com`?
   - ¿Prefieres `student@gamilit.com` o `student1@gamilit.com`?

4. **Cantidad de usuarios:**
   - ¿Crear solo 3 (admin, teacher, student) o 10 como BD origen?

5. **Módulos 6-8:**
   - ¿Eliminar módulos 6-8 placeholder o mantenerlos para futuro?

### Fase 2: Migración de Usuarios (30 min)

**Basado en respuestas de Fase 1**

**Escenario A: Emails simples**
```sql
admin@gamilit.com
teacher@gamilit.com
student@gamilit.com
```

**Escenario B: Múltiples usuarios**
```sql
admin@gamilit.com
teacher1@gamilit.com
teacher2@gamilit.com
student1@gamilit.com
student2@gamilit.com
student3@gamilit.com
```

### Fase 3: Migración de Ejercicios Módulo 4 (3-4 horas)

**Origen:** `/home/isem/workspace/projects/glit/database/seed_data/03_educational_modules_seed.sql`
**Destino:** `/apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

**Ejercicios a migrar (6):**
1. Infografía Interactiva
2. Búsqueda Guiada Web
3. Navegación Multimodal
4. Credibilidad de Fuentes
5. Análisis de Gráficos
6. (Identificar el 6to en BD origen)

**Método:**
- Leer definición completa de BD origen (líneas ~1098-1702)
- Copiar estructura JSONB (config, content, solution)
- Adaptar a formato de implementación actual
- Agregar a archivo 05-exercises-module4.sql

### Fase 4: Limpieza de Módulos Placeholder (15 min)

**Opciones:**
- **A:** Eliminar módulos 6-8 de seeds
- **B:** Mantener pero marcar como `is_published = false`
- **C:** Mantener como están (no afectan funcionalidad)

### Fase 5: Verificación Final (30 min)

- ✅ Login con usuarios @gamilit.com funciona
- ✅ 5 módulos visibles (1-5)
- ✅ Módulo 4 tiene 9 ejercicios
- ✅ Todos los ejercicios completables
- ✅ Rango inicial es Ajaw
- ✅ Progresión de rangos funcional

---

## 📊 Resumen Ejecutivo

### Métricas de Alineación

| Componente | BD Origen | Implementación | Alineación | Acción |
|------------|-----------|----------------|------------|--------|
| **Usuarios** | 10 @glit.com | 5 @glit.edu.mx | 0% | 🔴 RECREAR |
| **Módulos 1-3** | 15 ejercicios | 15 ejercicios | 100% | ✅ OK |
| **Módulo 4** | 9 ejercicios | 3 ejercicios | 33% | 🔴 MIGRAR 6 |
| **Módulo 5** | 3 ejercicios | 3 ejercicios | 100% | ✅ OK |
| **Rangos** | nacom | Ajaw | ✅ (correcto) | ✅ OK |
| **TOTAL** | 27 ejercicios | 21 ejercicios | 78% | 🟡 CORREGIR |

### Tiempo Estimado Total

| Fase | Duración | Prioridad |
|------|----------|-----------|
| Clarificaciones | 5 min | P0 |
| Usuarios | 30 min | P0 |
| Ejercicios M4 | 3-4h | P0 |
| Limpieza M6-8 | 15 min | P2 |
| Verificación | 30 min | P1 |
| **TOTAL** | **4.5-5.5 horas** | |

---

## ✅ Próximos Pasos

### Paso 1: Confirmar con Usuario (AHORA)

Presentar este análisis al usuario y confirmar:
1. ¿Dominio @gamilit.com confirmado?
2. ¿Qué password usar?
3. ¿Cuántos usuarios crear?
4. ¿Qué hacer con módulos 6-8?

### Paso 2: Ejecutar Migraciones

Una vez confirmado:
1. Crear nuevos usuarios con dominio correcto
2. Migrar 6 ejercicios de Módulo 4
3. Limpiar módulos placeholder si se decide

### Paso 3: Validación Final

- Re-ejecutar validación 3-capas
- Testing manual de usuarios y módulos
- Verificar progresión completa

---

## 📁 Archivos Clave

### BD Origen
- `/home/isem/workspace/projects/glit/database/seed_data/03_educational_modules_seed.sql` (92 KB)
- `/home/isem/workspace/projects/glit/database/seed_data/04_demo_users_and_data_seed.sql` (30 KB)

### Implementación
- `/apps/database/seeds/dev/auth/01-demo-users.sql`
- `/apps/database/seeds/dev/educational_content/01-modules.sql`
- `/apps/database/seeds/dev/educational_content/05-exercises-module4.sql`
- `/apps/database/seeds/dev/gamification_system/04-initialize_user_gamification.sql`

---

**Generado por:** ATLAS-DATABASE v2.0
**Basado en:** Análisis completo de BD origen vs implementación actual
**Estado:** ✅ LISTO PARA REVISIÓN CON USUARIO
**Tiempo análisis:** ~60 minutos
**Archivos analizados:** 8 archivos clave
