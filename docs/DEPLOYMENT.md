# Deployment, Backup & Restore

## 1. Option A – VPS (recommended; keeps local image storage working)
Ubuntu 22.04+, Node 20+, PostgreSQL 15, Nginx.

```bash
# database
sudo -u postgres psql -c "CREATE USER dealer WITH PASSWORD 'STRONG_PASSWORD';"
sudo -u postgres psql -c "CREATE DATABASE dealership OWNER dealer;"

# app
git clone <your-repo> /var/www/dealership && cd /var/www/dealership
cp .env.example .env     # DATABASE_URL, AUTH_SECRET, NEXT_PUBLIC_SITE_URL=https://yourdomain.com, SEED_ADMIN_*
npm ci
npx prisma migrate deploy
npm run db:seed          # once
npm run build
npm install -g pm2 && pm2 start npm --name dealership -- start && pm2 save && pm2 startup
```

Nginx (HTTPS via `certbot --nginx`):
```nginx
server {
  server_name yourdomain.com;
  client_max_body_size 25m;           # image uploads
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-For $remote_addr;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
}
```
Keep `./uploads` on persistent disk and include it in backups.

**Updating:** `git pull && npm ci && npx prisma migrate deploy && npm run build && pm2 restart dealership`

## 2. Option B – Vercel / serverless + managed Postgres (Neon, Supabase, RDS)
1. Create a managed PostgreSQL database; set `DATABASE_URL` (use the pooled URL and append `?pgbouncer=true&connection_limit=1` if required).
2. **Configure Cloudinary** (`CLOUDINARY_*`) – local disk storage does not persist on serverless.
3. Add all env vars in the host dashboard. Build command `npm run build`; run `npx prisma migrate deploy` once (from CI or your machine against the production URL) and `npm run db:seed` once.
4. The in-memory rate limiter is per instance there; add Redis/Upstash for strict limits.

## 3. Production checklist
- [ ] `AUTH_SECRET` is a unique 48+ byte random value; `.env` never committed.
- [ ] `NEXT_PUBLIC_SITE_URL` is the real https URL.
- [ ] Seed password changed after first login; unused sample content edited/removed.
- [ ] Settings → WhatsApp, phone, address, map, social links filled in.
- [ ] Sample placeholder vehicle photos replaced.
- [ ] HTTPS enabled; DB not exposed publicly; backups scheduled.

## 4. Backup & restore
```bash
# Backup (database + uploaded images)
pg_dump -Fc "$DATABASE_URL" > backup-$(date +%F).dump
tar czf uploads-$(date +%F).tgz uploads/

# Restore into an empty database
pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" backup-YYYY-MM-DD.dump
tar xzf uploads-YYYY-MM-DD.tgz
```
Daily cron example: `0 2 * * * cd /var/www/dealership && pg_dump -Fc "$DATABASE_URL" > /backups/db-$(date +\%F).dump && tar czf /backups/uploads-$(date +\%F).tgz uploads`
Managed hosts (Neon/Supabase/RDS) provide automated point-in-time backups — enable them. Cloudinary retains images itself.

## 5. Migrations
Schema changes: edit `prisma/schema.prisma`, then `npx prisma migrate dev --name describe_change` (dev) and commit the generated folder in `prisma/migrations/`. Deploy with `npx prisma migrate deploy`.
