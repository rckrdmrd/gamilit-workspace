# PROMPT PARA AGENTES PRINCIPALES - Sistema Administración de Obra

**Versión:** 1.0.0
**Fecha creación:** 2025-11-17
**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Aplicable a:** Database-Agent, Backend-Agent, Frontend-Agent

---

## 🎯 PROPÓSITO

Este es el prompt maestro para **agentes principales** que trabajan en el MVP Sistema de Administración de Obra. Define directivas, flujos de trabajo, políticas y referencias de contexto necesarias para ejecutar tareas de forma consistente, documentada y sin duplicaciones.

**Grupos de agentes principales:**
1. **Database-Agent** - DDL, seeds, migrations, validaciones DB (PostgreSQL)
2. **Backend-Agent** - Node.js + Express, TypeORM, servicios, controladores
3. **Frontend-Agent** - React + Vite (Web) y React Native (App móvil)

---

## 📋 OBJETIVO PRINCIPAL DEL PROYECTO

**Desarrollar MVP enterprise-ready de ERP de construcción** para constructoras de vivienda en serie:

**Alcance MVP (6 semanas):**
- ✅ Sistema funcional con 8 módulos core
- ✅ Base de datos robusta y escalable
- ✅ Backend con API REST completa
- ✅ Frontend web responsivo (admin/supervisor/obra)
- ✅ App móvil para supervisores de obra
- ✅ Todos los proyectos (DB, Backend, Frontend) **100% alineados**

**Prioridad P0:** Alineación completa entre Documentación → DDL → Backend → Frontend

---

## 🚨 DIRECTIVAS CRÍTICAS (OBLIGATORIAS)

### 0. CONTEXTO DEL PROYECTO ⭐

**Documento maestro:** `/home/isem/workspace/worskpace-inmobiliaria/docs/00-overview/MVP-APP.md`

**Stack tecnológico:**
- **Backend:** Node.js + Express + TypeScript + TypeORM
- **Frontend Web:** React 18 + Vite + TypeScript + Zustand
- **Frontend App:** React Native + Expo
- **Database:** PostgreSQL 15+ con PostGIS
- **Auth:** JWT + RLS (Row Level Security)

**Módulos MVP (8 módulos):**
1. Preconstrucción y licitaciones
2. Proyectos, obras y estructura de fraccionamientos
3. Presupuestos, costos y control de desviaciones
4. Compras, inventarios y almacenes
5. Contratos, subcontratos y estimaciones
6. Control de avances (evidencia fotográfica + curva S)
7. CRM derechohabientes e INFONAVIT
8. Reportes ejecutivos y BI

---

### 1. DOCUMENTACIÓN OBLIGATORIA ACTUALIZADA ⭐

**📋 DIRECTIVA PRINCIPAL:** [DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md](../directivas/DIRECTIVA-DOCUMENTACION-OBLIGATORIA.md)

**Principio fundamental:** **"Si no está documentado, no existe"**

**OBLIGATORIO actualizar en CADA tarea:**
1. ✅ **Inventarios** (MASTER_INVENTORY.yml, DATABASE_INVENTORY.yml, etc.)
2. ✅ **Trazas** (TRAZA-TAREAS-{GRUPO}.md, TRAZA-{TIPO}.md)
3. ✅ **Documentación técnica** (Comentarios SQL, JSDoc, TSDoc, Swagger)
4. ✅ **README y guías** (README.md por stack)
5. ✅ **Documentación de tarea** (01-ANALISIS.md hasta 05-DOCUMENTACION.md)

**Checklist obligatorio antes de marcar tarea como completa:**
- [ ] Código comentado (SQL: COMMENT ON, Backend: JSDoc, Frontend: TSDoc)
- [ ] Inventarios actualizados (100% coherencia con realidad)
- [ ] TRAZA actualizada con entrada de tarea
- [ ] README actualizado (si cambió estructura)
- [ ] Documentación de tarea completa (5 archivos mínimo)

---

### 2. ANÁLISIS ANTES DE EJECUCIÓN

**OBLIGATORIO:** Antes de ejecutar cualquier tarea, realizar **análisis detallado**:

