import { Test } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

describe('UsersController', () => {
  let controller: UsersController;
  let service: { syncFromEntra: jest.Mock; findById: jest.Mock };

  beforeEach(async () => {
    service = { syncFromEntra: jest.fn(), findById: jest.fn() };
    const mod = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: service }],
    }).compile();
    controller = mod.get(UsersController);
  });

  describe('sync', () => {
    const jwt = {
      oid: '00000000-0000-0000-0000-000000000001',
      email: 'real@user.com',
      name: 'Real User',
    } as any;

    it('throws Forbidden if body.oid != jwt.oid (IDOR defense)', async () => {
      await expect(
        controller.sync(jwt, {
          oid: '00000000-0000-0000-0000-000000000002',
          email: 'attacker@evil.com',
        }),
      ).rejects.toThrow(ForbiddenException);

      expect(service.syncFromEntra).not.toHaveBeenCalled();
    });

    it('uses email from token, not from body', async () => {
      service.syncFromEntra.mockResolvedValue({
        id: jwt.oid,
        email: jwt.email,
        displayName: null,
        loginCount: 1,
        lastLoginAt: new Date(),
        createdAt: new Date(),
      });

      await controller.sync(jwt, {
        oid: jwt.oid,
        email: 'attacker-tries@evil.com',
      });

      expect(service.syncFromEntra).toHaveBeenCalledWith(
        expect.objectContaining({ email: jwt.email }),
      );
    });
  });
});
