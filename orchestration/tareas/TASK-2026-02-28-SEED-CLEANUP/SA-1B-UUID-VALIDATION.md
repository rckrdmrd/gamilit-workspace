---
title: SA-1B UUID Chain Validation Report
agent: SA-1B
task: TASK-2026-02-28-SEED-CLEANUP
date: 2026-02-28
status: COMPLETE
scope: Research only — no files modified
---

# SA-1B: UUID Chain Validation Report

**Task:** TASK-2026-02-28-SEED-CLEANUP
**Agent:** SA-1B
**Date:** 2026-02-28
**Mode:** ANALYSIS (research only — no files modified)

---

## Executive Summary

| Check | Result | Details |
|-------|--------|---------|
| UUID count in auth seed | PASS | 50 UUIDs extracted from `02-production-users.sql` |
| UUID format validation | PASS | All 50 UUIDs conform to 8-4-4-4-12 hex pattern |
| Profile coverage check | FAIL (DISCREPANCY) | 13 in file 06, 37 in file 07 = 50 total — but file 06 header says "6 usuarios" for LOTE 3 while the actual file has 7 users |
| id = user_id relationship | PASS | All 50 profiles use `id = user_id = auth.users.id` pattern |
| Tenant references | PASS | All 50 profiles reference `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` |
| Duplicate UUIDs | PASS | No duplicate UUIDs found |
| Orphan UUIDs in gamification | PASS | All gamification seeds use dynamic lookups (email-based), no hardcoded production UUIDs |
| Orphan UUIDs in progress | PASS | Progress seeds are empty (intentionally) or use dynamic lookups |
| LOTE 3 count discrepancy | WARNING | Header says "6 usuarios" but 7 users defined (users 37–43) |

**Overall Status:** PASS with 1 WARNING (metadata inconsistency in LOTE 3 comment, not a data integrity issue)

---

## Section 1: All 50 Production User UUIDs

Source file: `apps/database/seeds/dev/auth/02-production-users.sql`

### LOTE 1: 2025-11-18 (13 usuarios)

| # | UUID | Email | Name |
|---|------|-------|------|
| 1 | `b017b792-b327-40dd-aefb-a80312776952` | joseal.guirre34@gmail.com | Jose Aguirre |
| 2 | `06a24962-e83d-4e94-aad7-ff69f20a9119` | sergiojimenezesteban63@gmail.com | Sergio Jimenez |
| 3 | `24e8c563-8854-43d1-b3c9-2f83e91f5a1e` | Gomezfornite92@gmail.com | Hugo Gomez |
| 4 | `bf0d3e34-e077-43d1-9626-292f7fae2bd6` | Aragon494gt54@icloud.com | Hugo Aragón |
| 5 | `2f5a9846-3393-40b2-9e87-0f29238c383f` | blu3wt7@gmail.com | Azul Valentina |
| 6 | `5e738038-1743-4aa9-b222-30171300ea9d` | ricardolugo786@icloud.com | Ricardo Lugo |
| 7 | `00c742d9-e5f7-4666-9597-5a8ca54d5478` | marbancarlos916@gmail.com | Carlos Marban |
| 8 | `33306a65-a3b1-41d5-a49d-47989957b822` | diego.colores09@gmail.com | Diego Colores |
| 9 | `7a6a973e-83f7-4374-a9fc-54258138115f` | hernandezfonsecabenjamin7@gmail.com | Benjamin Hernandez |
| 10 | `ccd7135c-0fea-4488-9094-9da52df1c98c` | jr7794315@gmail.com | Josue Reyes |
| 11 | `9951ad75-e9cb-47b3-b478-6bb860ee2530` | barraganfer03@gmail.com | Fernando Barragan |
| 12 | `735235f5-260a-4c9b-913c-14a1efd083ea` | roman.rebollar.marcoantonio1008@gmail.com | Marco Antonio Roman |
| 13 | `ebe48628-5e44-4562-97b7-b4950b216247` | rodrigoguerrero0914@gmail.com | Rodrigo Guerrero |

### LOTE 2: 2025-11-24 (23 usuarios)

