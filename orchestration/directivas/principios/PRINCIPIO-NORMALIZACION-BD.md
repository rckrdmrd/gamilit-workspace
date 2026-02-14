# PRINCIPIO-NORMALIZACION-BD

```yaml
metadata:
  version: "1.0.0"
  created: "2026-02-02"
  category: principios
  scope: database-design
  applies_to:
    - all_projects
    - ddl_design
    - database_refactoring
  related_docs:
    - "@SIMCO-DDL-UNIFIED"
    - "@TRIGGER-DDL-WSL"
    - "@ADRS"
  priority: HIGH
```

---

## 1. ¿Qué es Normalización?

### Definición

La **normalización** es un proceso sistemático de organización de datos en una base de datos relacional que busca estructurar las tablas de manera óptima, reduciendo la redundancia y estableciendo dependencias lógicas entre los datos.

### Objetivos Fundamentales

| Objetivo | Descripción | Beneficio |
|----------|-------------|-----------|
| **Eliminar Redundancia** | Evitar almacenar el mismo dato en múltiples lugares | Menor espacio, datos consistentes |
| **Evitar Anomalías de Inserción** | Poder insertar datos sin requerir información no relacionada | Flexibilidad operativa |
| **Evitar Anomalías de Actualización** | Modificar un dato en un solo lugar | Integridad garantizada |
| **Evitar Anomalías de Eliminación** | Eliminar registros sin perder datos no relacionados | Preservación de información |

### Principio Base

```
CADA TABLA DEBE REPRESENTAR UNA ÚNICA ENTIDAD O RELACIÓN
CADA COLUMNA DEBE DEPENDER ÚNICAMENTE DE LA CLAVE PRIMARIA COMPLETA
```

---

## 2. Primera Forma Normal (1NF)

### Reglas

1. **Valores Atómicos**: Cada celda contiene un único valor indivisible
2. **Sin Grupos Repetitivos**: No hay columnas que representen listas o arrays
3. **Clave Primaria Definida**: Existe un identificador único para cada fila
4. **Orden Irrelevante**: El orden de filas y columnas no afecta la semántica

### Ejemplo de Violación - Arrays en Columnas

```sql
-- VIOLACIÓN 1NF: productos almacenados como array/lista
CREATE TABLE pedidos_mal (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL,
    fecha DATE NOT NULL,
    productos TEXT,  -- "Laptop, Mouse, Teclado" ❌
    cantidades TEXT  -- "1, 2, 1" ❌
);

-- Problemas:
-- 1. No se puede indexar productos individuales
-- 2. Consultas complejas para buscar un producto específico
-- 3. Difícil mantener integridad referencial
-- 4. Cantidades desacopladas de productos
```

### Corrección - Tabla Relacionada

```sql
-- CORRECCIÓN 1NF: tabla normalizada con relación
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12,2) NOT NULL,
    UNIQUE(pedido_id, producto_id)  -- Un producto por línea por pedido
);

-- Beneficios:
-- ✓ Cada valor es atómico
-- ✓ Se puede indexar por producto_id
-- ✓ Integridad referencial garantizada
-- ✓ Consultas simples y eficientes
```

### Otro Ejemplo Común - Teléfonos Múltiples

```sql
-- VIOLACIÓN 1NF
CREATE TABLE contactos_mal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    telefono1 VARCHAR(20),  -- ❌ Grupo repetitivo
    telefono2 VARCHAR(20),  -- ❌
    telefono3 VARCHAR(20)   -- ❌
);

-- CORRECCIÓN 1NF
CREATE TABLE contactos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE contacto_telefonos (
    id SERIAL PRIMARY KEY,
    contacto_id INTEGER NOT NULL REFERENCES contactos(id) ON DELETE CASCADE,
    tipo VARCHAR(20) NOT NULL CHECK (tipo IN ('movil', 'casa', 'trabajo', 'otro')),
    numero VARCHAR(20) NOT NULL,
    es_principal BOOLEAN DEFAULT FALSE
);
```

---

## 3. Segunda Forma Normal (2NF)

### Reglas

1. **Cumple 1NF**: Todos los requisitos de primera forma normal
2. **Sin Dependencias Parciales**: Cada atributo no-clave depende de **toda** la clave primaria, no solo de una parte

> **Nota**: 2NF solo aplica a tablas con clave primaria compuesta. Las tablas con PK simple que cumplen 1NF automáticamente cumplen 2NF.

