# _MAP: docs/00-vision-general/

**Ultima actualizacion:** 2026-01-04
**Estado:** Activo
**Version:** 3.0
**Proposito:** Vision general, definiciones y documentacion de alto nivel

---

## Proposito de esta Carpeta

Esta carpeta contiene la **documentacion de alto nivel y definiciones generales** del proyecto GAMILIT. Es el punto de entrada para entender el producto y sirve como fuente de verdad para las especificaciones que luego se detallan en las carpetas de fases.

**Audiencia:**
- Nuevos desarrolladores (onboarding)
- Stakeholders (vision del proyecto)
- Product Owners (contexto general)
- Arquitectos (documento de diseno)
- QA (guias de pruebas)

---

## Contenido Principal

### Documentos de Vision y Onboarding

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| [VISION.md](./VISION.md) | Vision, mision y objetivos estrategicos | Done |
| [ONBOARDING.md](./ONBOARDING.md) | Guia de setup inicial (2-3 horas) | Done |
| [GLOSARIO.md](./GLOSARIO.md) | Terminos y definiciones del proyecto | Done |
| [README.md](./README.md) | Indice de la carpeta | Done |

### Documentos de Diseno (Fuente de Verdad)

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| [DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md](./DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md) | **DOCUMENTO PRINCIPAL** - Mecanicas, modulos, ejercicios, sistema de rangos Maya, XP, ML Coins | Done |
| [DATOS-GAMIFICACION.md](./DATOS-GAMIFICACION.md) | Resumen consolidado de datos de gamificacion | Done |
| [ANALISIS-HOMOLOGACION-DOC-DISENO-v6.1.md](./ANALISIS-HOMOLOGACION-DOC-DISENO-v6.1.md) | Analisis de alineacion entre documento de diseno e implementacion | Done |
| [REPORTE-INVESTIGACION-MULTIPLICADOR-ML-COINS.md](./REPORTE-INVESTIGACION-MULTIPLICADOR-ML-COINS.md) | Investigacion sobre multiplicadores de monedas | Done |

### Guias de Pruebas por Modulo

| Archivo | Modulo | Estado |
|---------|--------|--------|
| [GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md) | M1: Comprension Literal | Done |
| [GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO2-Respuestas-Ejemplo.md) | M2: Comprension Inferencial | Done |
| [GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO3-Respuestas-Ejemplo.md) | M3: Comprension Critica | Done |
| [GUIA-PRUEBAS-MODULO4-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO4-Respuestas-Ejemplo.md) | M4: Lectura Digital | Done |
| [GUIA-PRUEBAS-MODULO5-Respuestas-Ejemplo.md](./GUIA-PRUEBAS-MODULO5-Respuestas-Ejemplo.md) | M5: Produccion Creativa | Done |

---

## Subcarpetas

### archivados/
Versiones anteriores de documentos deprecados.
- `GUIA-PRUEBAS-MODULO3-Respuestas.md` - Version anterior de guia M3

### directivas/
Directivas especificas del proyecto.
- `_INDEX.md` - Indice de directivas

### migracion/
Documentacion de migracion entre fases.
- `README.md` - Guia de migracion
- `README-FASE-5.md` - Detalles fase 5
- `_MAP-FASE-5.md` - Mapa de fase 5

---

## Documento de Diseno - Contenido Principal

El archivo `DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md` es la **fuente de verdad** para:

### Sistema de Rangos Maya
| Rango | XP Minimo | XP Maximo | Bonus ML |
|-------|-----------|-----------|----------|
| AJAW | 0 | 499 | - |
| NACOM | 500 | 999 | +100 ML |
| AH K'IN | 1,000 | 1,499 | +250 ML |
| HALACH UINIC | 1,500 | 1,899 | +500 ML |
| K'UK'ULKAN | 1,900 | infinito | +1,000 ML |

### 5 Modulos Educativos (23 Ejercicios)
1. **M1 - Comprension Literal** (5 ejercicios): Crucigrama, Linea de Tiempo, Completar Espacios, V/F, Sopa de Letras
2. **M2 - Comprension Inferencial** (5 ejercicios): Detective Textual, Hipotesis, Prediccion, Puzzle Contexto, Rueda Inferencias
3. **M3 - Comprension Critica** (5 ejercicios): Tribunal Opiniones, Debate Digital, Analisis Fuentes, Podcast, Matriz Perspectivas
4. **M4 - Lectura Digital** (5 ejercicios): Verificador Fake News, Infografia, Quiz TikTok, Navegacion Hipertextual, Analisis Memes
5. **M5 - Produccion Creativa** (3 opciones): Diario Interactivo, Comic Digital, Capsula del Tiempo

---

## Interdependencias

### Esta Carpeta Alimenta A:
- `01-fase-alcance-inicial/` - Especificaciones detalladas de EPICs
- `02-fase-robustecimiento/` - Modulos M4-M5
- `03-fase-extensiones/` - Extensiones futuras
- `90-transversal/` - Arquitectura y API
- `apps/database/seeds/` - Datos de gamificacion

### Esta Carpeta Consume De:
- Product Owner - Vision del producto
- Arquitectura - Decisiones tecnicas (ADRs)

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Total archivos principales | 13 |
| Guias de pruebas | 5 |
| Subcarpetas | 3 |
| Version documento diseno | v6.5 |

---

**Actualizado:** 2026-01-04
**Mantenido por:** Architecture Team
