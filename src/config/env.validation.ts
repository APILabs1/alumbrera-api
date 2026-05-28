import { z } from 'zod';

const schema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z.coerce.number().default(3001),

  DB_HOST: z.string(),
  DB_PORT: z.coerce.number().default(5432),
  DB_USER: z.string(),
  DB_PASSWORD: z.string(),
  DB_NAME: z.string(),
  DB_SSL: z
    .enum(['true', 'false'])
    .default('false')
    .transform((v) => v === 'true'),

  AZURE_JWKS_URI: z.string().url(),
  AZURE_ISSUER: z.string().url(),
  AZURE_AUDIENCE: z.string().uuid(),

  ALLOWED_ORIGINS: z
    .string()
    .default('')
    .transform((s) =>
      s
        .split(',')
        .map((o) => o.trim())
        .filter(Boolean),
    ),

  APPLICATIONINSIGHTS_CONNECTION_STRING: z.string().optional(),
});

export type AppEnv = z.infer<typeof schema>;

export function validateEnv(raw: Record<string, unknown>): AppEnv {
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    console.error('Invalid environment variables:');
    console.error(parsed.error.flatten().fieldErrors);
    process.exit(1);
  }
  return parsed.data;
}