### Ejemplo de Violación - Dependencia Parcial

```sql
-- VIOLACIÓN 2NF: nombre_producto depende solo de producto_id, no de pedido_id
CREATE TABLE pedido_productos_mal (
    pedido_id INTEGER NOT NULL,
    producto_id INTEGER NOT NULL,
    cantidad INTEGER NOT NULL,
    nombre_producto VARCHAR(100),  -- ❌ Depende solo de producto_id
    precio_producto DECIMAL(10,2), -- ❌ Depende solo de producto_id
    PRIMARY KEY (pedido_id, producto_id)
);

-- Problemas:
-- 1. Si cambia el nombre del producto, hay que actualizar N filas
-- 2. Redundancia: mismo nombre repetido en cada pedido
-- 3. Riesgo de inconsistencia entre filas
```

### Corrección - Separar Dependencias

```sql
-- CORRECCIÓN 2NF: cada atributo depende de su clave completa
CREATE TABLE productos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    precio DECIMAL(12,2) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE pedido_productos (
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12,2) NOT NULL,  -- Precio al momento de la compra
    PRIMARY KEY (pedido_id, producto_id)
);

-- Nota: precio_unitario se guarda aquí porque representa el precio
-- histórico al momento de la transacción, no el precio actual del producto.
-- Esta es una denormalización justificada para auditoría.
```

### Ejemplo Adicional - Inscripciones

```sql
-- VIOLACIÓN 2NF
CREATE TABLE inscripciones_mal (
    estudiante_id INTEGER,
    curso_id INTEGER,
    fecha_inscripcion DATE,
    nombre_estudiante VARCHAR(100),  -- ❌ Depende solo de estudiante_id
    email_estudiante VARCHAR(100),   -- ❌ Depende solo de estudiante_id
    nombre_curso VARCHAR(100),       -- ❌ Depende solo de curso_id
    PRIMARY KEY (estudiante_id, curso_id)
);

-- CORRECCIÓN 2NF
CREATE TABLE estudiantes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    creditos INTEGER DEFAULT 3
);

CREATE TABLE inscripciones (
    estudiante_id INTEGER REFERENCES estudiantes(id),
    curso_id INTEGER REFERENCES cursos(id),
    fecha_inscripcion DATE NOT NULL DEFAULT CURRENT_DATE,
    calificacion DECIMAL(4,2),
    PRIMARY KEY (estudiante_id, curso_id)
);
```

---

## 4. Tercera Forma Normal (3NF)

### Reglas

1. **Cumple 2NF**: Todos los requisitos de segunda forma normal
2. **Sin Dependencias Transitivas**: Ningún atributo no-clave depende de otro atributo no-clave

> **Definición Formal**: Un atributo A depende transitivamente de la PK si existe un atributo B tal que PK → B → A

### Ejemplo Clásico - Código Postal y Ciudad

```sql
-- VIOLACIÓN 3NF: ciudad depende de codigo_postal, no directamente de id
CREATE TABLE clientes_mal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    codigo_postal VARCHAR(10),
    ciudad VARCHAR(100),        -- ❌ Depende de codigo_postal
    estado VARCHAR(100),        -- ❌ Depende de codigo_postal
    pais VARCHAR(100)           -- ❌ Depende de codigo_postal
);

-- Dependencia transitiva:
-- id → codigo_postal → ciudad
-- id → codigo_postal → estado
-- id → codigo_postal → pais

-- Problemas:
-- 1. Si se corrige el nombre de una ciudad, actualizar miles de registros
-- 2. Diferentes escrituras: "Cd. de México" vs "Ciudad de México"
-- 3. Espacio desperdiciado repitiendo datos geográficos
```

### Corrección - Tabla Lookup de Códigos Postales

