# Publish to GitHub and deploy on Vercel

The code is already committed locally (175 files, no secrets). Follow these steps in order.

## 1. Push to GitHub (no git install needed)
1. GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
   - Repository access: **All repositories**
   - Permissions: **Administration: Read and write**, **Contents: Read and write**
2. Open PowerShell in the project folder and run (the token stays on your PC; never paste it into chat):
   ```powershell
   $env:GITHUB_TOKEN = "github_pat_xxxxxxxx"
   npm run publish:github
   ```
   This creates a **private** repo `prestige-motors` and pushes `main`. (Public: set `$env:GITHUB_PRIVATE = "false"` first. Other name: `$env:GITHUB_REPO = "name"`.)
3. Delete or revoke the token afterwards (GitHub → Developer settings).

## 2. Create the cloud database (Neon, free)
1. Sign up at https://neon.tech → create a project (region closest to Pakistan, e.g. Singapore/Mumbai).
2. Copy the **connection string** (looks like `postgresql://user:pass@ep-xxx.neon.tech/neondb?sslmode=require`).
3. From your PC, create the tables and sample data in that database (once):
   ```powershell
   $env:DATABASE_URL = "postgresql://...neon.tech/neondb?sslmode=require"
   $env:SEED_ADMIN_EMAIL = "you@yourdomain.com"
   $env:SEED_ADMIN_PASSWORD = "a-strong-password-10+chars"
   npx prisma migrate deploy
   npm run db:seed
   npm run db:photos
   ```

## 3. Photo storage (Cloudinary, free)
Vercel cannot keep uploaded files, so image uploads need Cloudinary.
Sign up at https://cloudinary.com → Dashboard → copy **Cloud name, API key, API secret**.

## 4. Deploy on Vercel
1. https://vercel.com → sign up with GitHub → **Add New → Project** → import `prestige-motors`.
2. Framework: Next.js (auto-detected; `vercel.json` already sets the build command). Add **Environment Variables**:

   | Name | Value |
   |---|---|
   | `DATABASE_URL` | the Neon connection string |
   | `AUTH_SECRET` | 48+ random chars: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"` |
   | `NEXT_PUBLIC_SITE_URL` | your final URL, e.g. `https://prestige-motors.vercel.app` (change to your domain later and redeploy) |
   | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` | from Cloudinary |
   | `SMTP_*`, `NOTIFY_EMAIL` | optional, for new-lead emails |

3. **Deploy**. Open `https://<project>.vercel.app/admin`, sign in with the seed email/password, then change the password under *Users & roles*.
4. Custom domain: Vercel → Project → Settings → Domains. Then update `NEXT_PUBLIC_SITE_URL` and redeploy.

## Notes
- The build runs `prisma migrate deploy`, so future schema changes apply automatically on deploy.
- Rate limiting is per serverless instance (best-effort); add Upstash Redis if you need strict limits.
- `Start Website.bat`, `scripts/dev-db.mjs` and `.pgdata` are for local development only.
