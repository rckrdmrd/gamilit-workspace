# SIMCO-FLUJO-AGENTES.md

**Version:** 1.3.0
**Creado:** 2026-01-20
**Actualizado:** 2026-01-20
**Sistema:** SIMCO v4.0
**Tipo:** Directiva Obligatoria

---

## Prop\u00f3sito

Esta directiva establece el flujo optimizado de trabajo entre agentes para maximizar
la eficiencia en el uso de tokens de Claude Code y garantizar la calidad de ejecuci\u00f3n
mediante planes ultra-detallados para modelos no-razonadores.

---

## Regla Principal (OBLIGATORIA)

```
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551                                                                          \u2551
\u2551   FLUJO OBLIGATORIO PARA TAREAS DELEGADAS:                              \u2551
\u2551                                                                          \u2551
\u2551   FASE 1: Claude Code \u2192 An\u00e1lisis Inicial + Plan Alto Nivel             \u2551
\u2551   FASE 2: Trae (Gemini) \u2192 An\u00e1lisis Detallado + Plan At\u00f3mico            \u2551
\u2551   FASE 3: Windsurf \u2192 Ejecuci\u00f3n de Tareas At\u00f3micas                       \u2551
\u2551   FASE 4: Claude Code/Trae \u2192 Validaci\u00f3n Detallada                       \u2551
\u2551                                                                          \u2551
\u2551   SALTAR FASES = EJECUCI\u00d3N NO OPTIMIZADA                                \u2551
\u2551                                                                          \u2551
\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
```

### Jerarquía de Agentes por Fase

| Fase | Principal | Secundario | Alternativo | Modelo |
|------|-----------|------------|-------------|--------|
| **Fase 1** | Claude Code | Gemini CLI | - | Claude Opus 4.5 / Gemini 3 |
| **Fase 2** | Claude Code | Gemini CLI | Trae | Claude / Gemini 3 / Gemini 3 Pro |
| **Fase 3** | Windsurf | - | - | Cascade AI (no-razonador) |
| **Fase 4** | Claude Code | Gemini CLI | Trae | Claude / Gemini 3 |

```
JERARQUÍA DE SELECCIÓN:
┌─────────────────────────────────────────────────────────────────┐
│ 1. PRINCIPAL: Claude Code                                        │
│    → Usar cuando: disponible, requiere orquestación/web search  │
│                                                                  │
│ 2. SECUNDARIO: Gemini CLI                                        │
│    → Usar cuando: Claude no disponible, tarea no requiere       │
│      subagentes ni web search                                    │
│                                                                  │
│ 3. ALTERNATIVO: Trae (u otro según fase)                        │
│    → Usar cuando: ni Claude ni Gemini CLI disponibles           │
└─────────────────────────────────────────────────────────────────┘
```

> **NOTA:** Gemini CLI (Gemini 3) es el agente SECUNDARIO que puede sustituir
> a Claude Code en todas las fases excepto Fase 3. Es RAZONADOR pero SIN subagentes.

---

## Diagrama del Flujo

