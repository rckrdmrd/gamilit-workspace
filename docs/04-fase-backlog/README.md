# Fase 4: Backlog - Funcionalidad Futura

**Última actualización:** 2025-11-19  
**Estado:** Planificación y Diseño

---

## 📋 CONTENIDO DE ESTA FASE

Esta fase contiene funcionalidad **diseñada pero no implementada** por requerir:
- Evaluación manual o con IA
- Tecnologías avanzadas (visión computacional, NLP, generación multimodal)
- Infraestructura adicional no disponible actualmente

---

## 🎓 MÓDULOS EN BACKLOG

### Módulo 4: Lectura Digital y Multimodal (5 ejercicios)

**Estado:** ⚠️ BACKLOG  
**Razón:** Requieren validación con IA o análisis de medios

| Ejercicio | exercise_type | Razón de Backlog |
|-----------|---------------|------------------|
| 4.1 Verificador de Fake News | `verificador_fake_news` | Requiere verificación de fuentes externas, fact-checking con APIs |
| 4.2 Infografía Interactiva | `infografia_interactiva` | Requiere análisis de imágenes con visión computacional |
| 4.3 Quiz Estilo TikTok | `quiz_tiktok` | Requiere análisis de video y audio |
| 4.4 Navegación Hipertextual | `navegacion_hipertextual` | Requiere seguimiento de rutas de navegación complejas |
| 4.5 Análisis de Memes | `analisis_memes` | Requiere comprensión multimodal (imagen + texto + contexto cultural) |

**Documentación completa:** `docs/04-fase-backlog/modulo-4-lectura-digital/`

---

### Módulo 5: Producción y Expresión Lectora (3 ejercicios)

**Estado:** ⚠️ BACKLOG  
**Razón:** Requieren rúbricas de evaluación creativa y revisión humana

| Ejercicio | exercise_type | Razón de Backlog |
|-----------|---------------|------------------|
| 5.1 Diario Interactivo de Marie | `diario_multimedia` | Requiere evaluación de creatividad narrativa y multimedia |
| 5.2 Resumen Visual (Cómic Digital) | `comic_digital` | Requiere evaluación artística y de coherencia narrativa visual |
| 5.3 Cápsula del Tiempo (Video Carta) | `video_carta` | Requiere análisis de video, audio, guion y producción |

**Documentación completa:** `docs/04-fase-backlog/modulo-5-produccion-lectora/`

---

## 🔧 IMPLEMENTACIÓN ACTUAL

### En Base de Datos

✅ **Tipos definidos** en ENUM `exercise_type`
- Razón: Mantener compatibilidad futura
- Ubicación: `apps/database/ddl/00-prerequisites.sql` (líneas 159-165)
- Marcados como: `⚠️ BACKLOG`

✅ **Seeds disponibles** pero NO cargados por defecto
- Ubicación DEV: `apps/database/seeds/dev/educational_content/_backlog/`
- Ubicación PROD: `apps/database/seeds/prod/educational_content/_backlog/`
- Archivos: `05-exercises-module4.sql`, `06-exercises-module5.sql`

❌ **Validadores SQL:** NO implementados
- Razón: Imposible auto-evaluar con solo SQL
- Alternativa: Marcar `auto_gradable = false` en tabla exercises

---

## 📅 ROADMAP DE IMPLEMENTACIÓN

### Fase P1: Validadores Parciales (Corto Plazo)

**Objetivo:** Validar estructura y completitud básica

**Implementación:**
- Validar formato JSONB correcto
- Validar campos requeridos presentes
- Validar tamaño/duración de archivos multimedia
- Validar formatos de archivo permitidos

**Funciones SQL a crear:**
- `validate_multimedia_structure()` - Valida estructura de archivos
- `validate_submission_completeness()` - Valida completitud
- `validate_file_formats()` - Valida formatos permitidos

**Tiempo estimado:** 2-3 semanas

---

### Fase P2: Sistema de Revisión Manual (Medio Plazo)

**Objetivo:** Permitir evaluación por profesores

**Implementación:**
- Tabla `progress_tracking.manual_reviews`
- Workflow de asignación profesor → ejercicio
- Interfaz frontend para revisión
- Sistema de rúbricas configurables

**Componentes:**
- Backend: Endpoints de revisión manual
- Frontend: Panel de revisión para profesores
- Database: Tabla de reviews + rúbricas

**Tiempo estimado:** 1-2 meses

---

### Fase P3: Integración con IA (Largo Plazo)

**Objetivo:** Evaluación automática con modelos multimodales

**Tecnologías requeridas:**
- Vision Transformers (análisis de imágenes)
- Whisper/Speech-to-Text (análisis de audio)
- GPT-4V o Claude 3 (análisis multimodal)
- RAG para fact-checking (verificación de fuentes)

**Validadores IA:**
- `ai_validate_infografia()` - Analiza calidad de infografías
- `ai_validate_fake_news()` - Verifica autenticidad de fuentes
- `ai_validate_creative_production()` - Evalúa producción creativa

**Tiempo estimado:** 3-6 meses (requiere infraestructura ML)

---

## 📖 DOCUMENTACIÓN DISPONIBLE

### Especificaciones Técnicas
- `modulo-4-lectura-digital/especificacion-tecnica.md` - Detalle de cada ejercicio
- `modulo-5-produccion-lectora/especificacion-tecnica.md` - Rúbricas y criterios

### Justificación Técnica
- `JUSTIFICACION-BACKLOG.md` - Razones detalladas del backlog
- `ANALISIS-VIABILIDAD.md` - Análisis de viabilidad técnica

### Roadmap de Implementación
- `ROADMAP-MODULO-4.md` - Plan de implementación módulo 4
- `ROADMAP-MODULO-5.md` - Plan de implementación módulo 5

---

## ⚠️ IMPORTANTE

**NO eliminar tipos del ENUM:**
- Mantienen compatibilidad con código existente
- Permiten migración futura sin breaking changes
- Seeds en `_backlog/` disponibles para testing

**NO cargar seeds por defecto:**
- Ejercicios NO tienen validación automática
- Evita confusión en producción
- Se pueden cargar manualmente si se requiere

---

**Última revisión:** 2025-11-19  
**Responsable:** Database Agent  
**Tarea:** DB-126
