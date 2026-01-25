# Validación DevOps - Docker/CI-CD
## Definición Canónica

**Alias:** @DEF_VAL_DEVOPS
**Dominio:** DevOps, Docker, CI/CD

---

## COMANDOS OBLIGATORIOS

```bash
# Docker
docker build -t {imagen}:{tag} .              # DEBE completar
docker-compose config                          # Validar sintaxis
docker-compose up -d && docker-compose ps     # Servicios healthy

# CI/CD (GitHub Actions)
# Validar sintaxis YAML localmente:
yamllint .github/workflows/*.yml

# Scripts
bash -n {script}.sh                           # Validar sintaxis bash
shellcheck {script}.sh                        # Análisis estático (si disponible)
```

## CRITERIOS DE ACEPTACIÓN

```yaml
dockerfile:
  resultado: "Build exitoso"
  multi_stage: "Usar cuando posible"
  usuario_no_root: "Preferido para producción"
  healthcheck: "Definido"

docker_compose:
  resultado: "Servicios inician correctamente"
  volumes: "Persistencia configurada"
  networks: "Aislamiento correcto"
  depends_on: "Orden de inicio correcto"

ci_cd:
  resultado: "Pipeline ejecuta sin errores"
  jobs_paralelos: "Donde posible"
  cache: "Configurado para dependencias"
  secrets: "No hardcodeados"

scripts:
  resultado: "Ejecutan sin errores"
  set_e: "Activado (fail on error)"
  idempotentes: "Pueden re-ejecutarse"
```

## VALIDACIONES ADICIONALES

```yaml
seguridad:
  - "No secrets en código/Dockerfile"
  - "Imágenes base oficiales/verificadas"
  - "Puertos expuestos mínimos"
  - "Variables de entorno para configuración"

performance:
  - "Layers de Docker optimizados"
  - "Cache de dependencias"
  - ".dockerignore configurado"

mantenibilidad:
  - "Tags semánticos para imágenes"
  - "Documentación de variables requeridas"
  - "README con instrucciones"
```

## ERRORES COMUNES

```yaml
- error: "COPY failed: file not found"
  causa: "Archivo no existe o en .dockerignore"
  solucion: "Verificar ruta y .dockerignore"

- error: "port is already allocated"
  causa: "Puerto en uso por otro contenedor/proceso"
  solucion: "Cambiar puerto o detener conflicto"

- error: "network not found"
  causa: "Red de Docker no existe"
  solucion: "Crear red o usar default"
```

---

**Referencia:** @PERFIL_DEVOPS, @SIMCO_DEVOPS
