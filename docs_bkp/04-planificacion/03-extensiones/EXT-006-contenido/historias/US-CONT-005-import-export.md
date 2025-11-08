# US-CONT-005: Importación y Exportación de Contenido

## Información Básica

| Campo | Valor |
|-------|-------|
| **ID** | US-CONT-005 |
| **Épica** | EXT-006 - Gestión de Contenido |
| **Título** | Sistema de Importación y Exportación Multi-Formato |
| **Prioridad** | Media (P2) |
| **Story Points** | 6 SP |
| **Estado** | NOT STARTED |
| **Fase** | Mes 3 (Extensiones Primera Ola) |
| **Presupuesto** | $3,400 MXN |

---

## Historia de Usuario

**Como** profesor o administrador
**Quiero** importar contenido desde Word, PDF, Moodle, SCORM y exportar a múltiples formatos
**Para** migrar contenido existente fácilmente, compartir con otros sistemas y garantizar portabilidad

---

## Valor de Negocio

### Impacto
- **Migración**: Importar contenido existente ahorra 100+ horas
- **Interoperabilidad**: Compatibilidad con LMS estándar
- **Portabilidad**: No lock-in, exportación libre
- **Adopción**: Facilita onboarding desde otras plataformas

### Métricas de Éxito
- >200 importaciones exitosas en primer mes
- >90% tasa de éxito en conversiones
- Tiempo de importación <2 minutos (doc típico)
- >80% satisfacción con calidad de conversión

---

## Criterios de Aceptación

### CA-01: Importación desde Word (DOCX)
**Features:**
- Upload de archivo .docx
- Conversión automática a contenido GAMILIT
- Preservar formato:
  - Headings (H1-H6)
  - Bold, italic, underline
  - Listas (numeradas, bullets)
  - Tablas
  - Imágenes incrustadas
  - Enlaces
- Mapeo de estilos:
  - "Título 1" → H1
  - "Título 2" → H2
  - "Normal" → paragraph
- Preview antes de importar
- Ajustes manuales post-importación
- Extraer imágenes a biblioteca de medios

**Tecnología:**
- Mammoth.js para conversión DOCX → HTML
- Post-processing para limpieza de HTML

### CA-02: Importación desde PDF
**Features:**
- Upload de PDF
- Extracción de texto con OCR (si necesario)
- Detectar estructura:
  - Headings (por tamaño de fuente)
  - Párrafos
  - Listas
- Extraer imágenes embebidas
- Manejar PDFs multi-columna
- Advertencia: "PDFs pueden perder formato"
- Preview con ajustes manuales

**Tecnología:**
- PDF.js para parsing
- Tesseract.js para OCR (opcional)
- Heurísticas para detectar estructura

**Limitaciones:**
- Tablas complejas pueden no convertirse perfectamente
- Gráficos vectoriales se extraen como imágenes

### CA-03: Importación desde Google Docs
**Features:**
- Autenticación con Google OAuth
- Seleccionar documento de Google Drive
- Importar directamente usando Google Docs API
- Preservar:
  - Formato completo
  - Comentarios (como notas internas)
  - Imágenes
  - Tablas
- Sincronización bidireccional (opcional avanzado)

**Tecnología:**
- Google Docs API
- OAuth 2.0 para autenticación

### CA-04: Importación desde Moodle XML
**Features:**
- Upload de archivo XML de Moodle
- Parsear quiz y preguntas
- Mapear tipos de preguntas:
  - Multiple choice → Opción múltiple GAMILIT
  - True/False → Verdadero/Falso
  - Short answer → Respuesta corta
  - Essay → Respuesta larga
  - Matching → Matching
- Importar categorías como tags
- Importar bancos de preguntas completos
- Preview de preguntas antes de importar
- Validación de estructura XML

**Compatibilidad:**
- Moodle XML format 2.x
- Soporte para feedback y hints

### CA-05: Importación desde SCORM
**Features:**
- Upload de paquete SCORM (.zip)
- Descomprimir y parsear manifest (imsmanifest.xml)
- Extraer contenido HTML/JS
- Renderizar SCORM en iframe
- Tracking de progreso SCORM (API adapter)
- Convertir a módulos GAMILIT (conversión limitada)
- Advertencia: "SCORM se mantendrá como iframe"

**Compatibilidad:**
- SCORM 1.2
- SCORM 2004 (básico)

**Limitaciones:**
- Interactividad compleja puede no funcionar
- Se recomienda re-crear como ejercicios nativos

