import { Module } from '@nestjs/common';
import { ConfigModule } from './config/config.module.js';
import { LoggerModule } from './common/logger/logger.module.js';
import { PrismaModule } from './prisma/prisma.module.js';
import { AuthModule } from './auth/auth.module.js';
import { UsersModule } from './users/users.module.js';
import { HealthModule } from './health/health.module.js';

@Module({
  imports: [
    ConfigModule,
    LoggerModule,
    PrismaModule,
    AuthModule,
    UsersModule,
    HealthModule,
  ],
})
export class AppModule {}
