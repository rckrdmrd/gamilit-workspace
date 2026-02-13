# Prompts Fase 1: Analisis y Validacion

**Version:** 1.0.0
**Fecha:** 2026-02-03
**Total Prompts:** 18

---

## Nivel 2: Validacion por Dominio (@DB_DOMAIN_AGENT)

### PROMPT-F1-N2-001: Dominio Core

```yaml
prompt_id: "PROMPT-F1-N2-001"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio core (system, config)"
contexto_enviado:
  - "database/ddl/01_core/*.sql"
  - "ESTANDAR-DATABASE-PROFESIONAL.md"
  - "Naming conventions del proyecto"
prompt_texto: |
  ANALIZA el dominio CORE del DDL de gamilit_platform.

  ARCHIVOS A REVISAR:
  - 01_core/01_extensions.sql
  - 01_core/02_schemas.sql
  - 01_core/03_enums.sql
  - 01_core/04_system_tables.sql
  - 01_core/05_config_tables.sql

  VERIFICA:
  1. Extensiones necesarias (uuid-ossp, pgcrypto, etc.)
  2. Schemas definidos correctamente
  3. ENUMs con valores completos
  4. Tablas de sistema con campos audit
  5. Tablas de configuracion con valores default

  REPORTA hallazgos en formato:
  - [CRITICO] Problema bloqueante
  - [ALTO] Problema importante
  - [MEDIO] Mejora recomendada
  - [BAJO] Sugerencia opcional

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-CORE-DOMAIN.md"
  hallazgos:
    - criticos: 2
    - altos: 5
    - medios: 8
    - bajos: 3
tiempo_estimado: "15m"
tokens_estimados: 3500
```

---

### PROMPT-F1-N2-002: Dominio IAM

```yaml
prompt_id: "PROMPT-F1-N2-002"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio IAM (users, roles, permissions)"
contexto_enviado:
  - "database/ddl/02_iam/*.sql"
  - "Modelo de permisos RBAC"
  - "Requerimientos de autenticacion"
prompt_texto: |
  ANALIZA el dominio IAM del DDL de gamilit_platform.

  ARCHIVOS A REVISAR:
  - 02_iam/01_users.sql
  - 02_iam/02_roles.sql
  - 02_iam/03_permissions.sql
  - 02_iam/04_user_roles.sql
  - 02_iam/05_sessions.sql

  VERIFICA:
  1. Tabla users con campos obligatorios (email, password_hash, etc.)
  2. Sistema RBAC completo (roles, permissions, user_roles)
  3. Soporte multi-tenant si aplica
  4. Campos de audit en todas las tablas
  5. Indices para queries frecuentes

  PATRON ESPERADO:
  - users -> user_roles -> roles -> role_permissions -> permissions

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-IAM-DOMAIN.md"
  hallazgos:
    - criticos: 1
    - altos: 3
    - medios: 6
    - bajos: 4
tiempo_estimado: "12m"
tokens_estimados: 3200
```

---

### PROMPT-F1-N2-003: Dominio Social

```yaml
prompt_id: "PROMPT-F1-N2-003"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio social (posts, comments, reactions)"
contexto_enviado:
  - "database/ddl/03_social/*.sql"
  - "Funcionalidades de red social"
  - "Modelo de interacciones"
prompt_texto: |
  ANALIZA el dominio SOCIAL del DDL de gamilit_platform.

  TABLAS ESPERADAS:
  - posts (publicaciones)
  - comments (comentarios)
  - reactions (reacciones/likes)
  - shares (compartidos)
  - mentions (menciones)
  - hashtags (etiquetas)

  VERIFICA:
  1. Relaciones user -> posts
  2. Comentarios anidados (self-reference)
  3. Sistema de reacciones flexible
  4. Contadores denormalizados (performance)
  5. Soft delete en todas las tablas

  DETECTA:
  - Tablas faltantes
  - FK sin definir
  - Campos sin tipo correcto

resultado:
  estado: "parcial"
  archivos_generados:
    - "FINDINGS-SOCIAL-DOMAIN.md"
  hallazgos:
    - criticos: 4
    - altos: 7
    - medios: 5
    - bajos: 2
tiempo_estimado: "18m"
tokens_estimados: 4000
```

---

### PROMPT-F1-N2-004: Dominio Marketplace

