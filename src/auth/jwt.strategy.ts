import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        jwksUri: `https://${process.env.ENTRA_TENANT}.ciamlogin.com/${process.env.ENTRA_TENANT_ID}/discovery/v2.0/keys`,
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
      }),
      audience: process.env.ENTRA_CLIENT_ID,
      issuer: `https://${process.env.ENTRA_TENANT}.ciamlogin.com/${process.env.ENTRA_TENANT_ID}/v2.0`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: { oid: string; name?: string; email?: string }) {
    return {
      oid: payload.oid,
      name: payload.name ?? null,
      email: payload.email ?? null,
    };
  }
}
