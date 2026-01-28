/**
 * ParentAuthGuard
 *
 * EXT-011 Parent Portal - Authentication Guard
 *
 * @description Guard to protect parent portal routes.
 * Validates JWT token and ensures the user has a valid parent account.
 *
 * @see ET-PAR-001-parent-authentication.md
 * @created 2026-01-27
 */

import {
  Injectable,
  ExecutionContext,
  UnauthorizedException,
  CanActivate,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParentAccount } from '@/modules/auth/entities/parent-account.entity';
import { Profile } from '@/modules/auth/entities/profile.entity';
import { ConfigService } from '@nestjs/config';

export interface ParentJwtPayload {
  sub: string; // profile_id
  email: string;
  parentAccountId: string;
  type: 'parent';
  iat: number;
  exp: number;
}

export interface AuthenticatedParentRequest extends Request {
  parentAccount: ParentAccount;
  profile: Profile;
  parentJwt: ParentJwtPayload;
}

@Injectable()
export class ParentAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    @InjectRepository(ParentAccount, 'auth')
    private readonly parentAccountRepo: Repository<ParentAccount>,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepo: Repository<Profile>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token de autenticacion no proporcionado');
    }

    try {
      const payload = await this.jwtService.verifyAsync<ParentJwtPayload>(token, {
        secret: this.configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
      });

      // Verify this is a parent token
      if (payload.type !== 'parent') {
        throw new UnauthorizedException('Token invalido para el portal de padres');
      }

      // Get parent account
      const parentAccount = await this.parentAccountRepo.findOne({
        where: {
          id: payload.parentAccountId,
          isActive: true,
        },
      });

      if (!parentAccount) {
        throw new UnauthorizedException('Cuenta de padre no encontrada o inactiva');
      }

      // Get profile
      const profile = await this.profileRepo.findOne({
        where: { id: payload.sub },
      });

      if (!profile) {
        throw new UnauthorizedException('Perfil no encontrado');
      }

      // Attach to request
      request.parentAccount = parentAccount;
      request.profile = profile;
      request.parentJwt = payload;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token invalido o expirado');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const authHeader = request.headers?.authorization;
    if (!authHeader) {
      return undefined;
    }

    const [type, token] = authHeader.split(' ');
    return type === 'Bearer' ? token : undefined;
  }
}
