# Área protegida /socios con Cloudflare Access

Este proyecto se compila en modo estático (`pnpm build` genera la carpeta `dist/`). Para proteger cualquier URL bajo `/socios/**` cuando se publique en Cloudflare Pages, usa Cloudflare Access (Zero Trust) con la siguiente guía.

## 1. Preparar la compilación

1. Instala dependencias y compila:
   ```bash
   pnpm install
   pnpm build
   ```
2. Verifica que en `dist/` existan los ficheros estáticos, incluyendo la subcarpeta `socios/` generada por las rutas de Astro.

## 2. Desplegar en Cloudflare Pages

1. Crea un proyecto en [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages/new) vinculado a este repositorio o sube el contenido de `dist/`.
2. Configura los comandos de build si es un despliegue conectado a Git:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
3. Usa la rama `main` como origen (contiene las últimas correcciones para `/socios`).

## 3. Activar Cloudflare Access sobre `/socios/**`

1. Entra en **Zero Trust** → **Access** → **Applications** → **Add an application** → **Self-hosted**.
2. Introduce:
   - **Application name**: `Socios Siete Ranas Verdes`
   - **Domain**: `sieteranasverdes.es/socios/*`
   - Añade dominios adicionales según necesites (por ejemplo, el dominio `<tu-proyecto>.pages.dev/socios/*` para entornos de previsualización).
3. En **Session Duration**, ajusta el tiempo deseado (por ejemplo, 24h).
4. En **Policies**, crea una política **Allow** con:
   - **Include** → `Emails` o `Email domains` permitidos. Si quieres permitir One-Time PIN para cualquiera, usa `Everyone`.
   - **Require** → habilita el proveedor `One-time PIN` o los proveedores SSO configurados (Google, Microsoft, etc.).
   - Opcional: añade reglas **Exclude** si hay cuentas que deben quedar fuera.
5. Guarda la aplicación. Cloudflare Access empezará a pedir autenticación en cualquier petición a `/socios/**`.

## 4. Opcional: restringir vistas previas y assets

- Si quieres que el área de medios (`/socios/audio/*`, `/socios/images/*`) también esté protegida, asegúrate de que las URLs vivan bajo `/socios`. Cloudflare Access protege la petición HTTP completa, incluidos assets.
- Para permitir accesos automatizados (por ejemplo, pruebas E2E), crea **Service Tokens** desde Access y utilízalos enviando los encabezados `CF-Access-Client-Id` y `CF-Access-Client-Secret`.

## 5. Verificar

1. Accede a `https://sieteranasverdes.es/socios/` tras la propagación del despliegue.
2. Cloudflare mostrará la pantalla de inicio de sesión con el método que hayas permitido (OTP/SSO).
3. Al autenticarse, Access inyectará una cookie de sesión y el contenido estático de `/socios` responderá normalmente.

> El repositorio no necesita cambios adicionales en Astro para esta protección: todo se gestiona desde Cloudflare Access. Mantén la documentación para futuras operaciones.
