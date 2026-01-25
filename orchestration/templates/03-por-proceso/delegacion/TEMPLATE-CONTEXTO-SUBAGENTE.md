# CONTEXTO PARA SUBAGENTE: {TAREA-ID}-SUB-{N}

**Agente Principal:** {Database-Agent | Backend-Agent | Frontend-Agent}
**Tarea Principal:** {TAREA-ID} - {Nombre de la tarea}
**Fecha:** {YYYY-MM-DD}

---

## ⚠️ INSTRUCCIONES PARA AGENTE PRINCIPAL

**Este template define el contexto MÍNIMO que debes proporcionar al subagente.**

Si omites cualquier sección, el subagente puede:
- ❌ Cometer errores por asumir valores
- ❌ Crear duplicados por no verificar correctamente
- ❌ Usar convenciones incorrectas
- ❌ Reportar trabajo incompleto

**Completa TODAS las secciones antes de lanzar el subagente.**

---

## 1. IDENTIFICACIÓN DE LA TAREA

```yaml
# Información básica del subagente
tarea_id: "{TAREA-ID}-SUB-{N}"          # ej: DB-042-SUB-001
agente_principal: "{Tu nombre}"          # ej: Database-Agent
tarea_principal: "{TAREA-ID}"            # ej: DB-042 - Crear módulo de Proyectos
subtarea: "{Descripción breve}"          # ej: Crear tabla projects
prioridad: "P0 | P1 | P2 | P3"
duracion_estimada: "{X} horas"           # ej: 1.5 horas
fecha_inicio: "{YYYY-MM-DD HH:MM}"
```

---

## 2. OBJETIVO ESPECÍFICO

### Descripción del Objetivo

```markdown
## Objetivo Principal
{Descripción clara y específica de lo que debe hacer el subagente}

Ejemplo:
Crear la tabla `projects` en el schema `gamification_system`
con soporte para geolocalización (PostGIS) y jerarquía de proyectos.
```

### Especificaciones Detalladas

**Para Database (DDL):**
```markdown
### Tabla a Crear
- **Nombre:** {nombre_tabla}
- **Schema:** {nombre_schema}
- **Descripción:** {propósito de la tabla}

### Columnas Requeridas (TODAS)
| Nombre | Tipo | Constraints | Default | Descripción |
|--------|------|-------------|---------|-------------|
| id | UUID | PK, NOT NULL | gen_random_uuid() | Identificador único |
| code | VARCHAR(50) | UNIQUE, NOT NULL | - | Código del proyecto |
| name | VARCHAR(200) | NOT NULL | - | Nombre del proyecto |
| {...} | {tipo} | {constraints} | {default} | {descripción} |

### Índices Requeridos (TODOS)
| Nombre | Columnas | Tipo | Condición |
|--------|----------|------|-----------|
| idx_{tabla}_{columna} | {columna} | BTREE | - |
| idx_{tabla}_{col1}_{col2} | {col1, col2} | BTREE | - |
| idx_{tabla}_geo | {columna_geo} | GIST | - |

### Constraints Requeridos (TODOS)
| Tipo | Nombre | Definición |
|------|--------|------------|
| FK | fk_{tabla}_to_{tabla_ref} | FOREIGN KEY ({col}) REFERENCES {schema}.{tabla}({col}) |
| CHECK | chk_{tabla}_{columna} | CHECK ({columna} IN ('valor1', 'valor2')) |

### Comentarios SQL Obligatorios
- Comentario de tabla: "{descripción completa}"
- Comentarios de columnas importantes: {lista de columnas que DEBEN tener comentario}
```

**Para Backend (Entity/Service/Controller):**
```markdown
### Entity a Crear
- **Nombre:** {NombreEntity}
- **Tabla:** {schema}.{tabla}
- **Descripción:** {propósito}

### Properties Requeridas (TODAS)
| Property | Tipo TS | Decorator TypeORM | Validaciones | Descripción |
|----------|---------|-------------------|--------------|-------------|
| id | string | @PrimaryGeneratedColumn('uuid') | - | ID único |
| code | string | @Column({ type: 'varchar', length: 50, unique: true }) | @IsNotEmpty() | Código único |
| {...} | {tipo} | {decorator} | {validaciones} | {descripción} |

### Relaciones Requeridas
| Property | Tipo | Relación | Target Entity | Cascade |
|----------|------|----------|---------------|---------|
| createdBy | UserEntity | @ManyToOne | UserEntity | false |
| developments | DevelopmentEntity[] | @OneToMany | DevelopmentEntity | true |

### Métodos Requeridos (si Service)
- {nombreMetodo}({params}): {returnType} - {descripción}
```