```
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502  USUARIO SOLICITA  \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
          \u2502
          \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502        FASE 1: CLAUDE CODE                    \u2502
\u2502        An\u00e1lisis Inicial + Plan Alto Nivel      \u2502
\u2502                                               \u2502
\u2502  \u2022 Clasificar tarea                          \u2502
\u2502  \u2022 Identificar m\u00f3dulos afectados              \u2502
\u2502  \u2022 Definir alcance y criterios                \u2502
\u2502  \u2022 Generar plan de alto nivel                 \u2502
\u2502  \u2022 Registrar en PROMPTS-ACTIVOS.yml          \u2502
\u2502                                               \u2502
\u2502  Tokens Claude: ~10%                          \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                        \u2502
                        \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502        FASE 2: TRAE (GEMINI 3 PRO)            \u2502
\u2502        An\u00e1lisis Detallado + Plan At\u00f3mico       \u2502
\u2502                                               \u2502
\u2502  \u2022 Leer archivos de c\u00f3digo                    \u2502
\u2502  \u2022 Analizar patrones existentes               \u2502
\u2502  \u2022 Validar coherencia arquitect\u00f3nica          \u2502
\u2502  \u2022 DESCOMPONER en tareas at\u00f3micas             \u2502
\u2502  \u2022 Generar plan ULTRA-DETALLADO              \u2502
\u2502  \u2022 Actualizar PROMPTS-ACTIVOS.yml            \u2502
\u2502                                               \u2502
\u2502  Tokens Gemini: ~25% (no Claude)              \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                        \u2502
                        \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502        FASE 3: WINDSURF (CASCADE)             \u2502
\u2502        Ejecuci\u00f3n de Tareas At\u00f3micas            \u2502
\u2502                                               \u2502
\u2502  \u2022 Recibir plan ultra-detallado               \u2502
\u2502  \u2022 Ejecutar tareas UNA POR UNA                \u2502
\u2502  \u2022 Seguir instrucciones LITERALMENTE          \u2502
\u2502  \u2022 NO tomar decisiones                        \u2502
\u2502  \u2022 Validar cada tarea                         \u2502
\u2502  \u2022 Reportar progreso                          \u2502
\u2502                                               \u2502
\u2502  Tokens Cascade: ~50% (no Claude)             \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                        \u2502
                        \u25bc
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502        FASE 4: CLAUDE CODE / TRAE             \u2502
\u2502        Validaci\u00f3n Detallada                    \u2502
\u2502                                               \u2502
\u2502  \u2022 Leer c\u00f3digo generado                       \u2502
\u2502  \u2022 Validar coherencia arquitect\u00f3nica          \u2502
\u2502  \u2022 Validar directivas SIMCO                   \u2502
\u2502  \u2022 Validar anti-duplicaci\u00f3n                   \u2502
\u2502  \u2022 Ejecutar build/lint/test                   \u2502
\u2502  \u2022 Mover a PROMPTS-HISTORICO.yml             \u2502
\u2502  \u2022 Generar reporte final                      \u2502
\u2502                                               \u2502
\u2502  Tokens Claude: ~15%                          \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
                        \u2502
                        \u25bc
                 \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
                 \u2502 COMPLETO \u2502
                 \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
```

---

## FASE 1: An\u00e1lisis Inicial (Claude Code)

### Responsabilidades

| Actividad | Descripci\u00f3n | Output |
|-----------|-------------|--------|
| Clasificar | Determinar tipo de tarea (feature, bug, refactor) | tipo_tarea |
| Identificar | Proyectos y m\u00f3dulos afectados | lista_modulos |
| Definir | Alcance, objetivos, criterios de aceptaci\u00f3n | plan_alto_nivel |
| Registrar | Crear entrada en PROMPTS-ACTIVOS.yml | prompt_id |

### Template de Prompt para Fase 2

```yaml
# Prompt de Fase 1 para Trae
id: "PROMPT-{YYYY-MM-DD}-{NNN}"
fase_actual: "2_analisis_detallado"
origen: "claude-code"
destino: "trae"
estado: "pendiente"

contexto:
  tarea_original: |
    [Descripci\u00f3n del requerimiento del usuario]

  proyecto: "{nombre_proyecto}"
  tipo_tarea: "feature|bug|refactor|..."
  prioridad: "P0|P1|P2"

plan_alto_nivel:
  objetivo: |
    [Objetivo claro y medible]

  alcance:
    incluye:
      - [Lo que s\u00ed se debe hacer]
    excluye:
      - [Lo que NO se debe hacer]

  modulos_afectados:
    - modulo: "{nombre}"
      archivos_clave:
        - "path/to/file1.ts"
        - "path/to/file2.ts"

  criterios_aceptacion:
    - "[Criterio 1]"
    - "[Criterio 2]"

  dependencias:
    - "[Dependencia 1]"

  riesgos:
    - "[Riesgo identificado]"

instrucciones_para_trae:
  - "Leer archivos listados en modulos_afectados"
  - "Analizar patrones existentes (naming, imports, estructura)"
  - "Validar que el plan es coherente con arquitectura actual"
  - "DESCOMPONER en tareas at\u00f3micas (max 1 archivo, max 50 l\u00edneas)"
  - "Generar plan ULTRA-DETALLADO con c\u00f3digo literal"
  - "Actualizar este prompt con el plan detallado"
```

