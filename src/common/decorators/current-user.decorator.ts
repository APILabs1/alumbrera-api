import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { EntraJwtPayload } from '@/auth/types/entra-jwt-payload.js';

export const CurrentUser = createParamDecorator(
  (data: keyof EntraJwtPayload | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    const user = req.user as EntraJwtPayload;
    return data ? user?.[data] : user;
  },
);