**Para Frontend (Componente/Página):**
```markdown
### Componente/Página a Crear
- **Nombre:** {NombreComponente}
- **Ubicación:** {ruta completa}
- **Tipo:** Page | Component | Form
- **Descripción:** {propósito}

### Props Requeridas
| Prop | Tipo | Required | Default | Descripción |
|------|------|----------|---------|-------------|
| {nombre} | {tipo} | ✅ | - | {descripción} |

### State Requerido (si es Page)
- {variable}: {tipo} - {descripción}

### API Endpoints que Consume
- GET {endpoint} - {descripción}
- POST {endpoint} - {descripción}

### Componentes que Usa
- {Componente1} - {propósito}
- {Componente2} - {propósito}
```

---

## 3. UBICACIÓN DE ARCHIVOS

### Archivo(s) a Crear

```markdown
**OBLIGATORIO - Ubicaciones EXACTAS:**

1. **Archivo principal:**
   - Ruta COMPLETA: `{ruta completa desde raíz}`
   - Nombre EXACTO: `{nombre del archivo}`
   - Ejemplo: `apps/database/ddl/schemas/gamification_system/tables/01-user_points.sql`

2. **Archivos adicionales** (si aplica):
   - Ruta: `{ruta}`
   - Nombre: `{nombre}`

❌ PROHIBIDO crear en otras ubicaciones
❌ PROHIBIDO cambiar nombres de archivos
```

### Archivos a Modificar (si aplica)

```markdown
**Si debes MODIFICAR archivos existentes:**

1. **Archivo:**
   - Ruta: `{ruta completa}`
   - Modificación: {descripción de qué modificar}
   - Ejemplo: Agregar constante `PROJECTS: 'user_points'` en DB_TABLES.PROJECT_MANAGEMENT

❌ NO modificar archivos no especificados
```

---

## 4. ARCHIVOS DE REFERENCIA

### Templates Obligatorios

```markdown
**Debes CONSULTAR estos archivos antes de empezar:**

1. **Template principal:**
   - Archivo: `{ruta del template}`
   - Usar como: {plantilla de estructura | referencia de formato | ejemplo de patrón}
   - Ejemplo: `apps/database/ddl/schemas/auth_management/tables/01-users.sql`

2. **Template secundario:**
   - Archivo: `{ruta}`
   - Usar como: {propósito}

**Objetivo:** Mantener consistencia de formato y convenciones.
```

### Inventarios a Consultar

```markdown
**Verificación OBLIGATORIA de anti-duplicación:**

1. **Inventario maestro:**
   - Archivo: `orchestration/inventarios/MASTER_INVENTORY.yml`
   - Buscar: `{palabra clave}`
   - Resultado esperado: NO ENCONTRADO

2. **Inventario específico:**
   - Archivo: `orchestration/inventarios/{TIPO}_INVENTORY.yml`
   - Buscar: `{palabra clave}`
   - Resultado esperado: NO ENCONTRADO

**Acción si ENCONTRADO:** DETENER y reportar duplicación.
```

### Documentación del Proyecto

```markdown
**Contexto del módulo/feature:**

1. **MVP-APP.md:**
   - Sección: {número y nombre de sección}
   - Página/líneas: {referencia}
   - Información relevante: {resumen de lo que debe leer}

2. **ADR (si aplica):**
   - Archivo: `docs/97-adr/ADR-{XXX}-{tema}.md`
   - Decisiones relevantes: {lista}

3. **Requerimiento (si aplica):**
   - Archivo: `docs/01-requerimientos/{archivo}.md`
   - Criterios de aceptación: {lista}
```

### Estándares y Convenciones

```markdown
**Documentos de estándares:**

1. **Estándares de nomenclatura:**
   - Archivo: `orchestration/directivas/ESTANDARES-NOMENCLATURA.md`
   - Sección relevante: {sección específica}

2. **Prompt de agentes:**
   - Archivo: `orchestration/prompts/PROMPT-AGENTES-PRINCIPALES.md`
   - Sección: {sección con estándares de código}
```

---

## 5. RESTRICCIONES Y REGLAS

### Nomenclatura OBLIGATORIA

