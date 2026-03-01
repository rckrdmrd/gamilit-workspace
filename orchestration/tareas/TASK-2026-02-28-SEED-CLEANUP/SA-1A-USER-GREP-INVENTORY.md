---
title: "SA-1A: User Grep & Inventory Analysis"
agent: "SA-1A"
task: "TASK-2026-02-28-SEED-CLEANUP"
date: "2026-02-28"
phase: "1"
status: "COMPLETE"
---

# SA-1A: User Grep & Inventory Analysis

**Agent:** SA-1A (User Inventory Researcher)
**Task:** TASK-2026-02-28-SEED-CLEANUP
**Date:** 2026-02-28
**Mode:** ANALYSIS ONLY — no files modified

---

## EXECUTIVE SUMMARY

| Item | Finding |
|------|---------|
| `rckrdmrd` occurrences | 157 total across repo (2 seed comment-lines, 15+ backup data-lines, rest git/doc references) |
| `adredsi26` occurrences | Backups only (1 backup file: `gamilit_platform_20260228_210825.sql`); NOT present in any seed file |
| UUID `2c9af9ac-...` (rckrdmrd prod) | 1 file only: `gamilit_platform_20260228_210825.sql` (backup) |
| UUID `a6230bab-...` (adredsi26) | 1 file only: `gamilit_platform_20260228_210825.sql` (backup) |
| `02-production-users.sql` across envs | IDENTICAL across dev/prod/staging (confirmed via diff, no output) |
| Lote 3 header vs actual count | **DISCREPANCY**: Header says "7 usuarios", section label says "6 usuarios", INSERT comment says "45 usuarios" instead of 50 |
| `rckrdmrd` in active seed files | 2 comment-only lines (both exclusion notices), 0 INSERT/VALUES data lines |
| `adredsi26` in active seed files | 0 occurrences — not present in any seed file at all |

---

## SECTION 1: Grep of `rckrdmrd` — All Occurrences

### 1A. Active Seed Files (apps/database/seeds/)

| File | Line | Type | Content |
|------|------|------|---------|
| `seeds/dev/auth/02-production-users.sql` | 943 | Comment (CHANGELOG) | `-- Excluido: rckrdmrd@gmail.com (usuario dev)` |
| `seeds/dev/auth_management/07-profiles-production-additional.sql` | 20 | Comment (header) | `-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita)` |
| `seeds/dev/auth_management/07-profiles-production-additional.sql` | 737 | Comment (footer) | `-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente` |
| `seeds/prod/auth/02-production-users.sql` | 943 | Comment (CHANGELOG) | `-- Excluido: rckrdmrd@gmail.com (usuario dev)` |
| `seeds/prod/auth_management/07-profiles-production-additional.sql` | 20 | Comment (header) | `-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita)` |
| `seeds/prod/auth_management/07-profiles-production-additional.sql` | 737 | Comment (footer) | `-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente` |
| `seeds/staging/auth/02-production-users.sql` | 943 | Comment (CHANGELOG) | `-- Excluido: rckrdmrd@gmail.com (usuario dev)` |
| `seeds/staging/auth_management/07-profiles-production-additional.sql` | 20 | Comment (header) | `-- EXCLUIDO: rckrdmrd@gmail.com (por solicitud explicita)` |
| `seeds/staging/auth_management/07-profiles-production-additional.sql` | 737 | Comment (footer) | `-- NOTA: rckrdmrd@gmail.com fue EXCLUIDO intencionalmente` |

**Assessment:** `rckrdmrd@gmail.com` does NOT appear as INSERT/VALUES data in any active seed. All 9 occurrences are comments documenting the intentional exclusion. The seeds are clean.

### 1B. Backup Files (apps/database/backups/ and apps/database/backup/)

