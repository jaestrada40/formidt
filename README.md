# Enrollment Portal

Formulario de solicitud de comercio (merchant application) con panel de administración seguro.

## Arquitectura

- **Frontend:** React + Vite + Tailwind (`src/`)
- **Backend:** Express + TypeScript (`server/`), API en `/api/*`
- **Base de datos:** PostgreSQL vía Prisma (`prisma/schema.prisma`)
- **Auth admin:** JWT (cookies httpOnly) + MFA obligatorio (TOTP, Google Authenticator/Authy)
- **Anti-bot / anti-DDoS:** Cloudflare Turnstile + honeypot + rate limiting por IP + Helmet + CORS estricto
- **Email:** SMTP (Nodemailer) — cada solicitud notifica a `NOTIFY_EMAIL`

## Desarrollo local

**Requisitos:** Node.js 20+, PostgreSQL (o un contenedor: `docker run -e POSTGRES_PASSWORD=postgres -p 5432:5432 postgres:16-alpine`).

1. `npm install`
2. Copia `.env.example` a `.env` y completa los valores (ver sección "Variables de entorno" abajo).
3. `npm run prisma:migrate:deploy` (aplica las migraciones a tu base local).
4. `npm run seed:admin` — crea la cuenta de Lourdes e imprime una contraseña temporal en consola.
5. `npm run dev:all` — levanta frontend (puerto 3000) y backend (puerto 3001) juntos.

## Variables de entorno

Ver `.env.example` para la lista completa y comentada. Resumen de lo que necesitas conseguir:

- **SMTP:** credenciales del servidor de correo de IDT (host, usuario, contraseña).
- **Cloudflare Turnstile:** site key + secret key, gratis en https://dash.cloudflare.com/?to=/:account/turnstile
- **Secretos JWT y de encriptación:** generar con:
  ```
  node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # JWT_ACCESS_SECRET / JWT_REFRESH_SECRET
  node -e "console.log(require('crypto').randomBytes(32).toString('base64'))" # ENCRYPTION_KEY
  ```

## Deploy en Hostinger VPS con Coolify

1. En Coolify, crea un nuevo recurso apuntando a este repositorio de GitHub (`formidt`), tipo **Dockerfile** (usa el `Dockerfile` incluido) o **Docker Compose** (usa `docker-compose.yml`, que además levanta Postgres).
2. Si usas el Postgres administrado de Coolify en vez del que trae `docker-compose.yml`, crea ese servicio primero y copia su `DATABASE_URL`.
3. Configura todas las variables de entorno de `.env.example` en la sección de Environment Variables de Coolify (incluyendo `VITE_TURNSTILE_SITE_KEY` como *build arg* si usas el Dockerfile directo).
4. Deploy. El contenedor corre `prisma migrate deploy` automáticamente antes de iniciar, así que las migraciones se aplican solas en cada release.
5. Después del primer deploy, ejecuta una vez desde la consola del contenedor (o localmente contra la DB de producción):
   ```
   npm run seed:admin
   ```
   Esto crea la cuenta de Lourdes y muestra su contraseña temporal — compártela por un canal seguro. En su primer login se le pedirá activar MFA escaneando un código QR.
6. Apunta tu dominio a Coolify y activa HTTPS (Let's Encrypt automático).

## Seguridad implementada

- Contraseñas con bcrypt, cuentas con bloqueo temporal tras intentos fallidos.
- Sesión de administrador: JWT de acceso de vida corta (15 min) + refresh token revocable (7 días), ambos en cookies `httpOnly`, `secure`, `sameSite=strict`.
- MFA (TOTP) obligatorio para toda cuenta admin, sin excepción, activado en el primer login.
- SSNs cifrados en reposo (AES-256-GCM) y enmascarados en las vistas de lista; solo visibles completos en el detalle de una solicitud individual, tras autenticación.
- Cloudflare Turnstile + campo honeypot + rate limiting por IP en el envío público del formulario y en el login admin — mitiga spam masivo y fuerza bruta.
- Helmet (cabeceras de seguridad) + CSP + CORS restringido al dominio de la app.
- IDs de solicitud generados por una secuencia de Postgres — unicidad garantizada por la base de datos, sin colisiones posibles.
