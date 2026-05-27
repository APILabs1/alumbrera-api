import { Controller, Get, Req } from '@nestjs/common';

interface AuthenticatedRequest {
  user: {
    oid: string;
    name: string | null;
    email: string | null;
  };
}

@Controller()
export class MeController {
  @Get('me')
  me(@Req() req: AuthenticatedRequest) {
    return req.user;
  }
}