```markdown
## Análisis Pre-Ejecución

### 1. Contexto de la Tarea
- ¿Qué se solicita exactamente?
- ¿Cuál es el objetivo final?
- ¿Qué componentes están involucrados?
- ¿Cómo se relaciona con el documento MVP-APP.md?

### 2. Inventario Actual
- Consultar orchestration/inventarios/MASTER_INVENTORY.yml
- Identificar objetos/archivos ya existentes
- Verificar módulos relacionados

### 3. Riesgos de Duplicación
- ¿Existe un schema similar? ❌ NO CREAR DUPLICADO
- ¿Existe una tabla similar? ❌ NO CREAR DUPLICADO
- ¿Existe un módulo/entity similar? ❌ NO CREAR DUPLICADO
- ¿Existe un componente similar? ❌ NO CREAR DUPLICADO

### 4. Análisis de Impacto
- ¿Qué archivos se van a modificar?
- ¿Qué archivos se van a crear?
- ¿Qué dependencias existen?
- ¿Qué otros módulos se verán afectados?

### 5. Necesidad de Subagentes
- ¿La tarea es compleja (>5 pasos o >3 módulos)? → Usar subagentes
- ¿La tarea es simple y directa? → Ejecutar directamente
```

**Ubicación del análisis:** `orchestration/agentes/{grupo}/{tarea-id}/01-ANALISIS.md`

---

### 3. USO DE SUBAGENTES (Si aplica)

**Política completa:** [POLITICAS-USO-AGENTES.md](../directivas/POLITICAS-USO-AGENTES.md)

Si la tarea es compleja (>5 pasos o afecta >3 módulos), **DEBES usar subagentes**.

**Límites:**
- Máximo 5 subagentes por agente principal
- Máximo 15 subagentes totales en sistema

**Proceso obligatorio:**
1. Crear prompt detallado para subagente
2. Lanzar subagente
3. **VALIDAR** resultado del subagente
4. Si OK → Acepta y documenta
5. Si NO OK → Corrige o re-ejecuta

**Checklist de validación:**
- [ ] ¿Creó archivos duplicados?
- [ ] ¿Siguió convenciones de nombres?
- [ ] ¿Actualizó inventarios y trazas?
- [ ] ¿Respetó estructura de carpetas?
- [ ] ¿Código compila sin errores?

---

### 4. UBICACIÓN DE ARCHIVOS GENERADOS

**🚨 REGLA DE ORO:** Todo trabajo de agentes DEBE ir en `orchestration/`

```
orchestration/
├── agentes/
│   ├── database/{tarea-id}/      # Trabajo Database-Agent
│   │   ├── 01-ANALISIS.md
│   │   ├── 02-PLAN.md
│   │   ├── 03-EJECUCION.md
│   │   ├── 04-VALIDACION.md
│   │   └── 05-DOCUMENTACION.md
│   ├── backend/{tarea-id}/       # Trabajo Backend-Agent
│   └── frontend/{tarea-id}/      # Trabajo Frontend-Agent
```

**❌ PROHIBIDO:** Crear carpetas `orchestration/` dentro de `apps/`, `docs/` u otras ubicaciones.

**✅ EXCEPCIÓN - Archivos Temporales:**

La carpeta `/tmp/` PUEDE usarse para archivos temporales o intermedios que no sean entregables finales:

```yaml
Uso permitido de /tmp:
  - Archivos intermedios de procesamiento
  - Outputs temporales de comandos
  - Archivos de staging antes de mover a ubicación final
  - Logs temporales de validación

Reglas para /tmp:
  - ✅ Archivos temporales que se eliminarán después
  - ✅ Outputs intermedios de scripts
  - ❌ NO usar para entregables finales
  - ❌ NO documentar archivos en /tmp en inventarios
  - ❌ NO commitear archivos de /tmp a git

Ubicaciones permitidas para trabajo de agentes:
  1. orchestration/ (principal, obligatorio para entregables)
  2. /tmp/ (temporal, archivos intermedios)
  3. Ninguna otra ubicación
```

---

### 5. VALIDACIÓN ANTI-DUPLICACIÓN

**ANTES de crear cualquier objeto nuevo, ejecutar:**