| File | Line | Type | Content Summary |
|------|------|------|----------------|
| `backup/gamilit_platform_20260221_184823.sql` | 35738 | Activity log data | register event for `rckrdmrd@gmail.com` (2026-02-20 06:56) |
| `backup/gamilit_platform_20260221_184823.sql` | 35743 | Activity log data | login event (2026-02-20 06:57) |
| `backup/gamilit_platform_20260221_184823.sql` | 35757 | Activity log data | login event (2026-02-20 07:02) |
| `backup/gamilit_platform_20260221_184823.sql` | 35835 | Activity log data | login event mobile (2026-02-20 07:16) |
| `backup/gamilit_platform_20260221_184823.sql` | 35842 | Activity log data | login event (2026-02-20 07:19) |
| `backup/gamilit_platform_20260221_184823.sql` | 36028 | Activity log data | login event (2026-02-20 15:50) |
| `backup/gamilit_platform_20260221_184823.sql` | 36042 | Activity log data | login event (2026-02-20 15:54) |
| `backup/gamilit_platform_20260221_184823.sql` | 36047 | Activity log data | login event (2026-02-20 15:58) |
| `backup/gamilit_platform_20260221_184823.sql` | 36055 | Activity log data | login event (2026-02-20 16:07) |
| `backup/gamilit_platform_20260221_184823.sql` | 36192 | auth.users INSERT data | UUID `18b1659f-d150-4f26-bc5c-168ac1e2d438`, role student, created 2026-02-20 |
| `backup/gamilit_platform_20260221_184823.sql` | 36206–36241 | auth_attempts data | 9 login attempt records |
| `backup/gamilit_platform_20260221_184823.sql` | 36389 | auth_management.profiles data | display `rckrDmrD`, full name `Adrian Flores Cortes` |
| `backups/backup-nuevos-usuarios-20260220/03-production-users-20260220.sql` | 12 | Comment (header list) | Listed as user 1 of 6 new users |
| `backups/backup-nuevos-usuarios-20260220/03-production-users-20260220.sql` | 41 | INSERT/VALUES data | `'rckrdmrd@gmail.com'` — in backup-specific seed |
| `backups/backup-nuevos-usuarios-20260220/03-production-users-20260220.sql` | 141 | INSERT/VALUES data | profile insert for rckrdmrd |
| `backups/backup-nuevos-usuarios-20260220/03-production-users-20260220.sql` | 261 | Verification query | email in verification array |
| `backups/backup-nuevos-usuarios-20260220/full-data-dump.sql` | 79 | auth.users INSERT | Full row with UUID `18b1659f...` |
| `backups/backup-nuevos-usuarios-20260220/full-data-dump.sql` | 139 | profiles INSERT | Profile row for `rckrdmrd@gmail.com` |
| `backups/gamilit_platform_20260221_184823.sql` | 35738–36241 | Same as `backup/` folder | Duplicate of above (two path locations) |
| `backups/gamilit_platform_20260228_210825.sql` | 38858 | Activity log | Failed login attempt 2026-02-24 (401) |
| `backups/gamilit_platform_20260228_210825.sql` | 38995 | Activity log | Failed login attempt 2026-02-26 (401) |
| `backups/gamilit_platform_20260228_210825.sql` | 38996 | Activity log | Register event 2026-02-26 (re-register) |
| `backups/gamilit_platform_20260228_210825.sql` | 39021 | Activity log | Login success 2026-02-26 |
| `backups/gamilit_platform_20260228_210825.sql` | 39027 | Activity log | Login success 2026-02-27 |
| `backups/gamilit_platform_20260228_210825.sql` | 39133 | auth.users data | UUID `2c9af9ac-...` (new UUID after re-register) |
| `backups/gamilit_platform_20260228_210825.sql` | 39147–39158 | auth_attempts data | Mix of failed+successful attempts |
| `backups/gamilit_platform_20260228_210825.sql` | 39230 | profiles data | Profile with UUID `2c9af9ac-...` |
| `backups/pre-init/gamilit_platform_pre_recreate_20260218_235144.sql` | 35240 | Activity log | Register 2026-02-14 |
| `backups/pre-init/gamilit_platform_pre_recreate_20260218_235144.sql` | 36197 | auth.users data | UUID `ac1ee88c-...` (first registration UUID) |
| `backups/pre-init/gamilit_platform_pre_recreate_20260218_235144.sql` | 36215 | auth_attempts | Login attempt record |
| `backups/pre-init/gamilit_platform_pre_recreate_20260218_235144.sql` | 36379 | profiles data | Profile row |

### 1C. Orchestration & Documentation References

