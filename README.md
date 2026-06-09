  <div align="center">

  # alumbrera-api

  API REST de la plataforma Alumbrera — NestJS · PostgreSQL · Azure Entra

  ![CI](https://github.com/APILabs1/alumbrera-api/actions/workflows/ci.yml/badge.svg?branch=dev)
  ![Node](https://img.shields.io/badge/Node.js-22-1a365d?logo=node.js&logoColor=white)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-1a365d?logo=typescript&logoColor=white)
  ![NestJS](https://img.shields.io/badge/NestJS-11-1a365d?logo=nestjs&logoColor=white)
  ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-1a365d?logo=postgresql&logoColor=white)

  </div>

  ---

  ## Stack

  | | Tecnología | Versión |
  |---|---|---|
  | Runtime | Node.js + TypeScript | 22 / 5.x |
  | Framework | NestJS | 11 |
  | Base de datos | PostgreSQL + Prisma | 16 / 6 |
  | Autenticación | passport-jwt + jwks-rsa (Azure Entra CIAM) | 4 |
  | Logging | Pino (nestjs-pino) | 4.6 |
  | Gestor de paquetes | pnpm | 11 |

  ---

  ## Servicios de Azure

  Este proyecto integra los siguientes servicios de Azure para demostrar patrones de autenticación y despliegue cloud-native:

  | Servicio | Rol |
  |---|---|
  | **Azure Entra External ID (CIAM)** | Emite JWTs para los usuarios finales. La API valida los tokens obteniendo la clave pública desde el endpoint JWKS del tenant (RS256), sin secreto compartido. |
  | **Azure Container Registry (ACR)** | Almacena las imágenes Docker generadas por el pipeline de CD. La autenticación se realiza vía OIDC, sin credenciales almacenadas. |
  | **Azure Container Apps** | Hospeda la API en ejecución. El pipeline de CD dispara una nueva revisión en cada push a `dev`. |
  | **Azure Application Insights** | La connection string está contemplada en la validación de entorno — lista para activar trazas distribuidas y telemetría. |

  ---

  ## Requisitos previos

  - Node.js >= 22
  - pnpm >= 11
  - Docker (para PostgreSQL local)

  ---

  ## Inicio rápido

  ```bash
  cp .env.example .env       # completar los valores
  docker compose up -d       # levantar la base de datos local
  pnpm install
  pnpm prisma migrate dev
  pnpm run start:dev
  ```

  API en `http://localhost:3001` · Swagger en `http://localhost:3001/docs`

  ---

  ## Variables de entorno

  Ver `.env.example`. Variables principales:

  | Variable | Descripción |
  |---|---|
  | `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión a PostgreSQL |
  | `AZURE_JWKS_URI` | Endpoint JWKS de Entra para verificación de JWT |
  | `AZURE_ISSUER` | URL del emisor del token |
  | `AZURE_AUDIENCE` | Client ID de la API (GUID) |
  | `ALLOWED_ORIGINS` | Orígenes CORS separados por coma |
  | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights (opcional) |

  ---

  ## Comandos

  ```bash
  pnpm run start:dev    # Servidor de desarrollo (modo watch)
  pnpm run build        # Compilar a dist/
  pnpm run lint         # ESLint + Prettier
  pnpm run test         # Tests unitarios
  pnpm run test:e2e     # Tests E2E (requiere DB local)
  pnpm run test:cov     # Tests unitarios con cobertura
  ```

  ---

  ## Endpoints

  | Método | Ruta | Auth | Descripción |
  |---|---|---|---|
  | `GET` | `/health` | Público | Health check (incluye ping a la DB) |
  | `GET` | `/me` | Requerida | Devuelve el usuario autenticado actual |
  | `POST` | `/users/sync` | Requerida | Upsert del usuario local a partir de los claims de Entra |

  ---

  ## Docker

  ```bash
  docker build -t alumbrera-api .
  docker run -p 3001:3001 --env-file .env alumbrera-api
  ```

  El contenedor ejecuta `prisma migrate deploy` automáticamente al iniciarse.

  ---

  ## CI / CD

  GitHub Actions ejecuta el pipeline de CI en cada push a `main`/`dev` y en PRs a `main`: lint · verificación de tipos · tests unitarios · tests E2E · build Docker + smoke test.

  El pipeline de CD se dispara cuando CI pasa en `dev`: construye la imagen, la publica en ACR y despliega en Azure Container Apps usando autenticación OIDC (sin secretos de larga duración en GitHub).

  ---

  ## Mejoras potenciales

 Los próximos pasos naturales para profundizar la integración con Azure demostrada en este proyecto:

  ### Autorización por roles mediante Entra App Roles

  Actualmente la API solo valida la presencia del scope `access_as_user`. Azure Entra nos permite mediante`appRoles` definir directamente en el manifest de la aplicación (por ejemplo, `Admin`, `Viewer`).

  **Qué cambia:** un `RolesGuard` + decorador `@Roles()` en la capa NestJS; definición de roles en el manifest de la app en Entra.

  ---

  ### Pipeline de CD multi-ambiente (dev → staging → producción)

  El pipeline actual despliega directamente al entorno `dev` de Container Apps en cada push. Un pipeline orientado a producción incorporaría:

  - Un entorno `staging` que se despliega automáticamente después de que `dev` pase los smoke tests.
  - Una aprobación manual antes de promover a `producción`, usando GitHub Environments con revisores requeridos.
  - Entornos de Azure Container Apps separados por etapa, cada uno con su propio audience de Entra y su propia base de datos.

  **Qué cambia:** el workflow de CD se extiende con jobs adicionales y reglas de protección de entornos; el repositorio de infraestructura agrega dos nuevos entornos de Container Apps.

  ---

  ### Reenvío de logs estructurados a Azure Monitor

  Pino escribe JSON estructurado a stdout, que Azure Container Apps captura pero no expone para consultas. El siguiente paso es configurar un **Log Analytics Workspace** como destino de diagnóstico del Container App. Esto permitiría:

  - Consultas KQL sobre los logs de la aplicación directamente desde el portal de Azure.
  - Alertas basadas en condiciones de log (tasa de errores, umbrales de latencia).
  - Una superficie de observabilidad unificada que correlaciona los logs con las trazas de Application Insights ya contempladas en la variable de entorno.

  **Qué cambia:** un recurso `diagnosticSettings` en el repositorio de infraestructura apuntando el stream de logs del Container App al Log Analytics Workspace. No requiere cambios en el código de la aplicación.
