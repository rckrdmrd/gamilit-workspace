# POLITICA: Supply Chain Security para GAMILIT

---
tipo: politica
scope: gamilit
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [seguridad, supply-chain, npm, dependencias]
estado: vigente
---

**Version:** 1.0.0
**Estado:** VIGENTE
**Fecha Creacion:** 2026-02-14
**Revision:** Trimestral o cuando se detecte vulnerabilidad critica
**Aplica a:** apps/backend, apps/frontend, apps/database (monorepo)

---

## 1. Proposito

Proteger la cadena de suministro de software del proyecto gamilit contra:

- Dependencias con vulnerabilidades conocidas (CVEs)
- Paquetes npm con licencias incompatibles
- Inyeccion de codigo malicioso via dependencias transitivas
- Lock file tampering (manipulacion del package-lock.json)
- Dependency confusion attacks (paquetes con nombres similares a internos)

Esta politica establece controles obligatorios para la gestion de dependencias npm en todo el monorepo gamilit.

---

## 2. Alcance

Aplica a **todas las dependencias npm** del monorepo:

| Directorio | package.json | Tipo |
|------------|-------------|------|
| `apps/backend/` | NestJS 11, TypeORM 0.3.x, Socket.IO 4.8+, Passport, class-validator, bcrypt, helmet, compression | Backend |
| `apps/frontend/` | React 19, Zustand, TailwindCSS, Vite 6.x, React Query, React Router | Frontend |
| Raiz `/` | Dependencias compartidas del monorepo (si existen) | Monorepo |

**Excluido:** DDL de `apps/database/` (no tiene dependencias npm, solo archivos SQL).

---

## 3. Politica de Auditoria de Vulnerabilidades

### 3.1 Clasificacion y Tiempos de Respuesta

| Severidad | SLA de Correccion | Accion Requerida | Bloquea Deploy |
|-----------|-------------------|------------------|----------------|
| **Critica** (CVSS >= 9.0) | 24 horas | Fix inmediato, parche o reversion | SI |
| **Alta** (CVSS 7.0-8.9) | 7 dias | Fix en siguiente sprint | SI |
| **Media** (CVSS 4.0-6.9) | 30 dias | Planificar en backlog | NO |
| **Baja** (CVSS < 4.0) | Proxima revision trimestral | Evaluar impacto | NO |

### 3.2 Ejecucion Obligatoria

- `npm audit` DEBE ejecutarse en cada build de CI/CD
- `npm audit` DEBE ejecutarse antes de cada deploy a produccion (servidor 74.208.126.102)
- Cualquier vulnerabilidad critica o alta detectada **BLOQUEA** el deploy hasta su resolucion

### 3.3 Proceso de Remediacion

```
VULNERABILIDAD DETECTADA
     |
     v
  Evaluar severidad (CVSS)
     |
     +-- Critica/Alta --> Fix inmediato
     |                      |
     |                      +-- npm audit fix (si disponible)
     |                      +-- Override en package.json (si no hay fix)
     |                      +-- Reemplazar dependencia (ultimo recurso)
     |
     +-- Media/Baja --> Registrar en backlog
                          |
                          +-- Revisar en proxima sesion de mantenimiento
```

---

## 4. Configuracion Dependabot / Renovate

### 4.1 Template `.github/dependabot.yml` para Monorepo

```yaml
# .github/dependabot.yml
version: 2
updates:
  # Backend - NestJS 11 + dependencias
  - package-ecosystem: "npm"
    directory: "/apps/backend"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "America/Guatemala"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "backend"
    reviewers:
      - "rckrdmrd"
    # Automerge para patch versions
    versioning-strategy: increase
    allow:
      - dependency-type: "direct"
    ignore:
      # Major versions requieren revision manual
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  # Frontend - React 19 + Vite 6.x
  - package-ecosystem: "npm"
    directory: "/apps/frontend"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "06:00"
      timezone: "America/Guatemala"
    open-pull-requests-limit: 10
    labels:
      - "dependencies"
      - "frontend"
    reviewers:
      - "rckrdmrd"
    versioning-strategy: increase
    allow:
      - dependency-type: "direct"
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]

  # GitHub Actions (si se usan)
  - package-ecosystem: "github-actions"
    directory: "/"
    schedule:
      interval: "weekly"
    labels:
      - "dependencies"
      - "ci"
```

### 4.2 Reglas de Merge

| Tipo de Update | Automerge | Revision | Tests Requeridos |
|---------------|-----------|----------|------------------|
| **Patch** (x.x.PATCH) | SI (si CI pasa) | Automatica | Build + Lint + Tests |
| **Minor** (x.MINOR.x) | NO | 1 reviewer | Build + Lint + Tests + Smoke |
| **Major** (MAJOR.x.x) | NO | 1 reviewer + changelog review | Full test suite + Manual QA |