All remaining `rckrdmrd` occurrences (approximately 80+) are in documentation, orchestration files, and configuration files as the **GitHub username** (`rckrdmrd/gamilit-workspace.git`), the **email** in delivery docs, or references in the `SEEDS_INVENTORY.yml`. These are:

- `apps/database/config/database.config.yml` (line 20) — repository URL
- `apps/frontend/e2e/automation-flow.spec.ts` (lines 33, 52) — **E2E test that uses `rckrdmrd@gmail.com` as test registration email** (INSERT-equivalent context: triggers API registration)
- `docs/99-delivery/2025-11-16-entrega-final/*.md` — delivery docs listing email
- `orchestration/inventarios/SEEDS_INVENTORY.yml` (lines 51, 156, 236) — exclusion notes
- `orchestration/directivas/*`, `orchestration/referencias/*` — git remote URLs
- `CLAUDE.md`, `README.md`, `orchestration/PROJECT-CONTEXT.md` — project identity files
- `orchestration/directivas/politicas/POLITICA-SUPPLY-CHAIN.md` (lines 107, 130) — supply chain policy references

---

## SECTION 2: Grep of `adredsi26` — All Occurrences

### 2A. Active Seed Files

**Result: ZERO occurrences in any seed file.**

`adredsi26@gmail.com` does NOT appear in any of:
- `apps/database/seeds/dev/` (all subdirectories)
- `apps/database/seeds/prod/` (all subdirectories)
- `apps/database/seeds/staging/` (all subdirectories)

### 2B. Backup Files

| File | Line | Type | Content Summary |
|------|------|------|----------------|
| `backups/gamilit_platform_20260228_210825.sql` | 38811 | Activity log | Register event for `adredsi26@gmail.com` (2026-02-21 23:12, role student) |
| `backups/gamilit_platform_20260228_210825.sql` | 39130 | auth.users INSERT data | UUID `a6230bab-fac1-4436-a02e-1fbe342f14ce`, created 2026-02-21 |
| `backups/gamilit_platform_20260228_210825.sql` | 39142 | auth_attempts data | Login attempt (success) |
| `backups/gamilit_platform_20260228_210825.sql` | 39229 | profiles data | Full name `Adrian Flores Cortes`, display NULL |
| `backups/gamilit_platform_20260228_210825.sql` | 39353 | user_sessions data | Session token hash record |
| `backups/gamilit_platform_20260228_210825.sql` | 40338–40342 | missions data | 4 user_missions assigned at registration |
| `backups/gamilit_platform_20260228_210825.sql` | 40570 | user_ranks data | Rank "Ajaw" initialized |
| `backups/gamilit_platform_20260228_210825.sql` | 40581 | user_stats data | Zero stats row initialized |

### 2C. Orchestration References

| File | Line | Type | Content |
|------|------|------|---------|
| `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/SA-1A-BACKUP-CATALOG.md` | 859 | Audit report note | "2 x dev/owner users (rckrdmrd@gmail.com, adredsi26@gmail.com — student role)" |
| `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/SA-4A-SEED-DATA-ANALYSIS.md` | 60 | Audit report table | "2 demo users (rckrdmrd, adredsi26)" — **INCORRECT** (see Section 6 below) |

### 2D. Documentation, Frontend, Backend

**Result: ZERO occurrences in docs/, apps/frontend/, apps/backend/.**

---

## SECTION 3: UUID Grep Results

### UUID `2c9af9ac-0229-4baf-bbe8-fc24fca3296d` (rckrdmrd — 2nd registration)

| File | Type | Detail |
|------|------|--------|
| `backups/gamilit_platform_20260228_210825.sql` | ONLY occurrence | Multiple lines: auth.users row (line 39133), profiles row (line 39230), plus ~20+ gamification/session data lines referencing this UUID as user_id |

**Context:** This UUID was generated when `rckrdmrd@gmail.com` re-registered on 2026-02-26 after a failed login attempt returned 401 "Usuario no encontrado" (the user had been lost in a DB recreate). This is the **current** UUID for this user in production (as of the 2026-02-28 backup).

**The previous UUID** for the same email was `18b1659f-d150-4f26-bc5c-168ac1e2d438` (from the 2026-02-21 backup and backup-nuevos-usuarios archive).

