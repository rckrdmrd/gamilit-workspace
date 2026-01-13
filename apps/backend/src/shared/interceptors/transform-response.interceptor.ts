import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Transform Response Interceptor
 *
 * Normaliza todas las respuestas HTTP con el formato:
 * {
 *   success: boolean,
 *   data: any,
 *   timestamp: string,
 *   path: string
 * }
 *
 * También transforma strings ISO de fechas a objetos Date
 *
 * @version 1.1.0 - Fix circular reference handling (2026-01-13)
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  /**
   * Maximum depth for recursive transformation to prevent stack overflow
   */
  private static readonly MAX_DEPTH = 50;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    return next.handle().pipe(
      map((data) => {
        // Si es un stream de archivo, no transformar
        if (data instanceof Buffer || data?.isStream) {
          return data;
        }

        // Transformar fechas en el objeto con tracking de referencias circulares
        const visited = new WeakSet();
        const transformedData = this.transformDates(data, visited, 0);

        // Estructura de respuesta estándar
        return {
          success: true,
          data: transformedData,
          timestamp: new Date().toISOString(),
          path: url,
        };
      }),
    );
  }

  /**
   * Transforma recursivamente strings ISO a objetos Date
   *
   * @param obj - Object to transform
   * @param visited - WeakSet to track visited objects (circular reference detection)
   * @param depth - Current recursion depth
   * @returns Transformed object
   *
   * @version 1.1.0 - Added circular reference detection and depth limit
   */
  private transformDates(obj: any, visited: WeakSet<object>, depth: number): any {
    // Safety: prevent stack overflow with depth limit
    if (depth > TransformResponseInterceptor.MAX_DEPTH) {
      return obj;
    }

    if (obj === null || obj === undefined) {
      return obj;
    }

    // Si es un string de fecha ISO, convertir a Date
    if (typeof obj === 'string' && this.isISODateString(obj)) {
      return new Date(obj);
    }

    // Si ya es un objeto Date, retornar sin cambios
    if (obj instanceof Date) {
      return obj;
    }

    // Si es un array, transformar cada elemento
    if (Array.isArray(obj)) {
      return obj.map((item) => this.transformDates(item, visited, depth + 1));
    }

    // Si es un objeto, verificar referencias circulares
    if (typeof obj === 'object') {
      // Detectar referencia circular
      if (visited.has(obj)) {
        // Retornar placeholder para evitar recursión infinita
        return '[Circular Reference]';
      }

      // Marcar objeto como visitado
      visited.add(obj);

      const transformed: Record<string, unknown> = {};
      for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
          transformed[key] = this.transformDates(obj[key], visited, depth + 1);
        }
      }
      return transformed;
    }

    return obj;
  }

  /**
   * Verifica si un string es una fecha ISO válida
   */
  private isISODateString(value: string): boolean {
    // Regex para formato ISO 8601
    const isoDateRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?(?:Z|[+-]\d{2}:\d{2})?$/;

    if (!isoDateRegex.test(value)) {
      return false;
    }

    // Verificar que sea una fecha válida
    const date = new Date(value);
    return !isNaN(date.getTime());
  }
}

/**
 * Tipo de respuesta estándar
 */
export interface StandardResponse<T = any> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}