### Lo que Claude NO Hace en Fase 1

- NO lee archivos de c\u00f3digo en detalle (solo identifica)
- NO escribe c\u00f3digo
- NO genera planes de implementaci\u00f3n detallados
- NO ejecuta comandos de build/test

---

## FASE 2: An\u00e1lisis Detallado (Trae - Gemini 3 Pro)

### Responsabilidades

| Actividad | Descripci\u00f3n | Output |
|-----------|-------------|--------|
| Leer | Archivos de c\u00f3digo identificados | contexto_codigo |
| Analizar | Patrones, estructura, naming, imports | patrones |
| Validar | Coherencia con arquitectura existente | validacion |
| Descomponer | Tareas at\u00f3micas detalladas | lista_tareas |
| Generar | Plan ultra-detallado para Windsurf | plan_ejecucion |

### Reglas de Descomposici\u00f3n At\u00f3mica

```
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 REGLAS PARA TAREAS AT\u00d3MICAS                              \u2502
\u2502                                                          \u2502
\u2502 1. M\u00c1XIMO 1 archivo por tarea                            \u2502
\u2502 2. M\u00c1XIMO 50 l\u00edneas de cambio por tarea                   \u2502
\u2502 3. Incluir C\u00d3DIGO LITERAL a escribir                     \u2502
\u2502 4. Incluir L\u00cdNEAS EXACTAS a modificar                     \u2502
\u2502 5. Incluir IMPORTS espec\u00edficos                            \u2502
\u2502 6. Incluir VALIDACI\u00d3N espec\u00edfica por tarea                \u2502
\u2502 7. NO requerir INTERPRETACI\u00d3N                             \u2502
\u2502 8. Ser AUTO-CONTENIDA                                     \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
```

### Template de Tarea At\u00f3mica para Windsurf

```yaml
tareas_atomicas:
  - id: "T001"
    titulo: "Crear DTO de Achievement"
    archivo: "apps/backend/src/achievements/dto/achievement.dto.ts"
    accion: "crear"

    contenido_exacto: |
      import { IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';
      import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

      export class CreateAchievementDto {
        @ApiProperty({ description: 'Nombre del logro' })
        @IsString()
        name: string;

        @ApiPropertyOptional({ description: 'Descripci\u00f3n del logro' })
        @IsString()
        @IsOptional()
        description?: string;

        @ApiProperty({ description: 'Puntos otorgados' })
        @IsNumber()
        points: number;

        @ApiPropertyOptional({ description: 'Icono del logro' })
        @IsString()
        @IsOptional()
        icon?: string;
      }

      export class UpdateAchievementDto {
        @ApiPropertyOptional()
        @IsString()
        @IsOptional()
        name?: string;

        @ApiPropertyOptional()
        @IsString()
        @IsOptional()
        description?: string;

        @ApiPropertyOptional()
        @IsNumber()
        @IsOptional()
        points?: number;
      }

    validacion:
      comando: "cd apps/backend && npx tsc --noEmit src/achievements/dto/achievement.dto.ts"
      esperado: "Sin errores de compilaci\u00f3n"

    notas:
      - "Seguir patr\u00f3n de DTOs existentes en src/users/dto/"
      - "Usar decoradores de class-validator y swagger"

  - id: "T002"
    titulo: "Crear Entity de Achievement"
    archivo: "apps/backend/src/achievements/entities/achievement.entity.ts"
    accion: "crear"
    dependencia: "T001"

    contenido_exacto: |
      import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';
      import { ApiProperty } from '@nestjs/swagger';

      @Entity('achievements')
      export class Achievement {
        @ApiProperty()
        @PrimaryGeneratedColumn('uuid')
        id: string;

        @ApiProperty()
        @Column()
        name: string;

        @ApiProperty()
        @Column({ nullable: true })
        description: string;

        @ApiProperty()
        @Column({ type: 'int', default: 0 })
        points: number;

        @ApiProperty()
        @Column({ nullable: true })
        icon: string;

        @ApiProperty()
        @CreateDateColumn()
        createdAt: Date;
      }

    validacion:
      comando: "cd apps/backend && npx tsc --noEmit src/achievements/entities/achievement.entity.ts"
      esperado: "Sin errores de compilaci\u00f3n"
```

