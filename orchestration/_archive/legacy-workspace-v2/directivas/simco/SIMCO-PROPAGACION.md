# SIMCO: PROPAGACIÓN DE DOCUMENTACIÓN

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** Todos los agentes al completar tareas
**Prioridad:** OBLIGATORIA - Ejecutar DESPUÉS de cada tarea completada
**Prerequisito:** SIMCO-NIVELES.md (identificación de nivel)

---

## RESUMEN EJECUTIVO

> **Toda tarea completada DEBE propagar su documentación hacia niveles superiores.**
> Propagación incompleta = referencias rotas, inventarios desactualizados, trazabilidad perdida.
> La tarea NO está completa hasta que la propagación esté verificada.

---

## PRINCIPIO DE PROPAGACIÓN

```
╔══════════════════════════════════════════════════════════════════════╗
║  FLUJO DE PROPAGACIÓN: Siempre de ABAJO hacia ARRIBA                 ║
║                                                                       ║
║  Vertical → Suite → Workspace                                         ║
║  Suite Core → Suite → Workspace                                       ║
║  Standalone → Workspace                                               ║
║  Core → Workspace                                                     ║
║  Catálogo → Core → Workspace                                          ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## MATRIZ DE PROPAGACIÓN

### Por Nivel de Origen

| Nivel Origen | Propaga a Nivel 1 | Propaga a Nivel 2 | Propaga a Nivel 3 |
|--------------|-------------------|-------------------|-------------------|
| 2B.2 VERTICAL | 2B SUITE | 0 WORKSPACE | - |
| 2B.1 SUITE-CORE | 2B SUITE | 0 WORKSPACE | - |
| 2B SUITE | 0 WORKSPACE | - | - |
| 2A STANDALONE | 0 WORKSPACE | - | - |
| 1 CORE | 0 WORKSPACE | - | - |
| 3 CATÁLOGO | 1 CORE | 0 WORKSPACE | - |

### Qué Propagar

```yaml
PROPAGACION_CONTENIDO:
  inventario:
    tipo: "REFERENCIA"
    contenido: "Puntero al artefacto, NO duplicar contenido"
    ejemplo: "ref: verticals/construccion/backend/entities/Obra.entity.ts"

  traza:
    tipo: "RESUMEN"
    contenido: "Entrada resumida de la tarea completada"
    ejemplo: "[2025-12-08] Vertical:Construccion - Creada entity Obra"

  status:
    tipo: "ACTUALIZACIÓN"
    contenido: "Cambiar estado del componente/módulo"
    ejemplo: "construccion.backend.entities: UPDATED"

  indice:
    tipo: "ENTRADA"
    contenido: "Agregar a índices si es artefacto nuevo"
    ejemplo: "Nueva entrada en VERTICALES-INDEX.yml"
```

---

## PROTOCOLO DE PROPAGACIÓN

### Fase 1: Documentar en Nivel Actual

```yaml
PASO_1_DOCUMENTAR_LOCAL:
  ubicacion: "{ORCHESTRATION_PATH del nivel actual}"

  acciones:
    - actualizar_inventario:
        archivo: "{INVENTORY}.yml"
        contenido: "Artefacto completo con todos los campos"

    - registrar_traza:
        archivo: "trazas/TRAZA-TAREAS-{CAPA}.md"
        contenido: "Entrada completa con fecha, descripción, archivos"

    - actualizar_proxima_accion:
        archivo: "PROXIMA-ACCION.md"
        contenido: "Si hay siguiente paso, documentarlo"

  validacion:
    - [ ] Inventario actualizado
    - [ ] Traza registrada
    - [ ] Sin errores de formato
```

### Fase 2: Propagar a Niveles Superiores

```yaml
PASO_2_PROPAGAR:
  para_cada_nivel_en: "PROPAGATE_TO"

  acciones:
    - agregar_referencia:
        archivo: "{nivel_superior}/inventarios/{INVENTORY}.yml"
        tipo: "referencia"
        contenido: |
          - ref: "{ruta_relativa_al_artefacto}"
            nivel: "{nivel_origen}"
            fecha: "{fecha}"
            estado: "NUEVO|MODIFICADO"

    - actualizar_status:
        archivo: "{nivel_superior}/inventarios/STATUS.yml"
        contenido: "Marcar componente como actualizado"

    - registrar_en_traza:
        archivo: "{nivel_superior}/trazas/TRAZA-{tipo}.md"
        contenido: |
          ## [{fecha}] Propagación desde {nivel_origen}
          - **Origen:** {ruta_completa}
          - **Artefacto:** {nombre}
          - **Acción:** {CREAR|MODIFICAR|ELIMINAR}

  validacion:
    - [ ] Todas las referencias agregadas
    - [ ] Status actualizados
    - [ ] Trazas registradas
