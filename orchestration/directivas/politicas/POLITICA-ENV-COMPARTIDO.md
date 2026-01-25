# POLITICA: Variables de Entorno Compartidas en Git

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Tipo:** EXCEPCION TEMPORAL
**Estado:** VIGENTE
**Revision:** Cuando se implemente CI/CD

---

## CONTEXTO

El workspace actualmente opera en un entorno de desarrollo multi-ambiente donde:

- **1 equipo fisico** con multiples entornos virtuales
- **2 instancias WSL** (Linux subsystem)
- **1 entorno Windows** (SO padre)
- Todos los ambientes comparten el mismo filesystem

---

## DECISION

### Archivos .env SE MANTIENEN EN GIT

Por decision explicita, los siguientes archivos de configuracion de entorno **PERMANECEN en control de versiones**:

| Archivo | Proyecto(s) | Razon |
|---------|-------------|-------|
| `.env` | michangarrito, otros | Configuracion compartida entre ambientes |
| `.env.docker` | michangarrito | Configuracion Docker compartida |
| `.env.ports` | clinicas, analytics | Asignacion de puertos del workspace |

### Archivos .env QUE SI SE IGNORAN

| Archivo | Razon |
|---------|-------|
| `.env.local` | Overrides locales especificos |
| `.env.*.local` | Variantes locales |
| `.env.production` | Credenciales de produccion (NUNCA en git) |

---

## JUSTIFICACION

```
╔══════════════════════════════════════════════════════════════════════════╗
║  SITUACION ACTUAL:                                                        ║
║                                                                           ║
║  - Desarrollo en equipo unico con multiples entornos                     ║
║  - Sincronizacion manual de .env entre WSL/Windows seria error-prone     ║
║  - No hay separacion fisica de ambientes (dev/staging/prod)              ║
║  - CI/CD no implementado aun                                              ║
║                                                                           ║
║  BENEFICIO:                                                               ║
║  - Configuracion consistente entre todos los ambientes                   ║
║  - Evita errores de desincronizacion                                     ║
║  - Facilita cambios de puertos/hosts sin comunicacion manual             ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## RIESGOS ACEPTADOS

| Riesgo | Severidad | Mitigacion |
|--------|-----------|------------|
| Credenciales en historial git | MEDIO | Repositorios privados en Gitea interno |
| Exposicion si repo se hace publico | ALTO | Politica de repos privados obligatoria |
| Secretos de produccion expuestos | CRITICO | NUNCA incluir .env.production |

---

## REGLAS PARA AGENTES

### OBLIGATORIO

1. **NO sugerir remover .env de git** en proyectos listados arriba
2. **NO agregar .env a .gitignore** sin autorizacion explicita del usuario
3. **SI detectas .env.production** -> ALERTAR inmediatamente (ese SI debe ignorarse)
4. **SI el usuario pide CI/CD** -> Recordar revisar esta politica

### PROHIBIDO

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   NUNCA INCLUIR EN GIT:                                                  ║
║                                                                           ║
║   - .env.production                                                       ║
║   - Tokens de API de servicios externos (Stripe, AWS, etc.)              ║
║   - Claves privadas SSH/TLS (*.pem, *.key)                               ║
║   - Credenciales de bases de datos de produccion                         ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## PROYECTOS AFECTADOS

### Con .env en Git (PERMITIDO)

| Proyecto | Archivos | Estado |
|----------|----------|--------|
| michangarrito | `.env`, `.env.docker` | Vigente |
| clinica-dental | `.env.ports` | Vigente |
| clinica-veterinaria | `.env.ports` | Vigente |
| inmobiliaria-analytics | `.env.ports` | Vigente |

### Con .env ignorado (ESTANDAR)

| Proyecto | Archivos Ignorados |
|----------|-------------------|
| gamilit | `.env`, `.env.local`, `.env.*.local` |
| erp-* | `.env`, `.env.local`, `.env.*.local` |
| template-saas | `.env`, `.env.local`, `.env.*.local` |
| trading-platform | `.env`, `.env.local` |

---

## CONDICIONES DE REVISION

Esta politica debe revisarse cuando:

1. **Se implemente CI/CD** -> Migrar secretos a secrets manager
2. **Se agreguen mas desarrolladores** -> Evaluar vault de secretos
3. **Se separen ambientes fisicamente** -> dev/staging/prod independientes
4. **Se haga publico algun repositorio** -> Limpiar historial de git

---

## PROCESO DE TRANSICION (Futuro)

Cuando se implemente CI/CD, seguir estos pasos:

```bash
# 1. Crear secretos en CI/CD (GitHub Secrets, GitLab CI, etc.)
# 2. Remover archivos .env del tracking
git rm --cached .env .env.docker

# 3. Agregar a .gitignore
echo ".env" >> .gitignore
echo ".env.docker" >> .gitignore

# 4. Commit de limpieza
git commit -m "chore: Migrate secrets to CI/CD vault"

# 5. (Opcional) Limpiar historial si hay secretos sensibles
git filter-branch --tree-filter 'rm -f .env' -- --all
```

---

## REFERENCIA EN ANALISIS DE .GITIGNORE

Cuando se realice auditoria de .gitignore:

- **NO marcar como error** los archivos .env listados en "Proyectos Afectados"
- **SI documentar** que es una excepcion temporal
- **SI verificar** que .env.production NO este presente

---

## HISTORIAL

| Fecha | Version | Cambio |
|-------|---------|--------|
| 2026-01-20 | 1.0.0 | Documento inicial post-analisis de .gitignore |

---

**Sistema:** SIMCO v4.0.0
**Aprobado por:** Usuario (decision explicita)
**Documento:** POLITICA-ENV-COMPARTIDO.md