### CA-06: Exportación a PDF
**Features:**
- Exportar módulo completo como PDF
- Incluir:
  - Tabla de contenidos clickeable
  - Imágenes en alta resolución
  - Tablas formateadas
  - Syntax highlighting en código
  - Ecuaciones matemáticas renderizadas
- Configuración:
  - Tamaño de página (A4, Letter)
  - Orientación (portrait, landscape)
  - Márgenes
  - Header/footer con numeración
- Branding:
  - Logo de institución
  - Colores personalizados
- Exportar con respuestas o sin (para exámenes)

**Tecnología:**
- Puppeteer para HTML → PDF
- CSS print stylesheets
- Page breaks inteligentes

### CA-07: Exportación a Word (DOCX)
**Features:**
- Exportar contenido como .docx editable
- Preservar formato:
  - Headings con estilos Word
  - Listas
  - Tablas
  - Imágenes incrustadas
  - Enlaces
- Compatibilidad con Microsoft Word 2016+
- Incluir metadata (autor, fecha, versión)

**Tecnología:**
- docx library para generación
- Conversión de HTML → DOCX

### CA-08: Exportación a HTML
**Features:**
- Exportar como HTML standalone
- Incluir:
  - CSS inline o en archivo separado
  - JavaScript para interactividad básica
  - Imágenes embebidas (base64) o carpeta separada
- Configuración:
  - Minificado o legible
  - Single-page o multi-page
- Compatible con cualquier navegador
- Puede hospearse en servidor estático

**Uso típico:**
- Archivar contenido
- Compartir fuera de plataforma
- Publicar en web externa

### CA-09: Exportación a JSON
**Features:**
- Exportar estructura completa como JSON
- Incluir:
  - Contenido de módulos
  - Ejercicios con configuración
  - Metadata completa
  - Referencias a multimedia
- Schema versionado (v1.0)
- Validación con JSON Schema
- Compresión opcional (gzip)

**Uso típico:**
- Backup programático
- Migración a otra plataforma
- Análisis de datos
- APIs de terceros

### CA-10: Conversión Inteligente
**Features de IA (opcional avanzado):**
- Detectar automáticamente tipo de contenido
- Sugerir estructura de módulos
- Convertir preguntas de texto a ejercicios:
  - "¿Cuál es la capital de Francia?" → Opción múltiple
