# SIMCO: REUTILIZAR DEL CATÁLOGO

**Versión:** 1.0.0
**Fecha:** 2025-12-08
**Aplica a:** TODO agente que implemente funcionalidades comunes
**Prioridad:** OBLIGATORIA - Verificar ANTES de crear nuevo

---

## RESUMEN EJECUTIVO

> **Antes de implementar funcionalidades comunes (auth, notificaciones, pagos, etc.), VERIFICAR si existe código probado en @CATALOG y REUTILIZARLO.**

---

## PRINCIPIO FUNDAMENTAL

```
╔══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║              CÓDIGO PROBADO > CÓDIGO NUEVO                           ║
║                                                                       ║
║  "Reutilizar código validado ahorra tiempo y evita bugs."            ║
║  "El catálogo contiene soluciones probadas en producción."           ║
║                                                                       ║
╚══════════════════════════════════════════════════════════════════════╝
```

---

## CUÁNDO APLICAR ESTA DIRECTIVA

### Funcionalidades en el Catálogo (@CATALOG)

| Funcionalidad | Keywords | Alias |
|---------------|----------|-------|
| **Autenticación** | login, registro, JWT, OAuth, password | @CATALOG_AUTH |
| **Sesiones** | session, logout, dispositivo, concurrent | @CATALOG_SESSION |
| **Rate Limiting** | throttle, 429, limite, abuse | @CATALOG_RATELIMIT |
| **Notificaciones** | email, push, in-app, alerta | @CATALOG_NOTIFY |
| **Multi-Tenancy** | tenant, organization, RLS | @CATALOG_TENANT |
| **Feature Flags** | toggle, feature, rollout, a/b | @CATALOG_FLAGS |
| **WebSocket** | realtime, socket, streaming | @CATALOG_WS |
| **Pagos** | payment, stripe, subscription | @CATALOG_PAYMENTS |

---

## CHECKLIST RÁPIDO

```
VERIFICAR CATÁLOGO
├── [ ] 1. Buscar en @CATALOG_INDEX con keywords
├── [ ] 2. Si encuentra → Seguir pasos abajo
└── [ ] 3. Si NO encuentra → Usar @CREAR normal

SI ENCUENTRA EN CATÁLOGO
├── [ ] 4. Leer README.md de la funcionalidad
├── [ ] 5. Verificar compatibilidad de stack
├── [ ] 6. Seguir IMPLEMENTATION.md
├── [ ] 7. Copiar código de _reference/
├── [ ] 8. Adaptar configuración al proyecto
├── [ ] 9. Ejecutar tests de referencia
└── [ ] 10. Documentar adaptaciones realizadas
```

---

## PROCESO DETALLADO

### Paso 1: Buscar en el Catálogo

```bash
# Buscar por keyword en índice
grep -i "{lo que necesito}" @CATALOG_INDEX

# Ejemplos:
grep -i "login" @CATALOG_INDEX      # → auth
grep -i "sesion" @CATALOG_INDEX     # → session-management
grep -i "email" @CATALOG_INDEX      # → notifications
grep -i "stripe" @CATALOG_INDEX     # → payments
```

### Paso 2: Verificar Compatibilidad

**Antes de usar código del catálogo, verificar:**

```markdown
Checklist de Compatibilidad:
[ ] Stack del catálogo es compatible con mi proyecto
    - Catálogo usa: {stack del catálogo}
    - Mi proyecto usa: {stack del proyecto}
[ ] Versiones de dependencias son compatibles
[ ] El estado es "production-ready" o "documentando"
```

### Paso 3: Leer Documentación

```bash
# Ir al directorio de la funcionalidad
cd @CATALOG/{funcionalidad}/

# Leer descripción y trade-offs
cat README.md

# Leer pasos de implementación
cat IMPLEMENTATION.md
```

**Extraer de README.md:**
- Qué hace exactamente
- Cuándo usar / cuándo NO usar
- Dependencias requeridas
- Trade-offs conocidos

### Paso 4: Copiar Código de Referencia

```bash
# Ver archivos de referencia disponibles
ls @CATALOG/{funcionalidad}/_reference/

# Copiar al proyecto
cp @CATALOG/{funcionalidad}/_reference/{archivo} {destino_en_proyecto}
```

**IMPORTANTE:** El código en `_reference/` es un punto de partida, NO copiar ciegamente:
- Adaptar nombres al proyecto
- Ajustar configuración
- Modificar según necesidades específicas

