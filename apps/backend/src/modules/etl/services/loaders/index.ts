/**
 * ETL Loaders - Barrel Export
 *
 * @description Exports all loader services and types
 * @module ETL/Loaders
 * @see TASK-2026-02-03 Sprint 2.4 - ETL Pipeline Carga
 */

// Base loader classes
export { LoaderBaseService } from './loader-base.service';
export {
  FactLoaderService,
  DimensionReference,
} from './fact-loader.service';
export {
  DimensionLoaderService,
  SCD2Config,
  DEFAULT_SCD2_CONFIG,
} from './dimension-loader.service';

// Specific loaders
export * from './loaders';
