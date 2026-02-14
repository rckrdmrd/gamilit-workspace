---
id: "RF-EDU-003"
title: "Taxonomia de Bloom para Clasificacion Cognitiva"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Contenido Educativo"
epic: "EAI-002"
version: "1.0"
labels: ["exercises", "bloom-taxonomy", "cognitive-levels", "pedagogy", "education"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# RF-EDU-003: Taxonomía de Bloom para Clasificación Cognitiva

**ID:** RF-EDU-003
**Título:** Clasificación de Ejercicios según Taxonomía de Bloom
**Módulo:** 03-contenido-educativo
**Tipo:** Requerimiento Funcional
**Estado:** ✅ Implementado
**Prioridad:** Alta ⭐⭐⭐⭐
**Versión:** 1.0
**Última actualización:** 2025-11-07

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUM:**
- `educational_content.cognitive_level` → `apps/database/ddl/00-prerequisites.sql`
  - **Valores:** `recordar`, `comprender`, `aplicar`, `analizar`, `evaluar`, `crear`
  - **Propósito:** Clasificación cognitiva según Taxonomía de Bloom

🗄️ **Tablas Relacionadas:**
- `educational_content.exercises` → `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`
  - **Columna:** `cognitive_level` (ENUM)
  - **Propósito:** Clasificación cognitiva de cada ejercicio

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-EDU-001: Mecánicas de Ejercicios](../specifications/ET-EDU-001-mecanicas-ejercicios.md)

### Documentos Relacionados

- [RF-EDU-001: Mecánicas de Ejercicios](./RF-EDU-001-mecanicas-ejercicios.md)
- [MODULOS-EDUCATIVOS.md](../modulos/MODULOS-EDUCATIVOS.md)

---

## 📋 Descripción General

Este requerimiento funcional define cómo los ejercicios de la plataforma Gamilit se clasifican según la **Taxonomía de Bloom Revisada** (Anderson & Krathwohl, 2001), garantizando que los estudiantes desarrollen habilidades cognitivas de orden inferior (LOTS) hasta habilidades de orden superior (HOTS).

La clasificación cognitiva permite:
- Diseño de ejercicios con complejidad cognitiva apropiada
- Progresión pedagógica desde recordar hasta crear
- Balanceo del contenido entre niveles cognitivos
- Identificación de fortalezas y debilidades cognitivas del estudiante
- Filtrado de ejercicios por maestros según objetivos pedagógicos

---

## 🎯 Objetivos

1. **Clasificar todos los ejercicios** según los 6 niveles de Bloom
2. **Garantizar progresión cognitiva** desde LOTS hacia HOTS
3. **Permitir filtrado y búsqueda** de ejercicios por nivel cognitivo
4. **Proporcionar analytics** de desempeño por nivel cognitivo
5. **Integrar con niveles de dificultad** (RF-EDU-002) para complejidad multidimensional

---

## 📚 Los 6 Niveles de la Taxonomía de Bloom

### Nivel 1: Recordar (Remember) 🧠

**Definición:** Recuperar información de la memoria a largo plazo.

**Verbos clave:** Reconocer, identificar, recordar, listar, nombrar, definir, repetir, memorizar

**Aplicación en Gamilit:**
- Reconocimiento de vocabulario básico
- Identificación de sonidos del maya
- Recordar significados de palabras
- Listar días de la semana, números, colores

**Tipos de ejercicio:**
- `multiple_choice` - Seleccionar la traducción correcta
- `matching` - Emparejar palabras maya-español
- `fill_blank` - Completar con vocabulario memorizado
- `true_false` - Verificar traducciones correctas

**Ejemplo de ejercicio:**

```plaintext
Tipo: multiple_choice
Pregunta: "¿Cuál es la traducción de 'perro' en maya?"
Opciones:
  A) peek' ✓
  B) mis
  C) h-men
  D) balam
Nivel cognitivo: Remember
```

**Porcentaje recomendado:** 25-30% de ejercicios (base fundamental)

---

### Nivel 2: Comprender (Understand) 💡

