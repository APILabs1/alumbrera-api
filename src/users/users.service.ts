import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service.js';
import type { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async syncFromEntra(data: {
    oid: string;
    email: string;
    displayName?: string;
    givenName?: string;
    familyName?: string;
  }): Promise<User> {
    return this.prisma.user.upsert({
      where: { id: data.oid },
      update: {
        email: data.email,
        displayName: data.displayName,
        givenName: data.givenName,
        familyName: data.familyName,
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
      },
      create: {
        id: data.oid,
        email: data.email,
        displayName: data.displayName,
        givenName: data.givenName,
        familyName: data.familyName,
        lastLoginAt: new Date(),
        loginCount: 1,
      },
    });
  }
}
