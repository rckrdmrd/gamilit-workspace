# Inventario de Documentos RF-* y ET-*

## Descripción

Este directorio contiene un inventario completo de todos los documentos de **Requerimientos Funcionales (RF-*)** y **Especificaciones Técnicas (ET-*)** del proyecto Gamilit.

**Fecha de generación:** 2025-11-07
**Total de documentos catalogados:** 46 (24 RF + 22 ET)

---

## Archivos Generados

### 1. `INVENTARIO_RF_ET.csv`

**Formato:** Comma-Separated Values (CSV)

**Columnas:**
- `id` - Identificador único del documento (ej: RF-AUTH-001)
- `title` - Título/nombre descriptivo del documento
- `path` - Ruta relativa del archivo desde la raíz del proyecto
- `module` - Módulo al que pertenece (AUTH, GAM, EDU, PRG, SOC, NOT, CNT, AUD, CFG)
- `status` - Estado del documento (Implementado, Pendiente, etc.)
- `lines` - Número aproximado de líneas del documento

**Uso:**
```bash
# Importar en Excel/Google Sheets
# Filtrar por módulo
# Analizar por número de líneas
```

**Ejemplo de registros:**
```
RF-AUTH-001,Sistema de Roles de Usuario,docs/01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md,AUTH,Implementado,391
ET-GAM-003,Sistema de Rangos Maya,docs/02-especificaciones-tecnicas/02-gamificacion/ET-GAM-003-rangos-maya.md,GAM,Implementado,1860
```

---

### 2. `INVENTARIO_ESTADISTICAS.md`

**Formato:** Markdown

**Contenido:**
- Resumen general del inventario
- Distribución por módulo
- Listado completo de documentos agrupados
- Estadísticas de contenido
- Promedios y análisis de líneas
- Estado de completitud
- Estructura de carpetas
- Cobertura RF-ET
- Dependencias entre documentos
- Notas de implementación

**Uso:**
- Consulta rápida de estadísticas
- Análisis de cobertura
- Referencia de documentos relacionados
- Identificación de dependencias

---

### 3. `INVENTARIO_RUTAS_COMPLETAS.txt`

**Formato:** Texto plano

**Contenido:**
- Rutas absolutas completas de cada documento
- Organizadas por categoría (RF vs ET)
- Agrupadas por módulo
- Resumen rápido al final

**Uso:**
- Acceso directo a archivos desde scripts
- Integración con herramientas de búsqueda
- Referencias para automatización

**Estructura:**
```
RF-AUTH-001: /home/isem/workspace/.../RF-AUTH-001-roles.md
RF-AUTH-002: /home/isem/workspace/.../RF-AUTH-002-estados-cuenta.md
...
```

---

## Estructura del Proyecto

### Documentos de Requerimientos (RF-*)
Ubicación: `docs/01-requerimientos/`

Organizado en 8 subdirectorios por módulo:
- `01-autenticacion-autorizacion/` (3 RF)
- `02-gamificacion/` (3 RF)
- `03-contenido-educativo/` (3 RF)
- `04-progreso-seguimiento/` (2 RF)
- `05-caracteristicas-sociales/` (3 RF)
- `06-notificaciones/` (2 RF)
- `07-contenido-media/` (3 RF)
- `08-auditoria-configuracion/` (5 RF)

### Especificaciones Técnicas (ET-*)
Ubicación: `docs/02-especificaciones-tecnicas/`

Mismo esquema de carpetas que RF, con especificaciones técnicas correspondientes (22 ET)

---

## Módulos Cubiertos

| Código | Nombre | RF | ET | Total |
|--------|--------|----|----|-------|
| **AUTH** | Autenticación/Autorización | 3 | 3 | 6 |
| **GAM** | Gamificación | 3 | 3 | 6 |
| **EDU** | Contenido Educativo | 3 | 3 | 6 |
| **PRG** | Progreso y Seguimiento | 2 | 2 | 4 |
| **SOC** | Características Sociales | 3 | 3 | 6 |
| **NOT** | Notificaciones | 2 | 2 | 4 |
| **CNT** | Contenido y Media | 3 | 3 | 6 |
| **AUD** | Auditoría | 4 | 3 | 7 |
| **CFG** | Configuración | 1 | 0 | 1 |
| **TOTAL** | | **24** | **22** | **46** |

---

## Estadísticas Principales

### Contenido
- **Total de líneas:** 35,829
  - RF-* : 16,285 líneas (45.4%)
  - ET-* : 19,544 líneas (54.6%)

