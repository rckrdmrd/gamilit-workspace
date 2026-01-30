# TASK-006: Contexto

## Problema Identificado

El sistema de reportes administrativos del Portal Admin de GAMILIT generaba archivos **mock** (texto plano) en lugar de archivos binarios reales.

### Síntomas
- Los reportes PDF/Excel se descargaban pero aparecían como "archivo corrupto"
- El contenido era texto plano con formato de reporte simulado
- Los visores de PDF y Excel no podían abrir los archivos

### Causa Raíz

**Ubicación:** `apps/backend/src/modules/admin/services/admin-reports.service.ts`

El método `generateMockReportContent()` (líneas 431-462) generaba texto plano:

```typescript
private generateMockReportContent(report: AdminReport): string {
  const header = `
========================================
GAMILIT - REPORTE ADMINISTRATIVO
========================================
...
`;
  return header + body;
}
```

Y se guardaba como texto sin importar el formato:

```typescript
await fs.writeFile(filePath, reportContent, 'utf-8');
```

## Alcance

| Componente | Afectado |
|------------|----------|
| Backend Service | admin-reports.service.ts |
| Backend Controller | admin-reports.controller.ts |
| Dependencias NPM | package.json |
| Base de Datos | Tablas ya existían con estructura correcta |

## Requisitos de la Solución

1. **PDF:** Generar archivos PDF binarios reales usando `pdfkit`
2. **Excel:** Generar archivos XLSX binarios reales usando `exceljs`
3. **CSV:** Generar archivos CSV con BOM para compatibilidad Excel
4. **Streaming:** Devolver archivos con Content-Type correcto
5. **Datos reales:** Consultar datos de la BD según tipo de reporte

## Referencias

- Plan de Correcciones: Portal Admin Gamilit (2026-01-25)
- Epic: EXT-002 (Admin Extendido - Reports)
- Archivos relacionados:
  - `apps/backend/src/modules/admin/services/admin-reports.service.ts`
  - `apps/backend/src/modules/admin/controllers/admin-reports.controller.ts`
