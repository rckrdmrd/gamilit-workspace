# FASE 2: Auditoria de Usuarios y Datos Sensibles

**Tarea:** TASK-2026-02-19-ANALISIS-DEPLOY-PROD
**Fecha:** 2026-02-19
**Version:** 1.0.0
**Alcance:** Inventario completo de usuarios, UUIDs, credenciales y datos sensibles en seeds de dev, staging y prod

---

## 1. RESUMEN EJECUTIVO

Se auditaron 10 archivos SQL de seeds de autenticacion y 3 archivos de tenants en 3 ambientes (dev, staging, prod). Se identificaron **7 hallazgos de seguridad** de los cuales **3 son criticos** para produccion.

| Metrica | Valor |
|---------|-------|
| Archivos analizados | 10 auth + 3 tenants + 3 tenants-cleanup + 1 school-assign |
| Usuarios test (predictable UUID) | 3 en TODOS los ambientes |
| Usuarios demo (dev-only) | 4 (dev unicamente) |
| Usuarios reales (PII) | 45 en dev y prod |
| Staging usuario real | 0 (staging NO tiene 02-production-users.sql) |
| Hallazgos criticos | 3 |
| Hallazgos altos | 2 |
| Hallazgos medios | 2 |

---

## 2. MATRIZ DE USUARIOS POR AMBIENTE

### 2.1 Usuarios de Testing (@gamilit.com) -- PRESENTES EN TODOS LOS AMBIENTES

| # | Email | UUID | Password | Rol | Tipo UUID | Archivo |
|---|-------|------|----------|-----|-----------|---------|
| 1 | admin@gamilit.com | `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | `crypt('Test1234', gen_salt('bf',10))` | super_admin | PREDECIBLE | 01-demo-users.sql |
| 2 | teacher@gamilit.com | `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | `crypt('Test1234', gen_salt('bf',10))` | admin_teacher | PREDECIBLE | 01-demo-users.sql |
| 3 | student@gamilit.com | `cccccccc-cccc-cccc-cccc-cccccccccccc` | `crypt('Test1234', gen_salt('bf',10))` | student | PREDECIBLE | 01-demo-users.sql |

**Ambientes donde existe `01-demo-users.sql`:**
- dev: SI (identico)
- prod: SI (identico)
- staging: SI (identico)

**Conteo INSERT confirmado:** 3 usuarios (1 INSERT multi-row con 3 VALUES).

---

### 2.2 Usuarios Demo (@demo.glit.edu.mx) -- SOLO DEV

| # | Email | UUID | Password | Rol | Tipo UUID | Archivo |
|---|-------|------|----------|-----|-----------|---------|
| 1 | estudiante1@demo.glit.edu.mx | `dddddddd-dddd-dddd-dddd-dddddddddddd` | `crypt('Test1234', gen_salt('bf',10))` | student | PREDECIBLE | 01b-demo-students.sql |
| 2 | estudiante2@demo.glit.edu.mx | `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` | `crypt('Test1234', gen_salt('bf',10))` | student | PREDECIBLE | 01b-demo-students.sql |
| 3 | estudiante3@demo.glit.edu.mx | `ffffffff-ffff-ffff-ffff-ffffffffffff` | `crypt('Test1234', gen_salt('bf',10))` | student | PREDECIBLE | 01b-demo-students.sql |
| 4 | instructor@demo.glit.edu.mx | `11111111-2222-3333-4444-555555555555` | `crypt('Test1234', gen_salt('bf',10))` | admin_teacher | PREDECIBLE | 01b-demo-students.sql |

**Existencia de `01b-demo-students.sql` por ambiente:**
- dev: SI
- prod: NO (confirmado - archivo no existe)
- staging: NO (confirmado - archivo no existe)

**Conteo INSERT confirmado:** 4 usuarios (1 INSERT multi-row con 4 VALUES).

---

### 2.3 Usuarios Reales de Produccion -- DEV y PROD (NO staging)

**Archivo:** `02-production-users.sql`
**Existencia por ambiente:**
- dev: SI
- prod: SI (contenido identico byte-a-byte)
- staging: NO (archivo no existe)

