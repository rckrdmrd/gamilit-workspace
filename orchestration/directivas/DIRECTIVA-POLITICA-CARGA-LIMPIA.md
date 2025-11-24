# DIRECTIVA: POLÍTICA DE CARGA LIMPIA (Clean Load Policy)

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Versión:** 1.0.0
**Fecha:** 2025-11-23
**Ámbito:** Database-Agent y todos los desarrolladores
**Tipo:** Directiva Obligatoria
**Stack:** PostgreSQL 15+ con PostGIS

---

## 🎯 PROPÓSITO

Garantizar que la base de datos pueda **recrearse completamente desde archivos DDL** en cualquier momento, sin dependencia de scripts incrementales, migrations o fixes.

Esta política establece que:
- ✅ Los **archivos DDL son la fuente de verdad**
- ✅ La **base de datos es el resultado** de ejecutar esos archivos
- ✅ Todo cambio se valida mediante **recreación completa**
- ❌ **No se usan migrations** ni scripts incrementales

---

## 📜 REGLAS OBLIGATORIAS

### 1. DDL-First Approach

**Principio:** Los archivos DDL se crean/actualizan ANTES de modificar la base de datos.

#### ✅ FLUJO CORRECTO

```
1. Crear/actualizar archivo DDL
   └─> apps/database/ddl/schemas/{schema}/{tipo}/{archivo}.sql

2. Validar sintaxis del archivo DDL
   └─> Revisar manualmente o con linter SQL

3. Ejecutar recreación completa
   └─> ./apps/database/drop-and-recreate-database.sh

4. Si funciona → Commitear archivo DDL
   └─> git add apps/database/ddl/...
   └─> git commit -m "feat(db): descripción del cambio"

5. Si falla → Corregir DDL y volver a paso 3
   └─> NO ejecutar fixes manuales en BD
   └─> Corregir archivo DDL
```

#### ❌ FLUJO PROHIBIDO

```
❌ 1. Ejecutar ALTER TABLE directamente en psql
❌ 2. "Documentar" el cambio creando archivo DDL después
❌ 3. Esperar que funcione en producción
❌ 4. Crear migration incremental para aplicar cambio
```

**Razón de prohibición:**
- La BD y el DDL quedan desincronizados
- No hay garantía de que el cambio funcione en recreación limpia
- Otros desarrolladores no pueden recrear la BD localmente
- Riesgo alto en producción (cambio no validado)

---

### 2. Prohibición de Migrations

**PROHIBIDO crear o usar:**

```yaml
❌ Carpeta migrations/:
  - apps/database/migrations/
  - Archivos estilo TypeORM/Prisma migrations
  - Archivos versionados tipo: 001-create-users.sql, 002-add-column.sql

❌ Scripts incrementales:
  - migration-*.sql
  - alter-*.sql
  - update-*.sql
  - change-*.sql

❌ Estrategia ALTER TABLE como cambio principal:
  - ALTER TABLE ... ADD COLUMN (sin actualizar DDL base)
  - ALTER TABLE ... DROP COLUMN (sin actualizar DDL base)
  - ALTER TABLE ... MODIFY COLUMN (sin actualizar DDL base)
```

#### ¿Por qué NO migrations?

**Problemas de migrations incrementales:**
1. ❌ **Orden de ejecución:** Difícil de mantener, errores si se ejecuta fuera de orden
2. ❌ **Estado de BD desconocido:** No sabes si migration ya se aplicó o no
3. ❌ **Recreación imposible:** No puedes crear BD limpia sin ejecutar todas las migrations en orden
4. ❌ **Dependencias complejas:** Migrations dependen de migrations anteriores
5. ❌ **Debugging difícil:** Difícil saber en qué migration está el problema
6. ❌ **Rollback riesgoso:** Difícil revertir migrations sin perder datos

**Ventajas de carga limpia:**
1. ✅ **Fuente de verdad clara:** DDL es el estado actual, siempre
2. ✅ **Recreación simple:** `./drop-and-recreate-database.sh` y listo
3. ✅ **Sin estado:** No importa el estado anterior de la BD
4. ✅ **Debugging fácil:** Error en recreación = DDL tiene problema
5. ✅ **Onboarding rápido:** Nuevos devs crean BD en 1 comando
6. ✅ **Testing robusto:** Tests siempre empiezan con BD limpia

