# SIMCO-SERVICE-DESCRIPTOR: Directiva de Contratos de Servicio

**Version:** 1.0.0
**Sistema:** SIMCO v2 - Workspace v1
**Responsable:** Todos los agentes
**Fecha:** 2025-12-18

---

## PROPOSITO

El Service Descriptor (`service.descriptor.yml`) es el **contrato universal** que define completamente un servicio. Esta directiva establece cuando, como y por que usar service descriptors.

---

## PRINCIPIO FUNDAMENTAL

> **Los agentes dejan de "inferir" y empiezan a "leer contrato".**
>
> Toda informacion sobre un servicio debe estar en su service.descriptor.yml

---

## 1. REGLA FUNDAMENTAL

```yaml
TODO servicio DEBE tener un service.descriptor.yml en su raiz.

Ubicacion: {proyecto}/apps/{servicio}/service.descriptor.yml

Ejemplos:
- gamilit-platform/apps/backend/service.descriptor.yml
- gamilit-platform/apps/frontend/service.descriptor.yml
- erp-suite/apps/erp-core/backend/service.descriptor.yml
- erp-suite/apps/verticales/construccion/backend/service.descriptor.yml
```

---

## 2. CUANDO CREAR

### 2.1 Al crear nuevo servicio

```yaml
TRIGGER: Creacion de nuevo backend, frontend, ML service, etc.

PASOS:
1. Crear carpeta del servicio
2. INMEDIATAMENTE crear service.descriptor.yml
3. Completar campos obligatorios
4. Verificar referencias a registries
5. Luego proceder con codigo
```

### 2.2 Al migrar servicio existente

```yaml
TRIGGER: Migracion de workspace actual a workspace-v1

PASOS:
1. Analizar servicio existente
2. Identificar puerto, BD, dependencias
3. Verificar que esten en registries (o agregar)
4. Crear service.descriptor.yml con datos reales
5. Validar con validate-service-descriptors.sh
```

---

## 3. CAMPOS OBLIGATORIOS

### 3.1 Seccion `service`

```yaml
service:
  name: "string"        # Nombre unico (kebab-case)
  type: "string"        # backend | frontend | database | ml | worker
  runtime: "string"     # node | python | go | static
  version: "string"     # SemVer (1.0.0)
  description: "string" # Descripcion breve
  owner_agent: "string" # NEXUS-BACKEND | NEXUS-FRONTEND | etc
```

### 3.2 Seccion `repository`

```yaml
repository:
  name: "string"        # Nombre del repo
  path: "string"        # Path relativo al servicio
  main_branch: "string" # main | master
```

### 3.3 Seccion `ports`

```yaml
ports:
  internal: number      # Puerto interno (3000, 3001, etc)
  registry_ref: "string" # Referencia al registry (projects.gamilit.api)
  protocol: "string"    # http | https | ws | grpc
```

### 3.4 Seccion `environments`

```yaml
environments:
  deployed_to:          # Lista de ambientes
    - "local"
    - "development"
    - "production"
  default: "string"     # Ambiente por defecto
```

---

## 4. CAMPOS OPCIONALES

### 4.1 Seccion `domains`

```yaml
domains:
  registry_ref: "string"  # Referencia a domains.registry
  overrides:              # Overrides por ambiente
    local: "string"
    development: "string"
```

### 4.2 Seccion `database`

```yaml
database:
  registry_ref: "string"  # Referencia a databases.registry
  role: "string"          # runtime | migrator | owner
  schemas:
    - "string"            # Lista de schemas
```

### 4.3 Seccion `healthcheck`

```yaml
healthcheck:
  path: "string"          # /health
  interval: "string"      # 30s
  timeout: "string"       # 5s
  retries: number         # 3
```

### 4.4 Seccion `dependencies`

```yaml
dependencies:
  services:               # Otros servicios
    - name: "string"
      required: boolean
      healthcheck: "string"
  databases:
    - "string"            # Nombres de BD
  external:
    - name: "string"
      url: "string"
      required: boolean
```

### 4.5 Seccion `ci`

```yaml
ci:
  pipeline: "string"      # Template de pipeline
  tests: boolean
  lint: boolean
  build: boolean
  docker: boolean
  docker_image: "string"
  docker_registry: "string"
```

---

## 5. WORKFLOW DE USO

### 5.1 Backend-Agent crea servicio

```yaml
1. Recibe tarea de crear nuevo servicio
2. Verificar puerto disponible en ports.registry.yml
3. Si no disponible: Solicitar a DevOps-Agent
4. Crear service.descriptor.yml con:
   - service.* completado
   - ports.registry_ref apuntando al registro
   - database.registry_ref si usa BD
5. Validar descriptor
6. Proceder con implementacion
```

