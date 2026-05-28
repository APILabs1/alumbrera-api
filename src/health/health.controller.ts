import { Controller, Get } from '@nestjs/common';
import { HealthCheck, HealthCheckService } from '@nestjs/terminus';
import { ApiTags } from '@nestjs/swagger';
import { Public } from '@/common/decorators/public.decorator.js';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private health: HealthCheckService) {}

  @Get()
  @Public()
  @HealthCheck()
  check() {
    // DB health check added in B2 once PrismaModule is available
    return this.health.check([]);
  }
}
