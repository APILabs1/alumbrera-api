  import { Test } from '@nestjs/testing';
  import { UsersService } from './users.service.js';
  import { PrismaService } from '@/prisma/prisma.service.js';

  describe('UsersService', () => {
    let service: UsersService;
    let prisma: { user: { upsert: jest.Mock; findUnique: jest.Mock } };

    beforeEach(async () => {
      prisma = {
        user: {
          upsert: jest.fn(),
          findUnique: jest.fn(),
        },
      };
      const moduleRef = await Test.createTestingModule({
        providers: [
          UsersService,
          { provide: PrismaService, useValue: prisma },
        ],
      }).compile();
      service = moduleRef.get(UsersService);
    });

    describe('syncFromEntra', () => {
      it('upserts user with incrementing loginCount', async () => {
        const fakeUser = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'a@b.com',
          loginCount: 1,
        };
        prisma.user.upsert.mockResolvedValue(fakeUser);

        const result = await service.syncFromEntra({
          oid: fakeUser.id,
          email: fakeUser.email,
        });

        expect(result).toEqual(fakeUser);
        expect(prisma.user.upsert).toHaveBeenCalledWith(
          expect.objectContaining({
            where: { id: fakeUser.id },
            update: expect.objectContaining({
              loginCount: { increment: 1 },
            }),
            create: expect.objectContaining({
              loginCount: 1,
            }),
          }),
        );
      });
    });
  });