---

## 5. Verificacion de Lock File

### 5.1 Reglas de package-lock.json

1. **`package-lock.json` SIEMPRE debe estar en git** — NUNCA en `.gitignore`
2. En CI/CD usar **`npm ci`** (no `npm install`) — garantiza instalacion determinista
3. Si `package-lock.json` cambia sin cambio explicito en `package.json`, investigar la causa

### 5.2 Deteccion de Lock File Tampering

```bash
# Verificar integridad del lock file en CI
# Si npm ci falla, el lock file esta corrupto o desincronizado
npm ci --ignore-scripts

# Verificar que no hay diferencias inesperadas
git diff --name-only HEAD~1 -- package-lock.json
```

### 5.3 Reglas de Commit

```
REGLA: Todo cambio a package-lock.json DEBE ir acompanado de:
  1. Cambio correspondiente en package.json  -O-
  2. Comentario en commit explicando la razon (ej: "npm audit fix")

PROHIBIDO: Commit de package-lock.json sin explicacion
```

---

## 6. SBOM (Software Bill of Materials)

### 6.1 Generacion de SBOM

Generar un SBOM en formato CycloneDX para cada release o deploy a produccion:

```bash
# Instalar herramienta (una vez)
npm install -g @cyclonedx/cyclonedx-npm

# Generar SBOM para backend
cd apps/backend
cyclonedx-npm --output-file sbom-backend.json --output-format json

# Generar SBOM para frontend
cd apps/frontend
cyclonedx-npm --output-file sbom-frontend.json --output-format json
```

### 6.2 Almacenamiento

- Almacenar SBOMs como artifacts de CI (NO en el repositorio)
- Retener ultimas 5 versiones para comparacion
- El SBOM permite rastrear exactamente que versiones de que paquetes estan en produccion

### 6.3 Uso del SBOM

- Cuando se publica un CVE nuevo, buscar en el SBOM si la dependencia afectada esta en uso
- Comparar SBOMs entre releases para detectar dependencias nuevas o eliminadas
- Entregar SBOM a auditores de seguridad si lo solicitan

---

## 7. Politica de Dependencias Permitidas

### 7.1 Licencias Permitidas

| Licencia | Estado | Razon |
|----------|--------|-------|
| MIT | PERMITIDA | Compatible con uso comercial y educativo |
| Apache-2.0 | PERMITIDA | Compatible con uso comercial, requiere atribucion |
| ISC | PERMITIDA | Equivalente permisiva a MIT |
| BSD-2-Clause | PERMITIDA | Permisiva, minimas restricciones |
| BSD-3-Clause | PERMITIDA | Permisiva, incluye clausula de no-endoso |
| 0BSD | PERMITIDA | Sin restricciones |
| CC0-1.0 | PERMITIDA | Dominio publico |

### 7.2 Licencias Prohibidas

| Licencia | Estado | Razon |
|----------|--------|-------|
| GPL-2.0 | PROHIBIDA | Copyleft fuerte, incompatible con distribucion comercial |
| GPL-3.0 | PROHIBIDA | Copyleft fuerte, incompatible con distribucion comercial |
| AGPL-3.0 | PROHIBIDA | Copyleft de red, requiere compartir codigo fuente |
| SSPL | PROHIBIDA | Restricciones severas de uso |
| EUPL | PROHIBIDA | Copyleft, complejidad legal |

### 7.3 Licencias que Requieren Evaluacion

| Licencia | Estado | Accion |
|----------|--------|--------|
| LGPL-2.1 / LGPL-3.0 | EVALUAR | Aceptable si se usa como libreria (no se modifica) |
| MPL-2.0 | EVALUAR | Aceptable si no se modifica el archivo con licencia |
| CC-BY-4.0 | EVALUAR | Aceptable para documentacion, no para codigo |
| Unlicense | EVALUAR | Verificar que es intencionalmente sin licencia |

### 7.4 Verificacion antes de Agregar Dependencia

```bash
# Verificar licencia de un paquete
npm info <paquete> license

# Verificar licencias de todas las dependencias
npx license-checker --summary

# Verificar licencias prohibidas
npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0;SSPL"
```

**REGLA:** Antes de agregar cualquier dependencia nueva con `npm install`, verificar su licencia.

---

## 8. Scripts de Verificacion

### 8.1 Scripts para package.json

Agregar los siguientes scripts al `package.json` de cada app:

```json
{
  "scripts": {
    "security:audit": "npm audit --audit-level=high",
    "security:audit:fix": "npm audit fix",
    "security:check": "npm audit --omit=dev",
    "security:licenses": "npx license-checker --failOn 'GPL-2.0;GPL-3.0;AGPL-3.0;SSPL'",
    "security:outdated": "npm outdated",
    "preinstall": "npx npm-force-resolutions"
  }
}
```

### 8.2 Script de Verificacion Completa

```bash
#!/bin/bash
# scripts/security-check.sh
# Verificacion completa de supply chain para gamilit

echo "=== Supply Chain Security Check ==="
echo ""

FAILED=0

# 1. Verificar vulnerabilidades backend
echo "[1/4] Auditando apps/backend..."
cd apps/backend
AUDIT_BACKEND=$(npm audit --audit-level=high 2>&1)
if [ $? -ne 0 ]; then
    echo "  FALLO: Vulnerabilidades criticas/altas en backend"
    echo "$AUDIT_BACKEND"
    FAILED=1
else
    echo "  OK: Backend sin vulnerabilidades criticas/altas"
fi

# 2. Verificar vulnerabilidades frontend
echo "[2/4] Auditando apps/frontend..."
cd ../frontend
AUDIT_FRONTEND=$(npm audit --audit-level=high 2>&1)
if [ $? -ne 0 ]; then
    echo "  FALLO: Vulnerabilidades criticas/altas en frontend"
    echo "$AUDIT_FRONTEND"
    FAILED=1
else
    echo "  OK: Frontend sin vulnerabilidades criticas/altas"
fi

# 3. Verificar licencias
echo "[3/4] Verificando licencias..."
cd ../backend
npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0;SSPL" --summary > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "  FALLO: Licencias prohibidas detectadas en backend"
    FAILED=1
else
    echo "  OK: Licencias backend validas"
fi

cd ../frontend
npx license-checker --failOn "GPL-2.0;GPL-3.0;AGPL-3.0;SSPL" --summary > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "  FALLO: Licencias prohibidas detectadas en frontend"
    FAILED=1
else
    echo "  OK: Licencias frontend validas"
fi

# 4. Verificar lock files
echo "[4/4] Verificando lock files..."
cd ../..
if [ -f "apps/backend/package-lock.json" ] && [ -f "apps/frontend/package-lock.json" ]; then
    echo "  OK: Lock files presentes"
else
    echo "  FALLO: Faltan lock files"
    FAILED=1
fi

echo ""
if [ $FAILED -eq 0 ]; then
    echo "=== RESULTADO: APROBADO ==="
else
    echo "=== RESULTADO: FALLO - Corregir antes de deploy ==="
    exit 1
fi
```

---

## 9. Checklist Pre-Deploy de Supply Chain

Ejecutar antes de cada deploy a produccion (74.208.126.102):

```markdown
- [ ] `npm audit` ejecutado en apps/backend sin vulnerabilidades criticas/altas
- [ ] `npm audit` ejecutado en apps/frontend sin vulnerabilidades criticas/altas
- [ ] package-lock.json de backend actualizado y commiteado
- [ ] package-lock.json de frontend actualizado y commiteado
- [ ] No hay dependencias con licencias prohibidas (GPL, AGPL, SSPL)
- [ ] Dependencias desactualizadas revisadas (`npm outdated`)
- [ ] SBOM generado para esta release (si es release mayor)
- [ ] No hay dependencias nuevas sin revisar desde ultimo deploy
```

---

## Riesgos Aceptados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|------------|
| CVE en dependencia transitiva | Media | Alto | npm audit semanal + Dependabot |
| Lock file desincronizado | Baja | Medio | npm ci en CI, nunca npm install |
| Licencia incompatible oculta | Baja | Alto | license-checker en pre-deploy |
| Dependency confusion | Muy Baja | Critico | No hay paquetes internos privados (mitigado) |

---

## Condiciones de Revision

Esta politica debe revisarse cuando:

1. Se detecte una vulnerabilidad critica en produccion
2. Se agregue un nuevo directorio con `package.json` al monorepo
3. Cambio mayor de stack (ej: migracion de framework)
4. Trimestralmente como parte de governance review
5. Cuando npm introduzca nuevas herramientas de seguridad

---

## Referencias

- **CLAUDE.md:** Stack tecnologico y estructura monorepo
- **RC4 CLAUDE.md:** Monorepo — single git repo
- **CHECKLIST-SECURITY-SUPPLY-CHAIN:** Checklist operativo derivado de esta politica
- **npm audit docs:** https://docs.npmjs.com/cli/v10/commands/npm-audit
- **CycloneDX:** https://cyclonedx.org/
- **OWASP Supply Chain Security:** https://owasp.org/www-project-software-component-verification-standard/

---

*Sistema SIMCO v4.0.0*
*Fecha: 2026-02-14*