**Conteo INSERT confirmado:** 45 usuarios (1 INSERT multi-row con 45 VALUES).

#### Lote 1: 2025-11-18 (13 usuarios con nombres completos)

| # | Email | UUID | Nombre | Tipo UUID |
|---|-------|------|--------|-----------|
| 1 | joseal.guirre34@gmail.com | `b017b792-b327-40dd-aefb-a80312776952` | Jose Aguirre | ORIGINAL-PROD |
| 2 | sergiojimenezesteban63@gmail.com | `06a24962-e83d-4e94-aad7-ff69f20a9119` | Sergio Jimenez | ORIGINAL-PROD |
| 3 | Gomezfornite92@gmail.com | `24e8c563-8854-43d1-b3c9-2f83e91f5a1e` | Hugo Gomez | ORIGINAL-PROD |
| 4 | Aragon494gt54@icloud.com | `bf0d3e34-e077-43d1-9626-292f7fae2bd6` | Hugo Aragon | ORIGINAL-PROD |
| 5 | blu3wt7@gmail.com | `2f5a9846-3393-40b2-9e87-0f29238c383f` | Azul Valentina | ORIGINAL-PROD |
| 6 | ricardolugo786@icloud.com | `5e738038-1743-4aa9-b222-30171300ea9d` | Ricardo Lugo | ORIGINAL-PROD |
| 7 | marbancarlos916@gmail.com | `00c742d9-e5f7-4666-9597-5a8ca54d5478` | Carlos Marban | ORIGINAL-PROD |
| 8 | diego.colores09@gmail.com | `33306a65-a3b1-41d5-a49d-47989957b822` | Diego Colores | ORIGINAL-PROD |
| 9 | hernandezfonsecabenjamin7@gmail.com | `7a6a973e-83f7-4374-a9fc-54258138115f` | Benjamin Hernandez | ORIGINAL-PROD |
| 10 | jr7794315@gmail.com | `ccd7135c-0fea-4488-9094-9da52df1c98c` | Josue Reyes | ORIGINAL-PROD |
| 11 | barraganfer03@gmail.com | `9951ad75-e9cb-47b3-b478-6bb860ee2530` | Fernando Barragan | ORIGINAL-PROD |
| 12 | roman.rebollar.marcoantonio1008@gmail.com | `735235f5-260a-4c9b-913c-14a1efd083ea` | Marco Antonio Roman | ORIGINAL-PROD |
| 13 | rodrigoguerrero0914@gmail.com | `ebe48628-5e44-4562-97b7-b4950b216247` | Rodrigo Guerrero | ORIGINAL-PROD |

#### Lote 2: 2025-11-24 (23 usuarios, nombres vacios)

