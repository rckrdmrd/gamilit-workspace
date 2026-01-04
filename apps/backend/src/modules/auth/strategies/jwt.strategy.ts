import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Profile, User } from '../entities';

/**
 * JwtStrategy
 *
 * @description Estrategia de autenticación JWT con Passport.
 *
 * @flow
 * 1. Extrae token del header Authorization Bearer
 * 2. Valida token con secret
 * 3. Ejecuta validate() con payload decodificado
 * 4. Retorna user que se anexa a req.user
 *
 * @important DB-125: JWT sub contiene profile.id (NO auth.users.id)
 * Esto es consistente con las FKs de gamification/progress que apuntan a profiles.id
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(Profile, 'auth')
    private readonly profileRepository: Repository<Profile>,
    @InjectRepository(User, 'auth')
    private readonly userRepository: Repository<User>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET') || 'dev-secret-change-in-production',
    });
  }

  /**
   * Validar payload del JWT
   *
   * @param payload - { sub: profileId, email, role, iat, exp }
   * @returns User data para req.user
   *
   * @important DB-125: payload.sub es profile.id, NO user.id
   * - Primero buscamos el profile por payload.sub
   * - Luego validamos el user asociado (profile.user_id -> auth.users.id)
   * - Retornamos profile.id como id/sub para consistencia con FKs de gamification
   */
  async validate(payload: any) {
    const { sub: profileId } = payload;

    // DB-125: Buscar profile primero (sub = profile.id)
    const profile = await this.profileRepository.findOne({
      where: { id: profileId },
    });

    if (!profile) {
      throw new UnauthorizedException('Perfil no encontrado');
    }

    // Validar que el user asociado exista y esté activo
    if (!profile.user_id) {
      throw new UnauthorizedException('Perfil sin usuario asociado');
    }

    const user = await this.userRepository.findOne({
      where: { id: profile.user_id },
    });

    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }

    if (user.deleted_at) {
      throw new UnauthorizedException('Usuario inactivo');
    }

    // Retornar datos para req.user
    // IMPORTANTE: id y sub son profile.id para consistencia con gamification FKs
    return {
      id: profile.id,           // profile.id para gamification/progress
      sub: profile.id,          // DB-125: Mantener consistencia con JWT sub
      user_id: user.id,         // auth.users.id por si se necesita
      email: user.email,
      role: profile.role,
      tenant_id: profile.tenant_id,
      is_active: !user.deleted_at,
      email_verified: !!user.email_confirmed_at,
    };
  }
}