---

### 3. Prohibición de Fixes y Patches

**PROHIBIDO crear:**

```yaml
❌ Archivos de corrección única (one-time scripts):
  - fix-*.sql
  - patch-*.sql
  - hotfix-*.sql
  - repair-*.sql
  - cleanup-*.sql

❌ Scripts "temporales" que se vuelven permanentes:
  - temp-fix-users.sql
  - manual-update-points.sql
  - data-correction-2025-11-23.sql
```

#### ¿Qué hacer en lugar de fix/patch?

**Escenario 1: Error en DDL**

```markdown
❌ INCORRECTO:
1. Crear fix-missing-column.sql con ALTER TABLE
2. Ejecutar fix en BD
3. "Ya funciona, no tocar"

✅ CORRECTO:
1. Identificar archivo DDL original con error
   └─> apps/database/ddl/schemas/auth_management/tables/01-users.sql
2. Corregir DDL (agregar columna faltante en CREATE TABLE)
3. Validar con recreación completa: ./drop-and-recreate-database.sh
4. Commitear DDL corregido
```

**Escenario 2: Datos incorrectos en seeds**

```markdown
❌ INCORRECTO:
1. Crear fix-seed-data.sql con UPDATE/INSERT
2. Ejecutar fix en BD
3. Dejar seed original con datos incorrectos

✅ CORRECTO:
1. Identificar archivo seed con error
   └─> apps/database/seeds/dev/auth_management/01-users.sql
2. Corregir seed (arreglar datos)
3. Validar con recreación completa: ./drop-and-recreate-database.sh
4. Commitear seed corregido
```

**Escenario 3: Error en producción**

```markdown
❌ INCORRECTO:
1. Ejecutar fix directo en BD de producción
2. "Olvidar" actualizar DDL
3. Siguiente deploy rompe porque DDL está desactualizado

✅ CORRECTO:
1. Corregir DDL en desarrollo
2. Validar con recreación completa local
3. Crear ADR documentando el cambio
4. Aplicar cambio en producción usando DDL corregido
5. Commitear DDL + ADR
```

---

### 4. Cambios en Tablas Existentes

#### ✅ PROCESO CORRECTO para Cambios

**Ejemplo: Agregar columna a tabla existente**

```bash
# 1. Actualizar DDL base (NO crear migration)
vim apps/database/ddl/schemas/auth_management/tables/01-users.sql

# Cambiar de:
CREATE TABLE auth_management.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL
);

# A:
CREATE TABLE auth_management.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone_number VARCHAR(20),  -- ← Nueva columna agregada
    phone_verified BOOLEAN DEFAULT false
);

# 2. Validar con recreación completa
cd apps/database
./drop-and-recreate-database.sh

# 3. Si funciona, commitear
git add apps/database/ddl/schemas/auth_management/tables/01-users.sql
git commit -m "feat(db): add phone_number and phone_verified to users table"

# 4. Documentar en TRAZA-TAREAS-DATABASE.md
echo "## [DB-042] Agregar verificación de teléfono
**Fecha:** 2025-11-23
**Estado:** ✅ Completado
**Cambios:**
- Agregadas columnas phone_number, phone_verified a auth_management.users
**Archivos modificados:**
- apps/database/ddl/schemas/auth_management/tables/01-users.sql
" >> orchestration/trazas/TRAZA-TAREAS-DATABASE.md
```

#### ❌ PROCESO PROHIBIDO

```bash
# ❌ NO hacer esto:
psql -d gamilit_db -c "ALTER TABLE auth_management.users ADD COLUMN phone_number VARCHAR(20);"

# ❌ NO crear migration:
echo "ALTER TABLE auth_management.users ADD COLUMN phone_number VARCHAR(20);" \
  > apps/database/migrations/002-add-phone-to-users.sql

# ❌ NO crear fix:
echo "ALTER TABLE auth_management.users ADD COLUMN phone_number VARCHAR(20);" \
  > apps/database/fix-add-phone.sql
```

---

### 5. Validación de Carga Limpia

**Regla:** TODO cambio en DDL DEBE validarse con recreación completa.

#### Comandos de Validación