| # | UUID | Email |
|---|------|-------|
| 14 | `d089b1af-462f-4d2c-b0f5-d2528cec8506` | santiagoferrara78@gmail.com |
| 15 | `b1cadf36-1f07-46b2-b63d-da72d9b54dc6` | alexanserrv917@gmail.com |
| 16 | `af4d8788-f8a8-4971-bb0d-2f48c150dfc2` | aarizmendi434@gmail.com |
| 17 | `26fbc469-10af-4fa3-bd65-e5498188cc4f` | ashernarcisobenitezpalomino@gmail.com |
| 18 | `74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8` | ra.alejandrobm@gmail.com |
| 19 | `f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1` | abdallahxelhaneriavega@gmail.com |
| 20 | `012adac4-8ffd-47bd-9248-f0c5851e981f` | 09enriquecampos@gmail.com |
| 21 | `126b9257-7b0a-4bd6-9ab3-c505ee00e10a` | johhkk22@gmail.com |
| 22 | `9ac1746e-94a6-4efc-a961-951c015d416e` | edangiel4532@gmail.com |
| 23 | `2d9f05d4-44dd-42cd-97aa-d57bd06fecd0` | erickfranco462@gmail.com |
| 24 | `aff5dcc6-32de-4769-9aaf-eda751fa0866` | gallinainsana@gmail.com |
| 25 | `0cda1645-83c5-445b-80b7-d0e4d436c00c` | leile5257@gmail.com |
| 26 | `1364c463-88de-479b-a883-c0b7b362bcf8` | maximiliano.mejia367@gmail.com |
| 27 | `547eb778-4782-4681-b198-c731bba36147` | fl432025@gmail.com |
| 28 | `5fc06693-e408-4eab-a9a3-fcd5f4e01296` | 7341023901m@gmail.com |
| 29 | `5d1839f6-b03f-4e12-b236-eca43f4674f2` | segurauriel235@gmail.com |
| 30 | `1b310708-6f24-4c6a-88c9-a11f7a7f9763` | angelrabano11@gmail.com |
| 31 | `3c613b0e-66f9-4640-a599-c9426d8edffb` | daliaayalareyes35@gmail.com |
| 32 | `7ded133e-9b13-4467-9803-edb813f6a9a1` | alexeimongam@gmail.com |
| 33 | `4cc04f54-7771-462d-98aa-a94448bb6ff5` | davidocampovenegas@gmail.com |
| 34 | `fbbe7d19-048c-45e4-8a9c-cf86d2098c35` | zaid080809@gmail.com |
| 35 | `5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4` | ruizcruzabrahamfrancisco@gmail.com |
| 36 | `615adf6e-dbf3-480f-a907-3cfb3a64c6d2` | vituschinchilla@gmail.com |

### LOTE 3: 2025-11-25 (7 usuarios — see WARNING below)

| # | UUID | Email |
|---|------|-------|
| 37 | `bf445960-4c1f-4e29-8fb7-31667b183d7e` | bryan@betanzos.com |
| 38 | `d5fa4905-a78a-4040-8ad8-23220881c6a6` | loganalexander816@gmail.com |
| 39 | `71734c15-cdaa-431b-90f5-97a57e0316a8` | carlois1974@gmail.com |
| 40 | `1efe491d-98ef-4c02-acd1-3135f7289072` | enriquecuevascbtis136@gmail.com |
| 41 | `5ae21325-7450-4c37-82f1-3f9bcd7b6f45` | omarcitogonzalezzavaleta@gmail.com |
| 42 | `a4d27774-8a51-4660-ad2f-81d0dfd3a5a7` | gustavobm2024cbtis@gmail.com |
| 43 | `6e30164a-78b0-49b0-bd21-23d7c6c03349` | marianaxsotoxt22@gmail.com |

### LOTE 4: 2025-12 (2 usuarios)

| # | UUID | Email | Name |
|---|------|-------|------|
| 44 | `69681b09-5077-4f77-84cc-67606abd9755` | javiermar06@hotmail.com | Javier Mar |
| 45 | `f929d6df-8c29-461f-88f5-264facd879e9` | ju188an@gmail.com | Juan pa |