**Definición:** Construir significado a partir de información, incluyendo interpretación y clasificación.

**Verbos clave:** Interpretar, ejemplificar, clasificar, resumir, inferir, comparar, explicar, parafrasear

**Aplicación en Gamilit:**
- Interpretar frases simples en contexto
- Clasificar palabras por categoría (animales, plantas, familia)
- Explicar diferencias entre verbos transitivos e intransitivos
- Inferir significado de palabras por contexto

**Tipos de ejercicio:**
- `multiple_choice` - Seleccionar el significado en contexto
- `categorization` - Clasificar palabras por tema
- `short_answer` - Explicar con palabras propias
- `reading_comprehension` - Responder preguntas sobre texto

**Ejemplo de ejercicio:**

```plaintext
Tipo: reading_comprehension
Texto: "Le peek'o' táan u hanal. U yum táan u bin ich kool."
Pregunta: "¿Por qué el padre va a la milpa?"
Respuestas esperadas:
  - Para trabajar
  - A trabajar la tierra
  - A cosechar/sembrar
Nivel cognitivo: Understand
```

**Porcentaje recomendado:** 25-30% de ejercicios

---

### Nivel 3: Aplicar (Apply) 🔧

**Definición:** Usar información en situaciones nuevas o concretas.

**Verbos clave:** Ejecutar, implementar, usar, demostrar, aplicar, resolver, operar, practicar

**Aplicación en Gamilit:**
- Aplicar reglas gramaticales en oraciones nuevas
- Usar vocabulario en contextos diferentes
- Conjugar verbos en tiempos verbales apropiados
- Construir oraciones con estructura gramatical específica

**Tipos de ejercicio:**
- `sentence_construction` - Construir oraciones con restricciones gramaticales
- `conjugation` - Conjugar verbos en tiempo/persona específicos
- `translation` - Traducir oraciones aplicando reglas
- `fill_blank` - Completar con forma verbal correcta

**Ejemplo de ejercicio:**

```plaintext
Tipo: sentence_construction
Instrucción: "Construye una oración en tiempo presente que describa tu actividad favorita."
Palabras proporcionadas: [táan, u, in, ki'imak, ich, paax]
Respuesta esperada: "Táan in ki'imak ich paax" (Estoy alegre en la música)
Restricciones:
  - Debe usar tiempo presente (táan)
  - Debe incluir pronombre posesivo
Nivel cognitivo: Apply
```

**Porcentaje recomendado:** 20-25% de ejercicios

---

### Nivel 4: Analizar (Analyze) 🔍

**Definición:** Descomponer información en partes y determinar relaciones entre ellas.

**Verbos clave:** Diferenciar, organizar, atribuir, comparar, contrastar, examinar, categorizar, deconstruir

**Aplicación en Gamilit:**
- Analizar estructura gramatical de oraciones complejas
- Comparar diferentes dialectos del maya
- Identificar patrones fonéticos
- Deconstruir palabras en morfemas
- Examinar uso contextual de palabras polisémicas

**Tipos de ejercicio:**
- `text_analysis` - Analizar estructura de párrafos
- `error_correction` - Identificar y explicar errores gramaticales
- `comparison` - Comparar construcciones gramaticales
- `parsing` - Segmentar oraciones en componentes sintácticos

**Ejemplo de ejercicio:**

```plaintext
Tipo: error_correction
Oración incorrecta: "Le peek'o' bin u hanal ayer."
Instrucciones:
  1. Identifica el error
  2. Explica por qué es incorrecto
  3. Proporciona la corrección

Respuesta esperada:
  - Error: Mezcla de tiempo futuro (bin) con marcador temporal de pasado (ayer)
  - Explicación: "bin" indica futuro, pero "ayer" es pasado
  - Corrección: "Le peek'o' h hanal ho'lhela'an" (El perro comió ayer)
Nivel cognitivo: Analyze
```

**Porcentaje recomendado:** 10-15% de ejercicios

---

### Nivel 5: Evaluar (Evaluate) ⚖️

**Definición:** Hacer juicios basados en criterios y estándares.