```bash
# Validación básica (desarrollo)
cd apps/database
./drop-and-recreate-database.sh

# Validación completa (pre-commit)
cd apps/database
./drop-and-recreate-database.sh && \
  psql -d gamilit_platform -f scripts/validate-integrity.sql && \
  echo "✅ Carga limpia validada"

# Si falla la recreación
# → El DDL tiene un problema
# → NO ejecutar fixes manuales
# → Corregir el archivo DDL y volver a intentar
```

#### Frecuencia de Validación

```yaml
Desarrollo local:
  - Después de cada cambio en DDL
  - Antes de cada commit que toca apps/database/

CI/CD:
  - En cada pull request
  - Antes de merge a main/master
  - En cada deploy a staging/producción

Mantenimiento:
  - Recreación semanal de BD de desarrollo
  - Validación mensual de que DDL + seeds = BD completa
```

#### Checklist de Validación

```markdown
- [ ] Recreación completa ejecuta sin errores
- [ ] Todas las tablas se crean correctamente
- [ ] Todos los índices se crean
- [ ] Todas las funciones y triggers se crean
- [ ] Todas las RLS policies se aplican
- [ ] Seeds se cargan sin errores
- [ ] Integridad referencial validada (FKs)
- [ ] No hay warnings en el log de create-database.sh
```

---

### 6. Homologación BD ↔ Archivos DDL

**Principio:** Los archivos DDL son la fuente de verdad, la BD es derivada.

```yaml
Fuente de verdad:
  ✅ apps/database/ddl/schemas/**/*.sql
  ✅ apps/database/seeds/**/*.sql

Derivado (resultado de ejecutar DDL):
  ✅ Base de datos PostgreSQL real

Flujo de sincronización:
  DDL actualizado → Recreación BD → BD actualizada

Flujo PROHIBIDO:
  ❌ BD actualizada manualmente → "Documentar" en DDL después
```

#### Validación de Homologación

```bash
# ¿Cómo saber si DDL y BD están sincronizados?
# → Recrear BD completa y comparar

# 1. Backup de BD actual (por seguridad)
pg_dump gamilit_platform > /tmp/backup-before-recreation.sql

# 2. Recrear desde DDL
./drop-and-recreate-database.sh

# 3. Si recreación falla:
# → DDL y BD NO están sincronizados
# → Actualizar DDL con cambios faltantes
# → Volver a intentar recreación

# 4. Si recreación funciona:
# → DDL y BD están sincronizados ✅
```

---

## 🔧 HERRAMIENTAS Y SCRIPTS

### Scripts de Recreación

```bash
apps/database/
├── create-database.sh              # Crear BD completa desde DDL
├── drop-and-recreate-database.sh   # Drop + Create (carga limpia total)
├── reset-database.sh               # Reset a estado inicial
└── recreate-database.sh            # Alias de drop-and-recreate
```

**Uso principal:**
```bash
# Desarrollo diario
cd apps/database
./drop-and-recreate-database.sh

# Pre-commit
git add apps/database/ddl/...
./drop-and-recreate-database.sh && git commit -m "feat(db): ..."

# Validar que DDL está completo
./drop-and-recreate-database.sh && echo "✅ DDL completo"
```

### Script de Validación (Opcional)

```bash
# apps/database/scripts/validate-clean-load-policy.sh
# Validar cumplimiento de Política de Carga Limpia

#!/bin/bash
echo "🔍 Validando Política de Carga Limpia..."

# 1. Verificar que no existe carpeta migrations/
if [ -d "apps/database/migrations" ]; then
  echo "❌ ERROR: Carpeta migrations/ detectada (PROHIBIDA)"
  exit 1
fi

# 2. Verificar que no hay archivos fix-*.sql o patch-*.sql
FIXES=$(find apps/database -name "fix-*.sql" -o -name "patch-*.sql" -o -name "hotfix-*.sql")
if [ -n "$FIXES" ]; then
  echo "❌ ERROR: Archivos fix/patch detectados (PROHIBIDOS):"
  echo "$FIXES"
  exit 1
fi

# 3. Validar que recreación completa funciona
echo "🔄 Validando recreación completa..."
./apps/database/drop-and-recreate-database.sh > /tmp/clean-load-test.log 2>&1
if [ $? -ne 0 ]; then
  echo "❌ ERROR: Recreación completa falló"
  echo "Ver log: /tmp/clean-load-test.log"
  exit 1
fi

echo "✅ Política de Carga Limpia: CUMPLIDA"
exit 0
```

