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
 */
@Injectable()
export class TransformResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = context.switchToHttp().getRequest();
    const { url } = request;

    return next.handle().pipe(
      map((data) => {
        // Si es un stream de archivo, no transformar
        if (data instanceof Buffer || data?.isStream) {
          return data;
        }

        // Transformar fechas en el objeto
        const transformedData = this.transformDates(data, new WeakSet());

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
   * Transforma recursivamente strings ISO a objetos Date.
   * Usa WeakSet para detectar referencias circulares y evitar recursion infinita.
   */
  private transformDates(obj: unknown, visited: WeakSet<object>): unknown {
    if (obj === null || obj === undefined) {
      return obj;
    }

    // Si es un string de fecha ISO, convertir a Date
    if (typeof obj === 'string' && this.isISODateString(obj)) {
      return new Date(obj);
    }

    // Si es un array, transformar cada elemento
    if (Array.isArray(obj)) {
      if (visited.has(obj)) return obj;
      visited.add(obj);
      return obj.map((item) => this.transformDates(item, visited));
    }

    // Si es un objeto, transformar cada propiedad
    if (typeof obj === 'object') {
      if (visited.has(obj)) return obj;
      visited.add(obj);
      const transformed: Record<string, unknown> = {};
      const objRecord = obj as Record<string, unknown>;
      for (const key in objRecord) {
        if (Object.prototype.hasOwnProperty.call(objRecord, key)) {
          transformed[key] = this.transformDates(objRecord[key], visited);
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
export interface StandardResponse<T = unknown> {
  success: boolean;
  data: T;
  timestamp: string;
  path: string;
}