### UUID `a6230bab-fac1-4436-a02e-1fbe342f14ce` (adredsi26)

| File | Type | Detail |
|------|------|--------|
| `backups/gamilit_platform_20260228_210825.sql` | ONLY occurrence | auth.users row (line 39130), profiles row (line 39229), missions, ranks, stats, sessions data |

**Context:** `adredsi26@gmail.com` registered on 2026-02-21 23:12. This account has never appeared in any seed file — it is purely a runtime-generated account in the production database.

---

## SECTION 4: Complete Dev Seed User Inventory

### 4A. System + Testing Users — `01-demo-users.sql`

**File:** `apps/database/seeds/dev/auth/01-demo-users.sql`
**Version:** 4.0 (2026-02-21)
**Count declared in header:** 4 users
**Count in INSERT statements:** 4 users (verified)
**ID Strategy:** `system@gamilit.com` uses fixed UUID `00000000-0000-0000-0000-000000000001`; others use `gen_random_uuid()`

| # | Email | UUID | Role | Password | Notes |
|---|-------|------|------|----------|-------|
| 0 | `system@gamilit.com` | `00000000-0000-0000-0000-000000000001` (fixed) | super_admin | `n/a` | No login, system account |
| 1 | `admin@gamilit.com` | `gen_random_uuid()` | super_admin | `Test1234` | Testing admin |
| 2 | `teacher@gamilit.com` | `gen_random_uuid()` | admin_teacher | `Test1234` | Testing teacher |
| 3 | `student@gamilit.com` | `gen_random_uuid()` | student | `Test1234` | Testing student |

**Note:** Previous versions (v1.0) included 20 users at `@demo.glit.edu.mx` domain. These were removed in v2.0 (2025-11-17). The file does NOT contain `rckrdmrd` or `adredsi26` — both were explicitly removed.

### 4B. Demo Students — `01b-demo-students.sql`

**File:** `apps/database/seeds/dev/auth/01b-demo-students.sql`
**Version:** 2.0 (2026-02-21)
**Count declared in header:** 4 users
**Count in INSERT statements:** 4 users (verified)
**ID Strategy:** All `gen_random_uuid()`

| # | Email | UUID | Role | Password | Notes |
|---|-------|------|------|----------|-------|
| 1 | `estudiante1@demo.glit.edu.mx` | `gen_random_uuid()` | student | `Test1234` | Demo student, 30 days ago |
| 2 | `estudiante2@demo.glit.edu.mx` | `gen_random_uuid()` | student | `Test1234` | Demo student, 28 days ago |
| 3 | `estudiante3@demo.glit.edu.mx` | `gen_random_uuid()` | student | `Test1234` | Demo student, 25 days ago |
| 4 | `instructor@demo.glit.edu.mx` | `gen_random_uuid()` | admin_teacher | `Test1234` | Demo instructor, 60 days ago |

**Note:** Referenced by ~21 seed files in gamification, progress, social, audit schemas.

### 4C. Production Users — `02-production-users.sql`

**File:** `apps/database/seeds/dev/auth/02-production-users.sql`
**Version:** 3.0 (2026-02-21)
**Total declared in header:** 50 users
**Total actual INSERT rows:** 50 users (verified by counting USUARIO 1 through USUARIO 50 markers)
**ID Strategy:** Fixed UUIDs from production (preserved from backup)
**Password Strategy:** Original bcrypt hashes preserved

#### Lote 1 — 2025-11-18 (13 users, all with full names)