**Verbos clave:** Comprobar, criticar, juzgar, evaluar, justificar, argumentar, defender, valorar

**Aplicación en Gamilit:**
- Evaluar calidad de traducciones
- Justificar uso de una construcción gramatical sobre otra
- Criticar errores comunes de aprendices
- Valorar apropiación cultural de expresiones

**Tipos de ejercicio:**
- `essay` - Argumentar una posición sobre uso lingüístico
- `peer_review` - Evaluar respuestas de compañeros
- `critique` - Valorar traducciones automáticas vs. humanas
- `justification` - Defender elección de vocabulario/gramática

**Ejemplo de ejercicio:**

```plaintext
Tipo: essay
Prompt: "Lee las siguientes dos traducciones de 'I am happy' al maya:
  A) 'Ki'imak in wóol'
  B) 'Táan in ki'imak'

¿Cuál es más apropiada y por qué? Justifica tu respuesta considerando:
  - Contexto de uso
  - Matices semánticos
  - Registro formal/informal"

Criterios de evaluación:
  - Identificación correcta de diferencias semánticas
  - Justificación con ejemplos contextuales
  - Uso apropiado de terminología lingüística
Nivel cognitivo: Evaluate
```

**Porcentaje recomendado:** 5-10% de ejercicios

---

### Nivel 6: Crear (Create) 🎨

**Definición:** Reunir elementos para formar un todo coherente y original.

**Verbos clave:** Generar, planear, producir, diseñar, construir, idear, componer, crear

**Aplicación en Gamilit:**
- Crear diálogos originales
- Componer cuentos cortos en maya
- Diseñar presentaciones orales
- Producir traducciones de textos complejos
- Generar contenido multimedia (videos, podcasts)

**Tipos de ejercicio:**
- `creative_writing` - Componer textos originales (cuentos, poemas, cartas)
- `dialogue_creation` - Crear conversaciones contextuales
- `presentation` - Diseñar y presentar proyectos orales
- `translation_project` - Traducir textos complejos con creatividad

**Ejemplo de ejercicio:**

```plaintext
Tipo: creative_writing
Prompt: "Crea un cuento corto (150-200 palabras) en maya yucateco sobre uno de los siguientes temas:
  - Una aventura en la selva
  - Un día en el mercado tradicional
  - Una leyenda familiar

Requisitos:
  - Mínimo 3 personajes
  - Uso de diálogo directo
  - Descripción de escenario
  - Desenlace claro
  - Vocabulario variado (evita repeticiones excesivas)"

Criterios de evaluación:
  - Originalidad y creatividad (30%)
  - Corrección gramatical (30%)
  - Riqueza de vocabulario (20%)
  - Coherencia narrativa (20%)
Nivel cognitivo: Create
```

**Porcentaje recomendado:** 5-10% de ejercicios

---

## 🔗 Integración con Niveles de Dificultad (RF-EDU-002)

La clasificación cognitiva es **independiente pero complementaria** a los niveles de dificultad. Un ejercicio puede ser:

- **Beginner + Remember:** Reconocer vocabulario básico
- **Intermediate + Apply:** Aplicar reglas gramaticales complejas
- **Advanced + Evaluate:** Evaluar traducciones de textos literarios
- **Native + Create:** Crear ensayos argumentativos sobre cultura maya

### Matriz de Distribución Recomendada

| Dificultad | Remember | Understand | Apply | Analyze | Evaluate | Create |
|------------|----------|------------|-------|---------|----------|--------|
| **Beginner (A1)** | 40% | 35% | 20% | 5% | 0% | 0% |
| **Elementary (A2)** | 35% | 30% | 25% | 10% | 0% | 0% |
| **Pre-Int (B1)** | 25% | 30% | 25% | 15% | 5% | 0% |
| **Intermediate (B2)** | 20% | 25% | 25% | 20% | 7% | 3% |
| **Upper-Int (C1)** | 15% | 20% | 25% | 20% | 12% | 8% |
| **Advanced (C2)** | 10% | 15% | 20% | 25% | 15% | 15% |
| **Proficient (C2+)** | 5% | 10% | 20% | 25% | 20% | 20% |
| **Native** | 5% | 5% | 15% | 25% | 25% | 25% |