### Documentos por Tamaño
**Top 5 más grandes:**
1. ET-GAM-003 (1860 líneas) - Sistema de Rangos Maya
2. ET-GAM-001 (1600 líneas) - Sistema de Achievements
3. ET-EDU-002 (1375 líneas) - Niveles de Dificultad
4. ET-EDU-003 (1284 líneas) - Taxonomía de Bloom
5. ET-EDU-001 (987 líneas) - Mecánicas de Ejercicios

**Top 5 más pequeños:**
1. RF-CNT-001 (169 líneas) - Gestión de Media
2. RF-AUD-001 (198 líneas) - Sistema de Auditoría
3. ET-CNT-001 (274 líneas) - Gestión de Media
4. RF-CNT-002 (411 líneas) - Tipos de Media
5. ET-CNT-002 (453 líneas) - Tipos de Media

### Promedio de Líneas
- Por documento: 779 líneas
- Por RF: 678 líneas
- Por ET: 888 líneas

---

## Estado de Completitud

**100% de los documentos están implementados**

### Cobertura RF-ET
- **Pares completos:** 22 documentos RF tienen su correspondiente ET
- **Cobertura:** 91.7% (22/24)

**Excepciones sin ET correspondiente:**
- RF-AUD-004: Retención de Datos
- RF-CFG-001: Sistema de Configuración

---

## Cómo Usar Este Inventario

### Buscar un Documento Específico
1. Usar `INVENTARIO_RF_ET.csv` con Ctrl+F
2. Buscar por ID (ej: "RF-EDU-001")
3. Obtener la ruta relativa

### Analizar Cobertura de un Módulo
1. Abrir `INVENTARIO_ESTADISTICAS.md`
2. Ir a la sección del módulo deseado
3. Ver distribución de RF y ET

### Obtener Rutas Absolutas
1. Consultar `INVENTARIO_RUTAS_COMPLETAS.txt`
2. Copiar la ruta completa del documento

### Crear Scripts de Automatización
1. Leer `INVENTARIO_RUTAS_COMPLETAS.txt`
2. Parsear las rutas para procesamiento automatizado

---

## Características de los Documentos

### Formato
- Todos en **Markdown (.md)**
- Estructura estandarizada con encabezados
- Incluyen metadatos en tabla YAML/tabla

### Contenido Típico de RF-*
- Descripción general del requerimiento
- Requerimientos funcionales específicos
- Casos de uso
- Criterios de aceptación
- Testing
- Dependencias y referencias

### Contenido Típico de ET-*
- Especificación técnica del RF correspondiente
- Arquitectura y diseño
- Esquema de base de datos
- Endpoints/APIs
- Componentes de frontend
- Código de ejemplo
- Guía de implementación

---

## Referencias Cruzadas

### Ejemplo: Módulo EDU
```
RF-EDU-001 (Mecánicas de Ejercicios)
  ↓
ET-EDU-001 (Mecánicas de Ejercicios - Implementación)
  ↓
Relacionado con:
  - RF-EDU-002 (Niveles de Dificultad)
  - RF-EDU-003 (Taxonomía de Bloom)
  - RF-PRG-001 (Tracking de Progreso)
  - RF-GAM-002 (Sistema de Comodines)
```

---

## Mantenimiento del Inventario

### Cómo Actualizar
1. Cuando se agregue un nuevo documento RF o ET
2. Ejecutar script de generación
3. Actualizar los 3 archivos CSV/MD/TXT

### Convención de Nomenclatura
- **RF-{MODULE}-{NUMBER}** para requerimientos
- **ET-{MODULE}-{NUMBER}** para especificaciones
- Números secuenciales por módulo

---

## Notas Importantes

1. **Todos los documentos están completamente implementados**
2. **La mayoría de RF tienen su correspondiente ET** (excepto AUD-004 y CFG-001)
3. **Estructura consistente** en todas las carpetas
4. **Referencias cruzadas** bien mantenidas entre documentos
5. **Total de 35,829 líneas** de documentación técnica

---

## Contacto y Actualizaciones

**Último actualizado:** 2025-11-07
**Mantener actualizado cuando:** Se agreguen/modifiquen documentos RF-* o ET-*

---

## Archivos Relacionados

- `docs/01-requerimientos/` - Documentos de requerimientos
- `docs/02-especificaciones-tecnicas/` - Especificaciones técnicas
- `_MAP.md` - Mapa general del proyecto (si existe)

---

*Este inventario fue generado automáticamente y debe actualizarse regularmente.*