| # | Email | UUID | First Name | Last Name |
|---|-------|------|------------|-----------|
| 1 | `joseal.guirre34@gmail.com` | `b017b792-b327-40dd-aefb-a80312776952` | Jose | Aguirre |
| 2 | `sergiojimenezesteban63@gmail.com` | `06a24962-e83d-4e94-aad7-ff69f20a9119` | Sergio | Jimenez |
| 3 | `Gomezfornite92@gmail.com` | `24e8c563-8854-43d1-b3c9-2f83e91f5a1e` | Hugo | Gomez |
| 4 | `Aragon494gt54@icloud.com` | `bf0d3e34-e077-43d1-9626-292f7fae2bd6` | Hugo | Aragón |
| 5 | `blu3wt7@gmail.com` | `2f5a9846-3393-40b2-9e87-0f29238c383f` | Azul | Valentina |
| 6 | `ricardolugo786@icloud.com` | `5e738038-1743-4aa9-b222-30171300ea9d` | Ricardo | Lugo |
| 7 | `marbancarlos916@gmail.com` | `00c742d9-e5f7-4666-9597-5a8ca54d5478` | Carlos | Marban |
| 8 | `diego.colores09@gmail.com` | `33306a65-a3b1-41d5-a49d-47989957b822` | Diego | Colores |
| 9 | `hernandezfonsecabenjamin7@gmail.com` | `7a6a973e-83f7-4374-a9fc-54258138115f` | Benjamin | Hernandez |
| 10 | `jr7794315@gmail.com` | `ccd7135c-0fea-4488-9094-9da52df1c98c` | Josue | Reyes |
| 11 | `barraganfer03@gmail.com` | `9951ad75-e9cb-47b3-b478-6bb860ee2530` | Fernando | Barragan |
| 12 | `roman.rebollar.marcoantonio1008@gmail.com` | `735235f5-260a-4c9b-913c-14a1efd083ea` | Marco Antonio | Roman |
| 13 | `rodrigoguerrero0914@gmail.com` | `ebe48628-5e44-4562-97b7-b4950b216247` | Rodrigo | Guerrero |

**Profile coverage:** All 13 have profiles in `06-profiles-production.sql`.

#### Lote 2 — 2025-11-24 (23 users, most without names — first_name="" last_name="")

| # | Email | UUID | Has Name? |
|---|-------|------|-----------|
| 14 | `santiagoferrara78@gmail.com` | `d089b1af-462f-4d2c-b0f5-d2528cec8506` | No |
| 15 | `alexanserrv917@gmail.com` | `b1cadf36-1f07-46b2-b63d-da72d9b54dc6` | No |
| 16 | `aarizmendi434@gmail.com` | `af4d8788-f8a8-4971-bb0d-2f48c150dfc2` | No |
| 17 | `ashernarcisobenitezpalomino@gmail.com` | `26fbc469-10af-4fa3-bd65-e5498188cc4f` | No |
| 18 | `ra.alejandrobm@gmail.com` | `74ed8c97-ec36-43aa-a1cc-b0c99e4be4e8` | No |
| 19 | `abdallahxelhaneriavega@gmail.com` | `f4c46f46-3fb9-40bf-a52b-a8ad2e6a92e1` | No |
| 20 | `09enriquecampos@gmail.com` | `012adac4-8ffd-47bd-9248-f0c5851e981f` | No |
| 21 | `johhkk22@gmail.com` | `126b9257-7b0a-4bd6-9ab3-c505ee00e10a` | No |
| 22 | `edangiel4532@gmail.com` | `9ac1746e-94a6-4efc-a961-951c015d416e` | No |
| 23 | `erickfranco462@gmail.com` | `2d9f05d4-44dd-42cd-97aa-d57bd06fecd0` | No |
| 24 | `gallinainsana@gmail.com` | `aff5dcc6-32de-4769-9aaf-eda751fa0866` | No |
| 25 | `leile5257@gmail.com` | `0cda1645-83c5-445b-80b7-d0e4d436c00c` | No |
| 26 | `maximiliano.mejia367@gmail.com` | `1364c463-88de-479b-a883-c0b7b362bcf8` | No |
| 27 | `fl432025@gmail.com` | `547eb778-4782-4681-b198-c731bba36147` | No |
| 28 | `7341023901m@gmail.com` | `5fc06693-e408-4eab-a9a3-fcd5f4e01296` | No |
| 29 | `segurauriel235@gmail.com` | `5d1839f6-b03f-4e12-b236-eca43f4674f2` | No |
| 30 | `angelrabano11@gmail.com` | `1b310708-6f24-4c6a-88c9-a11f7a7f9763` | No |
| 31 | `daliaayalareyes35@gmail.com` | `3c613b0e-66f9-4640-a599-c9426d8edffb` | No |
| 32 | `alexeimongam@gmail.com` | `7ded133e-9b13-4467-9803-edb813f6a9a1` | No |
| 33 | `davidocampovenegas@gmail.com` | `4cc04f54-7771-462d-98aa-a94448bb6ff5` | No |
| 34 | `zaid080809@gmail.com` | `fbbe7d19-048c-45e4-8a9c-cf86d2098c35` | No |
| 35 | `ruizcruzabrahamfrancisco@gmail.com` | `5b3d74e8-fd1a-4c80-96d2-24c54bfe90c4` | No |
| 36 | `vituschinchilla@gmail.com` | `615adf6e-dbf3-480f-a907-3cfb3a64c6d2` | No |