### LOTE 5: 2026-02-20 (5 usuarios)

| # | UUID | Email | Name |
|---|------|-------|------|
| 46 | `fa14c733-d9fa-46e5-86fc-9d852e7f4383` | arizabalo21@hotmail.com | Ana Ofelia Arizabalo |
| 47 | `9f709cba-5f49-4c80-b58d-a424af57ffc6` | dl7231217@gmail.com | Daniela Jaqueline Castilleros Lopez |
| 48 | `e2bb31c0-0949-430e-8dd7-02e8b3ca91c2` | maritzamoralesdeloya@gmail.com | Maritza Morales Deloya |
| 49 | `aadf1eca-7e5c-4767-a3c7-80b47fdee782` | gamam130727@gmail.com | Mauricio Ramirez Gama |
| 50 | `71252b1c-c643-4228-aadc-d8ecaafd9356` | abigailisidro08@gmail.com | Diana Abigail Sotelo Isidro |

**Total: 50 UUIDs confirmed** (13 + 23 + 7 + 2 + 5 = 50)

---

## Section 2: UUID Format Validation

**Pattern checked:** `^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$` (lowercase hex, 8-4-4-4-12)

All 50 UUIDs were inspected manually from the SQL file. Each UUID appears in the form `'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'::uuid` with explicit cast.

| Result | Count |
|--------|-------|
| PASS (valid 8-4-4-4-12 format) | 50 |
| FAIL (malformed) | 0 |

**Verdict: PASS** — All 50 UUIDs conform to the standard UUID v4 8-4-4-4-12 hexadecimal format.

Notable observations:
- UUID #20 (`012adac4-8ffd-47bd-9248-f0c5851e981f`) starts with `012a` — leading zeros in first segment are valid.
- UUID #44 (`69681b09-5077-4f77-84cc-67606abd9755`) and #50 (`71252b1c-c643-4228-aadc-d8ecaafd9356`) both valid.
- No uppercase letters detected in any UUID.

---

## Section 3: Profile Coverage Check

**Expected:** 13 profiles in `06-profiles-production.sql` + 37 profiles in `07-profiles-production-additional.sql` = 50 total

### File 06: `auth_management/06-profiles-production.sql`

Contains 13 profiles — corresponding to LOTE 1 users (1–13, all with named first/last data).

| Profile # | UUID | Email | Covered |
|-----------|------|-------|---------|
| 1 | `b017b792-b327-40dd-aefb-a80312776952` | joseal.guirre34@gmail.com | YES |
| 2 | `06a24962-e83d-4e94-aad7-ff69f20a9119` | sergiojimenezesteban63@gmail.com | YES |
| 3 | `24e8c563-8854-43d1-b3c9-2f83e91f5a1e` | Gomezfornite92@gmail.com | YES |
| 4 | `bf0d3e34-e077-43d1-9626-292f7fae2bd6` | Aragon494gt54@icloud.com | YES |
| 5 | `2f5a9846-3393-40b2-9e87-0f29238c383f` | blu3wt7@gmail.com | YES |
| 6 | `5e738038-1743-4aa9-b222-30171300ea9d` | ricardolugo786@icloud.com | YES |
| 7 | `00c742d9-e5f7-4666-9597-5a8ca54d5478` | marbancarlos916@gmail.com | YES |
| 8 | `33306a65-a3b1-41d5-a49d-47989957b822` | diego.colores09@gmail.com | YES |
| 9 | `7a6a973e-83f7-4374-a9fc-54258138115f` | hernandezfonsecabenjamin7@gmail.com | YES |
| 10 | `ccd7135c-0fea-4488-9094-9da52df1c98c` | jr7794315@gmail.com | YES |
| 11 | `9951ad75-e9cb-47b3-b478-6bb860ee2530` | barraganfer03@gmail.com | YES |
| 12 | `735235f5-260a-4c9b-913c-14a1efd083ea` | roman.rebollar.marcoantonio1008@gmail.com | YES |
| 13 | `ebe48628-5e44-4562-97b7-b4950b216247` | rodrigoguerrero0914@gmail.com | YES |

**File 06 count: 13 profiles — PASS**