---

## FASE 3: Ejecuci\u00f3n (Windsurf - Cascade)

### Responsabilidades

| Actividad | Descripci\u00f3n | Output |
|-----------|-------------|--------|
| Leer | Plan ultra-detallado de Trae | contexto_plan |
| Ejecutar | Tareas at\u00f3micas una por una | archivos |
| Validar | Cada tarea individualmente | resultado |
| Reportar | Progreso y resultado | reporte |

### Restricciones CR\u00cdTICAS para Windsurf

```
\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551 WINDSURF NO DEBE:                                        \u2551
\u2551                                                          \u2551
\u2551 \u2717 Tomar decisiones arquitect\u00f3nicas                       \u2551
\u2551 \u2717 Interpretar instrucciones ambiguas                     \u2551
\u2551 \u2717 Modificar m\u00e1s de lo indicado                            \u2551
\u2551 \u2717 "Mejorar" el c\u00f3digo por cuenta propia                  \u2551
\u2551 \u2717 Crear archivos no especificados                        \u2551
\u2551 \u2717 Agregar funcionalidad extra                            \u2551
\u2551 \u2717 Cambiar naming o estructura                            \u2551
\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d

\u2554\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2557
\u2551 SI ENCUENTRA AMBIG\u00dcEDAD:                                  \u2551
\u2551                                                          \u2551
\u2551 1. DETENER ejecuci\u00f3n                                      \u2551
\u2551 2. Documentar la ambig\u00fcedad encontrada                    \u2551
\u2551 3. Reportar a Trae/Claude para clarificaci\u00f3n              \u2551
\u2551 4. NO continuar hasta recibir instrucci\u00f3n clara           \u2551
\u255a\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u255d
```

### Template de Reporte de Ejecuci\u00f3n

```yaml
# Reporte de Windsurf para Validador
id: "REPORT-{YYYY-MM-DD}-{NNN}"
prompt_ref: "PROMPT-{YYYY-MM-DD}-{NNN}"
ejecutor: "windsurf"
fecha: "2026-01-20"

ejecucion:
  inicio: "2026-01-20T10:00:00"
  fin: "2026-01-20T10:45:00"
  duracion_minutos: 45

tareas_ejecutadas:
  - id: "T001"
    titulo: "Crear DTO de Achievement"
    estado: "completada"
    archivo: "apps/backend/src/achievements/dto/achievement.dto.ts"
    accion: "crear"
    validacion_local:
      ejecutada: true
      resultado: "PASS"
      output: "Compilation successful"
    notas: []

  - id: "T002"
    titulo: "Crear Entity de Achievement"
    estado: "completada"
    archivo: "apps/backend/src/achievements/entities/achievement.entity.ts"
    accion: "crear"
    validacion_local:
      ejecutada: true
      resultado: "PASS"
      output: "Compilation successful"
    notas: []

commits:
  - hash: "abc123def"
    mensaje: "[GAM] feat: Add achievements module - DTOs and entities"
    archivos:
      - "apps/backend/src/achievements/dto/achievement.dto.ts"
      - "apps/backend/src/achievements/entities/achievement.entity.ts"

resumen:
  total_tareas: 5
  completadas: 5
  fallidas: 0
  bloqueadas: 0

ambiguedades_encontradas: []

validacion_global:
  build: "PASS"
  lint: "PASS"
  test: "N/A"
```

