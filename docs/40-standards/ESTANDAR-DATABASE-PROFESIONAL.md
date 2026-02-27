---
titulo: Estandar Database Profesional
tipo: estandar-workspace
scope: workspace
version: 1.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
herencia: |
  Este estandar aplica a nivel WORKSPACE.
  Los proyectos pueden EXTENDER (no contradecir) con estandares locales.
  Ejemplo: workspace-projects/projects/{proyecto}/docs/DATABASE-STANDARDS.md para configuraciones especificas.
---

# Estandar de Base de Datos Profesional

> Convenciones de diseno, modelado, indexacion y optimizacion para PostgreSQL
>
> **Nota de herencia:** Los proyectos heredan este estandar y pueden agregar reglas adicionales especificas

---

## 1. Normalizacion de Bases de Datos

### 1.1 Primera Forma Normal (1NF)

**Requisitos:**
- Valores atomicos en cada celda (sin listas ni JSON anidado para datos estructurados)
- Sin grupos repetitivos de columnas
- Clave primaria definida

```sql
-- VIOLACION 1NF: Grupos repetitivos
CREATE TABLE orders_bad (
    id UUID PRIMARY KEY,
    customer_id UUID,
    product1_id UUID,
    product1_qty INTEGER,
    product2_id UUID,
    product2_qty INTEGER
);

-- CORRECCION 1NF: Tabla separada
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id),
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price DECIMAL(12,2) NOT NULL
);
```

### 1.2 Segunda Forma Normal (2NF)

**Requisitos:**
- Cumplir 1NF
- Sin dependencias parciales (atributos no-clave dependen de TODA la clave)

```sql
-- VIOLACION 2NF: Dependencia parcial (supplier_name depende solo de supplier_id)
CREATE TABLE order_items_bad (
    order_id UUID,
    product_id UUID,
    supplier_id UUID,
    supplier_name VARCHAR(255), -- Dependencia parcial
    quantity INTEGER,
    PRIMARY KEY (order_id, product_id)
);

-- CORRECCION 2NF: Tabla separada para suppliers
CREATE TABLE suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    contact_email VARCHAR(255)
);

CREATE TABLE order_items (
    order_id UUID REFERENCES orders(id),
    product_id UUID REFERENCES products(id),
    supplier_id UUID REFERENCES suppliers(id),
    quantity INTEGER NOT NULL,
    PRIMARY KEY (order_id, product_id)
);
```

### 1.3 Tercera Forma Normal (3NF)

**Requisitos:**
- Cumplir 2NF
- Sin dependencias transitivas (A -> B -> C eliminar)

```sql
-- VIOLACION 3NF: Dependencia transitiva (city -> state -> country)
CREATE TABLE customers_bad (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    city VARCHAR(100),
    state VARCHAR(100),  -- Depende de city
    country VARCHAR(100) -- Depende de state
);

-- CORRECCION 3NF: Normalizar geograficamente
CREATE TABLE countries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code CHAR(2) NOT NULL UNIQUE
);

CREATE TABLE states (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    country_id UUID NOT NULL REFERENCES countries(id),
    UNIQUE(name, country_id)
);

CREATE TABLE cities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    state_id UUID NOT NULL REFERENCES states(id)
);

CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    city_id UUID REFERENCES cities(id)
);
```

### 1.4 Forma Normal de Boyce-Codd (BCNF)

**Requisitos:**
- Cumplir 3NF
- Toda determinante debe ser clave candidata

```sql
-- VIOLACION BCNF: teacher determina subject pero no es clave candidata
CREATE TABLE course_assignments_bad (
    student_id UUID,
    subject VARCHAR(100),
    teacher_id UUID,
    PRIMARY KEY (student_id, subject)
    -- teacher_id -> subject pero teacher_id no es clave
);

-- CORRECCION BCNF: Separar la dependencia
CREATE TABLE teacher_subjects (
    teacher_id UUID PRIMARY KEY REFERENCES teachers(id),
    subject VARCHAR(100) NOT NULL
);

CREATE TABLE student_enrollments (
    student_id UUID REFERENCES students(id),
    teacher_id UUID REFERENCES teacher_subjects(teacher_id),
    PRIMARY KEY (student_id, teacher_id)
);
```

### 1.5 Denormalizacion Controlada