### File 07: `auth_management/07-profiles-production-additional.sql`

Contains 37 profiles — covering users 14–50 (LOTE 2 through LOTE 5).

| Profile # | UUID | Email | Covered |
|-----------|------|-------|---------|
| 1 (user 14) | `d089b1af-462f-4d2c-b0f5-d2528cec8506` | santiagoferrara78@gmail.com | YES |
| 2 (user 15) | `b1cadf36-1f07-46b2-b63d-da72d9b54dc6` | alexanserrv917@gmail.com | YES |
| 3 (user 16) | `af4d8788-f8a8-4971-bb0d-2f48c150dfc2` | aarizmendi434@gmail.com | YES |
| 4 (user 17) | `26fbc469-10af-4fa3-bd65-e5498188cc4f` | ashernarcisobenitezpalomino@gmail.com | YES |
| 5 (user 18) | `74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8` | ra.alejandrobm@gmail.com | YES |
| 6 (user 19) | `f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1` | abdallahxelhaneriavega@gmail.com | YES |
| 7 (user 20) | `012adac4-8ffd-47bd-9248-f0c5851e981f` | 09enriquecampos@gmail.com | YES |
| 8 (user 21) | `126b9257-7b0a-4bd6-9ab3-c505ee00e10a` | johhkk22@gmail.com | YES |
| 9 (user 22) | `9ac1746e-94a6-4efc-a961-951c015d416e` | edangiel4532@gmail.com | YES |
| 10 (user 23) | `2d9f05d4-44dd-42cd-97aa-d57bd06fecd0` | erickfranco462@gmail.com | YES |
| 11 (user 24) | `aff5dcc6-32de-4769-9aaf-eda751fa0866` | gallinainsana@gmail.com | YES |
| 12 (user 25) | `0cda1645-83c5-445b-80b7-d0e4d436c00c` | leile5257@gmail.com | YES |
| 13 (user 26) | `1364c463-88de-479b-a883-c0b7b362bcf8` | maximiliano.mejia367@gmail.com | YES |
| 14 (user 27) | `547eb778-4782-4681-b198-c731bba36147` | fl432025@gmail.com | YES |
| 15 (user 28) | `5fc06693-e408-4eab-a9a3-fcd5f4e01296` | 7341023901m@gmail.com | YES |
| 16 (user 29) | `5d1839f6-b03f-4e12-b236-eca43f4674f2` | segurauriel235@gmail.com | YES |
| 17 (user 30) | `1b310708-6f24-4c6a-88c9-a11f7a7f9763` | angelrabano11@gmail.com | YES |
| 18 (user 31) | `3c613b0e-66f9-4640-a599-c9426d8edffb` | daliaayalareyes35@gmail.com | YES |
| 19 (user 32) | `7ded133e-9b13-4467-9803-edb813f6a9a1` | alexeimongam@gmail.com | YES |
| 20 (user 33) | `4cc04f54-7771-462d-98aa-a94448bb6ff5` | davidocampovenegas@gmail.com | YES |
| 21 (user 34) | `fbbe7d19-048c-45e4-8a9c-cf86d2098c35` | zaid080809@gmail.com | YES |
| 22 (user 35) | `5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4` | ruizcruzabrahamfrancisco@gmail.com | YES |
| 23 (user 36) | `615adf6e-dbf3-480f-a907-3cfb3a64c6d2` | vituschinchilla@gmail.com | YES |
| 24 (user 37) | `bf445960-4c1f-4e29-8fb7-31667b183d7e` | bryan@betanzos.com | YES |
| 25 (user 38) | `d5fa4905-a78a-4040-8ad8-23220881c6a6` | loganalexander816@gmail.com | YES |
| 26 (user 39) | `71734c15-cdaa-431b-90f5-97a57e0316a8` | carlois1974@gmail.com | YES |
| 27 (user 40) | `1efe491d-98ef-4c02-acd1-3135f7289072` | enriquecuevascbtis136@gmail.com | YES |
| 28 (user 41) | `5ae21325-7450-4c37-82f1-3f9bcd7b6f45` | omarcitogonzalezzavaleta@gmail.com | YES |
| 29 (user 42) | `a4d27774-8a51-4660-ad2f-81d0dfd3a5a7` | gustavobm2024cbtis@gmail.com | YES |
| 30 (user 43) | `6e30164a-78b0-49b0-bd21-23d7c6c03349` | marianaxsotoxt22@gmail.com | YES |
| 31 (user 44) | `69681b09-5077-4f77-84cc-67606abd9755` | javiermar06@hotmail.com | YES |
| 32 (user 45) | `f929d6df-8c29-461f-88f5-264facd879e9` | ju188an@gmail.com | YES |
| 33 (user 46) | `fa14c733-d9fa-46e5-86fc-9d852e7f4383` | arizabalo21@hotmail.com | YES |
| 34 (user 47) | `9f709cba-5f49-4c80-b58d-a424af57ffc6` | dl7231217@gmail.com | YES |
| 35 (user 48) | `e2bb31c0-0949-430e-8dd7-02e8b3ca91c2` | maritzamoralesdeloya@gmail.com | YES |
| 36 (user 49) | `aadf1eca-7e5c-4767-a3c7-80b47fdee782` | gamam130727@gmail.com | YES |
| 37 (user 50) | `71252b1c-c643-4228-aadc-d8ecaafd9356` | abigailisidro08@gmail.com | YES |

