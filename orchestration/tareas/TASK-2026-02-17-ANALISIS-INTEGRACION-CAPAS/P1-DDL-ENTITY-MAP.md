# P1 DDL-Entity Bidirectional Cross-Reference Report

**Date:** 2026-02-17 | **Status:** Complete — 100% Coherence

## Summary

| Metric | Count |
|--------|-------|
| DDL tables (all schemas) | **169** |
| DDL tables (active, excl data_warehouse) | **153** |
| DDL tables (data_warehouse, DDL-only) | **16** |
| Entity @Entity classes | **153** |
| **MATCHED** | **153/153 = 100%** |
| **MISSING_ENTITY** | **0** |
| **MISSING_DDL** | **0** |
| **NAME_MISMATCH** | **0** |

## Schema Breakdown

| Schema | DDL | Entities | Gap |
|--------|-----|----------|-----|
| `auth` | 1 | 1 | 0 |
| `auth_management` | 17 | 17 | 0 |
| `educational_content` | 21 | 21 | 0 |
| `gamification_system` | 20 | 20 | 0 |
| `progress_tracking` | 21 | 21 | 0 |
| `social_features` | 30 | 30 | 0 |
| `content_management` | 10 | 10 | 0 |
| `audit_logging` | 7 | 7 | 0 |
| `notifications` | 7 | 7 | 0 |
| `admin_dashboard` | 3 | 3 | 0 |
| `system_configuration` | 9 | 9 | 0 |
| `lti_integration` | 3 | 3 | 0 |
| `communication` | 4 | 4 | 0 |
| `data_warehouse` | 16 | 0 | 16 (DDL-only, intentional) |

## Key Findings

1. **Cross-schema DDL tables** in `_cross_schema/` subdirectories: classroom_modules, media_attachments, classroom_missions, comodin_uses, learning_path_modules — all have entities
2. **2 entities use hardcoded strings** instead of DB_TABLES constants (guild-mission, user-skill-rating) — values are correct
3. **database.constants.ts** serves as effective SSOT — 21 FIX H-016 corrections previously applied

## Verdict

DDL-Entity mapping is **100% coherent**. No action required.