**Cuando es aceptable:**
- Tablas de reportes/analytics (read-heavy)
- Datos de cache calculados
- Mejora de rendimiento medida y documentada

**Obligatorio al denormalizar:**

```sql
-- DOCUMENTAR denormalizacion con comentario
COMMENT ON COLUMN orders.total_amount IS
'DENORMALIZED: Suma calculada de order_items.
 Actualizado via trigger tr_update_order_total.
 Razon: Evitar JOIN costoso en reportes.
 Ticket: PERF-2026-001';

-- Trigger para mantener consistencia
CREATE OR REPLACE FUNCTION fn_update_order_total()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE orders
    SET total_amount = (
        SELECT COALESCE(SUM(quantity * unit_price), 0)
        FROM order_items WHERE order_id = COALESCE(NEW.order_id, OLD.order_id)
    )
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_update_order_total
AFTER INSERT OR UPDATE OR DELETE ON order_items
FOR EACH ROW EXECUTE FUNCTION fn_update_order_total();
```

---

## 2. Estrategias de Indexacion

### 2.1 Tipos de Indices

| Tipo | Uso | Operadores |
|------|-----|------------|
| B-Tree | Default, comparaciones | `=, <, >, <=, >=, BETWEEN` |
| GIN | Arrays, JSONB, Full-text | `@>, <@, &&, @@` |
| GiST | Geometrico, rangos, full-text | `<<, >>`, operadores de distancia |
| BRIN | Tablas muy grandes ordenadas | Correlacion fisica |
| Hash | Solo igualdad exacta | `=` |

### 2.2 Cuando Usar Cada Tipo

```sql
-- B-Tree: Busquedas por rango y ordenamiento (DEFAULT)
CREATE INDEX idx_orders_created_at ON orders(created_at);

-- GIN: Busquedas en JSONB
CREATE INDEX idx_products_metadata ON products USING GIN(metadata jsonb_path_ops);

-- GIN: Full-text search
CREATE INDEX idx_products_search ON products USING GIN(to_tsvector('spanish', name || ' ' || description));

-- GiST: Datos geograficos
CREATE INDEX idx_locations_coords ON locations USING GIST(coordinates);

-- BRIN: Tablas de logs ordenadas por tiempo (muy eficiente en espacio)
CREATE INDEX idx_audit_logs_created ON audit_logs USING BRIN(created_at);

-- Hash: Solo igualdad (usar con precaucion)
CREATE INDEX idx_sessions_token ON sessions USING HASH(token);
```

### 2.3 Reglas Obligatorias de Indexacion

```sql
-- REGLA 1: Toda FK debe tener indice
ALTER TABLE order_items ADD CONSTRAINT fk_order_items_order
    FOREIGN KEY (order_id) REFERENCES orders(id);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- REGLA 2: Indices compuestos ordenados por selectividad (mas selectivo primero)
-- Si tenant_id tiene 100 valores y status tiene 5: status primero
CREATE INDEX idx_orders_status_tenant ON orders(status, tenant_id);

-- REGLA 3: Incluir columnas frecuentes en SELECT (covering index)
CREATE INDEX idx_orders_customer_covering ON orders(customer_id)
    INCLUDE (status, total_amount);

-- REGLA 4: Indices parciales para consultas frecuentes
CREATE INDEX idx_orders_pending ON orders(created_at)
    WHERE status = 'pending';
```

### 2.4 Anti-patrones de Indexacion

```sql
-- ANTI-PATRON: Sobre-indexacion (mas de 5-7 indices por tabla)
-- Cada indice penaliza INSERT/UPDATE/DELETE

-- ANTI-PATRON: Indices duplicados
CREATE INDEX idx_a ON table(col_a);
CREATE INDEX idx_ab ON table(col_a, col_b); -- idx_a es redundante

-- ANTI-PATRON: Indices en columnas de baja cardinalidad solas
CREATE INDEX idx_bad ON users(is_active); -- Solo 2 valores posibles

-- CORRECTO: Combinarlo con columna selectiva
CREATE INDEX idx_good ON users(is_active, email) WHERE is_active = true;
```

---

## 3. Particionamiento de Tablas

### 3.1 Cuando Usar Particionamiento

- Tablas mayores a 100GB
- Queries con filtros predecibles (fecha, tenant, region)
- Necesidad de purga eficiente de datos antiguos

### 3.2 Tipos de Particionamiento

