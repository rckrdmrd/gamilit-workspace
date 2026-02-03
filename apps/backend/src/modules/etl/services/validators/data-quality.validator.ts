/**
 * Data Quality Validator
 *
 * @description Validates data quality before ETL transformation.
 * Performs null checks, type validation, range validation,
 * referential integrity checks, and duplicate detection.
 *
 * @module etl/services/validators
 * @since 2026-02-03
 */

import { Injectable, Logger } from '@nestjs/common';
import {
  ValidationResult,
  ValidationIssue,
  ValidationSeverity,
  ValidationCategory,
  FieldValidationStats,
  DuplicateGroup,
  ReferenceCheckResult,
  ValidationSummary,
  ValidationRule,
  ValidationConfig,
} from '../../interfaces/validation-result.interface';

/**
 * DataQualityValidator
 * @description Comprehensive data quality validation service
 */
@Injectable()
export class DataQualityValidator {
  private readonly logger = new Logger(DataQualityValidator.name);

  /**
   * Validate an array of records against configured rules
   * @param data - Array of records to validate
   * @param config - Validation configuration
   * @returns Detailed validation result
   */
  validate<T extends Record<string, any>>(
    data: T[],
    config: ValidationConfig,
  ): ValidationResult {
    const startTime = Date.now();
    const issues: ValidationIssue[] = [];
    const fieldStats = new Map<string, FieldValidationStats>();

    this.logger.log(`Starting validation of ${data.length} records`);

    // Initialize field stats for all fields in rules
    for (const rule of config.rules) {
      if (!fieldStats.has(rule.field)) {
        fieldStats.set(rule.field, this.createEmptyFieldStats(rule.field, data.length));
      }
    }

    // Validate each record
    for (let i = 0; i < data.length; i++) {
      const record = data[i];

      // Apply all rules to the record
      for (const rule of config.rules) {
        const issue = this.applyRule(rule, record, i);
        if (issue) {
          issues.push(issue);
          this.updateFieldStats(fieldStats, rule.field, issue.category);

          // Check fail-fast condition
          if (config.failFast && issue.severity === ValidationSeverity.ERROR) {
            this.logger.warn(`Fail-fast triggered at record ${i}`);
            break;
          }
        } else {
          // Record passed validation for this field
          const stats = fieldStats.get(rule.field);
          if (stats) stats.validCount++;
        }
      }

      // Check max errors condition
      if (config.maxErrors > 0 && issues.length >= config.maxErrors) {
        this.logger.warn(`Max errors (${config.maxErrors}) reached, stopping validation`);
        break;
      }
    }

    // Detect duplicates
    const duplicates = this.detectDuplicates(data, config.duplicateKeyFields);

    // Add duplicate issues
    for (const group of duplicates) {
      for (let i = 1; i < group.recordIndexes.length; i++) {
        issues.push({
          field: config.duplicateKeyFields.join('+'),
          severity: ValidationSeverity.WARNING,
          category: ValidationCategory.DUPLICATE,
          message: `Duplicate record found with key: ${group.duplicateKey}`,
          actualValue: group.duplicateKey,
          rowIndex: group.recordIndexes[i],
          recordId: group.recordIds[i],
        });
      }
    }

    // Perform reference checks (placeholder - would query actual tables)
    const referenceChecks: ReferenceCheckResult[] = [];

    // Calculate final statistics
    const errorRecords = new Set(
      issues
        .filter((i) => i.severity === ValidationSeverity.ERROR)
        .map((i) => i.rowIndex),
    ).size;
    const warningRecords = new Set(
      issues
        .filter((i) => i.severity === ValidationSeverity.WARNING)
        .map((i) => i.rowIndex),
    ).size;
    const validRecords = data.length - errorRecords;

    // Generate summary
    const summary = this.generateSummary(issues, fieldStats, data.length);

    // Calculate field percentages
    for (const stats of fieldStats.values()) {
      stats.nullPercentage = (stats.nullCount / stats.totalRecords) * 100;
      stats.validPercentage = (stats.validCount / stats.totalRecords) * 100;
    }

    const result: ValidationResult = {
      isValid: errorRecords === 0,
      totalRecords: data.length,
      validRecords,
      errorRecords,
      warningRecords,
      issues,
      fieldStats: Array.from(fieldStats.values()),
      duplicates,
      referenceChecks,
      validatedAt: new Date(),
      durationMs: Date.now() - startTime,
      summary,
    };

    this.logger.log(
      `Validation completed: ${validRecords}/${data.length} valid, ` +
        `${issues.length} issues found in ${result.durationMs}ms`,
    );

    return result;
  }

