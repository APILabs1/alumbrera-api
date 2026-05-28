import { NestFactory, Reflector } from '@nestjs/core';
import { Logger } from 'nestjs-pino';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module.js';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard.js';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });

  app.useLogger(app.get(Logger));

  app.use(helmet());

  const allowedOrigins = (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  app.enableCors({
    origin: allowedOrigins,
    credentials: false,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: false },
    }),
  );

  app.useGlobalGuards(new JwtAuthGuard(app.get(Reflector)));

  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));

  if (process.env.NODE_ENV !== 'production') {
    const issuerBase = process.env.AZURE_ISSUER!.replace(/\/v2\.0$/, '');
    const apiScope = `api://${process.env.AZURE_AUDIENCE}/access_as_user`;
    const config = new DocumentBuilder()
      .setTitle('Alumbrera API')
      .setVersion('0.1.0')
      .addOAuth2({
        type: 'oauth2',
        flows: {
          authorizationCode: {
            authorizationUrl: `${issuerBase}/oauth2/v2.0/authorize`,
            tokenUrl: `${issuerBase}/oauth2/v2.0/token`,
            scopes: {
              openid: 'Sign in',
              profile: 'Profile',
              [apiScope]: 'Access API',
            },
          },
        },
      })
      .build();
    const doc = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, doc, {
      jsonDocumentUrl: 'docs-json',
      swaggerOptions: {
        persistAuthorization: true,
        initOAuth: {
          clientId: process.env.AZURE_AUDIENCE,
          usePkceWithAuthorizationCodeGrant: true,
        },
      },
    });
  }

  const port = process.env.PORT ?? 3001;
  await app.listen(port, '0.0.0.0');
  app.get(Logger).log(`API listening on :${port}`);
}

bootstrap();