```sql
-- RANGE: Por fechas (mas comun)
CREATE TABLE audit_logs (
    id UUID DEFAULT gen_random_uuid(),
    action VARCHAR(50) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    user_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    details JSONB
) PARTITION BY RANGE (created_at);

-- Crear particiones mensuales
CREATE TABLE audit_logs_2026_01 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE audit_logs_2026_02 PARTITION OF audit_logs
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');

-- LIST: Por tenant o region
CREATE TABLE orders (
    id UUID DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL,
    customer_id UUID NOT NULL,
    total DECIMAL(12,2),
    created_at TIMESTAMPTZ DEFAULT NOW()
) PARTITION BY LIST (tenant_id);

CREATE TABLE orders_tenant_a PARTITION OF orders
    FOR VALUES IN ('550e8400-e29b-41d4-a716-446655440001');
CREATE TABLE orders_tenant_b PARTITION OF orders
    FOR VALUES IN ('550e8400-e29b-41d4-a716-446655440002');

-- HASH: Distribucion uniforme cuando no hay patron natural
CREATE TABLE sessions (
    id UUID DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    token TEXT NOT NULL,
    expires_at TIMESTAMPTZ
) PARTITION BY HASH (user_id);

CREATE TABLE sessions_p0 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 0);
CREATE TABLE sessions_p1 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 1);
CREATE TABLE sessions_p2 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 2);
CREATE TABLE sessions_p3 PARTITION OF sessions FOR VALUES WITH (MODULUS 4, REMAINDER 3);
```

---

## 4. Optimizacion de Queries

### 4.1 Uso de EXPLAIN ANALYZE

```sql
-- Siempre analizar queries problematicos
EXPLAIN (ANALYZE, BUFFERS, FORMAT TEXT)
SELECT o.id, c.name, SUM(oi.quantity * oi.unit_price) as total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
WHERE o.created_at >= '2026-01-01'
GROUP BY o.id, c.name;

-- Buscar: Seq Scan en tablas grandes, Nested Loop con muchas filas
```

### 4.2 CTEs vs Subqueries

```sql
-- CTE: Mejor legibilidad, se materializa (cuidado con performance)
WITH recent_orders AS (
    SELECT id, customer_id, total_amount
    FROM orders
    WHERE created_at >= CURRENT_DATE - INTERVAL '30 days'
)
SELECT c.name, COUNT(ro.id), SUM(ro.total_amount)
FROM customers c
JOIN recent_orders ro ON ro.customer_id = c.id
GROUP BY c.id;

-- Subquery correlacionada: Evitar cuando sea posible
-- Usar JOIN en su lugar
SELECT c.name,
    (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id) as order_count
FROM customers c; -- Ejecuta subquery por cada fila

-- MEJOR: JOIN
SELECT c.name, COUNT(o.id) as order_count
FROM customers c
LEFT JOIN orders o ON o.customer_id = c.id
GROUP BY c.id;
```

### 4.3 Window Functions

```sql
-- Ranking por categoria
SELECT
    p.name,
    p.category_id,
    p.price,
    ROW_NUMBER() OVER (PARTITION BY p.category_id ORDER BY p.price DESC) as rank,
    SUM(p.price) OVER (PARTITION BY p.category_id) as category_total,
    AVG(p.price) OVER () as global_avg
FROM products p;

-- Running totals
SELECT
    date,
    amount,
    SUM(amount) OVER (ORDER BY date ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) as running_total
FROM daily_sales;
```

### 4.4 Evitar SELECT *

```sql
-- PROHIBIDO en produccion
SELECT * FROM orders WHERE customer_id = $1;

-- CORRECTO: Solo columnas necesarias
SELECT id, status, total_amount, created_at
FROM orders
WHERE customer_id = $1;
```

---

## 5. Integridad Referencial

### 5.1 Foreign Keys Obligatorias

```sql
-- Toda relacion debe tener FK explicita
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL,
    product_id UUID NOT NULL,

    -- FK obligatorias con accion definida
    CONSTRAINT fk_order_items_order
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    CONSTRAINT fk_order_items_product
        FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
);
```

### 5.2 Estrategias ON DELETE/UPDATE

| Estrategia | Uso |
|------------|-----|
| CASCADE | Eliminar dependientes automaticamente (order -> items) |
| RESTRICT | Bloquear si hay dependientes (product con ordenes) |
| SET NULL | Permitir orfanos con FK null (optional relations) |
| SET DEFAULT | Asignar valor default |
| NO ACTION | Similar a RESTRICT pero evaluacion diferida |