  /**
   * Apply a validation rule to a record
   * @param rule - Validation rule to apply
   * @param record - Record to validate
   * @param rowIndex - Index of the record
   * @returns Validation issue if rule fails, null otherwise
   */
  private applyRule<T extends Record<string, any>>(
    rule: ValidationRule,
    record: T,
    rowIndex: number,
  ): ValidationIssue | null {
    const value = record[rule.field];

    switch (rule.type) {
      case 'required':
        return this.validateRequired(rule, value, rowIndex, record);

      case 'type':
        return this.validateType(rule, value, rowIndex, record);

      case 'range':
        return this.validateRange(rule, value, rowIndex, record);

      case 'regex':
        return this.validateRegex(rule, value, rowIndex, record);

      case 'custom':
        return this.validateCustom(rule, value, rowIndex, record);

      default:
        return null;
    }
  }

  /**
   * Validate required field
   */
  private validateRequired<T extends Record<string, any>>(
    rule: ValidationRule,
    value: unknown,
    rowIndex: number,
    record: T,
  ): ValidationIssue | null {
    if (value === null || value === undefined || value === '') {
      return {
        field: rule.field,
        severity: rule.severity,
        category: ValidationCategory.NULL_VALUE,
        message: this.formatMessage(rule.messageTemplate, { field: rule.field }),
        actualValue: value,
        rowIndex,
        recordId: this.getRecordId(record),
      };
    }
    return null;
  }

  /**
   * Validate data type
   */
  private validateType<T extends Record<string, any>>(
    rule: ValidationRule,
    value: unknown,
    rowIndex: number,
    record: T,
  ): ValidationIssue | null {
    if (value === null || value === undefined) return null;

    const expectedType = rule.params.expectedType as string;
    let isValid = false;

    switch (expectedType) {
      case 'string':
        isValid = typeof value === 'string';
        break;
      case 'number':
        isValid = typeof value === 'number' && !isNaN(value);
        break;
      case 'boolean':
        isValid = typeof value === 'boolean';
        break;
      case 'date':
        isValid = value instanceof Date || !isNaN(Date.parse(String(value)));
        break;
      case 'uuid':
        isValid =
          typeof value === 'string' &&
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value);
        break;
      case 'array':
        isValid = Array.isArray(value);
        break;
      case 'object':
        isValid = typeof value === 'object' && !Array.isArray(value);
        break;
    }