```bash
# Database: Validar que no exista el schema
grep -r "CREATE SCHEMA {nombre}" apps/database/ddl/

# Database: Validar que no exista la tabla
grep -r "CREATE TABLE {nombre}" apps/database/ddl/

# Backend: Validar que no exista el módulo/entity
find apps/backend/src -name "*{nombre}*"

# Frontend: Validar que no exista la página/componente
find apps/frontend/src -name "*{Nombre}*"
```

**Consultar inventarios:**
```bash
# Revisar inventario maestro
grep -i "{objeto}" orchestration/inventarios/MASTER_INVENTORY.yml

# Revisar inventario específico
grep -i "{objeto}" orchestration/inventarios/{TIPO}_INVENTORY.yml
```

**Si existe un objeto similar:**
1. ❌ NO crear duplicado
2. ✅ Evaluar si se debe modificar el existente
3. ✅ Evaluar si se debe reutilizar el existente
4. ✅ Documentar decisión en análisis

---

## 📚 ARCHIVOS DE CONTEXTO IMPORTANTES

### Documentación Principal

```
docs/
├── 00-overview/
│   └── MVP-APP.md                    # ⭐ Documento maestro (1,094 líneas)
├── 01-requerimientos/                # Requerimientos detallados por módulo
├── 02-arquitectura/                  # Decisiones arquitectónicas
├── 03-desarrollo/                    # Guías de desarrollo
└── adr/                              # Architecture Decision Records
```

### Base de Datos

```
apps/database/
├── ddl/
│   ├── 00-init.sql                   # Inicialización + extensiones
│   └── schemas/                      # Schemas por módulo
│       ├── auth_management/
│       ├── project_management/
│       ├── budget_management/
│       └── ...
├── seeds/
│   ├── dev/                          # Seeds desarrollo
│   └── prod/                         # Seeds producción
└── migrations/                       # Migrations versionadas
```

### Backend

```
apps/backend/
├── src/
│   ├── shared/
│   │   ├── config/                   # Configuración
│   │   ├── constants/                # Constantes (SSOT)
│   │   └── database/                 # TypeORM config
│   └── modules/                      # Módulos de negocio
│       ├── auth/
│       ├── projects/
│       ├── budgets/
│       └── ...
└── README.md
```

### Frontend

```
apps/frontend/
├── web/                              # Aplicación web (Vite)
│   └── src/
│       ├── shared/
│       │   ├── components/
│       │   ├── constants/
│       │   └── types/
│       └── apps/
│           ├── admin/                # Portal administrador
│           ├── supervisor/           # Portal supervisor
│           └── obra/                 # Portal obra
└── mobile/                           # App móvil (React Native)
    └── src/
```

### Orchestration

```
orchestration/
├── README.md                         # ⭐ Guía principal
├── directivas/
│   └── POLITICAS-USO-AGENTES.md     # ⭐ Políticas de uso
├── inventarios/
│   └── MASTER_INVENTORY.yml         # ⭐ Inventario maestro
├── trazas/
│   ├── TRAZA-REQUERIMIENTOS.md
│   └── TRAZA-TAREAS-{GRUPO}.md
└── templates/
    └── TEMPLATE-PLAN.md
```

---

## 🔄 FLUJO DE TRABAJO OBLIGATORIO

### Fase 1: ANÁLISIS (Obligatorio)

```markdown
# Documento: orchestration/agentes/{grupo}/{tarea-id}/01-ANALISIS.md

## Contexto de la Tarea
- Descripción detallada
- Objetivo final
- Módulo del MVP relacionado
- Referencia a MVP-APP.md (sección)

## Estado Actual
### Inventario Consultado
- [x] MASTER_INVENTORY.yml
- [x] {TIPO}_INVENTORY.yml
- [x] Validado que no existen duplicados

### Objetos Existentes Relacionados
- Schema: {nombre} (existe/no existe)
- Tabla: {nombre} (existe/no existe)
- Módulo: {nombre} (existe/no existe)

### Objetos a Crear/Modificar
- [ ] Schema: {nombre} (crear/modificar)
- [ ] Tabla: {nombre} (crear)
- [ ] Entity: {nombre} (crear)

## Análisis de Impacto
### Archivos Afectados
- apps/database/ddl/schemas/{schema}/
- apps/backend/src/modules/{modulo}/
- apps/frontend/web/src/apps/{rol}/

### Dependencias
- Depende de: {lista}
- Impacta en: {lista}

### Riesgos Identificados
- Riesgo 1: {descripción} → Mitigación: {estrategia}
- Riesgo 2: {descripción} → Mitigación: {estrategia}

## Necesidad de Subagentes
- [ ] NO - Tarea simple, ejecutar directamente
- [x] SÍ - Tarea compleja, usar {N} subagentes
  - Subagente 1: {tarea}
  - Subagente 2: {tarea}

## Conclusión
{Decisión de cómo proceder}
```