- Extraer conceptos clave como tags
- Generar resumen automático
- Detectar nivel de dificultad (bloom's taxonomy)

**Tecnología:**
- NLP básico (spaCy, NLTK)
- GPT API para conversiones complejas (opcional)

### CA-11: Validación de Contenido Importado
**Checks automáticos:**
- Imágenes rotas (links externos no accesibles)
- Videos no soportados (convertir formato)
- Ecuaciones mal formateadas
- HTML peligroso (XSS prevention)
- Contenido inapropiado (filtro básico)
- Tamaño excesivo (>10MB de texto)

**Reporte de validación:**
- Lista de warnings y errores
- Sugerencias de corrección
- Opción de auto-fix

### CA-12: Mapeo de Ejercicios
**Al importar de Moodle/SCORM:**
- Mostrar tabla de mapeo:
  | Tipo Original | Tipo GAMILIT | Estado |
  |---------------|--------------|--------|
  | Multiple choice | Opción múltiple | ✅ Compatible |
  | Cloze | Fill in blank | ✅ Compatible |
  | Flash | - | ❌ No soportado |
- Permitir cambiar mapeo manual
- Advertir sobre tipos no compatibles
- Sugerir tipo GAMILIT más cercano

### CA-13: Batch Import/Export
**Features:**
- Importar múltiples archivos simultáneamente
- Exportar múltiples módulos como ZIP
- Progress bar por archivo
- Logs de proceso
- Resumen al finalizar:
  - N archivos procesados exitosamente
  - M archivos con errores
  - Links a contenido importado

### CA-14: Preview Antes de Importar
**Para todos los formatos:**
- Vista previa de cómo se verá en GAMILIT
- Side-by-side: Original | Convertido
- Resaltar diferencias/pérdidas de formato
- Opción de ajustar manualmente
- "Aceptar" o "Cancelar" importación

### CA-15: Logs y Troubleshooting
**Sistema de logs:**
- Log detallado de cada importación/exportación
- Errores con stack trace (para soporte)
- Warnings no críticos
- Tiempo de procesamiento
- Tamaño de archivos
- Descargar logs como TXT

**Soporte:**
- FAQ de problemas comunes
- "Reportar problema" con logs adjuntos
- Email automático a soporte si fallo crítico

---

## Especificaciones Técnicas

### Technology Stack
```
Importación:
- Mammoth.js (DOCX → HTML)
- PDF.js (PDF parsing)
- xml2js (Moodle XML)
- SCORM Cloud API (SCORM packages)
- Google Docs API (Google Docs)

Exportación:
- Puppeteer (HTML → PDF)
- docx library (HTML → DOCX)
- jszip (crear ZIPs)

Processing:
- Bull queue para conversiones pesadas
- Worker threads para procesamiento paralelo
- Multer para file upload
```

### Frontend Components
```
src/features/import-export/
├── components/
│   ├── ImportWizard.tsx
│   ├── FileUploader.tsx
│   ├── FormatSelector.tsx
│   ├── PreviewPanel.tsx
│   ├── MappingTable.tsx
│   ├── ValidationReport.tsx
│   ├── ExportModal.tsx
│   └── ProgressTracker.tsx
└── hooks/
    ├── useImport.ts
    └── useExport.ts
```

### Backend API
```typescript
POST /api/import/docx
POST /api/import/pdf
POST /api/import/gdocs
POST /api/import/moodle-xml
POST /api/import/scorm

POST /api/export/pdf/:moduleId
POST /api/export/docx/:moduleId
POST /api/export/html/:moduleId
POST /api/export/json/:moduleId

GET /api/import/jobs/:jobId/status
GET /api/import/jobs/:jobId/preview
```

### Processing Pipeline
```
1. Upload archivo
2. Validar formato y tamaño
3. Queue job de conversión
4. Procesar en background:
   - Parsear contenido
   - Extraer multimedia
   - Convertir a formato GAMILIT
   - Validar resultado
5. Generar preview
6. Usuario aprueba/ajusta
7. Guardar en base de datos
8. Notificar completación
```

---

## Diferenciación con Alcance Inicial

### Alcance Inicial (EAI)
- Sin importación de contenido externo
- Sin exportación
- Crear todo desde cero

### Esta Historia (EXT-006)
- **Importación**: Word, PDF, Google Docs, Moodle, SCORM
- **Exportación**: PDF, Word, HTML, JSON
- **Conversión inteligente** con validación
- **Mapeo de ejercicios** automático
- **Batch processing**
- **Preview y validación**
- Esto es **migración y portabilidad completa**

---

## Dependencias

### Depende de
- **US-CONT-001**: Editor (destino de importación)
- **US-CONT-002**: Ejercicios (mapeo de preguntas)
- **US-CONT-003**: Biblioteca (almacenar multimedia importado)

---

## Definición de Terminado (DoD)

- [ ] Importación DOCX funcional
- [ ] Importación PDF con OCR
- [ ] Importación Google Docs (OAuth)
- [ ] Importación Moodle XML
- [ ] Importación SCORM básica
- [ ] Exportación PDF con estilos
- [ ] Exportación DOCX
- [ ] Exportación HTML
- [ ] Exportación JSON
- [ ] Preview antes de importar
- [ ] Validación automática
- [ ] Mapeo de ejercicios
- [ ] Batch import/export
- [ ] Queue de trabajos
- [ ] Tests >80% coverage
- [ ] Documentación
- [ ] Video tutoriales por formato

---

## Estimación Detallada (6 SP)

| Tarea | Horas |
|-------|-------|
| Import DOCX (Mammoth) | 10h |
| Import PDF (PDF.js) | 10h |
| Import Google Docs | 8h |
| Import Moodle XML | 10h |
| Import SCORM | 8h |
| Export PDF (Puppeteer) | 10h |
| Export DOCX | 8h |
| Export HTML/JSON | 6h |
| Validación | 8h |
| Preview system | 8h |
| Mapeo de ejercicios | 8h |
| Queue processing | 6h |
| Backend API | 10h |
| Testing | 10h |
| Documentación | 6h |
| **TOTAL** | **126h** |

**Presupuesto**: $3,400 MXN
**Duración**: 3-4 días

---

## Tags

#ext-006 #import #export #migracion #moodle #scorm #docx #pdf #interoperabilidad #mes-3

---

**Creado**: 2025-11-02
**Autor**: Sistema de Migración - Subagente EXT 4-6
**Origen**: EP005/US-005-11-content-creator-page.md
**Compliance**: PF-001 (XXX líneas)