```sql
-- CORRECCIÓN 3NF: tabla de lookup para datos geográficos
CREATE TABLE paises (
    id SERIAL PRIMARY KEY,
    codigo CHAR(2) NOT NULL UNIQUE,  -- ISO 3166-1 alpha-2
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE estados (
    id SERIAL PRIMARY KEY,
    pais_id INTEGER NOT NULL REFERENCES paises(id),
    codigo VARCHAR(10) NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    UNIQUE(pais_id, codigo)
);

CREATE TABLE codigos_postales (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(10) NOT NULL,
    ciudad VARCHAR(100) NOT NULL,
    estado_id INTEGER NOT NULL REFERENCES estados(id),
    latitud DECIMAL(10,8),
    longitud DECIMAL(11,8),
    UNIQUE(codigo, estado_id)
);

CREATE TABLE clientes (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    direccion VARCHAR(200),
    codigo_postal_id INTEGER REFERENCES codigos_postales(id),
    direccion_detalle VARCHAR(200)  -- Número, interior, etc.
);

-- Consulta para obtener dirección completa:
SELECT
    c.nombre,
    c.direccion,
    cp.codigo AS codigo_postal,
    cp.ciudad,
    e.nombre AS estado,
    p.nombre AS pais
FROM clientes c
LEFT JOIN codigos_postales cp ON c.codigo_postal_id = cp.id
LEFT JOIN estados e ON cp.estado_id = e.id
LEFT JOIN paises p ON e.pais_id = p.id;
```

### Otro Ejemplo - Empleados y Departamentos

```sql
-- VIOLACIÓN 3NF
CREATE TABLE empleados_mal (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100),
    departamento_id INTEGER,
    departamento_nombre VARCHAR(100),  -- ❌ Depende de departamento_id
    departamento_ubicacion VARCHAR(100) -- ❌ Depende de departamento_id
);

-- CORRECCIÓN 3NF
CREATE TABLE departamentos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    ubicacion VARCHAR(100),
    gerente_id INTEGER  -- FK a empleados, se agrega después
);

CREATE TABLE empleados (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    departamento_id INTEGER REFERENCES departamentos(id)
);

-- Agregar FK circular después de crear ambas tablas
ALTER TABLE departamentos
ADD CONSTRAINT fk_gerente
FOREIGN KEY (gerente_id) REFERENCES empleados(id);
```

---

## 5. Forma Normal de Boyce-Codd (BCNF)

### Definición

Una tabla está en BCNF si y solo si:
- Está en 3NF, Y
- **Toda determinante es una clave candidata**

> **Determinante**: Un atributo (o conjunto de atributos) del cual otros atributos dependen funcionalmente.

### Diferencia con 3NF

| Aspecto | 3NF | BCNF |
|---------|-----|------|
| Dependencias | Sin transitivas desde no-clave | Sin dependencias de no-candidatas |
| Determinantes | Pueden existir no-clave | Solo claves candidatas |
| Strictness | Menos estricta | Más estricta |

### Cuándo Aplicar BCNF

- Tablas con múltiples claves candidatas que se superponen
- Sistemas donde la integridad de datos es crítica (finanzas, salud)
- Cuando se detectan anomalías a pesar de cumplir 3NF

### Ejemplo de Violación BCNF

```sql
-- Escenario: Profesores, Cursos y Aulas
-- Restricciones:
-- 1. Cada profesor enseña exactamente un curso
-- 2. Cada curso puede ser enseñado por varios profesores
-- 3. Cada profesor usa exactamente un aula

-- VIOLACIÓN BCNF (cumple 3NF pero no BCNF)
CREATE TABLE asignaciones_mal (
    profesor_id INTEGER,
    curso_id INTEGER,
    aula_id INTEGER,
    PRIMARY KEY (profesor_id, curso_id)
);
-- Problema: profesor_id → aula_id, pero profesor_id NO es clave candidata
-- (la clave es compuesta: profesor_id, curso_id)

-- CORRECCIÓN BCNF: separar la dependencia
CREATE TABLE profesores (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    aula_id INTEGER REFERENCES aulas(id)  -- Dependencia movida aquí
);

CREATE TABLE cursos (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL
);

CREATE TABLE profesor_cursos (
    profesor_id INTEGER REFERENCES profesores(id),
    curso_id INTEGER REFERENCES cursos(id),
    PRIMARY KEY (profesor_id, curso_id)
);

CREATE TABLE aulas (
    id SERIAL PRIMARY KEY,
    edificio VARCHAR(50),
    numero VARCHAR(20),
    capacidad INTEGER
);
```

---

## 6. Denormalización Controlada

### Cuándo es Aceptable

