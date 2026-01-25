# SIMCO-DEVOPS: Directiva de Operaciones e Infraestructura

**Version:** 1.0.0
**Sistema:** SIMCO v2 - Workspace v1
**Responsable:** NEXUS-DEVOPS
**Fecha:** 2025-12-18

---

## PROPOSITO

Esta directiva define como los agentes interactuan con:
- Infraestructura (Docker, redes, ambientes)
- CI/CD (pipelines, builds, deployments)
- Registries (puertos, dominios, bases de datos)

---

## PRINCIPIO FUNDAMENTAL

> **Todo deployment debe pasar validacion de registries antes de proceder.**
>
> Ningun servicio puede exponerse sin estar registrado en el Control Plane.

---

## 1. VALIDACIONES PRE-DEPLOYMENT

### 1.1 Validacion de Puertos

```yaml
ANTES de exponer un servicio:
1. Leer service.descriptor.yml del servicio
2. Extraer ports.internal y ports.registry_ref
3. Verificar que registry_ref existe en ports.registry.yml
4. Verificar que el puerto coincide con el registry
5. Si falla: BLOQUEAR y reportar error

COMANDO:
./control-plane/devtools/scripts/validation/validate-ports.sh <proyecto>
```

### 1.2 Validacion de Dominios

```yaml
ANTES de configurar routing:
1. Leer domains del service.descriptor.yml
2. Verificar dominio esta en domains.registry.yml
3. Verificar ambiente correcto (local, dev, staging, prod)
4. Si falla: BLOQUEAR y reportar error

COMANDO:
./control-plane/devtools/scripts/validation/validate-domains.sh <proyecto>
```

### 1.3 Validacion de Base de Datos

```yaml
ANTES de conectar a BD:
1. Leer database.registry_ref del service.descriptor.yml
2. Verificar BD existe en databases.registry.yml
3. Verificar rol correcto:
   - "runtime" para aplicaciones
   - "migrator" para migraciones
   - "owner" solo para DDL inicial
4. Si falla: BLOQUEAR y reportar error
```

### 1.4 Validacion de Service Descriptor

```yaml
ANTES de cualquier operacion:
1. Verificar service.descriptor.yml existe
2. Verificar YAML valido
3. Verificar campos obligatorios presentes
4. Verificar referencias a registries validas

COMANDO:
./control-plane/devtools/scripts/validation/validate-service-descriptors.sh <proyecto>
```

---

## 2. PIPELINES DE CI/CD

### 2.1 Lectura de Configuracion

```yaml
El pipeline DEBE:
1. Leer service.descriptor.yml
2. Extraer ci.* flags:
   - ci.pipeline: Nombre del template a usar
   - ci.tests: true/false
   - ci.lint: true/false
   - ci.build: true/false
   - ci.docker: true/false
3. Ejecutar segun configuracion
```

### 2.2 Ejecucion de Pipeline

```yaml
ORDEN de ejecucion:
1. Lint (si ci.lint: true)
2. Tests (si ci.tests: true)
3. Build (si ci.build: true)
4. Validacion de registries
5. Docker build (si ci.docker: true)
6. Docker push (si validaciones pasan)
```

### 2.3 Build de Docker

```yaml
Si ci.docker: true:
1. Leer ci.docker_image como nombre de imagen
2. Leer ci.docker_registry como destino
3. Leer service.version como tag
4. Construir imagen
5. Push solo si TODAS las validaciones pasan
```

---

## 3. GESTION DE AMBIENTES

### 3.1 Ambientes Definidos

| Ambiente | Proposito | Red Docker | SSL |
|----------|-----------|------------|-----|
| local | Desarrollo individual | {proyecto}_local | No |
| development | Integracion | {proyecto}_dev | Staging |
| staging | Pre-produccion | {proyecto}_staging | Si |
| production | Produccion | {proyecto}_prod | Si |

### 3.2 Configuracion por Ambiente

```yaml
Cada ambiente tiene:
- Red Docker aislada: {proyecto}_{ambiente}
- Dominio especifico: Ver domains.registry.yml
- Variables de entorno: .env.{ambiente}
- Nivel de log: Ver environments.manifest.yml
```

### 3.3 Redes Docker

```yaml
REGLAS de redes:
1. Cada proyecto tiene su red por ambiente
2. Todos los proyectos comparten infra_shared
3. Traefik esta en infra_shared
4. Servicios de un proyecto solo ven su red + infra_shared
5. Redes son external: true en docker-compose
```

---

## 4. ENFORCEMENT

### 4.1 Que se Bloquea

