# content_management - Indexes MAP

## Schema Overview
- **Schema**: `content_management`
- **Purpose**: Management of educational content and materials
- **Created**: 2025-10-27

## Indexes Directory Structure

```
content_management/
├── indexes/
│   ├── 01-idx_marie_content_grade_levels_gin.sql
│   ├── 02-idx_marie_content_keywords_gin.sql
│   └── _MAP.md (this file)
└── tables/
    ├── marie_curie_content.sql
    └── ...
```

## Indexes Implemented

### 1. idx_marie_content_grade_levels_gin
- **Type**: GIN Index
- **Table**: `content_management.marie_curie_content`
- **Column**: `target_grade_levels` (ARRAY)
- **Priority**: HIGH
- **Purpose**: Performance optimization for filtering content by grade levels
- **Created**: 2025-10-27
- **Use Cases**:
  - Find content for specific grade level: `WHERE target_grade_levels @> ARRAY[5]`
  - Filter by multiple grade levels: `WHERE target_grade_levels && ARRAY[3,4,5]`

**Syntax Validation**: ✅ Valid GIN Index syntax (USING GIN on ARRAY column)

---

### 2. idx_marie_content_keywords_gin
- **Type**: GIN Index
- **Table**: `content_management.marie_curie_content`
- **Column**: `keywords` (ARRAY)
- **Priority**: HIGH
- **Purpose**: Performance optimization for keyword-based content search
- **Created**: 2025-10-27
- **Use Cases**:
  - Search by keywords: `WHERE keywords @> ARRAY['science', 'physics']`
  - Find content with specific topics: `WHERE keywords && ARRAY['biology']`

**Syntax Validation**: ✅ Valid GIN Index syntax (USING GIN on ARRAY column)

---

## Total Indexes in Schema
- **2 GIN Indexes** for array columns
- **2 Index files** (SQL)

## Performance Impact
- Dramatically speeds up array containment queries (@> operator)
- Efficient for array overlap queries (&& operator)
- Recommended for SELECT queries with WHERE clause on array columns

## Dependencies
- PostgreSQL GIN index type must be available
- Target columns must be ARRAY or JSONB type

## Notes
- All indexes use `IF NOT EXISTS` to prevent conflicts during migration
- Indexes are created without transaction wrapper for idempotency
- Comments are added to each index for documentation