```markdown
**Nombres que DEBES usar (NO cambiar):**

**Archivos:**
- Nombre: `{nombre exacto}` (ej: `01-user_points.sql`)
- Patrón: {patrón si aplica} (ej: prefijo numérico secuencial)

**Objetos de código:**
- Tabla/Entity/Componente: `{nombre exacto}` (ej: `projects`, `ProjectEntity`, `ProjectsPage`)
- Convención: {snake_case | PascalCase | camelCase}

**Elementos internos:**
- Índices: `idx_{tabla}_{columna}`
- Constraints: `fk_{tabla}_to_{tabla_ref}` o `chk_{tabla}_{columna}`
- Variables: {convención específica}

❌ NO usar otros nombres
❌ NO cambiar convenciones
```

### Restricciones Técnicas

```markdown
**Requisitos técnicos:**

1. **Tipos de datos:**
   - {Campo}: DEBE ser {tipo específico}
   - Razón: {justificación}

2. **Validaciones:**
   - {Campo}: DEBE validar {validación}
   - Implementar con: {mecanismo}

3. **Performance:**
   - Índices obligatorios: {lista}
   - Optimizaciones: {lista}
```

### Prohibiciones ABSOLUTAS

```markdown
❌ **PROHIBIDO:**

1. Crear carpetas `orchestration/` dentro de `apps/`, `docs/` u otras ubicaciones
2. Modificar archivos no especificados en este contexto
3. Agregar columnas/properties no solicitadas
4. Omitir índices/validaciones especificadas
5. Cambiar nombres de archivos/objetos
6. Asumir valores no especificados (PREGUNTAR si falta algo)
7. Reportar sin validar localmente
8. Omitir actualización de inventarios
```

---

## 6. CRITERIOS DE ACEPTACIÓN

### Checklist de Validación

```markdown
**El Agente Principal validará lo siguiente:**

**Archivos:**
- [ ] Archivo creado en ubicación EXACTA especificada
- [ ] Nombre de archivo EXACTO
- [ ] Formato consistente con template de referencia

**Especificaciones:**
- [ ] TODAS las columnas/properties especificadas implementadas
- [ ] TODOS los índices creados
- [ ] TODOS los constraints aplicados
- [ ] Tipos de datos EXACTOS
- [ ] Validaciones implementadas

**Código:**
- [ ] Sintaxis válida (compila/ejecuta sin errores)
- [ ] Comentarios/JSDoc incluidos
- [ ] Convenciones seguidas al 100%

**Documentación:**
- [ ] Inventario actualizado correctamente
- [ ] Traza documentada
- [ ] Reporte generado

**Anti-Duplicación:**
- [ ] NO se crearon objetos duplicados
- [ ] Verificación documentada en reporte

**Si CUALQUIERA falla:** Trabajo rechazado, requiere corrección.
```

### Pruebas que Debes Ejecutar

```markdown
**Validaciones OBLIGATORIAS antes de reportar:**

**Database:**
```bash
# 1. Compilación
psql $DATABASE_URL -f {archivo.sql}
# Resultado esperado: Sin errores

# 2. Estructura
psql $DATABASE_URL -c "\d {schema}.{tabla}"
# Verificar: {N} columnas, {M} índices

# 3. Prueba de insert
psql $DATABASE_URL -c "INSERT INTO {schema}.{tabla} (...) VALUES (...);"
# Resultado esperado: Exitoso

# 4. Validación de constraints
{comando para probar constraint}
# Resultado esperado: Error esperado (constraint funciona)
```

**Backend:**
```bash
# 1. Compilación TypeScript
npm run build
# Resultado esperado: Exitoso sin errores

# 2. Lint
npm run lint
# Resultado esperado: Sin errores críticos
```

**Frontend:**
```bash
# 1. Compilación
npm run build
# Resultado esperado: Exitoso

# 2. Renderizado (desarrollo)
npm run dev
# Verificar: Componente renderiza sin errores en consola
```

**Resultado:** Documentar en reporte con outputs.
```

---

## 7. INFORMACIÓN ADICIONAL

### Dependencias

```markdown
**Esta tarea depende de:**

1. **Tarea:** {TAREA-ID}
   - Estado actual: ✅ Completado | 🔄 En Progreso | ⏳ Pendiente
   - Artefacto necesario: {archivo/objeto específico}
   - Si NO completado: {acción a tomar}

**Esta tarea bloquea:**

1. **Tarea:** {TAREA-ID}
   - Razón: {descripción}
```

### Contexto de Negocio