| # | Email | UUID | Nombre | Tipo UUID |
|---|-------|------|--------|-----------|
| 14 | santiagoferrara78@gmail.com | `d089b1af-462f-4d2c-b0f5-d2528cec8506` | (vacio) | ORIGINAL-PROD |
| 15 | alexanserrv917@gmail.com | `b1cadf36-1f07-46b2-b63d-da72d9b54dc6` | (vacio) | ORIGINAL-PROD |
| 16 | aarizmendi434@gmail.com | `af4d8788-f8a8-4971-bb0d-2f48c150dfc2` | (vacio) | ORIGINAL-PROD |
| 17 | ashernarcisobenitezpalomino@gmail.com | `26fbc469-10af-4fa3-bd65-e5498188cc4f` | (vacio) | ORIGINAL-PROD |
| 18 | ra.alejandrobm@gmail.com | `74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8` | (vacio) | ORIGINAL-PROD |
| 19 | abdallahxelhaneriavega@gmail.com | `f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1` | (vacio) | ORIGINAL-PROD |
| 20 | 09enriquecampos@gmail.com | `012adac4-8ffd-47bd-9248-f0c5851e981f` | (vacio) | ORIGINAL-PROD |
| 21 | johhkk22@gmail.com | `126b9257-7b0a-4bd6-9ab3-c505ee00e10a` | (vacio) | ORIGINAL-PROD |
| 22 | edangiel4532@gmail.com | `9ac1746e-94a6-4efc-a961-951c015d416e` | (vacio) | ORIGINAL-PROD |
| 23 | erickfranco462@gmail.com | `2d9f05d4-44dd-42cd-97aa-d57bd06fecd0` | (vacio) | ORIGINAL-PROD |
| 24 | gallinainsana@gmail.com | `aff5dcc6-32de-4769-9aaf-eda751fa0866` | (vacio) | ORIGINAL-PROD |
| 25 | leile5257@gmail.com | `0cda1645-83c5-445b-80b7-d0e4d436c00c` | (vacio) | ORIGINAL-PROD |
| 26 | maximiliano.mejia367@gmail.com | `1364c463-88de-479b-a883-c0b7b362bcf8` | (vacio) | ORIGINAL-PROD |
| 27 | fl432025@gmail.com | `547eb778-4782-4681-b198-c731bba36147` | (vacio) | ORIGINAL-PROD |
| 28 | 7341023901m@gmail.com | `5fc06693-e408-4eab-a9a3-fcd5f4e01296` | (vacio) | ORIGINAL-PROD |
| 29 | segurauriel235@gmail.com | `5d1839f6-b03f-4e12-b236-eca43f4674f2` | (vacio) | ORIGINAL-PROD |
| 30 | angelrabano11@gmail.com | `1b310708-6f24-4c6a-88c9-a11f7a7f9763` | (vacio) | ORIGINAL-PROD |
| 31 | daliaayalareyes35@gmail.com | `3c613b0e-66f9-4640-a599-c9426d8edffb` | (vacio) | ORIGINAL-PROD |
| 32 | alexeimongam@gmail.com | `7ded133e-9b13-4467-9803-edb813f6a9a1` | (vacio) | ORIGINAL-PROD |
| 33 | davidocampovenegas@gmail.com | `4cc04f54-7771-462d-98aa-a94448bb6ff5` | (vacio) | ORIGINAL-PROD |
| 34 | zaid080809@gmail.com | `fbbe7d19-048c-45e4-8a9c-cf86d2098c35` | (vacio) | ORIGINAL-PROD |
| 35 | ruizcruzabrahamfrancisco@gmail.com | `5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4` | (vacio) | ORIGINAL-PROD |
| 36 | vituschinchilla@gmail.com | `615adf6e-dbf3-480f-a907-3cfb3a64c6d2` | (vacio) | ORIGINAL-PROD |

#### Lote 3: 2025-11-25 (7 usuarios, nombres vacios)

| # | Email | UUID | Nombre | Tipo UUID |
|---|-------|------|--------|-----------|
| 37 | bryan@betanzos.com | `bf445960-4c1f-4e29-8fb7-31667b183d7e` | (vacio) | ORIGINAL-PROD |
| 38 | loganalexander816@gmail.com | `d5fa4905-a78a-4040-8ad8-23220881c6a6` | (vacio) | ORIGINAL-PROD |
| 39 | carlois1974@gmail.com | `71734c15-cdaa-431b-90f5-97a57e0316a8` | (vacio) | ORIGINAL-PROD |
| 40 | enriquecuevascbtis136@gmail.com | `1efe491d-98ef-4c02-acd1-3135f7289072` | (vacio) | ORIGINAL-PROD |
| 41 | omarcitogonzalezzavaleta@gmail.com | `5ae21325-7450-4c37-82f1-3f9bcd7b6f45` | (vacio) | ORIGINAL-PROD |
| 42 | gustavobm2024cbtis@gmail.com | `a4d27774-8a51-4660-ad2f-81d0dfd3a5a7` | (vacio) | ORIGINAL-PROD |
| 43 | marianaxsotoxt22@gmail.com | `6e30164a-78b0-49b0-bd21-23d7c6c03349` | (vacio) | ORIGINAL-PROD |

#### Lote 4: 2025-12 (2 usuarios con nombres parciales)

