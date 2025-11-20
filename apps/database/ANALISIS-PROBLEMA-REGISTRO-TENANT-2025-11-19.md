# Análisis del Problema: Creación Incorrecta de Tenants en Registro

**Fecha:** 2025-11-19
**Agente:** Database Agent
**Problema Reportado:** Usuario `rckrdmrd@gmail.com` no puede enviar respuestas de ejercicios

---

## 📋 Resumen Ejecutivo

### Problema Identificado

Durante el registro de nuevos usuarios, el sistema crea automáticamente un **tenant personal** para cada usuario en lugar de asignarlos al **tenant principal de GAMILIT**.

**Consecuencia:**
- Los usuarios registrados no tienen acceso a módulos y ejercicios
- Los módulos están configurados con `tenant_id = NULL` (compartidos entre todos los tenants)
- Usuarios con tenants personales quedan aislados del contenido educativo

### Impacto

**Usuario Afectado:** `rckrdmrd@gmail.com`
- Tenant incorrecto: `rckrdmrd-personal` (e8d1c731-4972-4a8d-92ba-5ff52151b0cd)
- Tenant correcto: `GAMILIT Platform` (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)

**Solución Temporal Aplicada:**
Se corrigió manualmente el `tenant_id` en 3 tablas para este usuario específico.

---

## 🔍 Análisis Técnico Completo

### 1. Flujo de Registro Actual

```
1. Usuario envía formulario de registro (frontend)
   ↓
2. Backend: AuthService.register()
   ↓
3. Backend: Crea tenant personal (PROBLEMA AQUÍ)
   ├─ name: "rckrdmrd-personal"
   ├─ slug: "rckrdmrd-1763613240556"
   └─ subscription_tier: FREE
   ↓
4. Backend: Crea usuario en auth.users
   ↓
5. Backend: Crea perfil en auth_management.profiles
   └─ tenant_id: <tenant personal recién creado>
   ↓
6. Database: Trigger trg_initialize_user_stats (AFTER INSERT)
   ├─ Crea gamification_system.user_stats (con tenant_id incorrecto)
   ├─ Crea gamification_system.user_ranks (con tenant_id incorrecto)
   └─ Crea gamification_system.comodines_inventory
```

### 2. Código del Problema

**Archivo:** `apps/backend/src/modules/auth/services/auth.service.ts`
**Líneas:** 71-78, 92-95

```typescript
// 3. Crear tenant personal ❌ PROBLEMA
const tenant = this.tenantRepository.create({
  name: `${dto.email.split('@')[0]}-personal`,
  slug: `${dto.email.split('@')[0]}-${Date.now()}`,
  subscription_tier: SubscriptionTierEnum.FREE,
  is_active: true,
});
await this.tenantRepository.save(tenant);

// 5. Crear perfil con tenant incorrecto
const profile = this.profileRepository.create({
  user_id: user.id,
  tenant_id: tenant.id, // ❌ Usa el tenant recién creado
  email: user.email,
  // ...
});
```

### 3. Arquitectura Multi-Tenant

**Modelo Actual (Incorrecto):**
```
Tenant 1: GAMILIT Platform (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
  ├─ Módulos: NULL (compartidos)
  ├─ Ejercicios: NULL (compartidos)
  ├─ Usuario: student@gamilit.com ✅
  └─ Configuración: enterprise, 10,000 usuarios

Tenant 2: rckrdmrd-personal (e8d1c731-4972-4a8d-92ba-5ff52151b0cd)
  ├─ Módulos: ❌ Ninguno (aislado)
  ├─ Ejercicios: ❌ Ninguno (aislado)
  ├─ Usuario: rckrdmrd@gmail.com ❌ (sin acceso a contenido)
  └─ Configuración: free, 100 usuarios
```

**Modelo Esperado (Correcto):**
```
Tenant: GAMILIT Platform (a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11)
  ├─ Módulos: 5 módulos publicados
  ├─ Ejercicios: 15+ ejercicios
  ├─ Usuarios:
  │   ├─ student@gamilit.com ✅
  │   └─ rckrdmrd@gmail.com ✅
  └─ Configuración: enterprise, 10,000 usuarios
```

### 4. Tablas Afectadas

Las siguientes tablas requieren corrección del `tenant_id` para cada usuario registrado:

1. **auth_management.profiles** (tenant_id NOT NULL)
2. **gamification_system.user_stats** (tenant_id NULL-able pero propagado)
3. **gamification_system.user_ranks** (tenant_id NULL-able pero propagado)
4. **auth_management.user_sessions** (tenant_id al hacer login)
5. **Todas las tablas con FK a tenants**

### 5. Triggers Actuales en auth_management.profiles

```sql
-- AFTER INSERT
CREATE TRIGGER trg_initialize_user_stats
    AFTER INSERT ON auth_management.profiles
    FOR EACH ROW EXECUTE FUNCTION gamilit.initialize_user_stats();

-- AFTER UPDATE
CREATE TRIGGER trg_audit_profile_changes
    AFTER UPDATE ON auth_management.profiles
    FOR EACH ROW EXECUTE FUNCTION gamilit.audit_profile_changes();

-- BEFORE UPDATE
CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON auth_management.profiles
    FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column();
```