```yaml
prompt_id: "PROMPT-F1-N2-004"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio marketplace"
contexto_enviado:
  - "database/ddl/04_marketplace/*.sql"
  - "Funcionalidades de e-commerce"
prompt_texto: |
  ANALIZA el dominio MARKETPLACE del DDL.

  TABLAS ESPERADAS:
  - products, product_categories
  - orders, order_items
  - carts, cart_items
  - payments, transactions
  - reviews, ratings

  VERIFICA integridad de modelo e-commerce.

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-MARKETPLACE-DOMAIN.md"
  hallazgos:
    - criticos: 0
    - altos: 4
    - medios: 6
    - bajos: 5
tiempo_estimado: "15m"
tokens_estimados: 3500
```

---

### PROMPT-F1-N2-005: Dominio Messaging

```yaml
prompt_id: "PROMPT-F1-N2-005"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio messaging"
contexto_enviado:
  - "database/ddl/05_messaging/*.sql"
  - "Funcionalidades de chat"
prompt_texto: |
  ANALIZA el dominio MESSAGING del DDL.

  TABLAS ESPERADAS:
  - conversations
  - conversation_participants
  - messages
  - message_attachments
  - message_reads

  VERIFICA modelo de chat 1-1 y grupal.

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-MESSAGING-DOMAIN.md"
  hallazgos:
    - criticos: 1
    - altos: 2
    - medios: 4
    - bajos: 3
tiempo_estimado: "10m"
tokens_estimados: 2800
```

---

### PROMPT-F1-N2-006: Dominio Content

```yaml
prompt_id: "PROMPT-F1-N2-006"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio content/media"
contexto_enviado:
  - "database/ddl/06_content/*.sql"
  - "Sistema de archivos y media"
prompt_texto: |
  ANALIZA el dominio CONTENT del DDL.

  TABLAS ESPERADAS:
  - media_files
  - media_metadata
  - albums, album_items
  - file_storage_providers

  VERIFICA gestion de archivos multimedia.

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-CONTENT-DOMAIN.md"
  hallazgos:
    - criticos: 0
    - altos: 3
    - medios: 5
    - bajos: 4
tiempo_estimado: "10m"
tokens_estimados: 2500
```

---

### PROMPT-F1-N2-007: Dominio Gamification

```yaml
prompt_id: "PROMPT-F1-N2-007"
agente: "@DB_DOMAIN_AGENT"
objetivo: "Validar estructura DDL del dominio gamification"
contexto_enviado:
  - "database/ddl/07_gamification/*.sql"
  - "Sistema de logros y recompensas"
prompt_texto: |
  ANALIZA el dominio GAMIFICATION del DDL.

  TABLAS ESPERADAS:
  - achievements, user_achievements
  - badges, user_badges
  - points, point_transactions
  - levels, user_levels
  - rewards, reward_redemptions

  VERIFICA sistema de gamificacion completo.

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-GAMIFICATION-DOMAIN.md"
  hallazgos:
    - criticos: 0
    - altos: 2
    - medios: 7
    - bajos: 6
tiempo_estimado: "12m"
tokens_estimados: 3000
```

---

## Nivel 3: Coherencia Entre Capas (@COHERENCE_VALIDATOR_AGENT)

### PROMPT-F1-N3-001: DDL vs Backend Entities

```yaml
prompt_id: "PROMPT-F1-N3-001"
agente: "@COHERENCE_VALIDATOR_AGENT"
objetivo: "Validar coherencia entre tablas DDL y entities NestJS"
contexto_enviado:
  - "database/ddl/**/*.sql"
  - "backend/src/**/entities/*.entity.ts"
  - "TypeORM configuration"
prompt_texto: |
  COMPARA DDL con Backend Entities.

  PARA CADA TABLA DDL:
  1. Verificar existe entity correspondiente
  2. Comparar campos (nombre, tipo, nullable)
  3. Verificar relaciones (@ManyToOne, @OneToMany)
  4. Detectar campos en DDL sin entity
  5. Detectar campos en entity sin DDL

  GENERA matriz de coherencia:
  | Tabla DDL | Entity | Match % | Gaps |

  PRIORIZA por criticidad de gaps.

resultado:
  estado: "exito"
  archivos_generados:
    - "COHERENCE-DDL-BACKEND.md"
    - "GAPS-DDL-BACKEND.yml"
  hallazgos:
    - tablas_sin_entity: 12
    - campos_desincronizados: 34
    - relaciones_faltantes: 8
tiempo_estimado: "25m"
tokens_estimados: 5500
```

---

