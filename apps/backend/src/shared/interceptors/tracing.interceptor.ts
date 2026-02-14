/**
 * Tracing Interceptor
 *
 * Creates OpenTelemetry spans for each HTTP request with custom attributes.
 * Works alongside auto-instrumentation to add NestJS-specific context.
 *
 * @ref GUIA-OPENTELEMETRY-NESTJS §4
 */

import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { trace, SpanStatusCode, context } from '@opentelemetry/api';
import { correlationStorage } from '../utils/logger.util';
import * as crypto from 'crypto';

const tracer = trace.getTracer('gamilit-backend');

@Injectable()
export class TracingInterceptor implements NestInterceptor {
  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request = ctx.switchToHttp().getRequest();
    const handler = ctx.getHandler().name;
    const controller = ctx.getClass().name;

    // Generate or extract correlation ID
    const correlationId =
      request.headers['x-correlation-id'] ||
      request.headers['traceparent']?.split('-')[1] ||
      crypto.randomUUID();

    // Attach correlation ID to request for downstream use
    request.correlationId = correlationId;

    // Set correlation ID in AsyncLocalStorage for logger
    return new Observable((subscriber) => {
      correlationStorage.run({ correlationId }, () => {
        const span = tracer.startSpan(`${controller}.${handler}`, {
          attributes: {
            'http.method': request.method,
            'http.route': request.route?.path || request.url,
            'http.url': request.url,
            'nestjs.controller': controller,
            'nestjs.handler': handler,
            'user.id': request.user?.id || 'anonymous',
            'tenant.id': request.user?.tenant_id || 'unknown',
          },
        });

        const activeContext = trace.setSpan(context.active(), span);

        context.with(activeContext, () => {
          next.handle().pipe(
            tap({
              next: () => {
                span.setStatus({ code: SpanStatusCode.OK });
                span.end();
              },
              error: (error) => {
                span.setStatus({
                  code: SpanStatusCode.ERROR,
                  message: error.message,
                });
                span.setAttribute('error.type', error.constructor?.name || 'Error');
                span.end();
              },
            }),
          ).subscribe(subscriber);
        });
      });
    });
  }
}
