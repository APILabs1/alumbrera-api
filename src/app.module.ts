import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { AuthModule } from './auth/auth.module.js';
import { HealthModule } from './health/health.module.js';
import { MeController } from './me/me.controller.js';

@Module({
  imports: [ConfigModule, LoggerModule, AuthModule, HealthModule],
  controllers: [MeController],
})
export class AppModule {}
