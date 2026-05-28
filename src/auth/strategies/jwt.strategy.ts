import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import type { AppEnv } from '@/config/env.validation.js';
import type { EntraJwtPayload } from '../types/entra-jwt-payload.js';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(config: ConfigService<AppEnv, true>) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        cacheMaxEntries: 5,
        cacheMaxAge: 10 * 60 * 1000,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: config.get<string>('AZURE_JWKS_URI'),
      }),
      audience: config.get<string>('AZURE_AUDIENCE'),
      issuer: config.get<string>('AZURE_ISSUER'),
      algorithms: ['RS256'],
    });
  }

  async validate(payload: EntraJwtPayload): Promise<EntraJwtPayload> {
    if (!payload.oid) throw new UnauthorizedException('Missing oid claim');

    const scopes = (payload.scp ?? '').split(' ');
    if (!scopes.includes('access_as_user')) {
      throw new UnauthorizedException('Missing required scope: access_as_user');
    }

    return payload;
  }
}