---

## FASE 4: Validaci\u00f3n (Claude Code o Trae)

### Responsabilidades

| Actividad | Descripci\u00f3n | Output |
|-----------|-------------|--------|
| Revisar | C\u00f3digo generado/modificado | analisis |
| Comparar | Con especificaciones originales | cumplimiento |
| Validar | Coherencia arquitect\u00f3nica | arquitectura_ok |
| Verificar | Anti-duplicaci\u00f3n | duplicados_ok |
| Ejecutar | Build, lint, test | validacion_tecnica |
| Cerrar | Mover a hist\u00f3rico | registro |

### Checklist de Validaci\u00f3n

```markdown
## Validaci\u00f3n de Tarea Ejecutada por Windsurf

### 1. Cumplimiento de Especificaciones
- [ ] Todos los archivos especificados fueron creados/modificados
- [ ] El c\u00f3digo coincide con lo especificado en el plan
- [ ] Los criterios de aceptaci\u00f3n se cumplen

### 2. Coherencia Arquitect\u00f3nica
- [ ] Naming conventions correctas
- [ ] Imports correctos
- [ ] Estructura de carpetas correcta
- [ ] Patrones del proyecto respetados

### 3. Anti-Duplicaci\u00f3n
- [ ] No hay archivos duplicados
- [ ] No hay funcionalidad duplicada
- [ ] No hay c\u00f3digo redundante

### 4. Validaciones T\u00e9cnicas
- [ ] Build: PASS
- [ ] Lint: PASS
- [ ] TypeCheck: PASS
- [ ] Tests: PASS (si existen)

### 5. Git
- [ ] Commits con formato correcto
- [ ] Push realizado (si corresponde)
- [ ] Submodule actualizado (si corresponde)

### Veredicto
- [ ] APROBADA
- [ ] RECHAZADA (motivo: _______)
- [ ] REQUIERE CORRECCI\u00d3N (lista: _______)
```

---

## Uso de PROMPTS-ACTIVOS.yml y PROMPTS-HISTORICO.yml

### Estados del Prompt

```
pendiente_analisis    \u2192 Fase 1 completa, esperando Fase 2
en_analisis          \u2192 Trae ejecutando Fase 2
listo_para_ejecucion \u2192 Fase 2 completa, esperando Windsurf
en_ejecucion         \u2192 Windsurf ejecutando Fase 3
en_validacion        \u2192 Validador ejecutando Fase 4
completado           \u2192 Todas las fases completas
fallido              \u2192 Fall\u00f3 en alguna fase
bloqueado            \u2192 Requiere intervenci\u00f3n
```

### Flujo en Archivos

```
PROMPTS-ACTIVOS.yml                      PROMPTS-HISTORICO.yml
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510                    \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
\u2502 Fase 1: Claude     \u2502                    \u2502                      \u2502
\u2502 crea entrada       \u2502                    \u2502                      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518                    \u2502                      \u2502
           \u2502                               \u2502                      \u2502
           \u25bc                               \u2502                      \u2502
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510                    \u2502                      \u2502
\u2502 Fase 2: Trae       \u2502                    \u2502                      \u2502
\u2502 actualiza entrada  \u2502                    \u2502                      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518                    \u2502                      \u2502
           \u2502                               \u2502                      \u2502
           \u25bc                               \u2502                      \u2502
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510                    \u2502                      \u2502
\u2502 Fase 3: Windsurf   \u2502                    \u2502                      \u2502
\u2502 actualiza progreso \u2502                    \u2502                      \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u252c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518                    \u2502                      \u2502
           \u2502                               \u2502                      \u2502
           \u25bc                               \u2502                      \u2502
\u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510                    \u2502                      \u2502
\u2502 Fase 4: Validador  \u2502\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u25b6\u2502 Mueve al completar  \u2502
\u2502 mueve a hist\u00f3rico  \u2502                    \u2502 con todos los datos \u2502
\u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518                    \u2514\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2518
```

