# CHECKLIST DE VALIDACIÓN - MIGRACIÓN GAMILIT

**Fecha:** 2025-12-18
**Versión:** 1.0.0

---

## PRE-SINCRONIZACIÓN

### Verificaciones Iniciales
- [ ] Verificar que el repositorio ORIGEN tiene todos los cambios commitados o guardados
- [ ] Verificar que el repositorio DESTINO está accesible
- [ ] Verificar espacio en disco suficiente para backup
- [ ] Verificar que no hay procesos corriendo en DESTINO (npm run dev, etc.)

### Backup
- [ ] Crear backup del DESTINO con `git stash` o copia física
- [ ] Documentar el estado actual del DESTINO (último commit, cambios pendientes)
- [ ] Guardar copia de seeds críticos de producción

---

## DURANTE SINCRONIZACIÓN

### Database (70 archivos)
- [ ] DDL sincronizado (schemas, tables, functions, triggers)
- [ ] Seeds DEV sincronizados
- [ ] Seeds PROD sincronizados
- [ ] Seeds STAGING sincronizados
- [ ] Archivo create-database.sh actualizado

### Backend (40 archivos)
- [ ] Módulo assignments sincronizado
- [ ] Módulo auth sincronizado
- [ ] Módulo educational sincronizado
- [ ] Módulo gamification sincronizado
- [ ] Módulo progress sincronizado
- [ ] Módulo teacher sincronizado
- [ ] Módulo admin sincronizado
- [ ] Módulo health sincronizado
- [ ] Constantes shared sincronizadas

### Frontend (105 archivos)
- [ ] App.tsx sincronizado
- [ ] Admin portal sincronizado (13 archivos)
- [ ] Student portal sincronizado (6 archivos)
- [ ] Teacher portal sincronizado (18 archivos)
- [ ] Features gamification sincronizado (11 archivos)
- [ ] Features mechanics module1-2 sincronizado
- [ ] Features mechanics module4 sincronizado (7 archivos activos)
- [ ] Features mechanics module5 sincronizado (3 archivos + nuevos)
- [ ] Services API sincronizados
- [ ] Shared components sincronizados

### Docs (117 archivos)
- [ ] Documentación actualizada sincronizada
- [ ] Archivos obsoletos eliminados (53 archivos)
- [ ] Guías de desarrollo sincronizadas

### Orchestration (61 archivos)
- [ ] Inventarios sincronizados
- [ ] Reportes sincronizados
- [ ] Guidelines sincronizados

---

## ELIMINACIÓN DE OBSOLETOS

### Frontend - Mecánicas Eliminadas
- [ ] `ChatLiterario/` eliminado
- [ ] `EmailFormal/` eliminado
- [ ] `EnsayoArgumentativo/` eliminado
- [ ] `ResenaCritica/` eliminado

### Backend - DTOs Eliminados
- [ ] `diario-reflexivo-answer.dto.ts` eliminado
- [ ] `podcast-answer.dto.ts` eliminado

### Database - Seeds Eliminados
- [ ] `05-profiles-demo.sql` eliminado de prod/auth_management

---

## POST-SINCRONIZACIÓN

### Verificación de Estructura
- [ ] Verificar que existen los archivos nuevos en DESTINO
- [ ] Verificar que NO existen los archivos eliminados en DESTINO
- [ ] Verificar permisos de archivos (especialmente scripts .sh)

### Verificación de Código

#### Backend
```bash
cd apps/backend
npm install           # [ ] Sin errores
npm run build         # [ ] Sin errores
npm run lint          # [ ] Sin errores críticos
npx tsc --noEmit      # [ ] Sin errores de TypeScript
```

#### Frontend
```bash
cd apps/frontend
npm install           # [ ] Sin errores
npm run build         # [ ] Sin errores
npm run lint          # [ ] Sin errores críticos
npx tsc --noEmit      # [ ] Sin errores de TypeScript
```

### Verificación de Imports
- [ ] No hay imports a archivos eliminados (ChatLiterario, EmailFormal, etc.)
- [ ] No hay imports a DTOs eliminados (diario-reflexivo, podcast)
- [ ] Los nuevos DTOs están correctamente exportados
- [ ] Los nuevos componentes están correctamente exportados

### Verificación de Seeds
- [ ] Orden de seeds es correcto (sin dependencias circulares)
- [ ] UUIDs son consistentes entre tablas relacionadas
- [ ] No hay referencias a usuarios/perfiles eliminados

---

## COMMIT Y PUSH

### Pre-Commit
- [ ] `git status` muestra solo los cambios esperados
- [ ] No hay archivos sensibles (.env, credenciales)
- [ ] No hay archivos de backup temporales

### Commit
- [ ] Mensaje descriptivo con fecha y resumen de cambios
- [ ] Referencias a documentación de migración

### Push
- [ ] Push exitoso a rama main/master
- [ ] Verificar en GitHub/GitLab que los cambios están

---

## VALIDACIÓN FINAL

### Funcional (si aplica en staging/producción)
- [ ] Login funciona correctamente
- [ ] Portal estudiante carga
- [ ] Portal maestro carga
- [ ] Portal admin carga
- [ ] Ejercicios de módulo 1-5 funcionan
- [ ] Sistema de gamificación funciona

### Base de Datos (si se ejecutan seeds)
- [ ] Seeds de desarrollo cargan sin errores
- [ ] Seeds de producción cargan sin errores
- [ ] Datos críticos están presentes

---

## ROLLBACK (si es necesario)

### Pasos de Rollback
1. [ ] Detener servicios en producción
2. [ ] Restaurar desde git stash: `git stash pop`
3. [ ] O restaurar desde backup físico
4. [ ] Verificar que el rollback fue exitoso
5. [ ] Reiniciar servicios
6. [ ] Documentar la razón del rollback

---

## NOTAS Y OBSERVACIONES

| Fecha | Observación | Acción Tomada |
|-------|-------------|---------------|
| | | |
| | | |
| | | |

---

## FIRMA DE VALIDACIÓN

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Desarrollador | | | |
| QA | | | |
| DevOps | | | |

---

**Generado por:** Requirements-Analyst Agent
**Fecha:** 2025-12-18