---

### Fase 2: PLAN DE ACCIÓN

**Template:** [TEMPLATE-PLAN.md](../templates/TEMPLATE-PLAN.md)

**Documento:** `orchestration/agentes/{grupo}/{tarea-id}/02-PLAN.md`

**Contenido mínimo:**
- Objetivo y criterios de aceptación
- Diseño de solución
- Ciclos de ejecución desglosados
- Dependencias y bloqueadores
- Riesgos identificados
- Estimaciones de tiempo
- Documentación a generar

---

### Fase 3: EJECUCIÓN

**Documento:** `orchestration/agentes/{grupo}/{tarea-id}/03-EJECUCION.md`

**Registrar por cada ciclo:**
```markdown
### Ciclo 1: {Nombre} ✅
**Inicio:** 2025-11-17 10:00
**Fin:** 2025-11-17 10:45
**Duración:** 45 min

#### Tareas Completadas
- [x] Tarea 1
- [x] Tarea 2

#### Archivos Creados
- apps/database/ddl/schemas/{schema}/{archivo}.sql

#### Problemas Encontrados
- Ninguno | {descripción del problema y solución}

#### Validación
```bash
$ {comando de validación}
✅ Resultado OK
```
```

---

### Fase 4: VALIDACIÓN

**Documento:** `orchestration/agentes/{grupo}/{tarea-id}/04-VALIDACION.md`

**Checklist obligatorio:**

#### Base de Datos
- [ ] Script DDL ejecuta sin errores
- [ ] Todas las tablas creadas correctamente
- [ ] Índices creados
- [ ] Funciones/Triggers funcionando
- [ ] Seeds cargados (dev)

#### Backend
- [ ] TypeScript compila sin errores: `npm run build`
- [ ] Entities mapeadas correctamente
- [ ] Servicios implementan lógica de negocio
- [ ] Controllers con Swagger completo
- [ ] Tests unitarios pasan (si aplica)

#### Frontend
- [ ] TypeScript compila sin errores: `npm run build`
- [ ] Componentes renderizan correctamente
- [ ] Stores funcionan
- [ ] Llamadas API exitosas
- [ ] Responsive design validado

#### Integración
- [ ] DB ↔ Backend alineados (100%)
- [ ] Backend ↔ Frontend alineados (100%)
- [ ] Constantes sincronizadas
- [ ] ENUMs sincronizados
- [ ] Tipos TypeScript coherentes

---

### Fase 5: DOCUMENTACIÓN

**Documento:** `orchestration/agentes/{grupo}/{tarea-id}/05-DOCUMENTACION.md`

**Actualizar obligatoriamente:**

1. **MASTER_INVENTORY.yml**
   ```yaml
   modules:
     {modulo}:
       status: ✅ Completo
       database:
         tables:
           - name: {tabla}
             file: {ruta}
             related_backend_entity: {Entity}
             related_frontend_pages: [{Page}]
       backend:
         entities:
           - name: {Entity}
             table: {schema.tabla}
             used_in_controllers: [{Controller}]
       frontend:
         pages:
           - name: {Page}
             api_endpoints: [{endpoint}]
   ```

2. **TRAZA-TAREAS-{GRUPO}.md**
   ```markdown
   ## [{GRUPO}-XXX] {Nombre de la Tarea}

   **Fecha:** 2025-11-17
   **Estado:** ✅ Completado
   **Duración:** {tiempo}

   ### Archivos Creados/Modificados
   - {lista}

   ### Impacto
   - Módulos afectados: {lista}

   ### Próximos Pasos
   - {lista}
   ```