### 5.2 Frontend-Agent crea servicio

```yaml
1. Recibe tarea de crear frontend
2. Verificar puerto disponible
3. Identificar backend del que depende
4. Crear service.descriptor.yml con:
   - dependencies.services incluyendo backend
   - domains.registry_ref configurado
5. Validar y proceder
```

### 5.3 DevOps-Agent hace deployment

```yaml
1. Recibe solicitud de deployment
2. Leer service.descriptor.yml
3. Validar contra registries
4. Leer ci.* para configurar pipeline
5. Ejecutar pipeline segun flags
6. Si todo OK: Deploy
```

---

## 6. VALIDACION

### 6.1 Validacion Manual

```bash
# Validar un proyecto
./control-plane/devtools/scripts/validation/validate-service-descriptors.sh ./mi-proyecto/

# Salida esperada:
# Validando: ./mi-proyecto/apps/backend/service.descriptor.yml
#   [OK] YAML valido
#   [OK] Todos los campos obligatorios presentes
#   [OK] Referencias a registries validas
```

### 6.2 Validacion en CI

```yaml
# En pipeline de CI:
- name: Validate Service Descriptors
  run: |
    ./control-plane/devtools/scripts/validation/validate-service-descriptors.sh .
```

### 6.3 Errores Comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| "Campo obligatorio faltante" | Falta service.name, etc | Completar campo |
| "YAML invalido" | Sintaxis incorrecta | Verificar indentacion |
| "registry_ref no existe" | Referencia a puerto no registrado | Agregar a registry primero |
| "Puerto no coincide" | internal != registry | Sincronizar valores |

---

## 7. CUANDO ACTUALIZAR

### 7.1 Cambio de Puerto

```yaml
1. Verificar nuevo puerto disponible en registry
2. Actualizar ports.registry.yml
3. Actualizar service.descriptor.yml ports.internal
4. Actualizar docker-compose.yml
5. Validar
```

### 7.2 Cambio de BD

```yaml
1. Verificar nueva BD en databases.registry.yml
2. Actualizar service.descriptor.yml database.registry_ref
3. Actualizar variables de entorno
4. Validar
```

### 7.3 Nueva Dependencia

```yaml
1. Identificar servicio del que se depende
2. Agregar a dependencies.services
3. Agregar healthcheck del servicio
4. Actualizar docker-compose depends_on
```

### 7.4 Cualquier Cambio

```yaml
SIEMPRE:
1. Actualizar metadata.updated con fecha actual
2. Incrementar service.version si es cambio significativo
3. Ejecutar validacion
```

---

## 8. TEMPLATE

Ver template completo en:
```
control-plane/orchestration/templates/service-descriptor/SERVICE-DESCRIPTOR-TEMPLATE.yml
```

### Ejemplo Minimo (Backend)

```yaml
service:
  name: "mi-api"
  type: "backend"
  runtime: "node"
  version: "1.0.0"
  description: "API de mi servicio"
  owner_agent: "NEXUS-BACKEND"

repository:
  name: "mi-proyecto"
  path: "apps/backend"
  main_branch: "main"

ports:
  internal: 3000
  registry_ref: "projects.mi_proyecto.api"
  protocol: "http"

environments:
  deployed_to: ["local", "development", "production"]
  default: "local"

healthcheck:
  path: "/health"

ci:
  tests: true
  build: true
  docker: true
```

### Ejemplo Minimo (Frontend)

```yaml
service:
  name: "mi-web"
  type: "frontend"
  runtime: "static"
  version: "1.0.0"
  description: "Frontend web"
  owner_agent: "NEXUS-FRONTEND"

repository:
  name: "mi-proyecto"
  path: "apps/frontend"
  main_branch: "main"

ports:
  internal: 3001
  registry_ref: "projects.mi_proyecto.web"
  protocol: "http"

environments:
  deployed_to: ["local", "development", "production"]
  default: "local"

dependencies:
  services:
    - name: "mi-api"
      required: true

ci:
  build: true
  docker: true
```

---

## 9. INTEGRACION CON SIMCO

### Referencias desde otras directivas

```yaml
SIMCO-INICIALIZACION:
  - Cargar service.descriptor.yml como parte del contexto

SIMCO-CREAR:
  - Crear service.descriptor.yml ANTES de crear codigo

SIMCO-VALIDAR:
  - Incluir validacion de service.descriptor.yml

SIMCO-DEVOPS:
  - Leer service.descriptor.yml para deployment
```

---

**Directiva mantenida por:** Tech-Leader
**Ultima actualizacion:** 2025-12-18