**Observación:** ❌ NO hay trigger BEFORE INSERT que valide/corrija el tenant_id

---

## 💡 Soluciones Propuestas

### Solución 1: Trigger Database (RECOMENDADA) ⭐

**Ventajas:**
- ✅ Funciona independientemente de cómo se cree el usuario (backend, migración, scripts)
- ✅ Centralizad en la base de datos (única fuente de verdad)
- ✅ Protege contra errores futuros
- ✅ No requiere cambios en backend (pero se puede complementar)

**Implementación:**

```sql
-- Función: Corregir tenant_id al tenant principal de GAMILIT
CREATE OR REPLACE FUNCTION gamilit.set_default_tenant()
RETURNS TRIGGER AS $$
DECLARE
    v_main_tenant_id UUID;
BEGIN
    -- Obtener el tenant principal de GAMILIT
    SELECT id INTO v_main_tenant_id
    FROM auth_management.tenants
    WHERE slug = 'gamilit-prod'
      AND is_active = true
    LIMIT 1;

    -- Si no se encuentra el tenant principal, usar el primero activo
    IF v_main_tenant_id IS NULL THEN
        SELECT id INTO v_main_tenant_id
        FROM auth_management.tenants
        WHERE is_active = true
        ORDER BY created_at ASC
        LIMIT 1;
    END IF;

    -- Si aún no hay tenant, error crítico
    IF v_main_tenant_id IS NULL THEN
        RAISE EXCEPTION 'No se encontró ningún tenant activo en el sistema';
    END IF;

    -- Asignar el tenant principal al nuevo perfil
    NEW.tenant_id := v_main_tenant_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Ejecutar ANTES de insertar un perfil
CREATE TRIGGER trg_set_default_tenant
    BEFORE INSERT ON auth_management.profiles
    FOR EACH ROW
    EXECUTE FUNCTION gamilit.set_default_tenant();
```

**Archivos a Crear:**
- `apps/database/ddl/schemas/gamilit/functions/11-set_default_tenant.sql`
- `apps/database/ddl/schemas/auth_management/triggers/06-trg_set_default_tenant.sql`

---

### Solución 2: Modificar Backend (COMPLEMENTARIA)

**Ventajas:**
- ✅ Evita crear tenants innecesarios
- ✅ Más eficiente (no crea y después ignora)
- ✅ Coherencia con arquitectura de GAMILIT

**Implementación:**

```typescript
// apps/backend/src/modules/auth/services/auth.service.ts

async register(dto: RegisterUserDto, ip?: string, userAgent?: string): Promise<UserResponseDto> {
  // 1. Validar email único
  const existingUser = await this.userRepository.findOne({
    where: { email: dto.email },
  });

  if (existingUser) {
    throw new ConflictException('Email ya registrado');
  }

  // 2. Hashear password
  const hashedPassword = await bcrypt.hash(dto.password, 10);

  // 3. Obtener tenant principal de GAMILIT ✅ CAMBIO
  const mainTenant = await this.tenantRepository.findOne({
    where: { slug: 'gamilit-prod', is_active: true },
  });

  if (!mainTenant) {
    // Fallback: obtener el primer tenant activo
    const fallbackTenant = await this.tenantRepository.findOne({
      where: { is_active: true },
      order: { created_at: 'ASC' },
    });

    if (!fallbackTenant) {
      throw new Error('No hay tenants activos en el sistema');
    }

    tenant = fallbackTenant;
  } else {
    tenant = mainTenant;
  }

  // 4. Crear usuario (sin cambios)
  const user = this.userRepository.create({
    email: dto.email,
    encrypted_password: hashedPassword,
    role: GamilityRoleEnum.STUDENT,
  });
  await this.userRepository.save(user);

  // 5. Crear perfil con tenant principal ✅ CAMBIO
  const profile = this.profileRepository.create({
    user_id: user.id,
    tenant_id: mainTenant.id, // ✅ Usa tenant principal
    email: user.email,
    first_name: dto.first_name || null,
    last_name: dto.last_name || null,
    role: GamilityRoleEnum.STUDENT,
    status: UserStatusEnum.ACTIVE,
    email_verified: false,
  });
  await this.profileRepository.save(profile);

  // 6. Registrar intento exitoso
  await this.logAuthAttempt(user.id, dto.email, true, ip, userAgent);

  // 7. Retornar usuario sin password
  return this.toUserResponse(user);
}
```

---

## 🎯 Solución Combinada (ÓPTIMA)

**Implementar AMBAS soluciones:**

1. **Trigger Database (Capa de Seguridad):**
   - Garantiza tenant correcto siempre
   - Protege contra errores futuros
   - Funciona con cualquier método de inserción

