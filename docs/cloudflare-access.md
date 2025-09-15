# �rea protegida /socios con Cloudflare Access

Este proyecto se compila en modo est�tico (`pnpm build` genera la carpeta `dist/`). Para proteger cualquier URL bajo `/socios/**` cuando se publique en Cloudflare Pages, usa Cloudflare Access (Zero Trust) con la siguiente gu�a.

## 1. Preparar la compilaci�n

1. Instala dependencias y compila:
   ```bash
   pnpm install
   pnpm build
   ```
2. Verifica que en `dist/` existan los ficheros est�ticos, incluyendo la subcarpeta `socios/` generada por las rutas de Astro.

## 2. Desplegar en Cloudflare Pages

1. Crea un proyecto en [Cloudflare Pages](https://dash.cloudflare.com/?to=/:account/pages/new) vinculado a este repositorio o sube el contenido de `dist/`.
2. Configura los comandos de build si es un despliegue conectado a Git:
   - **Build command**: `pnpm build`
   - **Build output directory**: `dist`
3. Usa la rama `main` como origen (contiene las �ltimas correcciones para `/socios`).

## 3. Activar Cloudflare Access sobre `/socios/**`

1. Entra en **Zero Trust** ? **Access** ? **Applications** ? **Add an application** ? **Self-hosted**.
2. Introduce:
   - **Application name**: `Socios Siete Ranas Verdes`
   - **Domain**: `sieteranasverdes.com/socios/*`
   - A�ade dominios adicionales seg�n necesites (por ejemplo, el dominio `<tu-proyecto>.pages.dev/socios/*` para entornos de previsualizaci�n).
3. En **Session Duration**, ajusta el tiempo deseado (por ejemplo, 24h).
4. En **Policies**, crea una pol�tica **Allow** con:
   - **Include** ? `Emails` o `Email domains` permitidos. Si quieres permitir One-Time PIN para cualquiera, usa `Everyone`.
   - **Require** ? habilita el proveedor `One-time PIN` o los proveedores SSO configurados (Google, Microsoft, etc.).
   - Opcional: a�ade reglas **Exclude** si hay cuentas que deben quedar fuera.
5. Guarda la aplicaci�n. Cloudflare Access empezar� a pedir autenticaci�n en cualquier petici�n a `/socios/**`.

## 4. Opcional: restringir vistas previas y assets

- Si quieres que el �rea de medios (`/socios/audio/*`, `/socios/images/*`) tambi�n est� protegida, aseg�rate de que las URLs vivan bajo `/socios`. Cloudflare Access protege la petici�n HTTP completa, incluidos assets.
- Para permitir accesos automatizados (por ejemplo, pruebas E2E), crea **Service Tokens** desde Access y util�zalos enviando los encabezados `CF-Access-Client-Id` y `CF-Access-Client-Secret`.

## 5. Verificar

1. Accede a `https://sieteranasverdes.com/socios/` tras la propagaci�n del despliegue.
2. Cloudflare mostrar� la pantalla de inicio de sesi�n con el m�todo que hayas permitido (OTP/SSO).
3. Al autenticarse, Access inyectar� una cookie de sesi�n y el contenido est�tico de `/socios` responder� normalmente.

> El repositorio no necesita cambios adicionales en Astro para esta protecci�n: todo se gestiona desde Cloudflare Access. Mant�n la documentaci�n para futuras operaciones.
