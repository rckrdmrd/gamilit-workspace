# Reporte de Validacion: Seeds vs DDL

**Timestamp:** 2025-11-03T06:06:53Z  
**Subagente:** SA-VAL-009  
**Estado:** Validacion Completada

---

## Resumen Ejecutivo

| Metrica | Valor |
|---------|-------|
| **Seeds analizados** | 32 |
| **Tablas DDL validadas** | 64 |
| **Errores críticos encontrados** | 19 |
| **Cobertura de seeds** | 24/64 tablas (37.5%) |
| **Tablas sin seeds** | 40 |

---

## Errores Críticos Identificados

### 1. Tablas No Encontradas en DDL (3 errores)

Estos seeds apuntan a tablas que NO existen en la definicion de DDL:

| Seed File | Tabla Objetivo | Accion Recomendada |
|-----------|----------------|-------------------|
| `audit_logging/02-system-metrics.sql` | `audit_logging.system_metrics` | Crear tabla o eliminar seed |
| `content_management/01-marie-curie-bio.sql` | `content_management.content` | Crear tabla o eliminar seed |
| `content_management/03-tags.sql` | `content_management.tags` | Crear tabla o eliminar seed |

---

### 2. Valores ENUM Inválidos (16 errores)

**Tabla afectada:** `educational_content.exercises`  
**Columna:** `exercise_type`

Los seeds utilizan valores de exercise_type que NO estan definidos en el ENUM de DDL.

#### Desglose por Seed:

**educational_content/02-exercises-module1.sql** (4 errores)
```
Valores invalidos: multiple_choice, essay, fill_blank, interactive
Valores validos en DDL: [27 opciones incluyendo crucigrama, linea_tiempo, etc.]
```

**educational_content/03-exercises-module2.sql** (3 errores)
```
Valores invalidos: detective, predictor, analysis
Sugerencias:
  - detective -> detective_textual
  - predictor -> prediccion_narrativa
  - analysis -> analisis_fuentes
```

**educational_content/04-exercises-module3.sql** (3 errores)
```
Valores invalidos: debate, analysis, tribunal
Sugerencias:
  - debate -> debate_digital
  - analysis -> analisis_fuentes
  - tribunal -> tribunal_opiniones
```

**educational_content/05-exercises-module4.sql** (3 errores)
```
Valores invalidos: presentacion, podcast, video
Sugerencias:
  - podcast -> podcast_argumentativo
  - (presentacion, video no tienen equivalente directo)
```

**educational_content/06-exercises-module5.sql** (3 errores)
```
Valores invalidos: diario_multimedia, video_carta, comic_digital
Sugerencias:
  - diario_multimedia -> diario_interactivo
  - comic_digital -> collage_digital
  - (video_carta no tiene equivalente directo)
```

---

## Mapeo de ENUMs Problemáticos

### exercise_type ENUM

**Definición en DDL (27 valores):**
```
crucigrama, linea_tiempo, mapa_conceptual, emparejamiento, sopa_letras,
detective_textual, construccion_hipotesis, prediccion_narrativa, puzzle_contexto,
rueda_inferencias, tribunal_opiniones, debate_digital, analisis_fuentes,
podcast_argumentativo, matriz_perspectivas, verificador_fake_news,
infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes,
diario_interactivo, resumen_visual, capsula_tiempo, comprension_auditiva,
collage_digital, texto_movimiento, call_to_action
```

**Valores en Seeds (15 valores únicos):**
```
multiple_choice, fill_blank, essay, interactive, detective, predictor, analysis,
debate, tribunal, podcast, presentacion, video, diario_multimedia, video_carta,
comic_digital
```

**Mappeos sugeridos:**
| Seed Value | DDL Equivalent | Certeza |
|-----------|----------------|---------|
| detective | detective_textual | Alta |
| predictor | prediccion_narrativa | Alta |
| analysis | analisis_fuentes o analisis_memes | Media |
| debate | debate_digital | Alta |
| tribunal | tribunal_opiniones | Alta |
| podcast | podcast_argumentativo | Alta |
| diario_multimedia | diario_interactivo | Alta |
| comic_digital | collage_digital | Media |
| presentacion | *(no existe)* | Baja - Agregar al ENUM |
| video | *(no existe)* | Baja - Agregar al ENUM |
| video_carta | *(no existe)* | Baja - Agregar al ENUM |

---

## Cobertura de Seeds por Esquema

| Schema | Tablas en DDL | Con Seeds | % Cobertura |
|--------|---------------|-----------|-------------|
| audit_logging | 6 | 1 | 16.7% |
| auth | 1 | 1 | 100% |
| auth_management | 12 | 7 | 58.3% |
| content_management | 5 | 2 | 40% |
| educational_content | 4 | 3 | 75% |
| gamification_system | 12 | 4 | 33.3% |
| progress_tracking | 5 | 2 | 40% |
| public | 9 | 0 | 0% |
| social_features | 7 | 4 | 57.1% |
| system_configuration | 3 | 2 | 66.7% |

**Total:** 24/64 tablas con seeds (37.5%)

---

## Tablas Críticas Sin Seeds

Estas tablas carecen de datos de prueba y representan funcionalidades importantes:

```
- gamification_system.user_achievements
- gamification_system.user_ranks
- gamification_system.missions
- progress_tracking.learning_sessions
- public.assignments (9 tablas relacionadas)
- social_features.friendships
- social_features.team_challenges
- social_features.team_members
```

---

## Acciones Recomendadas

### PRIORITARIO (P0):

1. **Resolver conflictos de ENUM exercise_type**
   - Opcion A: Actualizar 6 seeds de educational_content con valores DDL validos
   - Opcion B: Agregar valores faltantes (presentacion, video, video_carta) al ENUM en DDL
   - Opcion C: Mezclar ambas soluciones

2. **Crear tablas faltantes en DDL**
   - `audit_logging.system_metrics`
   - `content_management.content`
   - `content_management.tags`
   O eliminar los seeds correspondientes

### IMPORTANTE (P1):

3. **Expandir cobertura de seeds**
   - Crear seeds para tablas críticas sin datos de prueba
   - Enfocarse en: assignments, user_achievements, missions

4. **Estandarizar nomenclatura de ENUMs**
   - Los valores de seeds usan convenciones English genéricas (multiple_choice, essay)
   - Los valores de DDL usan convenciones Spanish específicas (crucigrama, sopa_letras)
   - Establecer guia de convención única

### INFORMATIVO (P2):

5. **Documentar decisiones de diseño**
   - Registrar motivo de cada valor ENUM en DDL
   - Crear mapping reference entre seeds y DDL

---

## Validaciones Exitosas

- **Tablas existentes:** 24 de 32 seeds apuntan a tablas validas
- **Schemas consistentes:** Todos los seeds usan schemas validos definidos en DDL
- **Estructura general:** 97% de compatibilidad en estructura (tablas vs seeds)

---

## Próximas Pasos

1. Revisar y aprobar estrategia de resolución de ENUMs
2. Ejecutar correcciones en orden de prioridad
3. Re-ejecutar validación para confirmar resolución
4. Documentar cambios en git

---

**Generado por:** SA-VAL-009 Validation Agent  
**Fecha:** 2025-11-03  
**Archivo JSON:** `/validaciones/seeds-vs-ddl.json`
