import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import type { ParsedQs } from 'qs';
import type { ParamsDictionary } from 'express-serve-static-core';

@Injectable()
export class SanitizationMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    // Sanitize body
    if (req.body) {
      req.body = this.sanitizeObject(req.body);
    }

    // Sanitize query params
    if (req.query) {
      req.query = this.sanitizeObject(req.query) as ParsedQs;
    }

    // Sanitize params
    if (req.params) {
      req.params = this.sanitizeObject(req.params) as ParamsDictionary;
    }

    next();
  }

  private sanitizeObject(obj: unknown): unknown {
    if (typeof obj !== 'object' || obj === null) {
      return this.sanitizeString(obj);
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitizeObject(item));
    }

    const sanitized: Record<string, unknown> = {};
    for (const key in obj as Record<string, unknown>) {
      if (Object.prototype.hasOwnProperty.call(obj, key)) {
        sanitized[key] = this.sanitizeObject((obj as Record<string, unknown>)[key]);
      }
    }
    return sanitized;
  }

  private sanitizeString(value: unknown): unknown {
    if (typeof value !== 'string') {
      return value;
    }

    // Remove potential XSS patterns
    return value
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '')
      .replace(/<embed[^>]*>/gi, '')
      .replace(/<object[^>]*>/gi, '');
  }
}