**File 07 count: 37 profiles — PASS**

### Coverage Summary

| File | Expected | Actual Count | Users Covered | Status |
|------|----------|--------------|---------------|--------|
| `06-profiles-production.sql` | 13 | 13 | Users 1–13 (LOTE 1) | PASS |
| `07-profiles-production-additional.sql` | 37 | 37 | Users 14–50 (LOTE 2–5) | PASS |
| **Total** | **50** | **50** | **All 50 users** | **PASS** |

Every one of the 50 production UUIDs from `02-production-users.sql` appears in exactly one of the two profile seed files. No production user UUID is missing from the profile seeds.

---

## Section 4: id = user_id Relationship Validation

The profile schema uses a corrected design where `profiles.id = profiles.user_id = auth.users.id`. This was documented as a deliberate correction in file 06 (v2.0):

> `❌ ANTES: profiles.id generado con gen_random_uuid() (diferente de auth.users.id)`
> `✅ AHORA: profiles.id = auth.users.id (consistente con seeds de testing)`

**Inspection of file 06 pattern (13 profiles):**

Each profile INSERT uses this triple-column pattern:
```sql
'b017b792-b327-40dd-aefb-a80312776952'::uuid,  -- id = auth.users.id
'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,  -- tenant_id
'b017b792-b327-40dd-aefb-a80312776952'::uuid,  -- user_id = same as id
```

**Inspection of file 07 pattern (37 profiles):**

Same triple-column pattern used throughout. Example:
```sql
'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,  -- id
'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,  -- tenant_id
'd089b1af-462f-4d2c-b0f5-d2528cec8506'::uuid,  -- user_id
```

**Verification:** In all 50 profiles, the value in column position 1 (id) and column position 3 (user_id) are identical, and both match the corresponding UUID in `02-production-users.sql`.

| Check | Result |
|-------|--------|
| `profiles.id = auth.users.id` for all 50 | PASS |
| `profiles.user_id = auth.users.id` for all 50 | PASS |
| `profiles.id = profiles.user_id` for all 50 | PASS |

**Verdict: PASS** — The id = user_id relationship is correctly implemented for all 50 production users.

---

## Section 5: Tenant Reference Validation

**Expected tenant:** `a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11` (GAMILIT Platform — principal tenant)

**File 06 verification:** All 13 profiles use `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid` as tenant_id. The file's own verification query checks:
```sql
WHERE tenant_id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'
```
and expects count = 13.

**File 07 verification:** All 37 profiles use `'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid` as tenant_id. No exceptions found.

| File | Profiles with correct tenant | Profiles with wrong tenant | Status |
|------|------------------------------|---------------------------|--------|
| `06-profiles-production.sql` | 13 | 0 | PASS |
| `07-profiles-production-additional.sql` | 37 | 0 | PASS |
| **Total** | **50** | **0** | **PASS** |