---

## 📊 EJEMPLOS PRÁCTICOS

### Ejemplo 1: Crear Nueva Tabla

```sql
-- ✅ CORRECTO: Crear archivo DDL primero
-- File: apps/database/ddl/schemas/gamification_system/tables/05-challenges.sql

-- ============================================================================
-- Tabla: challenges
-- Schema: gamification_system
-- Descripción: Desafíos y retos del sistema de gamificación
-- Autor: Database-Agent
-- Fecha: 2025-11-23
-- Dependencias: gamification_system.levels
-- ============================================================================

DROP TABLE IF EXISTS gamification_system.challenges CASCADE;

CREATE TABLE gamification_system.challenges (
    -- Identificador
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    -- Datos del desafío
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    difficulty VARCHAR(20) NOT NULL,
    points_reward INTEGER NOT NULL DEFAULT 0,

    -- Requisitos
    required_level_id UUID,

    -- Auditoría
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Constraints
    CONSTRAINT fk_challenges_to_levels
        FOREIGN KEY (required_level_id)
        REFERENCES gamification_system.levels(id)
        ON DELETE SET NULL,

    CONSTRAINT chk_challenges_difficulty_valid
        CHECK (difficulty IN ('easy', 'medium', 'hard', 'expert')),

    CONSTRAINT chk_challenges_points_positive
        CHECK (points_reward >= 0)
);

-- Índices
CREATE INDEX idx_challenges_difficulty ON gamification_system.challenges(difficulty);
CREATE INDEX idx_challenges_required_level_id ON gamification_system.challenges(required_level_id);

-- Comentarios
COMMENT ON TABLE gamification_system.challenges IS
'Desafíos del sistema de gamificación que los estudiantes pueden completar para ganar puntos adicionales';

COMMENT ON COLUMN gamification_system.challenges.difficulty IS
'Dificultad del desafío: easy, medium, hard, expert';
```

**Luego validar:**
```bash
cd apps/database
./drop-and-recreate-database.sh
# Si funciona → commit
git add apps/database/ddl/schemas/gamification_system/tables/05-challenges.sql
git commit -m "feat(db): add challenges table to gamification_system"
```

### Ejemplo 2: Modificar Tabla Existente

```sql
-- ✅ CORRECTO: Actualizar DDL existente (NO crear migration)
-- File: apps/database/ddl/schemas/auth_management/tables/01-users.sql

-- Cambio: Agregar columnas para autenticación de dos factores

DROP TABLE IF EXISTS auth_management.users CASCADE;

CREATE TABLE auth_management.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,

    -- ← NUEVAS COLUMNAS AGREGADAS
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(100),
    backup_codes TEXT[],
    -- ← FIN NUEVAS COLUMNAS

    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

**Validar:**
```bash
./drop-and-recreate-database.sh
# ✅ Si funciona → DDL correcto, commitear
# ❌ Si falla → Corregir DDL, no ejecutar ALTER TABLE manual
```

### Ejemplo 3: Corregir Error en Seed

```sql
-- ❌ INCORRECTO: Crear fix-seed-data.sql
-- apps/database/fix-seed-users.sql
UPDATE auth_management.users SET role = 'admin' WHERE username = 'admin';

-- ✅ CORRECTO: Corregir archivo seed original
-- apps/database/seeds/dev/auth_management/01-users.sql

INSERT INTO auth_management.users (username, email, password_hash, role)
VALUES
    ('admin', 'admin@gamilit.com', '$2b$10$...', 'admin'),  -- ← Corregir role aquí
    ('teacher1', 'teacher1@gamilit.com', '$2b$10$...', 'teacher'),
    ('student1', 'student1@gamilit.com', '$2b$10$...', 'student')
