// Local development PostgreSQL (no admin rights / installer needed).
// Usage: npm run db:local   (keeps running; Ctrl+C to stop). Data lives in ./.pgdata
// For production use a managed or system PostgreSQL – see docs/DEPLOYMENT.md.
import EmbeddedPostgres from "embedded-postgres";
import fs from "node:fs";

const dir = new URL("../.pgdata", import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, "$1");
const fresh = !fs.existsSync(dir + "/PG_VERSION");
const pg = new EmbeddedPostgres({ databaseDir: dir, user: "postgres", password: "postgres", port: Number(process.env.DEV_DB_PORT || 5433), persistent: true });

if (fresh) await pg.initialise();
await pg.start();
if (fresh) await pg.createDatabase("dealership");
console.log(`PostgreSQL ready on localhost:${process.env.DEV_DB_PORT || 5433} (db: dealership, user: postgres)`);

const stop = async () => { await pg.stop(); process.exit(0); };
process.on("SIGINT", stop);
process.on("SIGTERM", stop);
setInterval(() => {}, 1 << 30);