**Verdict: PASS** — All 50 production user profiles reference the correct principal tenant UUID.

---

## Section 6: Duplicate UUID Check

All 50 UUIDs from `02-production-users.sql` were compared against each other.

**Method:** Manual inspection across all 50 INSERT value blocks in the SQL file, combined with cross-reference against the profile files.

**Result:** No duplicate UUIDs found.

Notable near-duplicates checked (none found):
- Users 3 and 4 both have "Hugo" as first name but different UUIDs (`24e8c563...` vs `bf0d3e34...`) — DISTINCT
- Users 37–43 (LOTE 3) all have different UUIDs despite being from the same date — DISTINCT

| Check | Result |
|-------|--------|
| Duplicate UUIDs in `02-production-users.sql` | 0 duplicates — PASS |
| Same UUID appearing in both profile files | 0 duplicates — PASS |
| UUID appearing in both auth seed and profile files with mismatch | 0 — PASS |

**Verdict: PASS** — No duplicate UUIDs exist across the production user seed chain.

---

## Section 7: Orphan UUID Search in Gamification Seeds

### Files examined

| File | Pattern Used | Hardcoded Production UUIDs? |
|------|-------------|----------------------------|
| `gamification_system/05-user_stats.sql` | Dynamic lookup via email (`WHERE u.email = '...'`) | NO |
| `gamification_system/06-user_ranks.sql` | Dynamic lookup via role + email exclusion | NO |
| `gamification_system/07-ml_coins_transactions.sql` | Dynamic lookup via email + NULL guards | NO |
| `gamification_system/08-user_achievements.sql` | Dynamic lookup via email subquery | NO |
| `gamification_system/09-comodines_inventory.sql` | Dynamic lookup via role + email exclusion | NO |
| `gamification_system/18-user_purchases-demo.sql` | Dynamic lookup via email, with fallback to first student | NO |
| `progress_tracking/01-module_progress.sql` | Empty (intentionally) | NO |

### Design Pattern Confirmed

All gamification and progress seed files use one of these safe patterns:

**Pattern A — Email-based subquery (most common):**
```sql
(SELECT p.id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = 'specific@email.com')
```

**Pattern B — Role-based dynamic iteration (06-user_ranks, 09-comodines):**
```sql
FOR v_student IN SELECT p.id FROM auth_management.profiles p WHERE p.role = 'student' AND p.email NOT IN (...) ...
```

**Pattern C — Fallback with NULL guard (05-user_stats FASE 0):**
```sql
SELECT p.id INTO v_profile_id FROM auth.users u JOIN auth_management.profiles p ON p.user_id = u.id WHERE u.email = '...';
IF v_profile_id IS NOT NULL THEN ... END IF;
```

### Key Finding: No Hardcoded Production User UUIDs in Gamification Seeds

The gamification seeds reference only the following users by email:
- `admin@gamilit.com` (testing user)
- `teacher@gamilit.com` (testing user)
- `student@gamilit.com` (testing user)
- `estudiante1@demo.glit.edu.mx` (demo user, dev-only)
- `estudiante2@demo.glit.edu.mx` (demo user, dev-only)
- `estudiante3@demo.glit.edu.mx` (demo user, dev-only)
- `instructor@demo.glit.edu.mx` (demo user, dev-only)
- Several production users by email for achievements: `blu3wt7@gmail.com`, `hernandezfonsecabenjamin7@gmail.com`, `marbancarlos916@gmail.com`, `diego.colores09@gmail.com`, `barraganfer03@gmail.com`, `roman.rebollar.marcoantonio1008@gmail.com`, `ricardolugo786@icloud.com`

All production user references in `08-user_achievements.sql` use the email-based subquery pattern, which safely resolves to NULL and skips if the user does not exist (via ON CONFLICT DO NOTHING or explicit NULL guard).

**Verdict: PASS** — No orphan hardcoded production UUIDs in gamification or progress seeds. All user references are dynamically resolved.

---

## Section 8: Cross-Reference Gamification Seeds vs Auth Seeds

### Production Users Referenced in Gamification Seeds

