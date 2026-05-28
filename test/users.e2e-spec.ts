  import { Test, TestingModule } from '@nestjs/testing';
  import { INestApplication, ValidationPipe } from '@nestjs/common';
  import request from 'supertest';
  import { AppModule } from '@/app.module.js';
  import { PrismaService } from '@/prisma/prisma.service.js';
  
  const TEST_OID = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  const ATTACKER_OID = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';

  class MockJwtAuthGuard {
    canActivate(ctx: any) {
      const req = ctx.switchToHttp().getRequest();
      req.user = {
        oid: TEST_OID,
        email: 'e2e@test.com',
        name: 'E2E User',
        scp: 'access_as_user',
      };
      return true;
    }
  }

  describe('Users (e2e)', () => {
    let app: INestApplication;
    let prisma: PrismaService;

    beforeAll(async () => {
      const mod: TestingModule = await Test.createTestingModule({
        imports: [AppModule],
      }).compile();

      app = mod.createNestApplication();
      app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
      app.useGlobalGuards(new MockJwtAuthGuard() as any);
      await app.init();

      prisma = app.get(PrismaService);
      await prisma.user.deleteMany();
    });

    afterAll(async () => {
      await prisma.user.deleteMany();
      await app.close();
    });

    it('POST /users/sync creates user and increments on second call', async () => {
      const body = {
        oid: TEST_OID,
        email: 'e2e@test.com',
        displayName: 'E2E',
      };    

      const r1 = await request(app.getHttpServer())
        .post('/users/sync')
        .send(body)
        .expect(201);
      expect(r1.body.loginCount).toBe(1);

      const r2 = await request(app.getHttpServer())
        .post('/users/sync')
        .send(body)
        .expect(201);
      expect(r2.body.loginCount).toBe(2);
    });

    it('GET /me returns the synced user', async () => {
      const r = await request(app.getHttpServer()).get('/me').expect(200);
      expect(r.body.email).toBe('e2e@test.com');
    });

    it('POST /users/sync with mismatching oid returns 403', async () => {
      await request(app.getHttpServer())
        .post('/users/sync')
        .send({
          oid: ATTACKER_OID,
          email: 'attacker@evil.com',
        })
        .expect(403);
    });
  });