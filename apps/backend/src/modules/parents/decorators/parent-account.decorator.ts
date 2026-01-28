/**
 * ParentAccount Decorator
 *
 * EXT-011 Parent Portal - Request Decorator
 *
 * @description Extracts ParentAccount from authenticated request.
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ParentAccount } from '@/modules/auth/entities/parent-account.entity';

/**
 * Extracts the ParentAccount from the request.
 * Must be used with ParentAuthGuard.
 *
 * @example
 * ```typescript
 * @Get('dashboard')
 * @UseGuards(ParentAuthGuard)
 * async getDashboard(@ParentAccountParam() parent: ParentAccount) {
 *   return this.dashboardService.getDashboard(parent.id);
 * }
 * ```
 */
export const ParentAccountParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): ParentAccount => {
    const request = ctx.switchToHttp().getRequest();
    return request.parentAccount;
  },
);

/**
 * Extracts the parent's profile ID from the request.
 */
export const ParentProfileId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.parentJwt?.sub;
  },
);

/**
 * Extracts the parent account ID from the request.
 */
export const ParentAccountId = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request.parentAccount?.id;
  },
);
