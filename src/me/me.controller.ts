import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@/common/decorators/current-user.decorator.js';
import type { EntraJwtPayload } from '@/auth/types/entra-jwt-payload.js';

@ApiTags('me')
@ApiBearerAuth()
@Controller()
export class MeController {
  @Get('me')
  me(@CurrentUser() user: EntraJwtPayload) {
    return {
      oid: user.oid,
      name: user.name ?? null,
      email: user.email ?? user.emails?.[0] ?? null,
    };
  }
}