```

### Fase 3: Verificar Coherencia

```yaml
PASO_3_VERIFICAR:
  acciones:
    - verificar_referencias:
        comando: "Validar que todas las refs apuntan a archivos existentes"

    - verificar_indices:
        comando: "Validar que índices incluyen nuevos artefactos"

    - verificar_status:
        comando: "Validar que status reflejan cambios"

  si_hay_error:
    - Corregir inmediatamente
    - NO marcar tarea como completa hasta resolver
```

---

## TEMPLATES DE PROPAGACIÓN

### Template: Referencia en Inventario Superior

```yaml
# En {nivel_superior}/inventarios/REFERENCIAS.yml

referencias_desde_{nivel_origen}:
  - id: "{uuid o identificador}"
    ruta: "{ruta_relativa_completa}"
    tipo: "{entity|service|component|table|etc}"
    nivel_origen: "{NIVEL_X}"
    fecha_creacion: "{YYYY-MM-DD}"
    fecha_modificacion: "{YYYY-MM-DD}"
    estado: "{ACTIVO|DEPRECADO}"
    descripcion: "{breve descripción}"
```

### Template: Entrada en Traza Superior

```markdown
## [{YYYY-MM-DD HH:MM}] Propagación: {Nivel Origen}

### Origen
- **Nivel:** {NIVEL_X}
- **Ruta:** `{ruta_completa}`
- **Proyecto/Vertical:** {nombre}

### Cambio
- **Tipo:** {CREAR|MODIFICAR|ELIMINAR}
- **Artefacto:** {nombre del artefacto}
- **Capa:** {DATABASE|BACKEND|FRONTEND}

### Impacto
- **Dependencias afectadas:** {lista o "ninguna"}
- **Requiere acción en otros niveles:** {sí/no}

### Referencias
- Inventario local: `{ruta_inventario_origen}`
- Traza local: `{ruta_traza_origen}`
```

### Template: Actualización de Status

```yaml
# En {nivel_superior}/inventarios/STATUS.yml

componentes:
  {nombre_componente}:
    nivel: "{NIVEL_X}"
    ultima_modificacion: "{YYYY-MM-DD}"
    modificado_por: "{agente}"
    estado: "{ESTABLE|EN_DESARROLLO|DEPRECADO}"
    artefactos_recientes:
      - "{artefacto_1}"
      - "{artefacto_2}"
```

---

## CASOS DE PROPAGACIÓN

### Caso 1: Crear Entity en Vertical

```yaml
ESCENARIO:
  nivel: "2B.2 VERTICAL (construccion)"
  accion: "Crear Obra.entity.ts"
  ruta: "projects/nexus-erp-suite/verticals/construccion/backend/src/modules/obra/entities/Obra.entity.ts"

PROPAGACION:
  paso_1_local:
    archivo: "verticals/construccion/orchestration/inventarios/BACKEND_INVENTORY.yml"
    contenido: |
      entities:
        - name: Obra
          file: src/modules/obra/entities/Obra.entity.ts
          table: obra.obras
          created: 2025-12-08
          status: NUEVO

  paso_2_suite:
    archivo: "projects/nexus-erp-suite/orchestration/inventarios/REFERENCIAS.yml"
    contenido: |
      referencias_verticales:
        construccion:
          backend:
            entities:
              - ref: verticals/construccion/backend/src/modules/obra/entities/Obra.entity.ts
                nombre: Obra
                fecha: 2025-12-08

  paso_3_workspace:
    archivo: "orchestration/WORKSPACE-STATUS.md"
    contenido: |
      ## Actividad Reciente
      - [2025-12-08] nexus-erp-suite/construccion: Nueva entity Obra
```

### Caso 2: Modificar Funcionalidad del Catálogo

```yaml
ESCENARIO:
  nivel: "3 CATÁLOGO"
  accion: "Actualizar auth module"
  ruta: "shared/catalog/functionalities/auth/"

PROPAGACION:
  paso_1_local:
    archivo: "shared/catalog/functionalities/auth/orchestration/CHANGELOG.md"
    contenido: "Detalle de cambios"

  paso_2_core:
    archivo: "core/orchestration/inventarios/CATALOG_STATUS.yml"
    contenido: |
      functionalities:
        auth:
          version: "1.2.0"
          ultima_modificacion: 2025-12-08
          cambios: "Descripción breve"

  paso_3_workspace:
    archivo: "orchestration/WORKSPACE-STATUS.md"
    contenido: |
      ## Catálogo Actualizado
      - [2025-12-08] shared/catalog/auth: Actualizado a v1.2.0

  paso_4_notificar_consumidores:
    # Proyectos que usan auth deben ser notificados
    consultar: "shared/catalog/functionalities/auth/orchestration/CONSUMIDORES.yml"
    accion: "Agregar nota de actualización disponible"