| # | Email | UUID | Nombre | Tipo UUID |
|---|-------|------|--------|-----------|
| 44 | javiermar06@hotmail.com | `69681b09-5077-4f77-84cc-67606abd9755` | Javier Mar | ORIGINAL-PROD |
| 45 | ju188an@gmail.com | `f929d6df-8c29-461f-88f5-264facd879e9` | Juan pa | ORIGINAL-PROD |

---

## 3. CONTEO TOTAL POR AMBIENTE

| Ambiente | 01-demo-users | 01b-demo-students | 02-production-users | Total Usuarios |
|----------|:-------------:|:------------------:|:-------------------:|:--------------:|
| **dev** | 3 | 4 | 45 | **52** |
| **staging** | 3 | 0 | 0 | **3** |
| **prod** | 3 | 0 | 45 | **48** |

### Distribucion por Rol

| Rol | dev | staging | prod |
|-----|:---:|:-------:|:----:|
| super_admin | 1 | 1 | 1 |
| admin_teacher | 2 (1 test + 1 demo) | 1 | 1 |
| student | 49 (2 test + 3 demo + 44 real + 1 real con sign-in) | 1 | 46 (1 test + 45 real) |
| **TOTAL** | **52** | **3** | **48** |

---

## 4. ANALISIS DE PASSWORDS

### 4.1 Metodo de Hash por Tipo de Usuario

| Tipo | Metodo | Password Plaintext en SQL | Password en BD |
|------|--------|--------------------------|----------------|
| Testing (@gamilit.com) | `crypt('Test1234', gen_salt('bf',10))` | SI - visible en SQL como literal `'Test1234'` | bcrypt hash (generado at INSERT time) |
| Demo (@demo.glit.edu.mx) | `crypt('Test1234', gen_salt('bf',10))` | SI - visible en SQL como literal `'Test1234'` | bcrypt hash (generado at INSERT time) |
| Produccion (reales) | Hash pre-generado `$2b$10$...` | NO - solo hash almacenado | bcrypt hash original del servidor |

### 4.2 Evaluacion de Fortaleza

- **"Test1234"** -- Password de 8 caracteres, 1 mayuscula, 1 numero. Cumple el minimo basico pero es trivialmente adivinable. Es un password de testing bien conocido.
- **Hashes de produccion** -- Son bcrypt cost 10 (`$2b$10$`), que es el estandar de la industria. Los passwords originales de los usuarios reales no son visibles en el seed.

---

## 5. ANALISIS DE UUIDs

### 5.1 UUIDs Predecibles (Peligro de Seguridad)

| UUID | Tipo | Usado en | Riesgo |
|------|------|----------|--------|
| `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` | admin super_admin | dev, staging, **PROD** | **CRITICO** -- adivinable, con privilegios maximos |
| `bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb` | teacher | dev, staging, **PROD** | ALTO -- adivinable |
| `cccccccc-cccc-cccc-cccc-cccccccccccc` | student | dev, staging, **PROD** | MEDIO -- adivinable |
| `dddddddd-dddd-dddd-dddd-dddddddddddd` | demo student | solo dev | BAJO -- no en prod |
| `eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee` | demo student | solo dev | BAJO |
| `ffffffff-ffff-ffff-ffff-ffffffffffff` | demo student | solo dev | BAJO |
| `11111111-2222-3333-4444-555555555555` | demo teacher | solo dev | BAJO |
| `00000000-0000-0000-0000-000000000000` | instance_id | TODOS los usuarios | BAJO -- es un placeholder valido |

### 5.2 UUIDs de Produccion

Los 45 usuarios reales tienen UUIDs generados por PostgreSQL `gen_random_uuid()` o equivalente. Son criptograficamente aleatorios y seguros.

---

## 6. DATOS DE TENANT

### 6.1 Tenant Principal (Identico en los 3 ambientes)