**Profile coverage:** All 23 have profiles in `07-profiles-production-additional.sql` (perfiles 1–23).

#### Lote 3 — 2025-11-25 (ACTUAL: 7 users — SEE DISCREPANCY in Section 6)

| # | Email | UUID | Has Name? |
|---|-------|------|-----------|
| 37 | `bryan@betanzos.com` | `bf445960-4c1f-4e29-8fb7-31667b183d7e` | No |
| 38 | `loganalexander816@gmail.com` | `d5fa4905-a78a-4040-8ad8-23220881c6a6` | No |
| 39 | `carlois1974@gmail.com` | `71734c15-cdaa-431b-90f5-97a57e0316a8` | No |
| 40 | `enriquecuevascbtis136@gmail.com` | `1efe491d-98ef-4c02-acd1-3135f7289072` | No |
| 41 | `omarcitogonzalezzavaleta@gmail.com` | `5ae21325-7450-4c37-82f1-3f9bcd7b6f45` | No |
| 42 | `gustavobm2024cbtis@gmail.com` | `a4d27774-8a51-4660-ad2f-81d0dfd3a5a7` | No |
| 43 | `marianaxsotoxt22@gmail.com` | `6e30164a-78b0-49b0-bd21-23d7c6c03349` | No |

**Profile coverage:** All 7 have profiles in `07-profiles-production-additional.sql` (perfiles 24–30).

#### Lote 4 — 2025-12-08/17 (2 users, with partial names)

| # | Email | UUID | First Name | Last Name |
|---|-------|------|------------|-----------|
| 44 | `javiermar06@hotmail.com` | `69681b09-5077-4f77-84cc-67606abd9755` | Javier | Mar |
| 45 | `ju188an@gmail.com` | `f929d6df-8c29-461f-88f5-264facd879e9` | Juan | pa |

**Profile coverage:** Both in `07-profiles-production-additional.sql` (perfiles 31–32).

#### Lote 5 — 2026-02-20 (5 users, from backup 2026-02-21, all with full names)

| # | Email | UUID | Full Name |
|---|-------|------|-----------|
| 46 | `arizabalo21@hotmail.com` | `fa14c733-d9fa-46e5-86fc-9d852e7f4383` | Ana Ofelia Arizabalo |
| 47 | `dl7231217@gmail.com` | `9f709cba-5f49-4c80-b58d-a424af57ffc6` | Daniela Jaqueline Castilleros Lopez |
| 48 | `maritzamoralesdeloya@gmail.com` | `e2bb31c0-0949-430e-8dd7-02e8b3ca91c2` | Maritza Morales Deloya |
| 49 | `gamam130727@gmail.com` | `aadf1eca-7e5c-4767-a3c7-80b47fdee782` | Mauricio Ramirez Gama |
| 50 | `abigailisidro08@gmail.com` | `71252b1c-c643-4228-aadc-d8ecaafd9356` | Diana Abigail Sotelo Isidro |

**Profile coverage:** All 5 in `07-profiles-production-additional.sql` (perfiles 33–37).

### 4D. Profile Coverage Summary

| Seed File | Profiles Inserted | Source Users |
|-----------|------------------|--------------|
| `06-profiles-production.sql` | 13 | Lote 1 users only (verified: 13 INSERT tuples) |
| `07-profiles-production-additional.sql` | 37 | Lotes 2–5 users (Perfiles 1–37 verified) + note about rckrdmrd exclusion |

**Total profiles:** 13 + 37 = **50 profiles** matching 50 production users. Consistent.

---

## SECTION 5: Cross-Environment Comparison of `02-production-users.sql`