```markdown
**Propósito de esta subtarea en el contexto del módulo:**

{Explicación de por qué es importante esta tarea}

**Ejemplo:**
La tabla `projects` es el nivel superior de la jerarquía de obra
(Proyecto > Desarrollo > Fase > Vivienda) y es fundamental porque
el 80% de los demás módulos (presupuestos, contratos, compras, avances)
dependen de ella.
```

### Notas Especiales

```markdown
**Consideraciones especiales:**

1. {Nota especial 1}
2. {Nota especial 2}

**Ejemplo:**
- La columna `coordinates` usa PostGIS GEOGRAPHY, no GEOMETRY
- El CHECK constraint de `status` debe permitir exactamente 5 valores
- La relación con `users` debe ser ON DELETE SET NULL, no CASCADE
```

---

## 8. TIEMPO Y PRIORIDAD

### Estimación

```markdown
**Tiempo estimado:** {X} horas

**Desglose:**
- Verificación contexto: {X} min
- Anti-duplicación: {Y} min
- Consulta referencias: {Z} min
- Desarrollo: {W} min
- Validación: {V} min
- Documentación: {U} min

**Total:** {suma} = {X} horas
```

### Prioridad

```markdown
**Prioridad:** P0 | P1 | P2 | P3

**Urgencia:** {Alta | Media | Baja}

**Razón de prioridad:**
{Explicación de por qué es P0/P1/P2/P3}
```

---

## 9. REPORTAR RESULTADOS

### Formato de Reporte

```markdown
**Al terminar, genera reporte en:**
`orchestration/agentes/{grupo}/{TAREA-ID}/03-SUBAGENTES/REPORTE-SUB-{N}.md`

**Contenido OBLIGATORIO del reporte:**

1. ✅ Resumen ejecutivo (completado/error/con warnings)
2. ✅ Archivos generados (rutas completas)
3. ✅ Especificaciones implementadas (tabla comparativa)
4. ✅ Validaciones realizadas (con outputs)
5. ✅ Convenciones seguidas (checklist)
6. ✅ Anti-duplicación verificada (comandos ejecutados)
7. ✅ Problemas encontrados (si los hay)
8. ✅ Tiempo real vs estimado
9. ✅ Solicitud de validación al Agente Principal

**Template:** Ver PROMPT-SUBAGENTES.md sección "Paso 8"
```

### Comunicación con Agente Principal

```markdown
**Situaciones que requieren comunicación INMEDIATA:**

1. ⚠️ **Duplicación detectada:**
   - Detener trabajo
   - Reportar duplicación encontrada
   - Esperar instrucciones

2. ⚠️ **Contexto insuficiente:**
   - Detener trabajo
   - Listar preguntas específicas
   - Esperar clarificación

3. ⚠️ **Error no resuelto:**
   - Intentar corrección (máx 2 intentos)
   - Si persiste, reportar error completo
   - Solicitar asistencia

4. ⚠️ **Contradicción en referencias:**
   - Detener trabajo
   - Reportar contradicción
   - Solicitar clarificación

**NO continuar hasta recibir respuesta del Agente Principal.**
```

---

## 10. CHECKLIST PARA AGENTE PRINCIPAL

### Antes de Lanzar Subagente

```markdown
**Verifica que proporcionaste:**

- [ ] Identificación completa (IDs, nombres, fechas)
- [ ] Objetivo específico detallado
- [ ] TODAS las especificaciones (columnas, tipos, validaciones, etc.)
- [ ] Ubicación EXACTA de archivos
- [ ] Archivos de referencia (templates, inventarios, docs)
- [ ] Restricciones y reglas claras
- [ ] Nomenclatura EXACTA a usar
- [ ] Criterios de aceptación completos
- [ ] Pruebas que debe ejecutar
- [ ] Dependencias identificadas
- [ ] Contexto de negocio explicado
- [ ] Estimación de tiempo

**Si falta CUALQUIER elemento:** Completar antes de lanzar.
```

---

## 📚 REFERENCIAS

- [PROMPT-SUBAGENTES.md](../prompts/PROMPT-SUBAGENTES.md) - Prompt completo para subagentes
- [DIRECTIVA-VALIDACION-SUBAGENTES.md](../directivas/DIRECTIVA-VALIDACION-SUBAGENTES.md) - Proceso de validación
- [ESTANDARES-NOMENCLATURA.md](../directivas/ESTANDARES-NOMENCLATURA.md) - Convenciones de nombres

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-17
**Uso:** Agentes principales al lanzar subagentes