| Campo | Valor |
|-------|-------|
| UUID | `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| Nombre | GAMILIT Platform |
| Slug | gamilit-platform |
| Dominio | platform.gamilit.com |
| Tier | enterprise |
| Max Users | 10,000 |
| Max Storage | 1,000 GB |
| Es el UNICO tenant | SI (cleanup elimina personales) |

**Hallazgo:** El UUID del tenant (`a0eebc99-...`) es el mismo en dev, staging y prod. Esto es intencional (100+ seeds lo referencian), pero crea una dependencia fuerte. Cambiar este UUID en produccion requeriria actualizar todas las referencias.

### 6.2 Escuela Default

Codigo: `GAMILIT-DEFAULT` (seed `08-assign-admin-schools.sql` en dev y prod).
Todos los usuarios sin escuela se asignan automaticamente a esta escuela.

---

## 7. HALLAZGOS DE SEGURIDAD

### H-SEC-01: Usuario super_admin con UUID Predecible en Produccion [CRITICO]

**Archivo:** `apps/database/seeds/prod/auth/01-demo-users.sql`
**Riesgo:** CRITICO
**Descripcion:** El usuario `admin@gamilit.com` tiene el UUID `aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa` y rol `super_admin`. Este UUID es trivialmente adivinable. Cualquier endpoint que acepte un user_id como parametro permitiria a un atacante dirigir acciones contra la cuenta de administrador conociendo su UUID sin necesidad de enumeracion.
**Impacto:** Escalacion de privilegios, impersonacion de admin, manipulacion de datos del tenant.
**Recomendacion:**
1. En produccion, reemplazar los 3 UUIDs predecibles por UUIDs aleatorios generados con `gen_random_uuid()`.
2. Actualizar toda referencia hardcoded a estos UUIDs en seeds que los referencien.
3. Alternativamente, eliminar estos 3 usuarios de testing del seed de produccion y crearlos solo via proceso de registro real con password fuerte.

---

### H-SEC-02: Password "Test1234" para Super Admin en Produccion [CRITICO]

**Archivo:** `apps/database/seeds/prod/auth/01-demo-users.sql`
**Riesgo:** CRITICO
**Descripcion:** El password `Test1234` se usa para las 3 cuentas de testing incluyendo el super_admin en produccion. Este password esta documentado en texto plano en el SQL (incluyendo en comentarios y en RAISE NOTICE del verification block). Si un atacante accede al repositorio o a los logs del seed, tiene acceso completo al admin.
**Impacto:** Acceso total al sistema con privilegios super_admin.
**Recomendacion:**
1. Cambiar inmediatamente el password del admin en la BD de produccion (via UPDATE directo).
2. En el seed de prod, usar `gen_random_uuid()` para el UUID y un password fuerte generado por `gen_random_bytes()` o equivalente.
3. Eliminar las lineas de RAISE NOTICE que imprimen credenciales en claro.

---

### H-SEC-03: Datos PII Reales en Ambiente de Desarrollo [CRITICO]

**Archivo:** `apps/database/seeds/dev/auth/02-production-users.sql`
**Riesgo:** CRITICO
**Descripcion:** El archivo `02-production-users.sql` en el ambiente de desarrollo contiene datos personales reales de 45 estudiantes:
- 45 direcciones de email reales (Gmail, iCloud, Hotmail, dominio personal)
- 15 nombres completos reales
- 45 hashes bcrypt de passwords reales
- 45 UUIDs originales del servidor de produccion
- Timestamps de registro y ultimo login

Estos son datos de menores de edad (estudiantes de preparatoria CBTis 136 segun emails como `enriquecuevascbtis136@gmail.com`, `gustavobm2024cbtis@gmail.com`).

**Impacto:** Violacion de privacidad de datos de menores. Exposicion de PII en repositorio de codigo. Violacion potencial de regulaciones de proteccion de datos (LFPDPPP en Mexico).
**Recomendacion:**
1. ELIMINAR `02-production-users.sql` del directorio `seeds/dev/`.
2. Para dev, crear un seed con datos ficticios (faker) que imiten la estructura pero sin datos reales.
3. Asegurar que los hashes de password de produccion nunca esten en el repositorio de codigo.
4. Considerar si los datos de produccion en `seeds/prod/` deberian estar en el repositorio o manejarse via backup/restore externo.

---

### H-SEC-04: Hashes de Password de Produccion en Repositorio Git [ALTO]

**Archivo:** `apps/database/seeds/dev/auth/02-production-users.sql` y `apps/database/seeds/prod/auth/02-production-users.sql`
**Riesgo:** ALTO
**Descripcion:** Los 45 hashes bcrypt de passwords reales de produccion estan almacenados en archivos SQL committeados al repositorio Git. Aunque bcrypt cost 10 es resistente a fuerza bruta, los passwords de estudiantes de preparatoria tienden a ser debiles (patrones comunes, nombres, fechas).
**Impacto:** Un atacante con acceso al repo podria ejecutar ataques de diccionario offline contra los hashes sin limite de rate-limiting del servidor.
**Recomendacion:**
1. No almacenar hashes de password de produccion en archivos de seed.
2. Para recreacion de BD de produccion, usar pg_dump/pg_restore en lugar de seeds SQL.
3. Si seeds son necesarios, usar passwords temporales y forzar cambio al primer login.

---

### H-SEC-05: Archivo Identico dev/prod para 02-production-users.sql [ALTO]

**Archivo:** `apps/database/seeds/dev/auth/02-production-users.sql` vs `apps/database/seeds/prod/auth/02-production-users.sql`
**Riesgo:** ALTO
**Descripcion:** Ambos archivos son identicos (mismos 45 usuarios, mismos UUIDs, mismos hashes). No existe segregacion entre datos de desarrollo y datos de produccion.
**Impacto:**
- Un desarrollador en ambiente local trabaja con datos reales de produccion.
- El ON CONFLICT en dev usa `ON CONFLICT (id)` que sobreescribe datos -- un dev podria corromper datos sin saberlo.
- No hay forma de probar con volumenes diferentes sin afectar datos reales.
**Recomendacion:**
1. El seed de dev deberia usar datos sinteticos (faker).
2. El seed de prod deberia eliminarse del repositorio y manejarse via backup/restore.
3. Minimo, agregar un gate que impida ejecutar seeds de prod en dev y viceversa.

---

### H-SEC-06: Credenciales de Testing Documentadas en SQL Comments [MEDIO]

**Archivos:** Todos los `01-demo-users.sql`
**Riesgo:** MEDIO
**Descripcion:** Las credenciales `admin@gamilit.com / Test1234`, `teacher@gamilit.com / Test1234`, `student@gamilit.com / Test1234` estan documentadas en:
- Header comments del archivo SQL (lineas 12-14)
- Bloque DO $$ de verificacion via RAISE NOTICE (lineas 185-188)
- Seccion "Testing Info" con ejemplo curl completo (lineas 200-205)

Esto es aceptable para dev pero inaceptable para prod.
**Recomendacion:**
1. En el seed de prod, eliminar todas las lineas que documenten passwords en texto plano.
2. Usar variables de entorno o archivos separados (no committeados) para credenciales de admin.

---

### H-SEC-07: Staging Incompleto -- Solo 3 Usuarios de Testing [MEDIO]

**Archivo:** `apps/database/seeds/staging/auth/` (solo contiene `01-demo-users.sql`)
**Riesgo:** MEDIO
**Descripcion:** El ambiente de staging solo tiene 3 usuarios de testing. No tiene `02-production-users.sql` ni `01b-demo-students.sql`. Esto significa que staging no puede simular condiciones de produccion con volumen real.
**Impacto:** Testing en staging no es representativo. Bugs que aparecen con 48+ usuarios no se detectaran.
**Recomendacion:**
1. Crear un seed de staging con datos sinteticos (50-100 usuarios ficticios) para simular volumen de produccion.
2. No copiar datos reales a staging.

---

## 8. MATRIZ RESUMEN DE RIESGO

| ID | Titulo | Severidad | Ambiente | Accion Requerida |
|----|--------|-----------|----------|------------------|
| H-SEC-01 | Super admin UUID predecible en prod | **CRITICO** | PROD | Reemplazar UUID por aleatorio |
| H-SEC-02 | Password "Test1234" para admin en prod | **CRITICO** | PROD | Cambiar password inmediatamente |
| H-SEC-03 | PII de menores en ambiente dev | **CRITICO** | DEV | Eliminar datos reales, usar faker |
| H-SEC-04 | Hashes de password en repositorio | ALTO | DEV+PROD | Mover a backup externo |
| H-SEC-05 | Sin segregacion dev/prod en seeds | ALTO | DEV+PROD | Crear seeds separados por ambiente |
| H-SEC-06 | Credenciales en SQL comments | MEDIO | PROD | Limpiar comments en seed de prod |
| H-SEC-07 | Staging sin datos representativos | MEDIO | STAGING | Crear datos sinteticos |

---

## 9. RECOMENDACIONES DE SEGREGACION

### 9.1 Estructura Propuesta de Seeds por Ambiente

```
seeds/
  dev/auth/
    01-demo-users.sql          -- 3 test users (UUIDs predecibles OK en dev)
    01b-demo-students.sql      -- 4 demo students (OK, solo dev)
    02-synthetic-users.sql     -- [NUEVO] 50+ usuarios FICTICIOS generados con faker
                               -- Emails: usuario1@test.gamilit.dev, etc.
                               -- Nombres: generados, no reales
                               -- Passwords: crypt('DevPass123', ...)
  staging/auth/
    01-demo-users.sql          -- 3 test users (pueden mantener UUIDs predecibles)
    02-synthetic-users.sql     -- [NUEVO] 100 usuarios sinteticos para QA
  prod/auth/
    01-admin-user.sql          -- [NUEVO] Solo 1 super_admin
                               -- UUID: gen_random_uuid()
                               -- Password: fuerte, NO en comments
                               -- Email: admin@gamilit.com o email real del admin
    -- SIN 02-production-users.sql (usuarios via registro normal o pg_restore)