---

## Aliases de Invocaci\u00f3n

```
@FLUJO-AGENTES       - Esta directiva
@FASE1-CLAUDE        - Template prompt Fase 1
@FASE2-TRAE          - Template prompt Fase 2
@FASE3-WINDSURF      - Template prompt Fase 3
@FASE4-VALIDACION    - Checklist de validaci\u00f3n
```

---

## Consideraciones Especiales

### Si la Tarea Involucra Base de Datos

Cuando la tarea incluye cambios en DDL o estructuras de datos:

```
┌──────────────────────────────────────────────────────────────┐
│ REGLA: Coherencia DDL → Backend → Frontend                   │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│ 1. DDL → Backend:                                            │
│    - Toda tabla DEBE tener entity correspondiente            │
│    - Campos de entity = columnas de tabla                    │
│    - Tipos TypeScript compatibles con PostgreSQL             │
│                                                              │
│ 2. Backend → Frontend (si aplica):                           │
│    - Endpoints consumidos DEBEN existir en backend           │
│    - DTOs expuestos DEBEN estar documentados                 │
│                                                              │
│ 3. Inventarios:                                              │
│    - DATABASE_INVENTORY.yml actualizado                      │
│    - BACKEND_INVENTORY.yml actualizado                       │
│    - Cobertura = 100%                                        │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

**Referencia:** Ver Regla 8 en CLAUDE.md para detalles completos.

### Credenciales y Configuración

Para tareas que requieren acceso a bases de datos o servicios:

```yaml
# Fuente única de verdad para credenciales
orchestration/inventarios/WORKSPACE-INTEGRATION.yml

# Ambientes por proyecto
Por proyecto: projects/{proyecto}/.env.development
```

**Alias:** `@WORKSPACE-INTEGRATION` o `@CREDENTIALS`

---

## Cuándo Usar Este Flujo

### USAR el flujo completo (4 fases):
- Features nuevas
- Refactorizaciones
- Cambios que afectan m\u00faltiples archivos
- Tareas > 3 SP

### USAR flujo abreviado (Claude directo):
- Fixes menores (< 10 l\u00edneas)
- Cambios de configuraci\u00f3n
- Documentaci\u00f3n
- Tareas < 2 SP

### Decisi\u00f3n de Flujo

```
                    \u00bfTarea > 3 SP?
                         \u2502
              \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
              \u2502                   \u2502
             S\u00cd                   NO
              \u2502                   \u2502
              \u25bc                   \u25bc
      Flujo Completo        \u00bfAfecta > 3 archivos?
      (4 Fases)                    \u2502
                          \u250c\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2534\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2510
                          \u2502               \u2502
                         S\u00cd               NO
                          \u2502               \u2502
                          \u25bc               \u25bc
                  Flujo Completo    Claude Directo
                  (4 Fases)         (1 Fase)
```

---

## M\u00e9tricas de \u00c9xito

| M\u00e9trica | Objetivo | Medici\u00f3n |
|---------|----------|----------|
| Tokens Claude | < 25% del total | PROMPTS-HISTORICO |
| Tasa de \u00e9xito Windsurf | > 90% | Reportes de ejecuci\u00f3n |
| Errores por ambig\u00fcedad | < 5% | Bloqueos reportados |
| Tiempo de validaci\u00f3n | < 15% del total | Timestamps |

---

## Referencias

- Roles de agentes: `orchestration/agents/AGENT-ROLES.md`
- Prompts gen\u00e9ricos: `orchestration/referencias/AGENT-STARTUP-PROMPTS.md`
- Prompts activos: `orchestration/referencias/PROMPTS-ACTIVOS.yml`
- Hist\u00f3rico: `orchestration/referencias/PROMPTS-HISTORICO.yml`
- Gobernanza: `orchestration/directivas/simco/SIMCO-PROMPTS-AGENTES.md`
- **Gemini CLI config:** `.gemini-cli/AGENT-CAPABILITIES.md`