| Environment | File Path | Result |
|-------------|-----------|--------|
| dev | `apps/database/seeds/dev/auth/02-production-users.sql` | Baseline |
| prod | `apps/database/seeds/prod/auth/02-production-users.sql` | **IDENTICAL** to dev (diff: no output) |
| staging | `apps/database/seeds/staging/auth/02-production-users.sql` | **IDENTICAL** to dev (diff: no output) |

**Conclusion:** All three environments share the exact same production user seed. This is intentional — the file header states `Environment: ALL (dev + prod)`.

---

## SECTION 6: Comment vs Actual Count Discrepancies

### FINDING 1 — Lote 3 Count Mismatch (CONFIRMED BUG)

**File:** `apps/database/seeds/dev/auth/02-production-users.sql` (and identical prod/staging copies)

| Location | Says | Actual |
|----------|------|--------|
| Header comment (line 15) | `Lote 3 (2025-11-25): 7 usuarios` | **7** (CORRECT) |
| Section label (line 626) | `LOTE 3: USUARIOS 2025-11-25 (6 usuarios)` | **7** (WRONG — says 6, has 7) |
| CHANGELOG v2.0 (line 956) | `Lote 3: 7 usuarios (2025-11-25)` | **7** (CORRECT) |

**Actual users in Lote 3:** Users 37–43 = **7 users**. The section label `(6 usuarios)` is incorrect. The header and changelog agree at 7. The section label is stale from a previous version when `marianaxsotoxt22@gmail.com` (user 43) may not have been included.

### FINDING 2 — INSERT Comment Says 45 Instead of 50 (STALE COMMENT)

**File:** `apps/database/seeds/dev/auth/02-production-users.sql` (line 35)

```sql
-- INSERT: Production Registered Users (45 usuarios)
```

**Actual row count:** 50 users (Lotes 1–5). This comment was not updated when Lote 5 was added (v3.0, 2026-02-21). The same file correctly declares "TOTAL: 50 usuarios" in the header (line 19).

### FINDING 3 — SEEDS_INVENTORY.yml Stale Counts

**File:** `orchestration/inventarios/SEEDS_INVENTORY.yml`

| Location | Says | Actual |
|----------|------|--------|
| `registros_estimados` for `02-production-users.sql` (line 150) | `45` | **50** (stale from pre-Lote5) |
| Lote 3 entry (line 165) | `cantidad: 6` | **7** |
| Notes (line 155) | "45 estudiantes reales" | **50** |
| notas_actualizacion (line 43–44) | "44 usuarios de producción" | **50** (very stale) |

**SEEDS_INVENTORY.yml** was last updated 2026-02-21 but does not reflect the Lote 5 addition to counts in all sections.

### FINDING 4 — SA-4A Report Inaccuracy (Previous Audit)

**File:** `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/SA-4A-SEED-DATA-ANALYSIS.md` (line 60)

The SA-4A report states:
> `| 01-demo-users.sql | auth.users, auth_management.profiles | 2 demo users (rckrdmrd, adredsi26) |`

This is **INCORRECT**. The current `01-demo-users.sql` contains:
- 4 users at `@gamilit.com` domain (system, admin, teacher, student)
- ZERO `rckrdmrd` or `adredsi26` entries

The SA-4A report appears to have been based on a previous version of the seed file (pre-v3.0 cleanup when placeholder UUIDs existed). The current file (v4.0) was completely rewritten.

---

## SECTION 7: E2E Test File Finding

**File:** `apps/frontend/e2e/automation-flow.spec.ts` (lines 33, 52)

```typescript
await page.getByLabel(/correo/i).fill('rckrdmrd@gmail.com');
// ...
await page.getByLabel(/email/i).fill('rckrdmrd@gmail.com');
```

This E2E test uses `rckrdmrd@gmail.com` as a real user to register and log in during automated testing. It calls the registration API, which would create/re-create this user in whatever environment the test runs against. This is a **functional usage**, not just a documentation reference — the test deletes and re-creates the user via `runAutoGrade('delete')` / registration flow.

**Risk:** If this test runs against production, it will attempt to register `rckrdmrd@gmail.com` on the live server. The test infrastructure should ensure this only runs against local/staging.