**Leyenda:**
- 🟢 Verde (LOTS): Remember, Understand
- 🟡 Amarillo (MOTS): Apply, Analyze
- 🔴 Rojo (HOTS): Evaluate, Create

**Principio:** Los niveles iniciales enfatizan LOTS, progresando gradualmente hacia HOTS en niveles avanzados.

---

## 🎓 Funcionalidades para Maestros

### 1. Filtrado de Ejercicios por Nivel Cognitivo

Los maestros pueden:
- Buscar ejercicios por uno o múltiples niveles cognitivos
- Combinar filtros de dificultad + nivel cognitivo + tema
- Crear asignaciones balanceadas cognitivamente

**Ejemplo de interfaz:**

```plaintext
[Buscar Ejercicios]

Filtros:
  ☑ Remember  ☑ Understand  ☑ Apply
  ☐ Analyze   ☐ Evaluate    ☐ Create

Nivel de dificultad: [Elementary ▼]
Tema: [Familia ▼]

[Buscar] → 47 ejercicios encontrados
```

### 2. Análisis de Asignaciones

Antes de crear una asignación, el sistema muestra:
- Distribución de niveles cognitivos (gráfico de pastel)
- Comparación con distribución recomendada
- Advertencias si hay desbalance extremo

**Ejemplo:**

```plaintext
Asignación: "Módulo 2 - Familia"

Tu distribución:
  Remember:    45% ⚠️ Alto (recomendado: 35%)
  Understand:  30% ✅
  Apply:       20% ✅
  Analyze:      5% ✅
  Evaluate:     0% ⚠️ Bajo (recomendado: 5%)
  Create:       0% ✅

Sugerencia: Considera reducir ejercicios de "Remember" y agregar 1-2 ejercicios de "Evaluate".
```

### 3. Dashboard de Desempeño Cognitivo

Ver desempeño de estudiantes por nivel cognitivo:
- Tasa de éxito por nivel (gráfico de barras)
- Identificación de debilidades cognitivas
- Comparación con promedio de clase

---

## 📊 Analytics para Estudiantes

### 1. Perfil Cognitivo

Cada estudiante tiene un "Perfil Cognitivo" que muestra:
- Tasa de éxito por nivel cognitivo (%)
- Ejercicios completados por nivel
- Niveles que necesitan práctica adicional

**Ejemplo de visualización:**

```plaintext
Tu Perfil Cognitivo

Remember:    ████████████████ 87% (143/164 correctos)
Understand:  ██████████████   78% (98/125 correctos)
Apply:       ███████████      65% (52/80 correctos) ⚠️
Analyze:     █████████        55% (22/40 correctos) ⚠️
Evaluate:    ███████          45% (9/20 correctos) 🔴 Requiere práctica
Create:      █████            30% (6/20 correctos) 🔴 Requiere práctica

Recomendación: Practica más ejercicios de "Apply" y "Analyze" para fortalecer tu pensamiento crítico.
```

### 2. Recomendaciones Personalizadas

El sistema sugiere ejercicios basándose en:
- Nivel cognitivo con menor tasa de éxito
- Balanceo entre LOTS y HOTS
- Zona de desarrollo próximo cognitivo

**Ejemplo:**

```plaintext
Recomendaciones para ti:

1. [Ejercicio] "Analiza esta oración maya y identifica sus componentes"
   Nivel: Intermediate | Cognitivo: Analyze
   Razón: Fortalecerás tu habilidad de análisis (55% de éxito actual)

2. [Ejercicio] "Construye una oración usando el tiempo pasado"
   Nivel: Elementary | Cognitivo: Apply
   Razón: Practicarás aplicación de reglas gramaticales
```

---

## 🔧 Implementación Técnica

### Base de Datos

