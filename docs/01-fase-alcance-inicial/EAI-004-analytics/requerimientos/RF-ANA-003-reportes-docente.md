---
id: "RF-ANA-003"
title: "Reportes para Docentes y Administradores"
type: "Requirement"
status: "Done"
priority: "Alta"
module: "Analytics"
epic: "EAI-004"
version: "1.0"
labels: ["analytics", "reports", "export", "csv", "teacher", "admin"]
created_date: "2026-01-20"
updated_date: "2026-01-20"
---

# RF-ANA-003: Reportes para Docentes y Administradores

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-ANA-003 |
| **Modulo** | Analytics |
| **Prioridad** | Alta |
| **Estado** | Done |
| **Version** | 1.0 |
| **Fecha creacion** | 2026-01-20 |
| **Ultima actualizacion** | 2026-01-20 |

## Referencias

### Especificacion Tecnica
- [ET-ANA-003: Exportacion de Datos](../especificaciones/ET-ANA-003-exportacion-datos.md)

### Historias de Usuario Relacionadas
- [US-ANA-004](../historias-usuario/US-ANA-004-reporte-basico-progreso.md) - Reporte Basico de Progreso

---

## Descripcion del Requerimiento

### Contexto

Los profesores y administradores necesitan generar reportes que resuman el progreso de sus clases para:
- Documentar el avance de los estudiantes
- Compartir informacion con padres o administradores
- Mantener registros para evaluaciones
- Analizar tendencias a nivel de modulo

### Necesidad del Negocio

**Problema:**
Sin un sistema de reportes:
- Profesores no tienen forma de documentar el progreso
- Imposible compartir informacion con terceros (padres, directivos)
- No hay registros historicos del avance
- Analisis manual es tedioso y propenso a errores

**Solucion:**
Implementar un sistema de reportes basicos que permita a los profesores ver un resumen del progreso de la clase por modulo, con opcion de exportar a CSV para analisis externo o archivo.

---

## Requerimiento Funcional

### RF-ANA-003.1: Reporte de Progreso de Clase

El sistema **DEBE** generar un reporte de progreso que incluya:

#### Resumen General
| Metrica | Descripcion |
|---------|-------------|
| Total de Estudiantes | Numero de estudiantes en la clase |
| Total de Modulos | Numero de modulos asignados |
| Progreso General | Porcentaje promedio de completitud |
| Estudiantes Completos | Estudiantes con todos los modulos completados |
| Estudiantes con Pendientes | Estudiantes con modulos pendientes |

#### Progreso por Modulo
Para cada modulo asignado a la clase:
| Campo | Descripcion |
|-------|-------------|
| Nombre del Modulo | Identificador del modulo |
| Completados | Numero de estudiantes que completaron (100%) |
| En Progreso | Numero de estudiantes con progreso >0% y <100% |
| No Iniciados | Numero de estudiantes con 0% progreso |
| % Promedio | Porcentaje promedio de completitud del modulo |

#### Visualizacion
- Tabla con todos los modulos y sus metricas
- Barra de progreso visual por modulo
- Badges de color por estado (verde/amarillo/gris)
- Ordenamiento alfabetico por nombre de modulo

### RF-ANA-003.2: Exportacion a CSV

El sistema **DEBE** permitir exportar el reporte a formato CSV:

#### Contenido del CSV
```csv
Reporte de Progreso - [Nombre de la Clase]
Generado: [Fecha y Hora]

RESUMEN GENERAL
Total de Estudiantes,[valor]
Total de Modulos,[valor]
Progreso General,[valor]%

Modulo,Completados,En Progreso,No Iniciados,% Promedio
[Modulo 1],[N],[N],[N],[N]%
[Modulo 2],[N],[N],[N],[N]%
...
```

#### Especificaciones del Archivo
- Encoding: UTF-8 con BOM (compatible con Excel)
- Nombre: `reporte-[clase]-[fecha].csv`
- Descarga automatica al hacer clic en "Exportar"
- Comas escapadas en nombres de modulos

### RF-ANA-003.3: Metadata del Reporte

El sistema **DEBE** incluir metadata del reporte:
- Identificador de la clase
- Nombre de la clase
- Fecha y hora de generacion
- Nombre del profesor que genero el reporte

---

## Criterios de Aceptacion

### AC-001: Reporte Visual Funcional
- [x] Tabla muestra todos los modulos de la clase
- [x] Resumen general muestra metricas correctas
- [x] Barras de progreso reflejan el % promedio
- [x] Badges de color se aplican correctamente