| Escenario | Justificación | Ejemplo |
|-----------|---------------|---------|
| **Performance Crítico** | Joins excesivos en queries frecuentes | Dashboard con 10+ tablas |
| **Lecturas Intensivas** | Ratio lectura/escritura > 100:1 | Catálogo de productos público |
| **Datos Históricos** | Preservar estado al momento de transacción | Precio en factura |
| **Agregaciones Frecuentes** | Cálculos costosos repetitivos | Totales de ventas por día |
| **Cache de Datos Externos** | Reducir latencia de APIs externas | Nombre de usuario de OAuth |

### Documentación Obligatoria (ADR)

Toda denormalización DEBE documentarse en un ADR (Architecture Decision Record):

```markdown
# ADR-XXX: Denormalización de [Tabla/Campo]

## Contexto
[Descripción del problema de performance o requisito]

## Decisión
Se denormaliza [campo] de [tabla_origen] en [tabla_destino].

## Justificación
- Queries afectados: [lista de queries]
- Frecuencia: [N veces por hora/día]
- Mejora esperada: [X ms → Y ms]
- Costo de inconsistencia: [análisis de riesgo]

## Consecuencias
- Positivas: [mejoras de performance]
- Negativas: [riesgos de inconsistencia]
- Mitigación: [estrategia de sincronización]

## Estrategia de Consistencia
[Trigger / Application Logic / Event-driven]
```

### Mantener Consistencia

#### Opción 1: Triggers de Base de Datos

```sql
-- Ejemplo: Mantener total_pedido denormalizado
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER NOT NULL REFERENCES clientes(id),
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    total DECIMAL(12,2) DEFAULT 0  -- Campo denormalizado
);

CREATE TABLE pedido_items (
    id SERIAL PRIMARY KEY,
    pedido_id INTEGER NOT NULL REFERENCES pedidos(id) ON DELETE CASCADE,
    producto_id INTEGER NOT NULL REFERENCES productos(id),
    cantidad INTEGER NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED
);

-- Trigger para mantener consistencia
CREATE OR REPLACE FUNCTION actualizar_total_pedido()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE pedidos
    SET total = (
        SELECT COALESCE(SUM(subtotal), 0)
        FROM pedido_items
        WHERE pedido_id = COALESCE(NEW.pedido_id, OLD.pedido_id)
    )
    WHERE id = COALESCE(NEW.pedido_id, OLD.pedido_id);

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_pedido_items_total
AFTER INSERT OR UPDATE OR DELETE ON pedido_items
FOR EACH ROW EXECUTE FUNCTION actualizar_total_pedido();
```

#### Opción 2: Lógica de Aplicación

```typescript
// En el servicio de aplicación (NestJS ejemplo)
@Injectable()
export class PedidoItemsService {
  async create(createDto: CreatePedidoItemDto): Promise<PedidoItem> {
    return this.dataSource.transaction(async (manager) => {
      // 1. Crear el item
      const item = await manager.save(PedidoItem, createDto);

      // 2. Actualizar el total denormalizado
      await this.actualizarTotalPedido(manager, item.pedidoId);

      return item;
    });
  }

  private async actualizarTotalPedido(
    manager: EntityManager,
    pedidoId: number
  ): Promise<void> {
    const total = await manager
      .createQueryBuilder(PedidoItem, 'pi')
      .select('SUM(pi.cantidad * pi.precioUnitario)', 'total')
      .where('pi.pedidoId = :pedidoId', { pedidoId })
      .getRawOne();

    await manager.update(Pedido, pedidoId, {
      total: total?.total || 0
    });
  }
}
```

#### Opción 3: Vistas Materializadas (Para Reportes)

```sql
-- Vista materializada para reportes de ventas
CREATE MATERIALIZED VIEW mv_ventas_diarias AS
SELECT
    DATE(p.fecha) AS fecha,
    COUNT(DISTINCT p.id) AS num_pedidos,
    COUNT(pi.id) AS num_items,
    SUM(pi.subtotal) AS total_ventas,
    AVG(pi.subtotal) AS ticket_promedio
FROM pedidos p
JOIN pedido_items pi ON p.id = pi.pedido_id
GROUP BY DATE(p.fecha)
WITH DATA;

-- Índice para consultas rápidas
CREATE UNIQUE INDEX idx_mv_ventas_fecha ON mv_ventas_diarias(fecha);

-- Refrescar periódicamente (cron job o scheduled task)
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_ventas_diarias;
```

---

## 7. Checklist de Validación

### Verificación Pre-Commit DDL

