/**
 * Validation Result Interface
 *
 * @description Interfaces for data quality validation results.
 * Used by the data quality validator to report validation outcomes.
 *
 * @module etl/interfaces
 * @since 2026-02-03
 */

/**
 * Validation Issue Severity
 */
export enum ValidationSeverity {
  /** Critical issue - record cannot be processed */
  ERROR = 'error',
  /** Warning - record can be processed with caveats */
  WARNING = 'warning',
  /** Informational - no action required */
  INFO = 'info',
}

/**
 * Validation Issue Category
 */
export enum ValidationCategory {
  /** Null or missing required value */
  NULL_VALUE = 'null_value',
  /** Invalid data type */
  TYPE_MISMATCH = 'type_mismatch',
  /** Value out of valid range */
  RANGE_VIOLATION = 'range_violation',
  /** Referential integrity violation */
  REFERENCE_INVALID = 'reference_invalid',
  /** Duplicate record detected */
  DUPLICATE = 'duplicate',
  /** Format validation failed */
  FORMAT_INVALID = 'format_invalid',
  /** Business rule violation */
  BUSINESS_RULE = 'business_rule',
}

/**
 * Validation Issue
 * @description Single validation issue found during data quality check
 */
export interface ValidationIssue {
  /** Field that failed validation */
  field: string;
  /** Severity of the issue */
  severity: ValidationSeverity;
  /** Category of validation failure */
  category: ValidationCategory;
  /** Human-readable message */
  message: string;
  /** Actual value that failed validation */
  actualValue: unknown;
  /** Expected value or constraint */
  expectedValue?: unknown;
  /** Row/record index (0-based) */
  rowIndex: number;
  /** Record identifier if available */
  recordId?: string;
}

/**
 * Field Validation Stats
 * @description Statistics for a single field across all records
 */
export interface FieldValidationStats {
  /** Field name */
  fieldName: string;
  /** Total records checked */
  totalRecords: number;
  /** Records with null values */
  nullCount: number;
  /** Percentage of null values */
  nullPercentage: number;
  /** Records with invalid type */
  typeMismatchCount: number;
  /** Records with out-of-range values */
  rangeViolationCount: number;
  /** Records passing all validations */
  validCount: number;
  /** Overall validity percentage */
  validPercentage: number;
}

/**
 * Duplicate Group
 * @description Group of duplicate records
 */
export interface DuplicateGroup {
  /** Key used for duplicate detection */
  duplicateKey: string;
  /** Indexes of duplicate records */
  recordIndexes: number[];
  /** Record IDs if available */
  recordIds: string[];
  /** Number of duplicates (including original) */
  count: number;
}

/**
 * Reference Check Result
 * @description Result of referential integrity check
 */
export interface ReferenceCheckResult {
  /** Field being checked */
  field: string;
  /** Referenced table */
  referencedTable: string;
  /** Total references checked */
  totalReferences: number;
  /** Valid references found */
  validReferences: number;
  /** Invalid/orphan references */
  orphanReferences: number;
  /** List of orphan IDs */
  orphanIds: string[];
}

/**
 * Validation Result
 * @description Complete result of data quality validation
 */
export interface ValidationResult {
  /** Overall validation passed (no errors, warnings allowed) */
  isValid: boolean;
  /** Total records validated */
  totalRecords: number;
  /** Records with no issues */
  validRecords: number;
  /** Records with errors (cannot be processed) */
  errorRecords: number;
  /** Records with warnings only */
  warningRecords: number;
  /** All validation issues found */
  issues: ValidationIssue[];
  /** Statistics by field */
  fieldStats: FieldValidationStats[];
  /** Duplicate groups found */
  duplicates: DuplicateGroup[];
  /** Reference check results */
  referenceChecks: ReferenceCheckResult[];
  /** Timestamp when validation completed */
  validatedAt: Date;
  /** Duration of validation in milliseconds */
  durationMs: number;
  /** Summary statistics */
  summary: ValidationSummary;
}

/**
 * Validation Summary
 * @description High-level summary of validation results
 */
export interface ValidationSummary {
  /** Total issues found */
  totalIssues: number;
  /** Issues by severity */
  issuesBySeverity: Record<ValidationSeverity, number>;
  /** Issues by category */
  issuesByCategory: Record<ValidationCategory, number>;
  /** Top problematic fields (by issue count) */
  topProblematicFields: Array<{ field: string; issueCount: number }>;
  /** Data quality score (0-100) */
  dataQualityScore: number;
  /** Recommendation for proceeding */
  recommendation: 'proceed' | 'review' | 'abort';
}

/**
 * Validation Rule
 * @description Definition of a validation rule
 */
export interface ValidationRule {
  /** Rule identifier */
  ruleId: string;
  /** Field to validate */
  field: string;
  /** Rule type */
  type: 'required' | 'type' | 'range' | 'regex' | 'reference' | 'custom';
  /** Rule parameters */
  params: Record<string, unknown>;
  /** Severity if rule fails */
  severity: ValidationSeverity;
  /** Error message template */
  messageTemplate: string;
}

/**
 * Validation Configuration
 * @description Configuration for data quality validator
 */
export interface ValidationConfig {
  /** Rules to apply */
  rules: ValidationRule[];
  /** Fields to check for duplicates */
  duplicateKeyFields: string[];
  /** Whether to stop on first error */
  failFast: boolean;
  /** Maximum errors before aborting */
  maxErrors: number;
  /** Reference tables for integrity checks */
  referenceTables: Record<string, string>;
}