### Paso 5: Seguir Guía de Implementación

El archivo `IMPLEMENTATION.md` contiene:

```markdown
1. Prerequisitos (qué debe existir antes)
2. Pasos de implementación (en orden)
3. Configuración requerida (env vars, etc.)
4. Verificación (cómo validar que funciona)
5. Troubleshooting (problemas comunes)
```

**Seguir los pasos EN ORDEN.**

### Paso 6: Adaptar al Proyecto

```markdown
Adaptaciones típicas:
- [ ] Renombrar según convenciones del proyecto
- [ ] Ajustar imports/paths
- [ ] Configurar variables de entorno
- [ ] Modificar esquema de BD si difiere
- [ ] Ajustar DTOs/interfaces según necesidad
```

### Paso 7: Validar

```bash
# Ejecutar tests del proyecto
npm run test

# Verificar build
npm run build

# Verificar lint
npm run lint
```

### Paso 8: Documentar

**Agregar en traza del proyecto:**

```markdown
## Funcionalidad Reutilizada

**Origen:** @CATALOG/{funcionalidad}/
**Versión catálogo:** {versión}
**Fecha:** {YYYY-MM-DD}

### Adaptaciones Realizadas
- {lista de cambios respecto al código de referencia}

### Archivos Creados/Modificados
- {lista de archivos}

### Notas
- {observaciones relevantes}
```

---

## ESTRUCTURA DE CADA FUNCIONALIDAD EN CATÁLOGO

```
@CATALOG/{funcionalidad}/
├── README.md           # Descripción, trade-offs, cuándo usar
├── IMPLEMENTATION.md   # Guía paso a paso
└── _reference/         # Código de referencia
    ├── {archivo1}.ts   # Servicios, entities, etc.
    ├── {archivo2}.ts
    ├── {archivo}.spec.ts  # Tests
    └── README.md       # Descripción de cada archivo
```

---

## QUÉ NO HACER

```
❌ NO copiar código sin leer README.md
   → Puede haber trade-offs importantes

❌ NO ignorar IMPLEMENTATION.md
   → Los pasos están en orden por una razón

❌ NO modificar archivos en @CATALOG/ directamente
   → Copiar a tu proyecto y modificar ahí

❌ NO usar código con estado "pendiente"
   → Preferir "production-ready" o "documentando"

❌ NO omitir validación (build, lint, tests)
   → El código de referencia funciona, pero tu adaptación debe validarse
```

---

## SI NO ENCUENTRA EN CATÁLOGO

```
Si la funcionalidad NO está en @CATALOG:

1. Proceder con @CREAR normal
2. Implementar siguiendo @SIMCO correspondiente
3. Al completar, considerar si es candidato para catálogo:
   - ¿Es reutilizable (no específica del dominio)?
   - ¿Tiene tests?
   - ¿Está documentada?

4. Si es candidato, notificar para futura inclusión
```

---

## FUNCIONALIDADES DISPONIBLES (Resumen)

| Funcionalidad | Estado | Stack | Origen |
|---------------|--------|-------|--------|
| auth | 🟢 Production-Ready | NestJS + JWT + Passport | Gamilit |
| session-management | 🟢 Production-Ready | NestJS + TypeORM | Gamilit |
| rate-limiting | 🟢 Production-Ready | NestJS + @nestjs/throttler | Gamilit |
| notifications | 🟢 Production-Ready | NestJS + Nodemailer + FCM | Gamilit |
| multi-tenancy | 🟢 Production-Ready | NestJS + PostgreSQL | Gamilit |
| feature-flags | 🟢 Production-Ready | NestJS + TypeORM | Gamilit |
| websocket | 🟢 Production-Ready | NestJS + Socket.io | Trading |
| payments | 🟢 Production-Ready | NestJS + Stripe | Trading |

**Leyenda:**
- 🟢 Production-Ready: README.md + IMPLEMENTATION.md completos
- 🟡 Documentando: En proceso de documentación
- 🔴 Pendiente: Identificado pero no documentado

**Última actualización:** 2025-12-08

---

## REFERENCIAS

- **Catálogo completo:** @CATALOG
- **Índice de búsqueda:** @CATALOG_INDEX
- **Si no existe:** @CREAR (SIMCO-CREAR.md)
- **Anti-duplicación:** @PRINCIPIOS/PRINCIPIO-ANTI-DUPLICACION.md

---

**Versión:** 1.0.0 | **Sistema:** SIMCO | **Mantenido por:** Tech Lead
