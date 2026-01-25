# SIMCO: MODULOS COMPARTIDOS

**Version:** 1.0.0
**Fecha:** 2026-01-03
**Aplica a:** Todos los agentes de desarrollo
**Prioridad:** OBLIGATORIA - Consultar antes de implementar funcionalidad comun
**Relacionado:** SIMCO-ESTRUCTURA-REPOS.md, PRINCIPIO-ANTI-DUPLICACION.md

---

## RESUMEN EJECUTIVO

> **El workspace NEXUS tiene DOS sistemas de codigo compartido: catalog/ y modules/**
> Consultar AMBOS antes de implementar funcionalidad que pueda existir.
> Duplicar codigo existente = deuda tecnica y mantenimiento multiplicado.

---

## DIFERENCIA: catalog/ vs modules/

### Tabla Comparativa

| Aspecto | shared/catalog/ | shared/modules/ |
|---------|---------------|---------------|
| **Proposito** | Documentacion + codigo de referencia | Codigo TypeScript listo para importar |
| **Contenido** | README, guias, templates, ejemplos | Archivos .ts exportables |
| **Uso** | Copiar y adaptar al proyecto | Importar directamente (@shared/modules/*) |
| **Funcionalidades** | auth, payments, notifications, etc. | utils, tipos comunes, helpers |
| **Mantenimiento** | Cada proyecto mantiene su copia | Central, actualizaciones afectan a todos |
| **Cuando usar** | Funcionalidad compleja que requiere adaptacion | Utilidades genericas sin logica de negocio |

### shared/catalog/ - Catalogo de Funcionalidades

```yaml
Ubicacion: /home/isem/workspace-v1/shared/catalog/

Proposito: Documentar funcionalidades complejas con codigo de referencia

Estructura por funcionalidad:
  shared/catalog/{funcionalidad}/
  +-- README.md               # Descripcion y trade-offs
  +-- IMPLEMENTATION.md       # Pasos de implementacion
  +-- _reference/             # Codigo de referencia para copiar
  |   +-- backend/
  |   +-- frontend/
  |   +-- database/
  +-- orchestration/
      +-- CONSUMIDORES.yml    # Proyectos que lo usan

Funcionalidades disponibles (11):
  - auth                      # Login, registro, JWT, OAuth
  - session-management        # Sesiones concurrentes
  - rate-limiting             # Throttle, 429
  - notifications             # Email, push, in-app
  - websocket                 # Tiempo real, streaming
  - multi-tenancy             # Tenant, RLS
  - feature-flags             # Toggles dinamicos
  - payments                  # Stripe, suscripciones
  - template-saas             # Template SaaS completo
  - portales                  # Dashboards, widgets
  - audit-logs                # Auditoria, compliance

Como usar:
  1. Buscar: grep -i "{keyword}" shared/catalog/CATALOG-INDEX.yml
  2. Leer: shared/catalog/{funcionalidad}/README.md
  3. Copiar: _reference/ al proyecto
  4. Adaptar: configuracion al contexto actual
  5. Validar: ejecutar tests
```

### shared/modules/ - Modulos TypeScript

```yaml
Ubicacion: /home/isem/workspace-v1/shared/modules/

Proposito: Codigo TypeScript compartido para importar directamente

Estructura:
  shared/modules/
  +-- package.json            # Configuracion del monorepo
  +-- utils/                  # Utilidades genericas
  |   +-- index.ts
  |   +-- date.util.ts
  |   +-- string.util.ts
  |   +-- validation.util.ts
  +-- auth/                   # Modulo de autenticacion (en desarrollo)
  +-- notifications/          # Sistema de notificaciones
  +-- payments/               # Integracion de pagos
  +-- billing/                # Facturacion
  +-- multitenant/            # Multi-tenancy

Modulos disponibles (6):
  - utils                     # Helpers de fecha, string, validacion
  - auth                      # Guards, decorators, JWT
  - notifications             # Servicio de notificaciones
  - payments                  # Integracion Stripe
  - billing                   # Logica de facturacion
  - multitenant               # Tenant context, RLS

Como usar:
  1. Importar: import { funcion } from '@shared/modules/utils';
  2. Usar directamente en el codigo
  3. NO copiar, solo importar
```

---

## FLUJO DE DECISION

### ¿Necesito funcionalidad compartida?

```
INICIO: Voy a implementar funcionalidad
  |
  v
¿Es funcionalidad comun (auth, payments, notifications)?
  |
  +-- SI --> Buscar en @CATALOG_INDEX
  |            |
  |            +-- Encontrado --> Seguir IMPLEMENTATION.md, copiar y adaptar
  |            |
  |            +-- No encontrado --> ¿Es utilidad generica?
  |                                    |
  |                                    +-- SI --> Ver shared/modules/
  |                                    |
  |                                    +-- NO --> Implementar nuevo
  |
  +-- NO --> ¿Es utilidad generica (fecha, string, validacion)?
               |
               +-- SI --> import from '@shared/modules/utils'
               |
               +-- NO --> Implementar en el proyecto
```

### ¿Catalog o Modules?

```yaml
Usar CATALOG cuando:
  - Es funcionalidad completa (auth, payments, notifications)
  - Requiere adaptacion al proyecto
  - Tiene logica de negocio que varia
  - Incluye DDL, backend, frontend
  - Cada proyecto puede tener variaciones

Usar MODULES cuando:
  - Es utilidad generica sin logica de negocio
  - NO requiere adaptacion
  - Es identico en todos los proyectos
  - Son helpers puros (fecha, string, validacion)
  - Cambios deben propagarse a todos los consumidores
```

---

## COMO IMPORTAR MODULOS

### Configuracion en tsconfig.json

```json
{
  "compilerOptions": {
    "paths": {
      "@shared/modules/*": ["../../shared/modules/*"]
    }
  }
}
```

### Ejemplos de Importacion

```typescript
// Importar utilidades
import { formatDate, parseDate } from '@shared/modules/utils';
import { slugify, capitalize } from '@shared/modules/utils/string.util';
import { isValidEmail, isValidPhone } from '@shared/modules/utils/validation.util';

// Importar modulos completos
import { TenantService } from '@shared/modules/multitenant';
import { NotificationService } from '@shared/modules/notifications';
import { StripeService } from '@shared/modules/payments';
```

### Estructura de Exportaciones

```typescript
// shared/modules/utils/index.ts
export * from './date.util';
export * from './string.util';
export * from './validation.util';
```

---

## CUANDO CREAR MODULO NUEVO

### Criterios para Promocion a shared/modules/

```yaml
Crear modulo nuevo SI:
  - Es usado por 3+ proyectos
  - Es utilidad generica (NO logica de negocio)
  - NO requiere adaptacion por proyecto
  - Tiene tests unitarios
  - Tiene documentacion (README.md)
  - Sigue patrones de los modulos existentes

NO crear modulo SI:
  - Es especifico de un proyecto
  - Contiene logica de negocio variable
  - Requiere configuracion diferente por proyecto
  - Es prototipo no probado
```

### Proceso de Promocion

```yaml
PASO_1_IDENTIFICAR:
  - Codigo duplicado en 2+ proyectos
  - Utilidad generica sin dependencia de negocio

PASO_2_EXTRAER:
  - Crear carpeta en shared/modules/{modulo}/
  - Mover codigo a archivos .ts
  - Crear index.ts con exports

PASO_3_DOCUMENTAR:
  - Crear README.md siguiendo TEMPLATE-MODULO-COMPARTIDO.md
  - Documentar API publica
  - Agregar ejemplos de uso

PASO_4_CONFIGURAR:
  - Actualizar shared/modules/package.json
  - Verificar paths en consumidores

PASO_5_VALIDAR:
  - npm run build en shared/modules
  - npm run test (si hay tests)
  - Verificar importacion desde proyecto de prueba

PASO_6_ACTUALIZAR_CONSUMIDORES:
  - Reemplazar codigo duplicado por imports
  - Actualizar inventarios
```

---

## ESTRUCTURA DE MODULO

### Template de Modulo

```
shared/modules/{modulo}/
+-- README.md                 # Documentacion del modulo
+-- package.json              # (opcional) dependencias propias
+-- index.ts                  # Punto de entrada, exports
+-- {funcion}.ts              # Archivos de funcionalidad
+-- {funcion}.spec.ts         # Tests unitarios
+-- types.ts                  # (opcional) tipos TypeScript
```

### Ejemplo: Modulo utils

```
shared/modules/utils/
+-- README.md
+-- index.ts                  # export * from './date.util'; ...
+-- date.util.ts              # formatDate, parseDate, addDays...
+-- date.util.spec.ts         # Tests de fecha
+-- string.util.ts            # slugify, capitalize, truncate...
+-- string.util.spec.ts       # Tests de string
+-- validation.util.ts        # isValidEmail, isValidPhone...
+-- validation.util.spec.ts   # Tests de validacion
```

---

## CHECKLIST DE DOCUMENTACION

### Al Crear Modulo Nuevo

```markdown
- [ ] README.md creado con:
  - [ ] Descripcion del modulo
  - [ ] Instalacion/configuracion
  - [ ] API publica documentada
  - [ ] Ejemplos de uso
  - [ ] Dependencias listadas
- [ ] index.ts con exports
- [ ] Tests unitarios
- [ ] Agregar a shared/modules/package.json
- [ ] Verificar paths de importacion
```

### Al Usar Modulo Existente

```markdown
- [ ] Verificar version compatible
- [ ] Configurar paths en tsconfig.json
- [ ] Importar correctamente
- [ ] NO copiar codigo (solo importar)
- [ ] Reportar bugs/mejoras al owner del modulo
```

---

## MANTENIMIENTO

### Responsabilidades

```yaml
Owner del modulo:
  - Mantener documentacion actualizada
  - Revisar PRs de contribuciones
  - Versionar cambios breaking
  - Notificar a consumidores de cambios

Consumidores:
  - Importar, NO copiar
  - Reportar bugs al owner
  - Contribuir mejoras via PR
  - Actualizar cuando hay cambios
```

### Versionado

```yaml
Reglas de versionado:
  - Patch (1.0.X): Bugfixes, no rompe nada
  - Minor (1.X.0): Nueva funcionalidad, retrocompatible
  - Major (X.0.0): Breaking changes, requiere actualizacion

Comunicacion:
  - Cambios breaking se anuncian en CHANGELOG.md
  - Consumidores actualizan antes de deadline
```

---

## ERRORES COMUNES

| Error | Causa | Solucion |
|-------|-------|----------|
| Modulo no encontrado | Paths mal configurados | Verificar tsconfig.json |
| Codigo duplicado | No consulto modules/ | Refactorizar a import |
| Breaking changes | Actualizo modulo sin avisar | Versionar correctamente |
| Funcionalidad en modules que deberia estar en catalog | Tiene logica de negocio | Mover a catalog/ |
| Tests fallan despues de import | Modulo incompatible | Verificar version y deps |

---

## REFERENCIAS

- **Estructura:** `SIMCO-ESTRUCTURA-REPOS.md`
- **Anti-duplicacion:** `PRINCIPIO-ANTI-DUPLICACION.md`
- **Catalogo:** `shared/catalog/CATALOG-INDEX.yml`
- **Template modulo:** `TEMPLATE-MODULO-COMPARTIDO.md`

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Directiva de Modulos
