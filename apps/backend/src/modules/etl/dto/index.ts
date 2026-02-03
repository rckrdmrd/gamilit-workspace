/**
 * ETL DTOs - Barrel Export
 *
 * @description Central export for all ETL module DTOs
 * @module etl/dto
 * @version 1.2.0
 * @since Sprint 2.2 - ETL Pipeline Extraction
 * @updated Sprint 2.4 - ETL Pipeline Load
 */

// Extraction DTOs (Sprint 2.2)
export {
  ExtractionMode,
  ExtractorType,
  TriggerExtractionDto,
  ExtractionQueryDto,
} from './extraction-config.dto';

export {
  ExtractorStatusDto,
  ExtractionRunStatusDto,
  ExtractionHistoryItemDto,
  ExtractionOverviewDto,
  TriggerExtractionResponseDto,
  ExtractionHistoryResponseDto,
} from './extraction-status.dto';

// Transformation DTOs (Sprint 2.3)
export * from './transformation-config.dto';
export * from './transformation-status.dto';

// Load DTOs (Sprint 2.4)
export * from './load-config.dto';
export * from './load-status.dto';
