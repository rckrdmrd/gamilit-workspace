# RF-XXX-NNN: [Título del Requerimiento]

## 📋 Metadata

| Campo | Valor |
|-------|-------|
| **ID** | RF-XXX-NNN |
| **Módulo** | [XX - Nombre del Módulo] |
| **Título** | [Título del Requerimiento] |
| **Prioridad** | [Alta / Media / Baja] |
| **Estado** | [🔴 Pendiente / 🟡 En Progreso / ✅ Implementado / ⏸️  En Pausa] |
| **Versión** | 1.0 |
| **Fecha Creación** | YYYY-MM-DD |
| **Última Actualización** | YYYY-MM-DD |
| **Autor** | [Nombre del Autor / Equipo] |
| **Stakeholders** | [Lista de stakeholders] |

---

## 🔗 Referencias

### Implementación DDL

🗄️ **ENUMs:**
- `schema.enum_name` → `apps/database/ddl/...`
  - **Valores:** `valor1`, `valor2`, `valor3`

🗄️ **Tablas Relacionadas:**
1. **`schema.table_name`**
   - **Ubicación:** `apps/database/ddl/schemas/schema/tables/table_name.sql`
   - **Columnas clave:** `id`, `name`, `status`
   - **Propósito:** [Descripción breve]

🗄️ **Funciones SQL:**
1. **`function_name(params)`**
   - **Ubicación:** `apps/database/ddl/schemas/schema/functions/function_name.sql`
   - **Propósito:** [Descripción breve]
   - **Retorno:** [Tipo de dato retornado]

### Especificación Técnica

📘 **Documento ET Relacionado:**
- [ET-XXX-NNN: Título](../../02-especificaciones-tecnicas/modulo/ET-XXX-NNN-titulo.md)

### Documentos Relacionados

- [RF-XXX-AAA: Título Relacionado](./RF-XXX-AAA-titulo.md)
- [Otro Documento Relevante](../../ruta/al/documento.md)

### ADRs (Architecture Decision Records)

- [ADR-NNN: Título de Decisión](../../02-especificaciones-tecnicas/adr/ADR-NNN-titulo.md)
  - **Decisión:** [Resumen de la decisión]
  - **Razón:** [Justificación breve]

---

## 📖 Descripción General

### Propósito

[Descripción clara y concisa del propósito del requerimiento. ¿Qué problema resuelve? ¿Por qué es necesario?]

### Contexto

[Contexto de negocio o técnico que justifica este requerimiento]

### Alcance

**Incluye:**
- ✅ [Funcionalidad incluida 1]
- ✅ [Funcionalidad incluida 2]
- ✅ [Funcionalidad incluida 3]

**Excluye:**
- ❌ [Funcionalidad explícitamente excluida 1]
- ❌ [Funcionalidad explícitamente excluida 2]

---

## ⚙️ Requerimientos Funcionales

### RF-XXX-NNN.1: [Nombre del Sub-Requerimiento]

**Descripción:**
[Descripción detallada del sub-requerimiento]

**Criterios de Aceptación:**
- [ ] Criterio 1
- [ ] Criterio 2
- [ ] Criterio 3

**Validaciones:**
| Campo | Validación | Mensaje de Error |
|-------|------------|------------------|
| `campo1` | Requerido, máximo 200 caracteres | "Campo es requerido" |
| `campo2` | Formato email | "Email inválido" |

**Endpoint (si aplica):**
- **Método:** GET / POST / PUT / DELETE
- **Ruta:** `/api/module/resource`
- **Auth:** Requiere autenticación (JWT)
- **Roles:** `student`, `admin_teacher`, `super_admin`

---

## 💼 Casos de Uso

### CU-XXX-NNN-001: [Nombre del Caso de Uso]

**Actor:** [Usuario final, Sistema, etc.]
**Trigger:** [Qué inicia este caso de uso]

**Precondiciones:**
- [Condición 1]
- [Condición 2]

**Flujo Principal:**

1. [Paso 1]
2. [Paso 2]
3. [Paso 3]
4. [Paso 4]

**Flujo Alternativo 1a: [Descripción del flujo alternativo]**
- [Descripción de qué sucede en esta alternativa]

**Postcondiciones:**
- [Estado del sistema después de completar el caso de uso]

---

## 🔒 Consideraciones de Seguridad

### Validaciones

| Validación | Implementación |
|------------|----------------|
| **Autenticación** | JWT token requerido |
| **Autorización** | Solo roles permitidos |
| **Input Sanitization** | [Descripción] |
| **Rate Limiting** | [Límites definidos] |

### Auditoría

[Descripción de qué se registra en audit logs]

---

## ✅ Criterios de Aceptación

### CA-XXX-NNN-001: [Nombre del Criterio]

- [ ] [Descripción del criterio 1]
- [ ] [Descripción del criterio 2]
- [ ] [Descripción del criterio 3]

---

## 🧪 Testing

### Test Case 1: [Nombre del Test]

```typescript
test('[Descripción del test]', async () => {
  // Arrange
  const input = {...};

  // Act
  const result = await functionUnderTest(input);

  // Assert
  expect(result).toBe(expectedValue);
});
```

---

## 📊 Métricas y KPIs

| Métrica | Objetivo | Método de Medición |
|---------|----------|-------------------|
| [Métrica 1] | [Valor objetivo] | [Cómo se mide] |
| [Métrica 2] | [Valor objetivo] | [Cómo se mide] |

---

## 🔗 Referencias Adicionales

### Documentación Externa

- [Documentación de tecnología externa](https://url.com)
- [Standard o especificación relevante](https://url.com)

### Consultoría

- **Documento:** "[Nombre del documento de consultoría]"
- **Asesor:** [Nombre]
- **Fecha:** YYYY-MM-DD

---

## 📅 Historial de Cambios

| Versión | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | YYYY-MM-DD | [Autor] | Creación del documento |

---

**Documento:** `docs/01-requerimientos/XX-modulo/RF-XXX-NNN-titulo.md`
**Propósito:** Requerimientos funcionales de [breve descripción]
**Audiencia:** Product Owner, Developers, QA Team