The file `08-user_achievements.sql` directly references 7 production users by email for achievement seeding:

| Email | UUID (from auth seed) | Present in Auth Seed? | Present in Profile Seed? |
|-------|-----------------------|-----------------------|--------------------------|
| blu3wt7@gmail.com | `2f5a9846-3393-40b2-9e87-0f29238c383f` | YES (User #5) | YES (file 06, Profile #5) |
| hernandezfonsecabenjamin7@gmail.com | `7a6a973e-83f7-4374-a9fc-54258138115f` | YES (User #9) | YES (file 06, Profile #9) |
| marbancarlos916@gmail.com | `00c742d9-e5f7-4666-9597-5a8ca54d5478` | YES (User #7) | YES (file 06, Profile #7) |
| diego.colores09@gmail.com | `33306a65-a3b1-41d5-a49d-47989957b822` | YES (User #8) | YES (file 06, Profile #8) |
| barraganfer03@gmail.com | `9951ad75-e9cb-47b3-b478-6bb860ee2530` | YES (User #11) | YES (file 06, Profile #11) |
| roman.rebollar.marcoantonio1008@gmail.com | `735235f5-260a-4c9b-913c-14a1efd083ea` | YES (User #12) | YES (file 06, Profile #12) |
| ricardolugo786@icloud.com | `5e738038-1743-4aa9-b222-30171300ea9d` | YES (User #6) | YES (file 06, Profile #6) |

**All 7 production users referenced in gamification achievements are valid — fully covered in auth and profile seeds.**

### Demo Users Referenced in Gamification Seeds

Demo users (`estudiante1/2/3@demo.glit.edu.mx`, `instructor@demo.glit.edu.mx`) are defined in `auth/01b-demo-students.sql` using `gen_random_uuid()` — their UUIDs are dynamic per run. All gamification references use email-based lookup, so there is no UUID coupling issue.

**Verdict: PASS** — All cross-references from gamification seeds to auth users are valid.

---

## Section 9: Discrepancies and Warnings

### WARNING-1: LOTE 3 Count Discrepancy in Comment

**Location:** `apps/database/seeds/dev/auth/02-production-users.sql`, line 626

**Issue:** The LOTE 3 section header comment states `"(6 usuarios)"` but the section actually contains 7 user definitions (Users 37–43).

```sql
-- =====================================================
-- LOTE 3: USUARIOS 2025-11-25 (6 usuarios)     ← WRONG: should be 7
-- =====================================================
```

**Actual users in LOTE 3:**
- User 37: bryan@betanzos.com
- User 38: loganalexander816@gmail.com
- User 39: carlois1974@gmail.com
- User 40: enriquecuevascbtis136@gmail.com
- User 41: omarcitogonzalezzavaleta@gmail.com
- User 42: gustavobm2024cbtis@gmail.com
- User 43: marianaxsotoxt22@gmail.com

**Impact:** None on data integrity. All 7 users are correctly defined, correctly have profiles, and the total count of 50 is accurate. This is only a comment/metadata error.

**Recommendation:** Update the comment on line 626 from `(6 usuarios)` to `(7 usuarios)`.

Similarly, the file header (lines 14–17) shows the following count breakdown:
```
-- - Lote 1 (2025-11-18): 13 usuarios con nombres completos
-- - Lote 2 (2025-11-24): 23 usuarios (algunos sin nombres)
-- - Lote 3 (2025-11-25): 7 usuarios                       ← FILE HEADER IS CORRECT (7)
-- - Lote 4 (2025-12-08 y 2025-12-17): 2 usuarios
```
The file-level header is already correct (7 users). Only the LOTE 3 section-level comment inside the SQL body is wrong ("6 usuarios").

### WARNING-2: File 07 Header Says "32 originales + 5 Lote 5" but Total is Correct

**Location:** `apps/database/seeds/dev/auth_management/07-profiles-production-additional.sql`, line 11

```
-- USUARIOS ADICIONALES: 37 perfiles (32 originales + 5 Lote 5)
```

This arithmetic is correct: 32 + 5 = 37. However, the file also states in its verification query threshold `>= 35` (line 729), which is a loose check — acceptable but could be tightened to `= 37`.

**Impact:** No data integrity issue.

---

## Section 10: Summary of All Validations

| # | Check | Source Files | Result | Notes |
|---|-------|-------------|--------|-------|
| 1 | Extract 50 production UUIDs | `auth/02-production-users.sql` | PASS | All 50 extracted and listed |
| 2 | UUID in profile file 06 (13 expected) | `auth_management/06-profiles-production.sql` | PASS | 13/13 matched |
| 3 | UUID in profile file 07 (37 expected) | `auth_management/07-profiles-production-additional.sql` | PASS | 37/37 matched |
| 4 | Total profile coverage (50 expected) | Files 06 + 07 | PASS | 50/50 = 100% coverage |
| 5 | UUID format (8-4-4-4-12 hex) | `auth/02-production-users.sql` | PASS | 50/50 valid |
| 6 | `profiles.id = auth.users.id` | Files 06 + 07 | PASS | All 50 profiles correct |
| 7 | `profiles.user_id = auth.users.id` | Files 06 + 07 | PASS | All 50 profiles correct |
| 8 | Tenant = `a0eebc99...` for all profiles | Files 06 + 07 | PASS | All 50 profiles correct |
| 9 | Duplicate UUID check | `auth/02-production-users.sql` | PASS | 0 duplicates |
| 10 | Orphan UUIDs in gamification seeds | `gamification_system/*.sql` | PASS | All use dynamic lookups |
| 11 | Orphan UUIDs in progress seeds | `progress_tracking/*.sql` | PASS | Empty or dynamic lookups |
| 12 | Gamification → auth cross-reference | `08-user_achievements.sql` | PASS | 7 prod users all valid |
| 13 | LOTE 3 comment accuracy | `auth/02-production-users.sql` L626 | WARNING | Comment says "6" but actual is 7 |

**OVERALL: 12 PASS, 0 FAIL, 1 WARNING**

---

## Files Examined

| File | Purpose |
|------|---------|
| `apps/database/seeds/dev/auth/01-demo-users.sql` | Testing users (@gamilit.com) — UUIDs generated dynamically |
| `apps/database/seeds/dev/auth/01b-demo-students.sql` | Demo students — UUIDs generated dynamically |
| `apps/database/seeds/dev/auth/02-production-users.sql` | **50 production users** — fixed UUIDs |
| `apps/database/seeds/dev/auth_management/06-profiles-production.sql` | **13 profiles** for LOTE 1 |
| `apps/database/seeds/dev/auth_management/07-profiles-production-additional.sql` | **37 profiles** for LOTE 2–5 |
| `apps/database/seeds/dev/gamification_system/05-user_stats.sql` | Stats — dynamic lookup only |
| `apps/database/seeds/dev/gamification_system/06-user_ranks.sql` | Ranks — dynamic lookup only |
| `apps/database/seeds/dev/gamification_system/07-ml_coins_transactions.sql` | Transactions — dynamic lookup only |
| `apps/database/seeds/dev/gamification_system/08-user_achievements.sql` | Achievements — dynamic lookup, 7 prod users by email |
| `apps/database/seeds/dev/gamification_system/09-comodines_inventory.sql` | Comodines — dynamic lookup only |
| `apps/database/seeds/dev/gamification_system/18-user_purchases-demo.sql` | Purchases — dynamic lookup only |
| `apps/database/seeds/dev/progress_tracking/01-module_progress.sql` | Progress — intentionally empty |

---

## Recommended Actions for Cleanup Task

1. **FIX (minor):** Update LOTE 3 section comment in `apps/database/seeds/dev/auth/02-production-users.sql` line 626: change `(6 usuarios)` to `(7 usuarios)`.

2. **OPTIONAL:** Tighten the verification threshold in `07-profiles-production-additional.sql` line 729 from `>= 35` to `= 37` for exact validation.

3. **NO ACTION REQUIRED** on UUID chain integrity — all 50 UUIDs are valid, unique, correctly profiled, and have no orphan references in dependent seeds.

---

*Report generated by SA-1B | TASK-2026-02-28-SEED-CLEANUP | Research only — no files modified*