### PROMPT-F1-N3-002: Backend vs Services

```yaml
prompt_id: "PROMPT-F1-N3-002"
agente: "@COHERENCE_VALIDATOR_AGENT"
objetivo: "Validar coherencia entre entities y services"
contexto_enviado:
  - "backend/src/**/entities/*.entity.ts"
  - "backend/src/**/services/*.service.ts"
prompt_texto: |
  COMPARA Entities con Services.

  PARA CADA ENTITY:
  1. Verificar existe service correspondiente
  2. Verificar metodos CRUD basicos
  3. Detectar queries custom necesarios
  4. Verificar inyeccion de repository

  GENERA lista de services faltantes.

resultado:
  estado: "exito"
  archivos_generados:
    - "COHERENCE-ENTITIES-SERVICES.md"
  hallazgos:
    - entities_sin_service: 8
    - services_incompletos: 5
tiempo_estimado: "15m"
tokens_estimados: 3800
```

---

### PROMPT-F1-N3-003: Services vs Controllers

```yaml
prompt_id: "PROMPT-F1-N3-003"
agente: "@COHERENCE_VALIDATOR_AGENT"
objetivo: "Validar coherencia entre services y controllers"
contexto_enviado:
  - "backend/src/**/services/*.service.ts"
  - "backend/src/**/controllers/*.controller.ts"
  - "Swagger decorators"
prompt_texto: |
  COMPARA Services con Controllers.

  PARA CADA SERVICE:
  1. Verificar existe controller correspondiente
  2. Verificar endpoints expuestos
  3. Verificar documentacion Swagger
  4. Detectar metodos no expuestos

  GENERA lista de endpoints faltantes.

resultado:
  estado: "exito"
  archivos_generados:
    - "COHERENCE-SERVICES-CONTROLLERS.md"
  hallazgos:
    - services_sin_controller: 4
    - metodos_no_expuestos: 12
tiempo_estimado: "12m"
tokens_estimados: 3200
```

---

### PROMPT-F1-N3-004: Backend vs Frontend Types

```yaml
prompt_id: "PROMPT-F1-N3-004"
agente: "@COHERENCE_VALIDATOR_AGENT"
objetivo: "Validar coherencia entre DTOs backend y types frontend"
contexto_enviado:
  - "backend/src/**/dto/*.dto.ts"
  - "frontend/src/types/**/*.ts"
  - "API responses"
prompt_texto: |
  COMPARA DTOs Backend con Types Frontend.

  PARA CADA DTO:
  1. Verificar existe type correspondiente
  2. Comparar propiedades
  3. Verificar tipos compatibles
  4. Detectar desincronizaciones

  GENERA lista de types desactualizados.

resultado:
  estado: "parcial"
  archivos_generados:
    - "COHERENCE-BACKEND-FRONTEND.md"
  hallazgos:
    - dtos_sin_type: 15
    - types_desactualizados: 9
tiempo_estimado: "18m"
tokens_estimados: 4200
```

---

## Nivel 4: Deteccion de Anomalias (@ANOMALY_DETECTOR_AGENT)

### PROMPT-F1-N4-001: Tablas Huerfanas

```yaml
prompt_id: "PROMPT-F1-N4-001"
agente: "@ANOMALY_DETECTOR_AGENT"
objetivo: "Detectar tablas sin relaciones FK entrantes"
contexto_enviado:
  - "database/ddl/**/*.sql"
  - "Grafo de FK"
prompt_texto: |
  DETECTA tablas huerfanas en el DDL.

  DEFINICION:
  Tabla huerfana = tabla sin FK entrantes (nadie la referencia)

  EXCEPCIONES VALIDAS:
  - Tablas de configuracion
  - Tablas de logs
  - Tablas maestras (root)

  PARA CADA TABLA:
  1. Contar FK entrantes
  2. Contar FK salientes
  3. Clasificar: huerfana, root, intermedia, hoja

  REPORTA tablas potencialmente innecesarias.

resultado:
  estado: "exito"
  archivos_generados:
    - "ANOMALIES-ORPHAN-TABLES.md"
  hallazgos:
    - tablas_huerfanas: 7
    - tablas_sospechosas: 4
tiempo_estimado: "10m"
tokens_estimados: 2800
```

---

### PROMPT-F1-N4-002: FK Circulares

