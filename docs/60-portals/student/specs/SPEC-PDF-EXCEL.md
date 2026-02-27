# SPEC-PDF-EXCEL - Student Portal File Generation

**Version:** 1.0.0
**Fecha:** 2026-01-24
**Autor:** Claude Code (Auditoría Automatizada)
**Estado:** DOCUMENTADO

---

## 1. Vision General

El Student Portal tiene capacidades limitadas de generación de archivos PDF/Excel. La mayoría del contenido exportable está en el Admin Portal.

---

## 2. Estado Actual

### 2.1 Capacidades Existentes

| Función | Estado | Ubicación |
|---------|--------|-----------|
| Exportar calificaciones | No disponible | N/A |
| Exportar progreso | No disponible | N/A |
| Certificados PDF | Planificado | Backlog |
| Reportes de actividad | No disponible | N/A |

### 2.2 Exportación Indirecta

El estudiante puede acceder a exports generados por el Admin Portal si el profesor los comparte.

---

## 3. Planificación Futura

### 3.1 Certificados de Logro (Planificado)

```typescript
interface CertificateData {
  studentName: string;
  achievementName: string;
  dateUnlocked: Date;
  signature?: string;
  logo?: string;
}

// Librería sugerida: jsPDF
// Endpoint: GET /certificates/{achievementId}/pdf
```

### 3.2 Reporte de Progreso Personal (Planificado)

```typescript
interface ProgressReport {
  period: { start: Date; end: Date };
  modules: ModuleProgress[];
  exercises: ExerciseResult[];
  achievements: Achievement[];
  statistics: ProgressStats;
}

// Formato: PDF (resumen visual)
// Endpoint: GET /reports/progress?period=weekly|monthly
```

---

## 4. Librerías Recomendadas

| Librería | Uso | Notas |
|----------|-----|-------|
| jsPDF | Generación PDF cliente | Certificados simples |
| xlsx | Generación Excel | Datos tabulares |
| html2canvas | Screenshots | Captura de gráficos |
| react-to-pdf | React a PDF | Componentes completos |

---

## 5. Arquitectura Propuesta

### 5.1 Cliente-Side (Simple)

```
React Component → html2canvas → jsPDF → Download
```

Uso: Certificados simples, capturas de pantalla

### 5.2 Server-Side (Complejo)

```
Request → Backend → Template Engine → PDF/Excel → S3 → Download URL
```

Uso: Reportes complejos, datos confidenciales

---

## 6. Gaps Conocidos

| ID | Descripción | Severidad |
|----|-------------|-----------|
| - | Sin exportación de progreso para estudiante | Baja |
| - | Sin certificados de logro | Media |
| - | Sin reporte de actividad descargable | Baja |

---

## 7. Referencias

- **Admin Portal Exports:** (fuera de alcance de esta auditoría)
- **Achievements:** `SPEC-ACHIEVEMENTS.md`
- **Progress:** `SPEC-PROGRESS.md`

---

*Generado: 2026-01-24*
*Sistema SIMCO v4.0.0*
