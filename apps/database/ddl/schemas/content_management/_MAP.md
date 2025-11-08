# Content Management Schema - Table Map

## Overview
The `content_management` schema handles all content-related operations, including templates, media files, content versions, and flagged content moderation.

**Total Tables: 5**

## Tables

| # | Filename | Table Name | Description | Status |
|---|----------|-----------|-------------|--------|
| 1 | `01-content_templates.sql` | `content_templates` | Content templates for creating structured content | Active |
| 2 | `02-marie_curie_content.sql` | `marie_curie_content` | Marie Curie content library | Active |
| 3 | `03-media_files.sql` | `media_files` | Media file library for content management | Active |
| 4 | `04-content_versions.sql` | `content_versions` | Version control for content (exercises, modules, etc.) | New |
| 5 | `05-flagged_content.sql` | `flagged_content` | Content flagged for moderation review | New |

## Implementation Notes

### New Tables (Latest)
- **content_versions**: Provides version control and change tracking for educational content
- **flagged_content**: Manages content moderation workflow with status tracking and reviewer assignment

### Schema Dependencies
- References `auth_management.tenants` for multi-tenancy
- References `auth_management.profiles` for user tracking
- References `auth.users` for content reporters and reviewers

### Indexes
All tables include appropriate indexes for:
- Tenant isolation
- User references
- Timestamp searches
- Status/priority filtering
- JSONB metadata searches (GIN indexes where applicable)

## Last Updated
2025-11-02 - Added content_versions and flagged_content tables
