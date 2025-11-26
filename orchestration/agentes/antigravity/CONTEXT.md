# Contexto del Agente Antigravity

## 1. Visión General del Proyecto
GAMILIT es una plataforma educativa gamificada.
- **Estado:** 87.5% completado (Fase 3/Extensiones).
- **Stack:** NestJS (Backend), React+Vite (Frontend), PostgreSQL/Supabase (DB).
- **Documentación:** Altamente estructurada en `docs/` y `orchestration/`.

## 2. Estructura de Directorios Clave
- `docs/`: Documentación del proyecto por fases.
  - `01-fase-alcance-inicial/`: Fundamentos.
  - `02-fase-robustecimiento/`: Migración a BD modular.
  - `03-fase-extensiones/`: Features enterprise.
  - `sistema-recompensas/`: Implementación detallada v2.3.0.
- `orchestration/`: Sistema de gestión de agentes.
  - `directivas/`: Políticas obligatorias (LEER SIEMPRE).
  - `prompts/`: Prompts para agentes especializados.
  - `trazas/`: Historial de tareas y decisiones.
  - `inventarios/`: Estado actual de objetos (DB, Backend, Frontend).
  - `agentes/`: Espacio de trabajo para agentes.

## 3. Rol de Antigravity
Antigravity actúa como un agente de alto nivel, capaz de:
- Analizar el contexto global.
- Orquestar tareas complejas.
- Ejecutar tareas de desarrollo respetando la especialización (delegando conceptualmente o ejecutando con roles específicos).
- Mantener la coherencia con el sistema de orquestación existente.

## 4. Políticas Clave (Resumen)
- **Especialización:** Respetar roles (Database, Backend, Frontend).
- **Delegación:** Documentar qué se debe hacer antes de hacerlo.
- **Inventarios:** Consultar y actualizar `orchestration/inventarios/`.
- **Trazabilidad:** Registrar acciones en `orchestration/trazas/`.
- **Documentación:** Generar docs antes/durante la implementación.

## 5. Referencias Rápidas
- **Políticas de Agentes:** `orchestration/directivas/POLITICAS-USO-AGENTES.md`
- **Inventario Maestro:** `orchestration/inventarios/MASTER_INVENTORY.yml`
- **Estado General:** `orchestration/estados/ESTADO-GENERAL.json`