---

## SECTION 8: Key Identity Information for rckrdmrd and adredsi26

### rckrdmrd@gmail.com

| Property | Value |
|----------|-------|
| Display name | `rckrDmrD` |
| Full name | `Adrian Flores Cortes` |
| Role | `student` |
| UUID (pre-init, ~2026-02-14) | `ac1ee88c-841a-4acd-a385-58410aa1b5bd` |
| UUID (post-Lote5, 2026-02-20) | `18b1659f-d150-4f26-bc5c-168ac1e2d438` |
| UUID (current prod, 2026-02-26 re-register) | `2c9af9ac-0229-4baf-bbe8-fc24fca3296d` |
| First registered | 2026-02-14 (pre-init backup) |
| Lost in DB recreate | Yes — attempted login 2026-02-24, got 401 "Usuario no encontrado" |
| Re-registered | 2026-02-26 15:13:08 UTC |
| Status in seeds | EXCLUDED from all seed files (dev, prod, staging) |
| Status in backups | Present in all 4 backup files (2 pre-init, 1 Lote5, 2 post-recreate) |

### adredsi26@gmail.com

| Property | Value |
|----------|-------|
| Full name | `Adrian Flores Cortes` |
| Role | `student` |
| UUID | `a6230bab-fac1-4436-a02e-1fbe342f14ce` |
| Registered | 2026-02-21 23:12:59 UTC |
| Status in seeds | NEVER present — not in any seed file |
| Status in backups | Present only in `gamilit_platform_20260228_210825.sql` (most recent backup) |
| School | `59dde6ac-9b81-4dfb-8b02-d38d32065348` (different from other users who use `99999999-...`) |
| Active missions | 4 (created automatically at registration, 2 expired, 2 in_progress) |

---

## SECTION 9: Actionable Findings Summary

| Priority | Finding | Recommendation |
|----------|---------|----------------|
| P1 (Documentation) | `02-production-users.sql` line 35: INSERT comment says "45 usuarios" | Update to "50 usuarios" |
| P1 (Documentation) | `02-production-users.sql` line 626: Section label says "6 usuarios" for Lote 3 | Update to "7 usuarios" |
| P2 (Inventory) | `SEEDS_INVENTORY.yml`: `registros_estimados: 45` for `02-production-users.sql` | Update to `50` |
| P2 (Inventory) | `SEEDS_INVENTORY.yml`: Lote 3 `cantidad: 6` | Update to `7` |
| P2 (Inventory) | `SEEDS_INVENTORY.yml`: "45 estudiantes reales" note | Update to "50" |
| P3 (Audit doc) | `SA-4A-SEED-DATA-ANALYSIS.md`: Incorrect claim rckrdmrd/adredsi26 in `01-demo-users.sql` | Note as stale/superseded |
| P3 (E2E) | `automation-flow.spec.ts`: Uses `rckrdmrd@gmail.com` for E2E registration | Confirm test cannot target production; consider using a dedicated test email |
| INFO | `rckrdmrd@gmail.com` UUID has changed 3 times (3 different registrations) | No seed action needed — excluded by design |
| INFO | `adredsi26@gmail.com` is absent from all seeds | No action needed — never was a seed user |

---

## FILES READ IN THIS ANALYSIS

- `apps/database/seeds/dev/auth/01-demo-users.sql`
- `apps/database/seeds/dev/auth/01b-demo-students.sql`
- `apps/database/seeds/dev/auth/02-production-users.sql`
- `apps/database/seeds/dev/auth_management/06-profiles-production.sql`
- `apps/database/seeds/dev/auth_management/07-profiles-production-additional.sql`
- `apps/database/backups/backup-nuevos-usuarios-20260220/03-production-users-20260220.sql`
- `apps/frontend/e2e/automation-flow.spec.ts`
- `orchestration/inventarios/SEEDS_INVENTORY.yml`
- `orchestration/tareas/TASK-2026-02-28-PROD-DB-AUDIT/SA-4A-SEED-DATA-ANALYSIS.md`
- Grep results across entire repo for: `rckrdmrd`, `adredsi26`, both UUIDs

---

*Report generated by SA-1A — RESEARCH ONLY, no files modified*