| Situacion | Accion |
|-----------|--------|
| Puerto no en registry | BLOQUEAR deployment |
| Dominio no en registry | BLOQUEAR deployment |
| service.descriptor.yml faltante | BLOQUEAR deployment |
| service.descriptor.yml invalido | BLOQUEAR deployment |
| Tests fallando (si ci.tests: true) | BLOQUEAR deployment |
| Puerto expuesto directamente (ports:) | ADVERTENCIA |

### 4.2 Proceso de Excepcion

```yaml
Si se requiere excepcion temporal:
1. Crear issue documentando:
   - Razon de la excepcion
   - Impacto potencial
   - Plan de regularizacion
2. Solicitar aprobacion de Tech-Leader
3. Si aprobado: Agregar al registry con nota "EXCEPTION"
4. Revisar en siguiente sprint para regularizar
5. Maximo tiempo de excepcion: 2 sprints
```

---

## 5. HERRAMIENTAS

### 5.1 Scripts de Validacion

```bash
# Validar todo antes de deploy
./control-plane/devtools/scripts/validation/validate-all.sh

# Validar solo puertos
./control-plane/devtools/scripts/validation/validate-ports.sh [directorio]

# Validar solo service descriptors
./control-plane/devtools/scripts/validation/validate-service-descriptors.sh [proyecto]
```

### 5.2 Scripts de Bootstrap

```bash
# Inicializar workspace completo
./control-plane/devtools/scripts/bootstrap/init-workspace.sh

# Crear nuevo proyecto
./control-plane/devtools/scripts/bootstrap/init-project.sh <nombre> <tipo>
```

### 5.3 Pre-commit Hooks

```yaml
# Configurar en cada proyecto:
repos:
  - repo: local
    hooks:
      - id: validate-ports
        name: Validate Ports
        entry: ../control-plane/devtools/scripts/validation/validate-ports.sh
        language: script
        pass_filenames: false

      - id: validate-service-descriptor
        name: Validate Service Descriptor
        entry: ../control-plane/devtools/scripts/validation/validate-service-descriptors.sh .
        language: script
        pass_filenames: false
```

---

## 6. INTEGRACION CON OTROS AGENTES

### 6.1 Flujo de Deployment

```
Backend-Agent                    DevOps-Agent
     |                                |
     | 1. "Listo para deploy"         |
     |------------------------------->|
     |                                |
     |    2. Ejecutar validaciones    |
     |                                |
     |    3a. Si OK: Proceder         |
     |<-------------------------------|
     |                                |
     |    3b. Si FAIL: Reportar       |
     |<-------------------------------|
     |                                |
```

### 6.2 Reportes a Tech-Leader

```yaml
DevOps-Agent reporta a Tech-Leader:
- Violaciones de registries detectadas
- Deployments bloqueados
- Excepciones solicitadas
- Metricas de CI/CD
- Estado de ambientes
```

### 6.3 Solicitudes de Otros Agentes

```yaml
Cuando otro agente necesita:
- Nuevo puerto: Solicitar a DevOps-Agent
- Nuevo dominio: Solicitar a DevOps-Agent
- Nueva BD: Solicitar a DevOps-Agent + Database-Agent
- Deployment: Solicitar a DevOps-Agent
```

---

## 7. CHECKLIST DE DEPLOYMENT

```markdown
PRE-DEPLOYMENT:
[ ] service.descriptor.yml existe y es valido
[ ] Puertos registrados en ports.registry.yml
[ ] Dominios registrados en domains.registry.yml
[ ] BD registrada en databases.registry.yml (si aplica)
[ ] Docker compose usa expose (no ports)
[ ] Docker compose usa redes external
[ ] Labels de Traefik configurados
[ ] .env.example documentado
[ ] Tests pasan
[ ] Build exitoso

POST-DEPLOYMENT:
[ ] Servicio responde en health endpoint
[ ] Logs sin errores
[ ] Metricas reportando (si aplica)
```

---

## 8. TROUBLESHOOTING

### Error: "Puerto no registrado"

```bash
# Verificar puerto en registry
grep -r "3000" control-plane/registries/ports.registry.yml

# Si no existe, agregar al registry primero
# Luego actualizar service.descriptor.yml
```

### Error: "Red no existe"

```bash
# Crear redes necesarias
./control-plane/devtools/scripts/bootstrap/init-workspace.sh

# O manualmente
docker network create gamilit_local
```

### Error: "Traefik no rutea"

```bash
# Verificar labels en docker-compose
docker inspect <container> | grep -A 20 Labels

# Verificar que Traefik ve el container
curl http://localhost:8080/api/http/routers
```

---

**Directiva mantenida por:** NEXUS-DEVOPS
**Ultima actualizacion:** 2025-12-18