```

### Caso 3: Crear Tabla en Suite Core

```yaml
ESCENARIO:
  nivel: "2B.1 SUITE-CORE"
  accion: "Crear tabla shared.audit_logs"
  ruta: "projects/nexus-erp-suite/core/database/ddl/schemas/shared/tables/01-audit_logs.sql"

PROPAGACION:
  paso_1_local:
    archivo: "projects/nexus-erp-suite/core/orchestration/inventarios/DATABASE_INVENTORY.yml"
    contenido: |
      tables:
        shared:
          - name: audit_logs
            file: ddl/schemas/shared/tables/01-audit_logs.sql
            created: 2025-12-08

  paso_2_suite:
    archivo: "projects/nexus-erp-suite/orchestration/inventarios/SUITE_MASTER_INVENTORY.yml"
    contenido: |
      core:
        database:
          tablas_nuevas:
            - shared.audit_logs (2025-12-08)

  paso_3_notificar_verticales:
    # Tabla compartida, verticales pueden usarla
    archivo: "projects/nexus-erp-suite/orchestration/trazas/TRAZA-SUITE.md"
    contenido: |
      ## [2025-12-08] Nueva tabla compartida disponible
      - **Tabla:** shared.audit_logs
      - **Uso:** Disponible para todos los verticales
      - **Documentación:** core/database/docs/audit_logs.md
```

---

## VALIDACIÓN POST-PROPAGACIÓN

### Checklist de Verificación

```markdown
## Validación de Propagación - {Tarea}

### Nivel Local ({NIVEL_X})
- [ ] Inventario actualizado con artefacto completo
- [ ] Traza registrada con todos los detalles
- [ ] PROXIMA-ACCION actualizado (si aplica)

### Nivel Superior 1 ({NIVEL_Y})
- [ ] Referencia agregada en inventario
- [ ] Status actualizado
- [ ] Traza con entrada de propagación

### Nivel Superior 2 ({NIVEL_Z}) - si aplica
- [ ] Referencia agregada
- [ ] Status actualizado
- [ ] Traza registrada

### Workspace (NIVEL_0)
- [ ] WORKSPACE-STATUS.md actualizado
- [ ] Índice de proyectos actualizado (si es nuevo)

### Coherencia
- [ ] Todas las referencias apuntan a archivos existentes
- [ ] No hay referencias duplicadas
- [ ] Fechas consistentes entre niveles
- [ ] Estados coherentes (NUEVO en todos o MODIFICADO en todos)
```

---

## ERRORES COMUNES

| Error | Causa | Solución |
|-------|-------|----------|
| Referencia rota | Ruta mal calculada | Usar rutas relativas desde nivel superior |
| Duplicación de contenido | Copiar en vez de referenciar | Solo REFERENCIAS en niveles superiores |
| Propagación parcial | Olvidó un nivel | Verificar PROPAGATE_TO completo |
| Fechas inconsistentes | Copiar fecha antigua | Usar fecha actual de propagación |
| Status desincronizado | No actualizó todos los niveles | Ejecutar validación post-propagación |

---

## AUTOMATIZACIÓN (Futuro)

```yaml
# Concepto para script de propagación automática

propagacion_automatica:
  trigger: "Al completar tarea"
  input:
    - nivel_actual
    - artefacto_creado
    - tipo_cambio

  proceso:
    1. Identificar PROPAGATE_TO
    2. Generar entradas de referencia
    3. Actualizar inventarios
    4. Registrar trazas
    5. Validar coherencia

  output:
    - Reporte de propagación
    - Lista de verificación
```

---

## INTEGRACIÓN CON OTROS SIMCO

### Con SIMCO-NIVELES

```yaml
# SIMCO-NIVELES identifica el nivel
# SIMCO-PROPAGACION usa esa información

flujo:
  1. SIMCO-NIVELES → nivel_actual, PROPAGATE_TO
  2. Ejecutar tarea
  3. SIMCO-PROPAGACION → documentar y propagar
```

### Con SIMCO-VALIDAR

```yaml
# Incluir propagación en validación final

validacion_extendida:
  - Validación técnica (build, lint)
  - Validación de documentación local
  - Validación de propagación (NUEVO)
```

---

## REFERENCIAS

- **Niveles:** `SIMCO-NIVELES.md`
- **Validación:** `SIMCO-VALIDAR.md`
- **Templates:** `templates/PROPAGACION-*.md`

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Directiva de Propagación