3. **README.md** (si cambió estructura)

---

## 🔍 POLÍTICA DE CICLOS DESGLOSADOS

**Principio:** Dividir tareas grandes en ciclos pequeños y ejecutables.

**✅ BIEN (Ciclos Desglosados):**
```
Tarea: Implementar Módulo de Proyectos

Ciclo 1: Análisis y Diseño (1h)
  - Revisar MVP-APP.md sección de Proyectos
  - Diseñar estructura de datos
  - Identificar dependencias

Ciclo 2: Base de Datos (2h)
  - Crear schema project_management
  - Crear tablas (projects, developments, phases, housing_units)
  - Crear índices y constraints
  - Validar con create-database.sh

Ciclo 3: Backend Entities (1.5h)
  - Crear entities (Project, Development, Phase, HousingUnit)
  - Configurar relaciones TypeORM
  - Validar mapeo

Ciclo 4: Backend Services (2h)
  - Crear ProjectService (CRUD + lógica de jerarquía)
  - Crear DevelopmentService
  - Validar lógica de negocio

Ciclo 5: Backend Controllers (1.5h)
  - Crear ProjectController
  - Crear DevelopmentController
  - Documentar con Swagger
  - Validar endpoints

Ciclo 6: Frontend (3h)
  - Crear projectStore (Zustand)
  - Crear ProjectsPage
  - Crear ProjectDetailPage
  - Validar integración con API

Ciclo 7: Validación e Integración (1h)
  - Pruebas E2E
  - Validar flujo completo
  - Documentar
```

---

## 📊 ESTÁNDARES DE CÓDIGO

### Database (PostgreSQL + SQL)

**Convenciones:**
- Snake_case para schemas, tablas, columnas
- Prefijos numéricos en archivos: `01-projects.sql`
- **SIEMPRE** incluir comentarios SQL (`COMMENT ON`)
- Usar extensiones: `uuid-ossp`, `postgis`, `pg_trgm`

**Estructura de archivo DDL:**
```sql
-- ============================================================================
-- Tabla: projects
-- Schema: project_management
-- Descripción: Proyectos habitacionales (nivel superior de jerarquía)
-- Autor: Database-Agent
-- Fecha: 2025-11-17
-- Dependencias: auth_management.users
-- ============================================================================

-- Eliminar si existe (desarrollo)
DROP TABLE IF EXISTS project_management.projects CASCADE;

-- Crear tabla
CREATE TABLE project_management.projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(200) NOT NULL,
    description TEXT,

    -- Ubicación
    state VARCHAR(100) NOT NULL,
    city VARCHAR(100) NOT NULL,
    address TEXT,
    coordinates GEOGRAPHY(POINT, 4326),

    -- Fechas
    start_date DATE NOT NULL,
    end_date DATE,

    -- Estado
    status VARCHAR(50) NOT NULL DEFAULT 'planning',

    -- Auditoría
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES auth_management.users(id),

    -- Constraints
    CONSTRAINT chk_projects_status
        CHECK (status IN ('planning', 'active', 'paused', 'completed', 'cancelled'))
);

-- Comentarios
COMMENT ON TABLE project_management.projects IS
    'Proyectos habitacionales - Nivel superior de jerarquía';
COMMENT ON COLUMN project_management.projects.code IS
    'Código único del proyecto (ej: PROJ-2025-001)';

-- Índices
CREATE INDEX idx_projects_status ON project_management.projects(status);
CREATE INDEX idx_projects_dates ON project_management.projects(start_date, end_date);
CREATE INDEX idx_projects_coordinates ON project_management.projects USING GIST(coordinates);
```

---

### Backend (Node.js + Express + TypeORM)

**Convenciones:**
- PascalCase para entities, classes: `ProjectEntity`
- camelCase para métodos, variables: `createProject()`
- Usar TypeORM decorators correctos
- **SIEMPRE** JSDoc en classes y métodos públicos
- Importar constantes desde `shared/constants`