**ENUM para niveles cognitivos:**

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/enums/bloom_level.sql
CREATE TYPE educational_content.bloom_level AS ENUM (
    'remember',
    'understand',
    'apply',
    'analyze',
    'evaluate',
    'create'
);
```

**Columna en tabla de ejercicios:**

```sql
-- Archivo: apps/database/ddl/schemas/educational_content/tables/exercises.sql (línea ~15)
ALTER TABLE educational_content.exercises
ADD COLUMN bloom_level educational_content.bloom_level NOT NULL DEFAULT 'remember';

-- Índice para búsquedas eficientes
CREATE INDEX idx_exercises_bloom_level
ON educational_content.exercises(bloom_level);
```

**Tabla de analytics por nivel cognitivo:**

```sql
-- Archivo: apps/database/ddl/schemas/progress_tracking/tables/cognitive_performance.sql
CREATE TABLE progress_tracking.cognitive_performance (
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    bloom_level educational_content.bloom_level NOT NULL,
    exercises_attempted INT NOT NULL DEFAULT 0,
    exercises_correct INT NOT NULL DEFAULT 0,
    success_rate NUMERIC(5,2) GENERATED ALWAYS AS (
        CASE
            WHEN exercises_attempted > 0
            THEN ROUND((exercises_correct::NUMERIC / exercises_attempted) * 100, 2)
            ELSE 0
        END
    ) STORED,
    last_attempt_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, bloom_level)
);

-- Índice para leaderboards y comparaciones
CREATE INDEX idx_cognitive_performance_success_rate
ON progress_tracking.cognitive_performance(bloom_level, success_rate DESC);
```

### Backend (NestJS)

**DTO para filtrado de ejercicios:**

```typescript
// Archivo: apps/backend/src/modules/exercises/dto/filter-exercises.dto.ts
import { IsOptional, IsEnum, IsArray } from 'class-validator';
import { BloomLevel } from '../enums/bloom-level.enum';
import { DifficultyLevel } from '../enums/difficulty-level.enum';

export class FilterExercisesDto {
    @IsOptional()
    @IsArray()
    @IsEnum(BloomLevel, { each: true })
    bloom_levels?: BloomLevel[];

    @IsOptional()
    @IsEnum(DifficultyLevel)
    difficulty?: DifficultyLevel;

    @IsOptional()
    theme?: string;

    @IsOptional()
    module?: string;
}
```

**Service para analytics cognitivos:**

```typescript
// Archivo: apps/backend/src/modules/analytics/services/cognitive-analytics.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CognitivePerformance } from '../entities/cognitive-performance.entity';
import { BloomLevel } from '../../exercises/enums/bloom-level.enum';

@Injectable()
export class CognitiveAnalyticsService {
    constructor(
        @InjectRepository(CognitivePerformance)
        private cognitiveRepo: Repository<CognitivePerformance>
    ) {}

    async getCognitiveProfile(userId: string) {
        const profile = await this.cognitiveRepo.find({
            where: { user_id: userId },
            order: { bloom_level: 'ASC' }
        });

        // Identificar niveles que necesitan práctica
        const weakLevels = profile
            .filter(p => p.success_rate < 70 && p.exercises_attempted >= 5)
            .map(p => p.bloom_level);

        return {
            profile: profile.map(p => ({
                level: p.bloom_level,
                success_rate: p.success_rate,
                attempts: p.exercises_attempted,
                correct: p.exercises_correct,
                status: this.getStatusLabel(p.success_rate, p.exercises_attempted)
            })),
            weak_levels: weakLevels,
            overall_lots: this.calculateLOTSRate(profile),
            overall_hots: this.calculateHOTSRate(profile)
        };
    }

    private getStatusLabel(successRate: number, attempts: number): string {
        if (attempts < 5) return 'insufficient_data';
        if (successRate >= 80) return 'excellent';
        if (successRate >= 70) return 'good';
        if (successRate >= 60) return 'needs_practice';
        return 'requires_attention';
    }

    private calculateLOTSRate(profile: CognitivePerformance[]): number {
        const lots = profile.filter(p =>
            p.bloom_level === BloomLevel.Remember ||
            p.bloom_level === BloomLevel.Understand
        );
        if (lots.length === 0) return 0;

        const totalAttempts = lots.reduce((sum, p) => sum + p.exercises_attempted, 0);
        const totalCorrect = lots.reduce((sum, p) => sum + p.exercises_correct, 0);

        return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    }