```markdown
## Checklist de Normalización

### Primera Forma Normal (1NF)
- [ ] ¿Hay columnas con arrays, JSON arrays, o listas separadas por comas?
  - → **Violación 1NF**: Crear tabla relacionada
- [ ] ¿Hay columnas repetitivas (campo1, campo2, campo3...)?
  - → **Violación 1NF**: Crear tabla de relación
- [ ] ¿Todas las tablas tienen PRIMARY KEY definida?
  - → **Requisito 1NF**: Agregar PK

### Segunda Forma Normal (2NF)
- [ ] ¿Hay tablas con PK compuesta?
  - Si sí: ¿Todos los atributos dependen de TODA la PK?
  - → **Violación 2NF**: Mover a tabla separada los que dependen parcialmente
- [ ] ¿Los nombres/descripciones de entidades relacionadas están duplicados?
  - → **Violación 2NF**: Usar solo FK, no copiar atributos

### Tercera Forma Normal (3NF)
- [ ] ¿Hay columnas que dependen de otras columnas no-clave?
  - → **Violación 3NF**: Crear tabla lookup
- [ ] ¿Datos geográficos (ciudad, estado, país) están junto a código postal?
  - → **Violación 3NF clásica**: Tabla de códigos postales
- [ ] ¿Hay cálculos derivados almacenados (total, promedio)?
  - → Evaluar: ¿Es denormalización justificada? Documentar en ADR

### BCNF (Si Aplica)
- [ ] ¿Hay determinantes que no son claves candidatas?
  - → **Violación BCNF**: Separar en tablas adicionales

### Denormalización
- [ ] ¿Toda denormalización tiene ADR documentado?
- [ ] ¿Existe mecanismo de consistencia (trigger/app logic)?
- [ ] ¿Se justifica por performance medido?
```

### Script de Detección Automática

```sql
-- Detectar posibles violaciones de normalización

-- 1. Columnas que podrían ser arrays (nombres sospechosos)
SELECT
    table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_schema = 'public'
  AND (
    column_name LIKE '%list%' OR
    column_name LIKE '%array%' OR
    column_name LIKE '%items%' OR
    column_name LIKE '%1' OR
    column_name LIKE '%2' OR
    column_name LIKE '%3'
  )
ORDER BY table_name, column_name;

-- 2. Tablas sin PRIMARY KEY
SELECT t.table_name
FROM information_schema.tables t
LEFT JOIN information_schema.table_constraints tc
    ON t.table_name = tc.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
WHERE t.table_schema = 'public'
  AND t.table_type = 'BASE TABLE'
  AND tc.constraint_name IS NULL;

-- 3. Columnas duplicadas entre tablas (posible violación 2NF/3NF)
SELECT
    c1.table_name AS tabla1,
    c2.table_name AS tabla2,
    c1.column_name
FROM information_schema.columns c1
JOIN information_schema.columns c2
    ON c1.column_name = c2.column_name
    AND c1.table_name < c2.table_name
WHERE c1.table_schema = 'public'
  AND c2.table_schema = 'public'
  AND c1.column_name NOT IN ('id', 'created_at', 'updated_at', 'deleted_at', 'is_active')
  AND c1.column_name NOT LIKE '%_id'
ORDER BY c1.column_name;
```

---

## Resumen Visual

```
┌─────────────────────────────────────────────────────────────────┐
│                    FORMAS NORMALES                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1NF: Valores Atómicos + PK Definida                            │
│   └── Sin arrays, sin grupos repetitivos                        │
│                                                                  │
│  2NF: 1NF + Sin Dependencias Parciales                          │
│   └── Cada atributo depende de TODA la PK                       │
│                                                                  │
│  3NF: 2NF + Sin Dependencias Transitivas                        │
│   └── No-clave no depende de no-clave                           │
│                                                                  │
│  BCNF: 3NF + Todo Determinante es Clave Candidata               │
│   └── Más estricto, para casos especiales                       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  DENORMALIZACIÓN: Solo con justificación + ADR + Consistencia   │
└─────────────────────────────────────────────────────────────────┘
```

---

## Referencias

- Codd, E.F. (1970). "A Relational Model of Data for Large Shared Data Banks"
- Date, C.J. "An Introduction to Database Systems"
- PostgreSQL Documentation: Table Design
- `@SIMCO-DDL-UNIFIED` - Estándares DDL del proyecto
- `@ADRS` - Directorio de Architecture Decision Records