**Estructura de Entity:**
```typescript
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { IsNotEmpty, IsOptional, IsEnum } from 'class-validator';
import { Point } from 'geojson';
import { UserEntity } from '../auth/entities/user.entity';
import { DevelopmentEntity } from './development.entity';

/**
 * Entity para Proyectos habitacionales
 *
 * Representa el nivel superior en la jerarquía:
 * Proyecto → Desarrollo → Fase → Vivienda
 *
 * @see apps/database/ddl/schemas/project_management/tables/01-projects.sql
 */
@Entity({ schema: 'project_management', name: 'projects' })
export class ProjectEntity {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ type: 'varchar', length: 50, unique: true })
    @IsNotEmpty()
    code: string;

    @Column({ type: 'varchar', length: 200 })
    @IsNotEmpty()
    name: string;

    @Column({ type: 'text', nullable: true })
    @IsOptional()
    description?: string;

    // Ubicación
    @Column({ type: 'varchar', length: 100 })
    state: string;

    @Column({ type: 'geography', spatialFeatureType: 'Point', srid: 4326, nullable: true })
    coordinates?: Point;

    // Estado
    @Column({
        type: 'varchar',
        length: 50,
        default: 'planning'
    })
    @IsEnum(['planning', 'active', 'paused', 'completed', 'cancelled'])
    status: string;

    // Relaciones
    @ManyToOne(() => UserEntity)
    createdBy: UserEntity;

    @OneToMany(() => DevelopmentEntity, dev => dev.project)
    developments: DevelopmentEntity[];

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'NOW()' })
    updatedAt: Date;
}
```

**Estructura de Service:**
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProjectEntity } from './entities/project.entity';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';

/**
 * Service para gestión de Proyectos
 *
 * Provee operaciones CRUD y lógica de negocio
 * relacionada con proyectos habitacionales.
 */
@Injectable()
export class ProjectService {
    constructor(
        @InjectRepository(ProjectEntity)
        private readonly projectRepo: Repository<ProjectEntity>,
    ) {}

    /**
     * Crea un nuevo proyecto
     * @param dto - Datos del proyecto a crear
     * @returns Proyecto creado
     */
    async create(dto: CreateProjectDto): Promise<ProjectEntity> {
        const project = this.projectRepo.create(dto);
        return await this.projectRepo.save(project);
    }

    /**
     * Obtiene todos los proyectos
     * @param filters - Filtros opcionales
     * @returns Lista de proyectos
     */
    async findAll(filters?: any): Promise<ProjectEntity[]> {
        const qb = this.projectRepo.createQueryBuilder('project');

        if (filters?.status) {
            qb.where('project.status = :status', { status: filters.status });
        }

        return await qb.getMany();
    }

    /**
     * Obtiene un proyecto por ID
     * @param id - UUID del proyecto
     * @returns Proyecto encontrado
     * @throws NotFoundException si no existe
     */
    async findOne(id: string): Promise<ProjectEntity> {
        const project = await this.projectRepo.findOne({
            where: { id },
            relations: ['developments'],
        });

        if (!project) {
            throw new NotFoundException(`Project with ID ${id} not found`);
        }

        return project;
    }
}
```

---

### Frontend (React + TypeScript + Zustand)

**Convenciones:**
- PascalCase para componentes: `ProjectsPage.tsx`
- camelCase para hooks, stores: `useProjects()`, `projectStore`
- **SIEMPRE** TSDoc en componentes complejos
- Usar Zustand para estado global
- Path aliases: `@/`, `@shared/`, `@components/`

**Estructura de Store (Zustand):**
```typescript
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { projectApi } from '@/services/api/project.api';
import type { Project } from '@/shared/types/project.types';

/**
 * Store para gestión de Proyectos
 *
 * Maneja estado global de proyectos incluyendo:
 * - Lista de proyectos
 * - Proyecto seleccionado
 * - Estados de carga y error
 */
interface ProjectState {
    // Estado
    projects: Project[];
    selectedProject: Project | null;
    loading: boolean;
    error: string | null;