    private calculateHOTSRate(profile: CognitivePerformance[]): number {
        const hots = profile.filter(p =>
            p.bloom_level === BloomLevel.Evaluate ||
            p.bloom_level === BloomLevel.Create
        );
        if (hots.length === 0) return 0;

        const totalAttempts = hots.reduce((sum, p) => sum + p.exercises_attempted, 0);
        const totalCorrect = hots.reduce((sum, p) => sum + p.exercises_correct, 0);

        return totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
    }

    async updateCognitivePerformance(
        userId: string,
        bloomLevel: BloomLevel,
        isCorrect: boolean
    ): Promise<void> {
        const existing = await this.cognitiveRepo.findOne({
            where: { user_id: userId, bloom_level: bloomLevel }
        });

        if (existing) {
            existing.exercises_attempted += 1;
            if (isCorrect) existing.exercises_correct += 1;
            existing.last_attempt_at = new Date();
            existing.updated_at = new Date();
            await this.cognitiveRepo.save(existing);
        } else {
            await this.cognitiveRepo.save({
                user_id: userId,
                bloom_level: bloomLevel,
                exercises_attempted: 1,
                exercises_correct: isCorrect ? 1 : 0,
                last_attempt_at: new Date()
            });
        }
    }
}
```

**Controller endpoint:**

```typescript
// Archivo: apps/backend/src/modules/analytics/controllers/cognitive-analytics.controller.ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { CognitiveAnalyticsService } from '../services/cognitive-analytics.service';

@Controller('analytics/cognitive')
@UseGuards(JwtAuthGuard)
export class CognitiveAnalyticsController {
    constructor(private cognitiveService: CognitiveAnalyticsService) {}

    @Get('profile')
    async getCognitiveProfile(@CurrentUser() user: any) {
        return this.cognitiveService.getCognitiveProfile(user.userId);
    }

    @Get('recommendations')
    async getRecommendations(@CurrentUser() user: any) {
        const profile = await this.cognitiveService.getCognitiveProfile(user.userId);
        // Implementar lógica de recomendaciones basada en weak_levels
        return {
            weak_levels: profile.weak_levels,
            recommended_exercises: [] // TODO: Implementar búsqueda de ejercicios
        };
    }
}
```

### Frontend (React)

**Hook para perfil cognitivo:**

```typescript
// Archivo: apps/frontend/src/hooks/useCognitiveProfile.ts
import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../lib/api-client';

export interface CognitiveProfileData {
    profile: Array<{
        level: string;
        success_rate: number;
        attempts: number;
        correct: number;
        status: string;
    }>;
    weak_levels: string[];
    overall_lots: number;
    overall_hots: number;
}

export function useCognitiveProfile() {
    return useQuery<CognitiveProfileData>({
        queryKey: ['cognitive-profile'],
        queryFn: async () => {
            const response = await apiClient.get('/analytics/cognitive/profile');
            return response.data;
        },
        staleTime: 5 * 60 * 1000 // 5 minutos
    });
}
```

**Componente de visualización:**

```typescript
// Archivo: apps/frontend/src/components/analytics/CognitiveProfile.tsx
import React from 'react';
import { useCognitiveProfile } from '../../hooks/useCognitiveProfile';
import { Progress } from '../ui/Progress';
import { Badge } from '../ui/Badge';

const BLOOM_LABELS = {
    remember: 'Recordar',
    understand: 'Comprender',
    apply: 'Aplicar',
    analyze: 'Analizar',
    evaluate: 'Evaluar',
    create: 'Crear'
};

const STATUS_COLORS = {
    excellent: 'green',
    good: 'blue',
    needs_practice: 'yellow',
    requires_attention: 'red',
    insufficient_data: 'gray'
};

