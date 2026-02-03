/**
 * Model Ready Guard
 *
 * @description Guard that checks if the required ML model is loaded and ready
 * for predictions before allowing the request to proceed.
 *
 * Returns 503 Service Unavailable if model is not ready, with retry-after header.
 *
 * @module ml/guards
 * @sprint 3.3 - ML Prediction API
 * @created 2026-02-03
 */

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ServiceUnavailableException,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request, Response } from 'express';

/**
 * Model type metadata key
 */
export const MODEL_TYPE_KEY = 'model_type';

/**
 * Decorator to specify required model type for an endpoint
 *
 * @param modelType - The model type required for this endpoint
 */
export const RequiresModel = (modelType: string) =>
  Reflect.metadata(MODEL_TYPE_KEY, modelType);

/**
 * Model status storage (in-memory for simplicity)
 * In production, this would be backed by Redis or a database
 */
interface ModelStatus {
  isReady: boolean;
  lastChecked: Date;
  version: string;
  error?: string;
}

const modelStatuses: Map<string, ModelStatus> = new Map([
  ['dropout_risk', { isReady: true, lastChecked: new Date(), version: '3.3.0' }],
  ['performance', { isReady: true, lastChecked: new Date(), version: '3.3.0' }],
  ['difficulty', { isReady: true, lastChecked: new Date(), version: '3.3.0' }],
  ['engagement', { isReady: true, lastChecked: new Date(), version: '3.3.0' }],
]);

@Injectable()
export class ModelReadyGuard implements CanActivate {
  private readonly logger = new Logger(ModelReadyGuard.name);

  /** Default retry delay in seconds */
  private readonly DEFAULT_RETRY_AFTER = 30;

  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // Get the required model type from decorator
    const modelType = this.reflector.getAllAndOverride<string>(MODEL_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no model type specified, allow the request
    if (!modelType) {
      return true;
    }

    // Check if model is ready
    const status = modelStatuses.get(modelType);

    if (!status) {
      this.logger.warn(`Unknown model type requested: ${modelType}`);
      throw new ServiceUnavailableException({
        statusCode: 503,
        message: `ML model '${modelType}' is not available`,
        error: 'Service Unavailable',
        retryAfter: this.DEFAULT_RETRY_AFTER,
      });
    }

    if (!status.isReady) {
      this.logger.warn(`Model ${modelType} is not ready: ${status.error || 'Unknown reason'}`);

      // Set retry-after header on response
      const response = context.switchToHttp().getResponse<Response>();
      response.setHeader('Retry-After', this.DEFAULT_RETRY_AFTER.toString());

      throw new ServiceUnavailableException({
        statusCode: 503,
        message: `ML model '${modelType}' is currently unavailable. Please try again later.`,
        error: 'Service Unavailable',
        modelType,
        modelVersion: status.version,
        retryAfter: this.DEFAULT_RETRY_AFTER,
        lastChecked: status.lastChecked,
      });
    }

    this.logger.debug(`Model ${modelType} is ready (v${status.version})`);
    return true;
  }

  /**
   * Set model status (for use by admin endpoints)
   */
  static setModelStatus(modelType: string, isReady: boolean, error?: string): void {
    const existing = modelStatuses.get(modelType);
    modelStatuses.set(modelType, {
      isReady,
      lastChecked: new Date(),
      version: existing?.version || '0.0.0',
      error,
    });
  }

  /**
   * Get model status
   */
  static getModelStatus(modelType: string): ModelStatus | undefined {
    return modelStatuses.get(modelType);
  }

  /**
   * Get all model statuses
   */
  static getAllModelStatuses(): Map<string, ModelStatus> {
    return new Map(modelStatuses);
  }
}