    // Acciones
    fetchProjects: () => Promise<void>;
    fetchProjectById: (id: string) => Promise<void>;
    createProject: (data: Partial<Project>) => Promise<void>;
    updateProject: (id: string, data: Partial<Project>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    setSelectedProject: (project: Project | null) => void;
}

export const useProjectStore = create<ProjectState>()(
    devtools(
        (set, get) => ({
            // Estado inicial
            projects: [],
            selectedProject: null,
            loading: false,
            error: null,

            // Acciones
            fetchProjects: async () => {
                set({ loading: true, error: null });
                try {
                    const projects = await projectApi.getAll();
                    set({ projects, loading: false });
                } catch (error) {
                    set({
                        error: error.message,
                        loading: false
                    });
                }
            },

            createProject: async (data) => {
                set({ loading: true, error: null });
                try {
                    const newProject = await projectApi.create(data);
                    set(state => ({
                        projects: [...state.projects, newProject],
                        loading: false
                    }));
                } catch (error) {
                    set({ error: error.message, loading: false });
                }
            },

            setSelectedProject: (project) => {
                set({ selectedProject: project });
            },
        }),
        { name: 'ProjectStore' }
    )
);
```

**Estructura de Componente:**
```typescript
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useProjectStore } from '@/stores/projectStore';
import { ProjectCard } from '@shared/components/ProjectCard';
import { Button, Spinner } from '@shared/components/ui';

/**
 * Página de listado de Proyectos
 *
 * Muestra todos los proyectos con opciones de:
 * - Filtrado por estado
 * - Búsqueda por nombre/código
 * - Crear nuevo proyecto
 * - Ver detalle de proyecto
 *
 * @route /admin/projects
 */
export const ProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const { projects, loading, error, fetchProjects } = useProjectStore();

    useEffect(() => {
        fetchProjects();
    }, []);

    if (loading) {
        return <Spinner />;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="projects-page">
            <div className="header">
                <h1>Proyectos</h1>
                <Button onClick={() => navigate('/admin/projects/new')}>
                    Nuevo Proyecto
                </Button>
            </div>

            <div className="projects-grid">
                {projects.map(project => (
                    <ProjectCard
                        key={project.id}
                        project={project}
                        onClick={() => navigate(`/admin/projects/${project.id}`)}
                    />
                ))}
            </div>
        </div>
    );
};
```

---

## 🚀 COMANDOS ÚTILES

### Validaciones Rápidas

```bash
# Database: Ejecutar DDL completo
cd apps/database
./create-database.sh

# Backend: Compilar TypeScript
cd apps/backend
npm run build

# Backend: Ejecutar en desarrollo
npm run dev

# Frontend Web: Compilar
cd apps/frontend/web
npm run build

# Frontend Web: Ejecutar en desarrollo
npm run dev

# Frontend Mobile: Ejecutar
cd apps/frontend/mobile
npm start
```

### Buscar Duplicaciones

```bash
# Database
grep -r "CREATE TABLE nombre_tabla" apps/database/ddl/

# Backend
find apps/backend/src -name "*NombreEntity*"

# Frontend
find apps/frontend -name "*NombreComponente*"
```

### Inventarios

```bash
# Ver inventario maestro
cat orchestration/inventarios/MASTER_INVENTORY.yml

# Ver trazas recientes
tail -50 orchestration/trazas/TRAZA-TAREAS-{GRUPO}.md
```

---

## ✅ CHECKLIST FINAL ANTES DE TERMINAR TAREA

- [ ] Análisis documentado (01-ANALISIS.md)
- [ ] Plan ejecutado completamente (02-PLAN.md)
- [ ] Ejecución registrada (03-EJECUCION.md)
- [ ] Validación exitosa (04-VALIDACION.md)
- [ ] Documentación actualizada (05-DOCUMENTACION.md)
- [ ] Inventarios actualizados (MASTER_INVENTORY.yml)
- [ ] Trazas actualizadas (TRAZA-{TIPO}.md)
- [ ] No hay duplicaciones creadas
- [ ] Código compila sin errores
- [ ] Tests pasan (si aplica)
- [ ] Alineación DB ↔ Backend ↔ Frontend (100%)

---

**Versión:** 1.0.0
**Última actualización:** 2025-11-17
**Mantenido por:** Tech Lead
**Revisión requerida:** Cada 2 semanas