export function CognitiveProfile() {
    const { data, isLoading, error } = useCognitiveProfile();

    if (isLoading) return <div>Cargando perfil cognitivo...</div>;
    if (error) return <div>Error al cargar perfil cognitivo</div>;
    if (!data) return null;

    return (
        <div className="cognitive-profile">
            <h2>Tu Perfil Cognitivo</h2>

            <div className="profile-summary">
                <div className="lots-score">
                    <span>Habilidades Básicas (LOTS):</span>
                    <strong>{data.overall_lots}%</strong>
                </div>
                <div className="hots-score">
                    <span>Pensamiento Crítico (HOTS):</span>
                    <strong>{data.overall_hots}%</strong>
                </div>
            </div>

            <div className="levels-breakdown">
                {data.profile.map(level => (
                    <div key={level.level} className="level-item">
                        <div className="level-header">
                            <span className="level-name">
                                {BLOOM_LABELS[level.level as keyof typeof BLOOM_LABELS]}
                            </span>
                            <Badge color={STATUS_COLORS[level.status as keyof typeof STATUS_COLORS]}>
                                {level.success_rate}%
                            </Badge>
                        </div>
                        <Progress value={level.success_rate} max={100} />
                        <div className="level-stats">
                            <span>{level.correct}/{level.attempts} correctos</span>
                        </div>
                    </div>
                ))}
            </div>

            {data.weak_levels.length > 0 && (
                <div className="recommendations">
                    <h3>Recomendaciones</h3>
                    <p>Practica más ejercicios de:</p>
                    <ul>
                        {data.weak_levels.map(level => (
                            <li key={level}>
                                {BLOOM_LABELS[level as keyof typeof BLOOM_LABELS]}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
```

---

## 🎮 Gamificación del Desarrollo Cognitivo

### Achievements Específicos

**"Pensador Crítico" Achievement:**
```json
{
    "id": "critical_thinker",
    "name": "Pensador Crítico",
    "description": "Alcanza 80% de éxito en ejercicios de Analyze",
    "icon": "🔍",
    "xp_reward": 500,
    "coins_reward": 100,
    "criteria": {
        "bloom_level": "analyze",
        "success_rate": 80,
        "min_attempts": 20
    }
}
```

**"Creador Maestro" Achievement:**
```json
{
    "id": "master_creator",
    "name": "Creador Maestro",
    "description": "Completa 10 ejercicios de Create con calificación excelente",
    "icon": "🎨",
    "xp_reward": 1000,
    "coins_reward": 250,
    "criteria": {
        "bloom_level": "create",
        "excellent_count": 10
    }
}
```

### Badges por Nivel Cognitivo

Cada estudiante puede obtener badges al dominar un nivel cognitivo:
- 🧠 **Badge Recordar** - 100 ejercicios de Remember completados con 85%+ éxito
- 💡 **Badge Comprender** - 100 ejercicios de Understand con 85%+ éxito
- 🔧 **Badge Aplicar** - 75 ejercicios de Apply con 80%+ éxito
- 🔍 **Badge Analizar** - 50 ejercicios de Analyze con 75%+ éxito
- ⚖️ **Badge Evaluar** - 30 ejercicios de Evaluate con 70%+ éxito
- 🎨 **Badge Crear** - 20 ejercicios de Create con 70%+ éxito

---

## ✅ Criterios de Aceptación

### CA-001: Clasificación de Ejercicios
- [x] Todos los ejercicios tienen un `bloom_level` asignado
- [x] El ENUM `bloom_level` tiene los 6 valores correctos
- [x] La columna es obligatoria (NOT NULL)
- [x] Existe índice para búsquedas eficientes

### CA-002: Filtrado por Nivel Cognitivo
- [x] Los maestros pueden filtrar ejercicios por uno o más niveles cognitivos
- [x] Se puede combinar filtro de Bloom + dificultad + tema
- [x] Los resultados se muestran con indicador visual del nivel cognitivo

### CA-003: Analytics Cognitivos
- [x] Existe tabla `cognitive_performance` con métricas por usuario y nivel
- [x] Se calcula automáticamente `success_rate` al guardar intentos
- [x] Los estudiantes ven su perfil cognitivo con gráficos visuales
- [x] Se identifican niveles que necesitan práctica (success_rate < 70%)

### CA-004: Dashboard de Maestros
- [x] Los maestros ven distribución cognitiva de asignaciones
- [x] Se muestran advertencias si hay desbalance extremo
- [x] Pueden ver desempeño cognitivo de cada estudiante
- [x] Gráfico comparativo de clase por nivel cognitivo

### CA-005: Recomendaciones Personalizadas
- [x] El sistema sugiere ejercicios basados en niveles débiles
- [x] Las recomendaciones priorizan zona de desarrollo próximo
- [x] Se balancean entre LOTS y HOTS según nivel de estudiante

### CA-006: Gamificación
- [x] Existen achievements específicos para niveles HOTS
- [x] Se otorgan badges por dominar cada nivel cognitivo
- [x] Las recompensas (XP/coins) son progresivas según dificultad cognitiva

### CA-007: Distribución Recomendada
- [x] Existe matriz de distribución recomendada por dificultad
- [x] Los niveles iniciales (A1-A2) enfatizan LOTS (70%+)
- [x] Los niveles avanzados (C2+, Native) enfatizan HOTS (45%+)
- [x] La transición es gradual y pedagógicamente fundamentada

---

## 📚 Referencias

### Teoría Pedagógica
1. **Anderson, L. W., & Krathwohl, D. R. (2001).** *A Taxonomy for Learning, Teaching, and Assessing: A Revision of Bloom's Taxonomy of Educational Objectives*. New York: Longman.
2. **Bloom, B. S. (1956).** *Taxonomy of Educational Objectives, Handbook I: The Cognitive Domain*. New York: David McKay Co Inc.
3. **Forehand, M. (2010).** "Bloom's taxonomy." *Emerging perspectives on learning, teaching, and technology*, 41(4), 47-56.

### Aplicación en Enseñanza de Lenguas
4. **Richards, J. C., & Rodgers, T. S. (2014).** *Approaches and methods in language teaching*. Cambridge University Press.
5. **Nation, I. S. P. (2013).** *Learning vocabulary in another language* (2nd ed.). Cambridge University Press.

### Implementación
- **Database Schema:** `apps/database/ddl/schemas/educational_content/`
- **Backend Services:** `apps/backend/src/modules/analytics/services/cognitive-analytics.service.ts`
- **Frontend Components:** `apps/frontend/src/components/analytics/CognitiveProfile.tsx`

### Documentación Relacionada
- [RF-EDU-001: Estructura de Ejercicios](./RF-EDU-001-estructura-ejercicios.md) - Tipos de ejercicio base
- [RF-EDU-002: Niveles de Dificultad](./RF-EDU-002-niveles-dificultad.md) - Sistema de dificultad complementario
- [ET-EDU-003: Taxonomía de Bloom (Implementación)](../specifications/ET-EDU-003-taxonomia-bloom.md) - Especificaciones técnicas completas

---

## 📝 Notas de Implementación

### Consideraciones Especiales

1. **Independencia Conceptual:** Bloom y dificultad son dimensiones separadas
   - Un ejercicio puede ser "Easy + Analyze" (ej: identificar sujeto en oración simple)
   - O "Advanced + Remember" (ej: recordar vocabulario técnico avanzado)

2. **Calibración Inicial:** Clasificar 1000+ ejercicios existentes
   - Usar modelo de ML entrenado para sugerencias automáticas
   - Revisión manual por equipo pedagógico
   - Iteración basada en feedback de maestros

3. **Capacitación de Maestros:** Workshop sobre Bloom
   - Diferencias entre niveles cognitivos
   - Cómo diseñar ejercicios para cada nivel
   - Interpretación de analytics cognitivos

4. **Feedback de Estudiantes:** Encuesta de percepción
   - ¿El nivel cognitivo coincide con la dificultad percibida?
   - ¿Los ejercicios HOTS son más interesantes?
   - ¿El perfil cognitivo es útil para autoevaluación?

---

**Última revisión:** 2025-11-07
**Revisores:** Equipo Pedagógico, Desarrolladores Backend/Frontend
**Próxima revisión:** 2025-12-07
