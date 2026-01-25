# SIMCO-RELACIONES-OBJETOS.md - Documentacion de Dependencias Entre Objetos

**Version:** 1.0.0
**Creado:** 2026-01-16
**Sistema:** SIMCO v3.8+

---

## Proposito

Definir el procedimiento estandar para documentar relaciones y dependencias entre objetos del sistema (tablas, entities, DTOs, services, componentes, hooks, etc.) de forma que se pueda trazar el impacto de cualquier cambio.

---

## Tipos de Relaciones

### 1. Relaciones de Base de Datos
```yaml
tipo: FK      # Foreign Key
tipo: INDEX   # Indice compartido
tipo: TRIGGER # Trigger entre tablas
tipo: VIEW    # Vista que depende de tabla
```

### 2. Relaciones de Backend
```yaml
tipo: IMPORT     # A importa a B
tipo: EXTENDS    # A extiende B
tipo: IMPLEMENTS # A implementa interface B
tipo: INJECT     # A inyecta B (DI)
tipo: CALLS      # A llama metodo de B
```

### 3. Relaciones de Frontend
```yaml
tipo: IMPORT     # Componente importa otro
tipo: RENDERS    # Componente renderiza otro
tipo: USES_HOOK  # Componente usa hook
tipo: USES_STORE # Componente usa store
tipo: CALLS_API  # Componente llama API
```

---

## Formato de Documentacion en Inventarios

### Para DATABASE_INVENTORY.yml
```yaml
tablas:
  - nombre: users
    schema: core
    relaciones:
      salientes:  # Esta tabla apunta a otras
        - destino: schools
          tipo: FK
          columna: school_id
          on_delete: CASCADE
      entrantes:  # Otras tablas apuntan a esta
        - origen: user_stats
          tipo: FK
          columna: user_id
        - origen: user_achievements
          tipo: FK
          columna: user_id
    impacto_cambio: ALTO  # Muchos dependientes
```

### Para BACKEND_INVENTORY.yml
```yaml
entities:
  - nombre: UserEntity
    path: modules/users/entities/user.entity.ts
    relaciones:
      importa:
        - objeto: BaseEntity
          tipo: EXTENDS
          path: shared/entities/base.entity.ts
        - objeto: SchoolEntity
          tipo: FK_RELATION
          path: modules/schools/entities/school.entity.ts
      importado_por:
        - objeto: UserService
          tipo: INJECT
          path: modules/users/users.service.ts
        - objeto: AuthService
          tipo: INJECT
          path: modules/auth/auth.service.ts
    impacto_cambio: ALTO
```

### Para FRONTEND_INVENTORY.yml
```yaml
componentes:
  - nombre: UserProfile
    path: components/UserProfile.tsx
    relaciones:
      importa:
        - objeto: useAuth
          tipo: USES_HOOK
          path: hooks/useAuth.ts
        - objeto: userApi
          tipo: CALLS_API
          path: services/api/userAPI.ts
        - objeto: Avatar
          tipo: RENDERS
          path: components/common/Avatar.tsx
      importado_por:
        - objeto: ProfilePage
          tipo: RENDERS
          path: pages/ProfilePage.tsx
        - objeto: Header
          tipo: RENDERS
          path: components/layout/Header.tsx
    impacto_cambio: MEDIO
```

---

## Procedimiento para Documentar Relaciones

### Paso 1: Identificar Relaciones al Crear/Modificar

Al crear o modificar un objeto, ejecutar:

```bash
# Para archivos TypeScript/JavaScript
grep -r "import.*from.*{archivo}" src/

# Para encontrar que importa el archivo
grep -l "import" {archivo} | head -20
```

O usar el trigger:
```
@TRIGGER-ANALISIS-DEPENDENCIAS
```

### Paso 2: Clasificar Relaciones

```yaml
# Preguntas para clasificar:
1. Este objeto IMPORTA otros? → Relacion "importa"
2. Este objeto es IMPORTADO por otros? → Relacion "importado_por"
3. Este objeto EXTIENDE otro? → Relacion "extends"
4. Este objeto IMPLEMENTA interface? → Relacion "implements"
5. Este objeto tiene FK a otro? → Relacion "FK"
```

### Paso 3: Determinar Impacto de Cambio

```yaml
impacto_cambio:
  CRITICO: # > 20 dependientes O es core del sistema
    - "Cambio requiere revision arquitectonica"
    - "Notificar a todos los equipos"

  ALTO: # 10-20 dependientes
    - "Cambio requiere tests extensivos"
    - "Evaluar backwards compatibility"

  MEDIO: # 5-10 dependientes
    - "Cambio requiere tests de dependientes"
    - "Actualizar documentacion"

  BAJO: # < 5 dependientes
    - "Cambio localizado"
    - "Tests unitarios suficientes"
```

### Paso 4: Documentar en Inventario

Agregar seccion `relaciones:` al objeto en el inventario correspondiente.