### 5.3 Soft Delete Pattern

```sql
-- Soft delete con deleted_at
ALTER TABLE products ADD COLUMN deleted_at TIMESTAMPTZ;

-- Vista para excluir eliminados
CREATE VIEW active_products AS
SELECT * FROM products WHERE deleted_at IS NULL;

-- Indice parcial para queries frecuentes
CREATE INDEX idx_products_active ON products(id) WHERE deleted_at IS NULL;

-- Funcion de soft delete
CREATE OR REPLACE FUNCTION soft_delete()
RETURNS TRIGGER AS $$
BEGIN
    NEW.deleted_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 6. Data Modeling Patterns

### 6.1 One-to-Many

```sql
-- Padre
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Hijo con FK
CREATE TABLE employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id UUID NOT NULL REFERENCES departments(id),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL
);
CREATE INDEX idx_employees_department ON employees(department_id);
```

### 6.2 Many-to-Many

```sql
-- Tabla de union con atributos adicionales
CREATE TABLE user_roles (
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    assigned_by UUID REFERENCES users(id),
    PRIMARY KEY (user_id, role_id)
);
CREATE INDEX idx_user_roles_role ON user_roles(role_id);
```

### 6.3 Tablas de Auditoria

```sql
-- Auditoria generica
CREATE TABLE audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    table_name VARCHAR(100) NOT NULL,
    record_id UUID NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_data JSONB,
    new_data JSONB,
    changed_by UUID REFERENCES users(id),
    changed_at TIMESTAMPTZ DEFAULT NOW(),
    ip_address INET,
    user_agent TEXT
);

CREATE INDEX idx_audit_log_table_record ON audit_log(table_name, record_id);
CREATE INDEX idx_audit_log_changed_at ON audit_log USING BRIN(changed_at);
```

### 6.4 Multi-tenancy Pattern

```sql
-- Schema separation (mas aislamiento)
CREATE SCHEMA tenant_acme;
CREATE TABLE tenant_acme.products (...);

-- Row-level (mas flexible)
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    UNIQUE(tenant_id, name)
);

-- RLS (Row Level Security)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY tenant_isolation ON products
    USING (tenant_id = current_setting('app.current_tenant')::UUID);
```

---

## 7. Checklist de Validacion DDL

Antes de crear o modificar cualquier tabla, verificar:

### Estructura Basica
- [ ] UUID como PK con `gen_random_uuid()`
- [ ] `created_at TIMESTAMPTZ DEFAULT NOW()`
- [ ] `updated_at TIMESTAMPTZ` con trigger de actualizacion
- [ ] Campos NOT NULL donde corresponde
- [ ] Constraints CHECK para validacion de datos

### Indices
- [ ] Todas las FK tienen indice
- [ ] Columnas de busqueda frecuente indexadas
- [ ] No mas de 7 indices por tabla
- [ ] Indices compuestos ordenados por selectividad

### Integridad
- [ ] FK con ON DELETE/UPDATE definido
- [ ] Constraints UNIQUE donde aplica
- [ ] Constraints CHECK para dominios de valores

### Documentacion
- [ ] COMMENT ON TABLE con descripcion
- [ ] COMMENT ON COLUMN para campos no obvios
- [ ] Denormalizacion documentada con ticket

### Performance
- [ ] Particionamiento evaluado si >100GB proyectado
- [ ] BRIN considerado para tablas de logs
- [ ] Indices parciales para consultas frecuentes filtradas

---

## Referencias

- [ESTANDAR-CODIGO.md](./ESTANDAR-CODIGO.md) - Estandares de codigo
- [ESTANDAR-NOMENCLATURA.md](./ESTANDAR-NOMENCLATURA.md) - Convenciones de nombres
- [@SIMCO-DDL](../../orchestration/directivas/simco/SIMCO-DDL.md) - Flujo DDL
- [PostgreSQL Documentation](https://www.postgresql.org/docs/current/) - Referencia oficial

## Ver tambien

- [PRINCIPIO-NORMALIZACION-BD](../../orchestration/directivas/principios/PRINCIPIO-NORMALIZACION-BD.md) - Principio de normalizacion de bases de datos (1NF a 5NF)