2. **Modificar Backend (Eficiencia):**
   - No crea tenants innecesarios
   - Reduce queries a la base de datos
   - Código más limpio y coherente

**Beneficios:**
- ✅ Defensa en profundidad (defense in depth)
- ✅ Si el backend falla, el trigger lo corrige
- ✅ Si hay migraciones o scripts, el trigger protege
- ✅ Menos tenants basura en la base de datos

---

## 📊 Impacto de la Solución

### Antes
```
Registro de 10 usuarios:
  → 1 tenant principal (GAMILIT Platform)
  → 10 tenants personales (basura) ❌
  → 10 usuarios aislados sin acceso a contenido ❌
```

### Después
```
Registro de 10 usuarios:
  → 1 tenant principal (GAMILIT Platform)
  → 0 tenants personales ✅
  → 10 usuarios con acceso completo ✅
```

---

## 🧪 Plan de Implementación

### Fase 1: Análisis y Documentación ✅
- [x] Identificar causa raíz
- [x] Analizar flujo completo
- [x] Documentar problema
- [x] Diseñar soluciones

### Fase 2: Implementación Database
- [ ] Crear función `gamilit.set_default_tenant()`
- [ ] Crear trigger `trg_set_default_tenant` (BEFORE INSERT)
- [ ] Integrar al DDL principal (NO scripts de fix)
- [ ] Validar con create-database.sh

### Fase 3: Implementación Backend
- [ ] Modificar `AuthService.register()`
- [ ] Eliminar lógica de creación de tenant personal
- [ ] Agregar lógica de obtención de tenant principal
- [ ] Agregar manejo de errores

### Fase 4: Limpieza
- [ ] Eliminar tenants personales creados
- [ ] Verificar que no hay referencias huérfanas
- [ ] Actualizar documentación

### Fase 5: Testing
- [ ] Crear usuario de prueba
- [ ] Verificar tenant_id correcto
- [ ] Verificar acceso a módulos
- [ ] Verificar envío de respuestas

---

## 🚨 Casos Edge a Considerar

### 1. ¿Qué pasa si NO existe el tenant principal?

**Solución en Trigger:**
```sql
-- Fallback 1: Buscar tenant por slug
SELECT id FROM tenants WHERE slug = 'gamilit-prod' AND is_active = true;

-- Fallback 2: Buscar primer tenant activo
SELECT id FROM tenants WHERE is_active = true ORDER BY created_at ASC LIMIT 1;

-- Fallback 3: Error crítico
RAISE EXCEPTION 'No hay tenants activos en el sistema';
```

### 2. ¿Qué pasa con usuarios ya registrados?

**Migración de Datos:**
```sql
-- Script de corrección (una sola vez)
UPDATE auth_management.profiles
SET tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE tenant_id IN (
    SELECT id FROM auth_management.tenants
    WHERE slug LIKE '%-personal'
);

-- Actualizar gamification_system también
UPDATE gamification_system.user_stats
SET tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE tenant_id IN (
    SELECT id FROM auth_management.tenants
    WHERE slug LIKE '%-personal'
);

-- Y user_ranks
UPDATE gamification_system.user_ranks
SET tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
WHERE tenant_id IN (
    SELECT id FROM auth_management.tenants
    WHERE slug LIKE '%-personal'
);
```

### 3. ¿Hay escenarios donde SÍ queremos tenants personales?

**Respuesta:** Según la arquitectura de GAMILIT, todos los usuarios deben estar en el tenant principal para acceder al contenido educativo. Los tenants separados solo tienen sentido para:
- Escuelas (un tenant por escuela)
- Organizaciones enterprise

Pero NO para usuarios individuales estudiantes.

---

## 📝 Checklist de Validación Post-Implementación

- [ ] Trigger `trg_set_default_tenant` existe en DDL
- [ ] Función `gamilit.set_default_tenant()` existe en DDL
- [ ] create-database.sh ejecuta limpiamente sin errores
- [ ] Nuevo usuario se registra con tenant principal
- [ ] `user_stats` se crea con tenant principal
- [ ] `user_ranks` se crea con tenant principal
- [ ] Usuario puede acceder a módulos
- [ ] Usuario puede enviar respuestas de ejercicios
- [ ] No se crean tenants personales nuevos

---

## 🎓 Lecciones Aprendidas

1. **Multi-tenancy en GAMILIT:**
   - GAMILIT usa un modelo de tenant único para contenido educativo
   - Tenants personales NO son apropiados para estudiantes individuales

2. **Defensa en Profundidad:**
   - Combinar validaciones en backend Y database
   - Triggers database son la última línea de defensa

3. **Política de Carga Limpia:**
   - TODO debe estar en DDL principales
   - NO crear scripts de fix separados
   - Triggers y funciones deben ser parte del DDL

---

**Última actualización:** 2025-11-19
**Estado:** Análisis Completo - Listo para Implementación
**Próximo Paso:** Implementar Solución 1 (Trigger Database)
