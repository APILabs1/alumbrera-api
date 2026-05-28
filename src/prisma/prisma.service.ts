  import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from
  '@nestjs/common';
  import { PrismaClient } from '@prisma/client';
  import { ConfigService } from '@nestjs/config';
  import type { AppEnv } from '@/config/env.validation.js';

  @Injectable()
  export class PrismaService
    extends PrismaClient
    implements OnModuleInit, OnModuleDestroy
  {
    private readonly logger = new Logger(PrismaService.name);

    constructor(config: ConfigService<AppEnv, true>) {
      const host = config.get<string>('DB_HOST')!;
      const port = config.get<number>('DB_PORT')!;
      const user = config.get<string>('DB_USER')!;
      const pass = config.get<string>('DB_PASSWORD')!;
      const name = config.get<string>('DB_NAME')!;
      const ssl = config.get<boolean>('DB_SSL')!;
  
      const url = `postgresql://${encodeURIComponent(user)}:${encodeURIComponent
  (pass)}@${host}:${port}/${name}${ssl ? '?sslmode=require' : ''}`;

      super({
        datasources: { db: { url } },
        log: [
          { emit: 'event', level: 'error' },
          { emit: 'event', level: 'warn' },
        ],
      });
    }

    async onModuleInit() {
      await this.$connect();
      this.logger.log('Prisma connected');
    }

    async onModuleDestroy() {
      await this.$disconnect();
    }
  }