ON CONFLICT (username) DO NOTHING;
```

**Validar:**
```bash
./drop-and-recreate-database.sh
# Verificar que admin tiene role correcto desde el inicio
psql -d gamilit_platform -c "SELECT username, role FROM auth_management.users WHERE username = 'admin';"
```

---

## 🚨 CASOS ESPECIALES

### Caso 1: Migración desde Otro Sistema

**Escenario:** Importar datos desde sistema legacy.

```markdown
❌ INCORRECTO:
1. Crear migration-import-legacy.sql con INSERT masivo
2. Ejecutar una vez y "olvidar"

✅ CORRECTO:
1. Crear seed en apps/database/seeds/prod/migration/01-import-legacy.sql
2. Documentar que es importación única con comentarios
3. Incluir en create-database.sh con flag condicional
4. Mantener seed para recreaciones futuras (testing)
```

### Caso 2: Datos de Producción

**Escenario:** Necesito actualizar datos en producción.

```markdown
❌ INCORRECTO:
1. Ejecutar UPDATE directo en producción
2. No actualizar seeds

✅ CORRECTO:
1. Si es dato de configuración:
   └─> Actualizar seed en apps/database/seeds/prod/
   └─> Validar con recreación local
   └─> Aplicar seed en producción

2. Si es dato de usuario (transaccional):
   └─> NO va en seeds (datos dinámicos)
   └─> Crear script de actualización documentado
   └─> Ejecutar en producción
   └─> Archivar script como documentación (NO en seeds)
```

### Caso 3: Hotfix en Producción

**Escenario:** Bug crítico en producción que requiere cambio urgente en BD.

```markdown
❌ INCORRECTO:
1. Ejecutar ALTER TABLE directo en producción
2. "Ya funcionó, documentar después"

✅ CORRECTO (incluso en emergencia):
1. Corregir DDL localmente
2. Validar con recreación local (rápido: 2-3 min)
3. Crear ADR documentando el hotfix
4. Aplicar DDL en producción
5. Commitear DDL + ADR inmediatamente
6. Post-mortem: ¿Por qué no se detectó en testing?
```

---

## ✅ CHECKLIST DE CUMPLIMIENTO

### Para Database-Agent

Antes de completar una tarea, verificar:

```markdown
- [ ] Todos los cambios están en archivos DDL (no en BD directamente)
- [ ] NO se crearon archivos en migrations/
- [ ] NO se crearon archivos fix-*.sql o patch-*.sql
- [ ] Recreación completa funciona: ./drop-and-recreate-database.sh
- [ ] MASTER_INVENTORY.yml actualizado
- [ ] TRAZA-TAREAS-DATABASE.md actualizado
- [ ] Commits incluyen archivos DDL, no scripts temporales
```

### Para Code Reviewers

Al revisar PRs que tocan base de datos:

```markdown
- [ ] Cambios están en apps/database/ddl/, no en migrations/
- [ ] NO hay archivos fix-*.sql, patch-*.sql, hotfix-*.sql
- [ ] DDL sigue estándares (ver DIRECTIVA-DISENO-BASE-DATOS.md)
- [ ] CI/CD ejecutó recreación completa exitosamente
- [ ] TRAZA-TAREAS-DATABASE.md documenta el cambio
```

### Para Desarrolladores

Al trabajar con base de datos:

```markdown
- [ ] Leí DIRECTIVA-POLITICA-CARGA-LIMPIA.md (este documento)
- [ ] Entiendo que DDL es fuente de verdad, BD es derivada
- [ ] Sé que NO debo crear migrations/
- [ ] Sé que debo actualizar DDL antes de modificar BD
- [ ] Sé validar con ./drop-and-recreate-database.sh
```

---

## 📚 REFERENCIAS

### Documentos Relacionados

- **[PROMPT-DATABASE-AGENT.md](../prompts/PROMPT-DATABASE-AGENT.md)** - Workflow de Database-Agent
- **[DIRECTIVA-DISENO-BASE-DATOS.md](DIRECTIVA-DISENO-BASE-DATOS.md)** - Estándares de diseño
- **[ESTANDARES-NOMENCLATURA.md](ESTANDARES-NOMENCLATURA.md)** - Nomenclatura de objetos DB
- **[TRAZA-TAREAS-DATABASE.md](../trazas/TRAZA-TAREAS-DATABASE.md)** - Historial de cambios

### Scripts Importantes

```bash
apps/database/
├── create-database.sh              # Crear BD desde DDL
├── drop-and-recreate-database.sh   # Recreación completa (carga limpia)
└── reset-database.sh               # Reset a estado inicial
```

### Estructura de Archivos DDL

```bash
apps/database/ddl/
├── 00-prerequisites.sql            # Extensions, configuración
└── schemas/
    ├── auth_management/
    │   ├── 00-schema.sql
    │   ├── tables/
    │   │   ├── 01-users.sql
    │   │   └── 02-roles.sql
    │   ├── functions/
    │   └── policies/
    ├── gamification_system/
    │   └── ...
    └── educational_content/
        └── ...