```yaml
prompt_id: "PROMPT-F1-N4-002"
agente: "@ANOMALY_DETECTOR_AGENT"
objetivo: "Detectar referencias FK circulares"
contexto_enviado:
  - "database/ddl/**/*.sql"
  - "ALTER TABLE ... ADD CONSTRAINT statements"
prompt_texto: |
  DETECTA FK circulares en el DDL.

  TIPOS DE CIRCULARIDAD:
  1. Directa: A -> B -> A
  2. Indirecta: A -> B -> C -> A
  3. Self-reference: A -> A (valido para jerarquias)

  ANALIZA grafo de dependencias FK.
  REPORTA ciclos encontrados.
  SUGIERE como romper ciclos problematicos.

resultado:
  estado: "exito"
  archivos_generados:
    - "ANOMALIES-CIRCULAR-FK.md"
  hallazgos:
    - ciclos_directos: 0
    - ciclos_indirectos: 2
    - self_references: 5
tiempo_estimado: "8m"
tokens_estimados: 2200
```

---

### PROMPT-F1-N4-003: Naming Inconsistente

```yaml
prompt_id: "PROMPT-F1-N4-003"
agente: "@ANOMALY_DETECTOR_AGENT"
objetivo: "Detectar inconsistencias en naming conventions"
contexto_enviado:
  - "database/ddl/**/*.sql"
  - "Naming conventions definidas"
prompt_texto: |
  DETECTA inconsistencias de naming en DDL.

  REGLAS ESPERADAS:
  - Tablas: plural, snake_case (users, not user)
  - Columnas: snake_case (created_at, not createdAt)
  - FK: {tabla_singular}_id (user_id, not userId)
  - Indices: idx_{tabla}_{columnas}
  - Constraints: {tipo}_{tabla}_{descripcion}

  REPORTA violaciones con sugerencia de correccion.

resultado:
  estado: "exito"
  archivos_generados:
    - "ANOMALIES-NAMING.md"
  hallazgos:
    - tablas_singular: 8
    - fk_mal_nombradas: 12
    - indices_sin_convencion: 6
tiempo_estimado: "12m"
tokens_estimados: 3000
```

---

### PROMPT-F1-N4-004: Indices Duplicados

```yaml
prompt_id: "PROMPT-F1-N4-004"
agente: "@ANOMALY_DETECTOR_AGENT"
objetivo: "Detectar indices redundantes o duplicados"
contexto_enviado:
  - "database/ddl/**/*.sql"
  - "CREATE INDEX statements"
prompt_texto: |
  DETECTA indices duplicados o redundantes.

  TIPOS DE REDUNDANCIA:
  1. Duplicado exacto (mismo nombre, mismas columnas)
  2. Subsumido (idx(a,b) hace innecesario idx(a))
  3. Inverso innecesario (idx(a,b) vs idx(b,a) sin justificacion)

  ANALIZA todos los CREATE INDEX.
  SUGIERE indices a eliminar.
  ESTIMA impacto en storage.

resultado:
  estado: "exito"
  archivos_generados:
    - "ANOMALIES-DUPLICATE-INDEXES.md"
  hallazgos:
    - indices_duplicados: 3
    - indices_redundantes: 5
tiempo_estimado: "10m"
tokens_estimados: 2500
```

---

## Nivel 5: Purga y Consolidacion (@PURGE_CONSOLIDATION_AGENT)

### PROMPT-F1-N5-001: Consolidar Hallazgos

```yaml
prompt_id: "PROMPT-F1-N5-001"
agente: "@PURGE_CONSOLIDATION_AGENT"
objetivo: "Consolidar todos los hallazgos de niveles 2-4"
contexto_enviado:
  - "FINDINGS-*-DOMAIN.md (7 archivos)"
  - "COHERENCE-*.md (4 archivos)"
  - "ANOMALIES-*.md (4 archivos)"
prompt_texto: |
  CONSOLIDA todos los hallazgos de Fase 1.

  PROCESO:
  1. Leer todos los archivos de hallazgos
  2. Eliminar duplicados (mismo issue reportado por multiples agentes)
  3. Unificar severidades (CRITICO > ALTO > MEDIO > BAJO)
  4. Agrupar por categoria:
     - Estructura DDL
     - Coherencia capas
     - Naming conventions
     - Seguridad
     - Performance

  GENERA FINDINGS-CONSOLIDATED.md con formato estandar.

resultado:
  estado: "exito"
  archivos_generados:
    - "FINDINGS-CONSOLIDATED.md"
  hallazgos:
    - total_antes_dedup: 156
    - total_despues_dedup: 98
    - duplicados_eliminados: 58
tiempo_estimado: "20m"
tokens_estimados: 6000
```