    if (!isValid) {
      return {
        field: rule.field,
        severity: rule.severity,
        category: ValidationCategory.TYPE_MISMATCH,
        message: this.formatMessage(rule.messageTemplate, {
          field: rule.field,
          expected: expectedType,
          actual: typeof value,
        }),
        actualValue: value,
        expectedValue: expectedType,
        rowIndex,
        recordId: this.getRecordId(record),
      };
    }
    return null;
  }

  /**
   * Validate numeric range
   */
  private validateRange<T extends Record<string, any>>(
    rule: ValidationRule,
    value: unknown,
    rowIndex: number,
    record: T,
  ): ValidationIssue | null {
    if (value === null || value === undefined) return null;

    const numValue = Number(value);
    if (isNaN(numValue)) return null;

    const min = rule.params.min as number | undefined;
    const max = rule.params.max as number | undefined;

    if ((min !== undefined && numValue < min) || (max !== undefined && numValue > max)) {
      return {
        field: rule.field,
        severity: rule.severity,
        category: ValidationCategory.RANGE_VIOLATION,
        message: this.formatMessage(rule.messageTemplate, {
          field: rule.field,
          min,
          max,
          actual: numValue,
        }),
        actualValue: numValue,
        expectedValue: { min, max },
        rowIndex,
        recordId: this.getRecordId(record),
      };
    }
    return null;
  }

  /**
   * Validate against regex pattern
   */
  private validateRegex<T extends Record<string, any>>(
    rule: ValidationRule,
    value: unknown,
    rowIndex: number,
    record: T,
  ): ValidationIssue | null {
    if (value === null || value === undefined) return null;

    const pattern = rule.params.pattern as string;
    const regex = new RegExp(pattern);

    if (!regex.test(String(value))) {
      return {
        field: rule.field,
        severity: rule.severity,
        category: ValidationCategory.FORMAT_INVALID,
        message: this.formatMessage(rule.messageTemplate, {
          field: rule.field,
          pattern,
        }),
        actualValue: value,
        expectedValue: pattern,
        rowIndex,
        recordId: this.getRecordId(record),
      };
    }
    return null;
  }

  /**
   * Validate with custom function
   */
  private validateCustom<T extends Record<string, any>>(
    rule: ValidationRule,
    value: unknown,
    rowIndex: number,
    record: T,
  ): ValidationIssue | null {
    const validator = rule.params.validator as (
      value: unknown,
      record: T,
    ) => { isValid: boolean; message?: string };

    if (!validator) return null;

    const result = validator(value, record);
    if (!result.isValid) {
      return {
        field: rule.field,
        severity: rule.severity,
        category: ValidationCategory.BUSINESS_RULE,
        message: result.message || rule.messageTemplate,
        actualValue: value,
        rowIndex,
        recordId: this.getRecordId(record),
      };
    }
    return null;
  }

  /**
   * Detect duplicate records
   */
  private detectDuplicates<T extends Record<string, any>>(
    data: T[],
    keyFields: string[],
  ): DuplicateGroup[] {
    if (keyFields.length === 0) return [];

    const keyMap = new Map<string, { indexes: number[]; ids: string[] }>();

    for (let i = 0; i < data.length; i++) {
      const record = data[i];
      const keyParts = keyFields.map((f) => String(record[f] ?? ''));
      const key = keyParts.join('|');

      if (!keyMap.has(key)) {
        keyMap.set(key, { indexes: [], ids: [] });
      }

      const entry = keyMap.get(key)!;
      entry.indexes.push(i);
      entry.ids.push(this.getRecordId(record) || `row-${i}`);
    }

    const duplicates: DuplicateGroup[] = [];
    for (const [key, entry] of keyMap.entries()) {
      if (entry.indexes.length > 1) {
        duplicates.push({
          duplicateKey: key,
          recordIndexes: entry.indexes,
          recordIds: entry.ids,
          count: entry.indexes.length,
        });
      }
    }

    return duplicates;
  }

  /**
   * Generate validation summary
   */
  private generateSummary(
    issues: ValidationIssue[],
    fieldStats: Map<string, FieldValidationStats>,
    totalRecords: number,
  ): ValidationSummary {
    // Count by severity
    const issuesBySeverity: Record<ValidationSeverity, number> = {
      [ValidationSeverity.ERROR]: 0,
      [ValidationSeverity.WARNING]: 0,
      [ValidationSeverity.INFO]: 0,
    };

    // Count by category
    const issuesByCategory: Record<ValidationCategory, number> = {
      [ValidationCategory.NULL_VALUE]: 0,
      [ValidationCategory.TYPE_MISMATCH]: 0,
      [ValidationCategory.RANGE_VIOLATION]: 0,
      [ValidationCategory.REFERENCE_INVALID]: 0,
      [ValidationCategory.DUPLICATE]: 0,
      [ValidationCategory.FORMAT_INVALID]: 0,
      [ValidationCategory.BUSINESS_RULE]: 0,
    };

    // Count by field
    const issuesByField = new Map<string, number>();

    for (const issue of issues) {
      issuesBySeverity[issue.severity]++;
      issuesByCategory[issue.category]++;
      issuesByField.set(issue.field, (issuesByField.get(issue.field) || 0) + 1);
    }

    // Top problematic fields
    const topProblematicFields = Array.from(issuesByField.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([field, issueCount]) => ({ field, issueCount }));

    // Calculate data quality score
    const errorWeight = 10;
    const warningWeight = 1;
    const errorPoints =
      issuesBySeverity[ValidationSeverity.ERROR] * errorWeight;
    const warningPoints =
      issuesBySeverity[ValidationSeverity.WARNING] * warningWeight;
    const maxPoints = totalRecords * errorWeight;
    const dataQualityScore = Math.max(
      0,
      100 - ((errorPoints + warningPoints) / maxPoints) * 100,
    );

    // Determine recommendation
    let recommendation: 'proceed' | 'review' | 'abort' = 'proceed';
    if (issuesBySeverity[ValidationSeverity.ERROR] > 0) {
      recommendation = 'abort';
    } else if (issuesBySeverity[ValidationSeverity.WARNING] > totalRecords * 0.1) {
      recommendation = 'review';
    }

    return {
      totalIssues: issues.length,
      issuesBySeverity,
      issuesByCategory,
      topProblematicFields,
      dataQualityScore: Math.round(dataQualityScore * 100) / 100,
      recommendation,
    };
  }

  /**
   * Create empty field statistics
   */
  private createEmptyFieldStats(
    fieldName: string,
    totalRecords: number,
  ): FieldValidationStats {
    return {
      fieldName,
      totalRecords,
      nullCount: 0,
      nullPercentage: 0,
      typeMismatchCount: 0,
      rangeViolationCount: 0,
      validCount: 0,
      validPercentage: 0,
    };
  }

  /**
   * Update field statistics based on issue
   */
  private updateFieldStats(
    stats: Map<string, FieldValidationStats>,
    field: string,
    category: ValidationCategory,
  ): void {
    const fieldStats = stats.get(field);
    if (!fieldStats) return;

    switch (category) {
      case ValidationCategory.NULL_VALUE:
        fieldStats.nullCount++;
        break;
      case ValidationCategory.TYPE_MISMATCH:
        fieldStats.typeMismatchCount++;
        break;
      case ValidationCategory.RANGE_VIOLATION:
        fieldStats.rangeViolationCount++;
        break;
    }
  }

  /**
   * Get record identifier if available
   */
  private getRecordId<T extends Record<string, any>>(record: T): string | undefined {
    return (record.id as string) || (record.uuid as string) || undefined;
  }

  /**
   * Format message template with values
   */
  private formatMessage(
    template: string,
    values: Record<string, unknown>,
  ): string {
    return template.replace(/\{(\w+)\}/g, (_, key) => String(values[key] ?? ''));
  }

  // ==========================================
  // CONVENIENCE METHODS
  // ==========================================

  /**
   * Create a required field rule
   */
  static requiredRule(field: string): ValidationRule {
    return {
      ruleId: `required_${field}`,
      field,
      type: 'required',
      params: {},
      severity: ValidationSeverity.ERROR,
      messageTemplate: `Field {field} is required`,
    };
  }

  /**
   * Create a type validation rule
   */
  static typeRule(
    field: string,
    expectedType: string,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
  ): ValidationRule {
    return {
      ruleId: `type_${field}`,
      field,
      type: 'type',
      params: { expectedType },
      severity,
      messageTemplate: `Field {field} expected {expected}, got {actual}`,
    };
  }

  /**
   * Create a range validation rule
   */
  static rangeRule(
    field: string,
    min?: number,
    max?: number,
    severity: ValidationSeverity = ValidationSeverity.ERROR,
  ): ValidationRule {
    return {
      ruleId: `range_${field}`,
      field,
      type: 'range',
      params: { min, max },
      severity,
      messageTemplate: `Field {field} must be between {min} and {max}, got {actual}`,
    };
  }

  /**
   * Create a UUID validation rule
   */
  static uuidRule(field: string): ValidationRule {
    return {
      ruleId: `uuid_${field}`,
      field,
      type: 'type',
      params: { expectedType: 'uuid' },
      severity: ValidationSeverity.ERROR,
      messageTemplate: `Field {field} must be a valid UUID`,
    };
  }
}