### AC-002: Calculos Precisos
- [x] Conteo de completados/en progreso/no iniciados es correcto
- [x] Porcentaje promedio se calcula correctamente
- [x] Total de estudiantes coincide con datos reales
- [x] Progreso general es promedio de todos los modulos

### AC-003: Exportacion CSV Funcional
- [x] Boton "Exportar a CSV" genera archivo
- [x] Archivo se descarga automaticamente
- [x] Nombre de archivo incluye clase y fecha
- [x] CSV abre correctamente en Excel y Google Sheets

### AC-004: Formato CSV Correcto
- [x] Header con informacion de la clase
- [x] Seccion de resumen general
- [x] Tabla de modulos con headers
- [x] Encoding UTF-8 con BOM

### AC-005: Performance
- [x] Reporte genera en menos de 3 segundos
- [x] CSV genera en menos de 2 segundos
- [x] Skeleton loader se muestra durante la carga

---

## Casos de Uso

### UC-ANA-007: Profesor genera reporte de progreso

**Actor:** Profesor
**Precondiciones:** Profesor autenticado con clase asignada

**Flujo:**
1. Profesor navega a vista de reportes
2. Sistema muestra resumen general de la clase
3. Sistema muestra tabla con progreso por modulo
4. Profesor revisa estado de cada modulo
5. Profesor identifica modulos con bajo progreso promedio

**Resultado:** Profesor tiene vision completa del progreso por modulo

### UC-ANA-008: Profesor exporta reporte para compartir

**Actor:** Profesor
**Precondiciones:** Profesor en vista de reportes

**Flujo:**
1. Profesor hace clic en "Exportar a CSV"
2. Sistema genera archivo CSV con todos los datos
3. Navegador descarga archivo automaticamente
4. Profesor abre archivo en Excel
5. Profesor envia reporte por email a director/padres

**Resultado:** Profesor comparte reporte con terceros

### UC-ANA-009: Administrador revisa reportes de multiples clases

**Actor:** Administrador
**Precondiciones:** Administrador con acceso a multiples clases

**Flujo:**
1. Administrador selecciona clase del listado
2. Sistema genera reporte de la clase seleccionada
3. Administrador exporta CSV
4. Administrador repite para otras clases
5. Administrador consolida datos en spreadsheet externo

**Resultado:** Administrador tiene datos de multiples clases para analisis

---

## Consideraciones de Seguridad

### Autorizacion
- Solo profesores pueden generar reportes de sus clases
- Administradores pueden generar reportes de clases de su institucion
- Endpoint de exportacion valida permisos antes de generar

### Datos Sensibles
- Reporte no incluye datos personales de estudiantes (solo agregados)
- En extension futura, reporte individual requerira consentimiento

---

## Notas de Implementacion

1. **Generacion del Reporte:**
   - Calcular progreso de cada estudiante por modulo
   - Agregar por modulo (completados/en progreso/no iniciados)
   - Calcular promedios

2. **Generacion del CSV:**
   - Generar on-the-fly (no almacenar)
   - Agregar BOM para compatibilidad Excel
   - Escapar comas y comillas en textos

3. **Performance:**
   - Cachear reporte por 10 minutos
   - Query optimizado con agregaciones SQL
   - Para clases grandes (>100), considerar generacion asincrona

4. **UX:**
   - Indicador de progreso durante exportacion
   - Mensaje de exito al descargar
   - Skeleton loader durante carga del reporte

---

## Alcance Basico vs Extensiones

### EAI-004 (Este alcance - Analytics Basico):
- Reporte simple de progreso por modulo
- Resumen general basico
- Exportacion a CSV unicamente
- Vista estatica (sin filtros ni configuracion)
- Ordenamiento alfabetico por modulo

### EXT-005 (Extension futura - Reportes Avanzados):
- Multiples formatos de exportacion (PDF, Excel, CSV)
- Graficas visuales en el reporte
- Filtros por fechas, modulos, grupos
- Reportes configurables (elegir metricas)
- Comparativas entre periodos
- Reporte individual por estudiante (PDF)
- Programacion de reportes automaticos
- Compartir reporte con otros profesores
- Analisis de tendencias

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-20 | Documentation Team | Creacion inicial del requerimiento |

---

**Documento:** `docs/01-fase-alcance-inicial/EAI-004-analytics/requerimientos/RF-ANA-003-reportes-docente.md`