```

### 9.2 Acciones Inmediatas (Pre-Deploy)

1. **HOY:** Cambiar password de `admin@gamilit.com` en BD de produccion via SQL directo.
2. **HOY:** Verificar que `01b-demo-students.sql` no se ejecute en prod (confirmado: no existe, OK).
3. **ESTA SEMANA:** Crear `02-synthetic-users.sql` para dev con datos ficticios.
4. **ESTA SEMANA:** Eliminar `02-production-users.sql` de `seeds/dev/`.
5. **PROXIMO SPRINT:** Evaluar si `02-production-users.sql` en `seeds/prod/` es necesario o puede reemplazarse por pg_dump.

### 9.3 Acciones de Hardening (Post-Deploy)

1. Generar UUIDs aleatorios para cuentas de testing en prod.
2. Implementar politica de passwords: minimo 12 caracteres para roles admin.
3. Agregar rotacion forzada de passwords para super_admin.
4. Considerar `.gitignore` para `seeds/prod/auth/02-*` si se decide mantener seeds de produccion.
5. Audit trail: registrar quien ejecuta seeds en produccion.

---

## 10. ARCHIVOS AUDITADOS

| Ruta Absoluta | Existe | Usuarios |
|---------------|--------|----------|
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\dev\auth\01-demo-users.sql` | SI | 3 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\dev\auth\01b-demo-students.sql` | SI | 4 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\dev\auth\02-production-users.sql` | SI | 45 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\prod\auth\01-demo-users.sql` | SI | 3 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\prod\auth\02-production-users.sql` | SI | 45 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\staging\auth\01-demo-users.sql` | SI | 3 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\staging\auth\02-production-users.sql` | **NO** | 0 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\prod\auth\01b-demo-students.sql` | **NO** | 0 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\staging\auth\01b-demo-students.sql` | **NO** | 0 |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\dev\auth_management\01-tenants.sql` | SI | (tenant) |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\prod\auth_management\01-tenants.sql` | SI | (tenant) |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\staging\auth_management\01-tenants.sql` | SI | (tenant) |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\dev\auth_management\02-tenants-production.sql` | SI | (cleanup) |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\prod\auth_management\02-tenants-production.sql` | SI | (cleanup) |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\dev\auth_management\08-assign-admin-schools.sql` | SI | (school assign) |
| `C:\Empresas\ISEM\gamilit-workspace\apps\database\seeds\prod\auth_management\08-assign-admin-schools.sql` | SI | (school assign) |

---

*Fin del analisis FASE2-USUARIOS -- 2026-02-19*