```

---

## 🎓 BENEFICIOS DE ESTA POLÍTICA

### Técnicos

1. ✅ **Reproducibilidad:** BD puede recrearse en cualquier momento, en cualquier ambiente
2. ✅ **Simplicidad:** Un script (drop-and-recreate), un resultado (BD completa)
3. ✅ **Debugging:** Error en recreación = DDL tiene problema (fácil de localizar)
4. ✅ **Testing:** Tests siempre empiezan con BD limpia predecible
5. ✅ **Onboarding:** Nuevos devs tienen BD funcional en minutos

### Operacionales

1. ✅ **Disaster Recovery:** Recrear BD desde DDL es rápido y confiable
2. ✅ **Ambientes:** Dev, Staging, Prod tienen misma estructura (desde mismo DDL)
3. ✅ **Auditoría:** Git history de DDL = historia completa de cambios en BD
4. ✅ **Rollback:** Revertir commit de DDL = revertir cambio en BD
5. ✅ **Compliance:** Cambios en BD rastreables y versionados

### De Equipo

1. ✅ **Claridad:** Todo el equipo sabe dónde están los cambios (DDL)
2. ✅ **Colaboración:** Conflictos en DDL son fáciles de resolver (Git)
3. ✅ **Documentación:** DDL es documentación ejecutable y siempre actualizada
4. ✅ **Confianza:** Cambios validados con recreación = alta confianza
5. ✅ **Velocidad:** No hay "estado misterioso" de BD, siempre es predecible

---

## ⚖️ CONTRASTE: Carga Limpia vs Migrations

| Aspecto | Migrations Incrementales | Carga Limpia (Este Proyecto) |
|---------|-------------------------|------------------------------|
| **Fuente de verdad** | Estado de BD + Migrations históricas | Archivos DDL actuales |
| **Recreación** | Ejecutar todas las migrations en orden | Un script: drop-and-recreate |
| **Debugging** | Difícil (¿cuál migration falló?) | Fácil (DDL tiene el problema) |
| **Onboarding** | Complejo (ejecutar N migrations) | Simple (1 comando, BD lista) |
| **Estado de BD** | Incierto (¿migrations aplicadas?) | Siempre conocido (DDL) |
| **Rollback** | Requiere migration de rollback | Revertir commit de DDL |
| **Testing** | Difícil (estado previo incierto) | Simple (siempre BD limpia) |
| **Producción** | Riesgoso (migration puede fallar) | Confiable (validado en recreación) |

**Cuándo usar migrations:** Proyectos con datos de producción que NO pueden perderse (ej: e-commerce, banking).

**Cuándo usar carga limpia:** Proyectos educativos, startups, MVPs, sistemas donde BD puede recrearse (como GAMILIT).

---

**Versión:** 1.0.0
**Fecha:** 2025-11-23
**Próxima revisión:** Trimestral o al identificar necesidad
**Responsable:** Database-Agent + Tech Lead
**Aprobado por:** Tech Lead

---

**NOTA IMPORTANTE:**

Esta política formaliza la práctica que ya se viene aplicando exitosamente en GAMILIT. El objetivo es documentarla para prevenir desviaciones futuras y facilitar el onboarding de nuevos desarrolladores.

**Evidencia de cumplimiento histórico:**
- ✅ 45+ menciones a "Política de Carga Limpia" en `TRAZA-TAREAS-DATABASE.md`
- ✅ 0 migrations creadas en historial del proyecto
- ✅ Scripts de recreación completa (`drop-and-recreate-database.sh`) funcionando desde inicio
- ✅ 100% de cambios en BD documentados en archivos DDL