---

### PROMPT-F1-N5-002: Priorizar por Impacto

```yaml
prompt_id: "PROMPT-F1-N5-002"
agente: "@PURGE_CONSOLIDATION_AGENT"
objetivo: "Calcular prioridad ponderada de hallazgos"
contexto_enviado:
  - "FINDINGS-CONSOLIDATED.md"
  - "Criterios de priorizacion"
prompt_texto: |
  PRIORIZA hallazgos consolidados.

  FORMULA DE PRIORIDAD:
  score = (severidad * 3) + (impacto_usuarios * 2) + (facilidad_fix * 1)

  SEVERIDAD: CRITICO=4, ALTO=3, MEDIO=2, BAJO=1
  IMPACTO: Bloqueante=4, Alto=3, Medio=2, Bajo=1
  FACILIDAD: Trivial=4, Facil=3, Medio=2, Dificil=1

  ORDENA por score descendente.
  AGRUPA en sprints de remediacion.

resultado:
  estado: "exito"
  archivos_generados:
    - "PRIORITY-MATRIX.md"
  hallazgos:
    - items_criticos: 8
    - items_sprint1: 15
    - items_sprint2: 25
    - items_backlog: 50
tiempo_estimado: "15m"
tokens_estimados: 4500
```

---

### PROMPT-F1-N5-003: Generar Plan de Remediacion

```yaml
prompt_id: "PROMPT-F1-N5-003"
agente: "@PURGE_CONSOLIDATION_AGENT"
objetivo: "Generar plan de remediacion estructurado"
contexto_enviado:
  - "PRIORITY-MATRIX.md"
  - "Dependencias entre hallazgos"
prompt_texto: |
  GENERA plan de remediacion para Fase 2.

  ESTRUCTURA DE SPRINTS:
  - Sprint 1: Criticos (bloqueantes)
  - Sprint 2: Fundamentos (estructura base)
  - Sprint 3: Funcionalidades core
  - Sprint 4: Documentacion
  - Sprint 5: Mejoras
  - Sprint 6: Backlog

  PARA CADA ITEM:
  - ID de hallazgo
  - Descripcion de fix
  - Dependencias
  - Agente asignado
  - Tiempo estimado

  GENERA REMEDIATION-PLAN.md

resultado:
  estado: "exito"
  archivos_generados:
    - "REMEDIATION-PLAN.md"
    - "SPRINT-ASSIGNMENTS.yml"
  hallazgos:
    - sprints_planificados: 6
    - items_asignados: 98
    - tiempo_total_estimado: "40h"
tiempo_estimado: "25m"
tokens_estimados: 7000
```

---

## Metricas Agregadas Fase 1

| Nivel | Prompts | Tokens Entrada | Tokens Salida | Tiempo |
|-------|---------|----------------|---------------|--------|
| Nivel 2 | 7 | ~22,000 | ~12,000 | ~92m |
| Nivel 3 | 4 | ~15,000 | ~8,000 | ~70m |
| Nivel 4 | 4 | ~10,000 | ~5,500 | ~40m |
| Nivel 5 | 3 | ~18,000 | ~10,000 | ~60m |
| **TOTAL** | **18** | **~65,000** | **~35,500** | **~262m** |

---

## Patrones Reutilizables

### Patron: Validacion por Dominio
```yaml
template: |
  ANALIZA el dominio {DOMAIN} del DDL.
  ARCHIVOS: {FILES}
  VERIFICA: {CRITERIA}
  REPORTA: [CRITICO|ALTO|MEDIO|BAJO] + descripcion
```

### Patron: Coherencia Entre Capas
```yaml
template: |
  COMPARA {LAYER_A} con {LAYER_B}.
  PARA CADA elemento en {LAYER_A}:
    1. Verificar existe en {LAYER_B}
    2. Comparar {PROPERTIES}
    3. Detectar gaps
  GENERA matriz de coherencia.
```

### Patron: Deteccion de Anomalias
```yaml
template: |
  DETECTA {ANOMALY_TYPE} en {SOURCE}.
  DEFINICION: {DEFINITION}
  EXCEPCIONES: {VALID_EXCEPTIONS}
  REPORTA con sugerencia de correccion.
```

---

*Generado: 2026-02-03 | Sistema SIMCO v4.0.0*