---

## Ejemplo Completo: Nueva Entity

### Escenario
Crear `PaymentEntity` que:
- Extiende `BaseEntity`
- Tiene FK a `UserEntity`
- Tiene FK a `OrderEntity`
- Sera usada por `PaymentService`

### Documentacion en BACKEND_INVENTORY.yml
```yaml
entities:
  - nombre: PaymentEntity
    path: modules/payments/entities/payment.entity.ts
    tabla: payments.payments
    creado: 2026-01-16
    relaciones:
      importa:
        - objeto: BaseEntity
          tipo: EXTENDS
          path: shared/entities/base.entity.ts
        - objeto: UserEntity
          tipo: FK_RELATION
          path: modules/users/entities/user.entity.ts
          columna: user_id
        - objeto: OrderEntity
          tipo: FK_RELATION
          path: modules/orders/entities/order.entity.ts
          columna: order_id
      importado_por:
        - objeto: PaymentService
          tipo: INJECT
          path: modules/payments/payments.service.ts
        - objeto: PaymentController
          tipo: USES
          path: modules/payments/payments.controller.ts
    impacto_cambio: MEDIO
    notas: "Entidad core del modulo de pagos"
```

### Documentacion en DATABASE_INVENTORY.yml
```yaml
tablas:
  - nombre: payments
    schema: payments
    creado: 2026-01-16
    relaciones:
      salientes:
        - destino: users
          destino_schema: core
          tipo: FK
          columna: user_id
          on_delete: RESTRICT
        - destino: orders
          destino_schema: orders
          tipo: FK
          columna: order_id
          on_delete: CASCADE
      entrantes: []  # Ninguna tabla apunta a esta aun
    impacto_cambio: BAJO  # Nueva, sin dependientes
```

---

## Grafo de Dependencias

Para visualizar relaciones complejas, mantener grafo en:
```
orchestration/DEPENDENCY-GRAPH.yml
```

### Formato del Grafo
```yaml
# DEPENDENCY-GRAPH.yml
version: 1.0.0
updated: 2026-01-16

nodos:
  - id: users
    tipo: tabla
    schema: core

  - id: UserEntity
    tipo: entity
    modulo: users

  - id: UserService
    tipo: service
    modulo: users

aristas:
  - origen: UserEntity
    destino: users
    tipo: MAPS_TO

  - origen: UserService
    destino: UserEntity
    tipo: USES

  - origen: user_stats
    destino: users
    tipo: FK
```

---

## Actualizacion de Relaciones

### Cuando Actualizar

| Evento | Accion |
|--------|--------|
| Crear objeto nuevo | Documentar todas sus relaciones |
| Modificar imports | Actualizar relacion "importa" |
| Agregar dependiente | Actualizar relacion "importado_por" |
| Eliminar objeto | Remover de relaciones de otros |
| Cambiar FK | Actualizar relaciones BD |

### Comando para Verificar Consistencia

```bash
# Verificar que relaciones documentadas existen
grep -r "import.*{objeto}" src/ | wc -l
# Comparar con numero en inventario
```

---

## Relaciones Bidireccionales

**Regla:** Toda relacion debe documentarse en AMBOS lados.

### Ejemplo
Si `UserService` importa `UserEntity`:

```yaml
# En entrada de UserService:
relaciones:
  importa:
    - objeto: UserEntity
      tipo: INJECT

# En entrada de UserEntity:
relaciones:
  importado_por:
    - objeto: UserService
      tipo: INJECT
```

---

## Anti-patrones

### Evitar:
1. **Relaciones huerfanas:** Documentar solo un lado
2. **Relaciones obsoletas:** No actualizar al eliminar
3. **Impacto incorrecto:** Subestimar dependientes
4. **Falta de tipo:** No especificar tipo de relacion

### Verificar:
```yaml
# Checklist de calidad de relaciones
[ ] Ambos lados documentados
[ ] Tipo de relacion especificado
[ ] Path/ubicacion correcta
[ ] Impacto de cambio evaluado
[ ] Actualizado en ultimo cambio
```

---

## Integracion con Otros SIMCO

| Directiva | Integracion |
|-----------|-------------|
| TRIGGER-ANALISIS-DEPENDENCIAS | Input para identificar relaciones |
| CHECKLIST-FASE-D | Paso 7 usa esta directiva |
| SIMCO-INVENTARIOS | Formato base de inventarios |
| SIMCO-MODIFICAR | Verificar relaciones antes de modificar |

---

## Referencias

- `orchestration/DEPENDENCY-GRAPH.yml` - Grafo de dependencias
- `orchestration/inventarios/*.yml` - Inventarios con relaciones
- `TRIGGER-ANALISIS-DEPENDENCIAS.md` - Identificar dependencias

---

**Sistema:** SIMCO v3.8+ con SAAD
**Ultima actualizacion:** 2026-01-16
