// Publishes this project to a (private) GitHub repository WITHOUT needing git installed.
//
//   1. Create a token:  GitHub → Settings → Developer settings → Personal access tokens → Fine-grained tokens
//      Repository access: "All repositories"; Permissions: Administration = Read & write, Contents = Read & write.
//   2. In PowerShell (token stays on your machine, never share it):
//        $env:GITHUB_TOKEN = "github_pat_..."
//        npm run publish:github
//
// Options (env): GITHUB_REPO (default "prestige-motors"), GITHUB_PRIVATE ("false" for a public repo)
import fs from "node:fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node";

const dir = process.cwd();
const token = process.env.GITHUB_TOKEN;
const repoName = process.env.GITHUB_REPO || "prestige-motors";
const isPrivate = process.env.GITHUB_PRIVATE !== "false";
const commitOnly = process.argv.includes("--commit-only");

async function ghApi(path, init = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "dealership-publisher", ...(init.headers || {}) },
  });
  return { status: res.status, body: await res.json().catch(() => ({})) };
}

async function localCommit(author) {
  if (!fs.existsSync(`${dir}/.git`)) await git.init({ fs, dir, defaultBranch: "main" });
  const matrix = await git.statusMatrix({ fs, dir });
  let changed = 0;
  for (const [file, head, workdir, stage] of matrix) {
    if (workdir === 0 && head === 1) { await git.remove({ fs, dir, filepath: file }); changed++; }
    else if (workdir === 2 && stage !== 2 || (head === 0 && workdir === 2)) { await git.add({ fs, dir, filepath: file }); changed++; }
  }
  if (changed === 0 && (await git.log({ fs, dir, depth: 1 }).catch(() => [])).length) { console.log("Nothing new to commit."); return; }
  const sha = await git.commit({ fs, dir, message: "Prestige Motors dealership platform", author });
  console.log(`Committed ${changed} files (${sha.slice(0, 7)})`);
}

if (commitOnly) {
  await localCommit({ name: "Prestige Motors", email: "noreply@users.noreply.github.com" });
  const files = await git.listFiles({ fs, dir });
  console.log(`${files.length} files tracked. Secrets check:`, files.some((f) => f === ".env" || f.startsWith(".pgdata/") || f.startsWith("node_modules/")) ? "PROBLEM – sensitive path tracked!" : "no .env / .pgdata / node_modules tracked");
  process.exit(0);
}

if (!token) { console.error("Set $env:GITHUB_TOKEN first (see the comment at the top of this file)."); process.exit(1); }

const me = await ghApi("/user");
if (me.status !== 200) { console.error("GitHub rejected the token:", me.body.message); process.exit(1); }
const login = me.body.login;
console.log(`Signed in to GitHub as ${login}`);

const created = await ghApi("/user/repos", { method: "POST", body: JSON.stringify({ name: repoName, private: isPrivate, description: "Premium car dealership platform (Next.js, Prisma, PostgreSQL)" }) });
if (created.status === 201) console.log(`Created ${isPrivate ? "private" : "public"} repo ${login}/${repoName}`);
else if (created.status === 422) console.log(`Repo ${login}/${repoName} already exists – pushing to it.`);
else { console.error("Could not create repo:", created.status, created.body.message); process.exit(1); }

await localCommit({ name: me.body.name || login, email: `${me.body.id}+${login}@users.noreply.github.com` });

const url = `https://github.com/${login}/${repoName}.git`;
await git.addRemote({ fs, dir, remote: "origin", url, force: true });
const result = await git.push({ fs, dir, http, remote: "origin", ref: "main", onAuth: () => ({ username: token, password: "x-oauth-basic" }), onProgress: (p) => process.stdout.write(`\r${p.phase} ${p.loaded ?? ""}   `) });
console.log(result.ok ? `\nPushed → https://github.com/${login}/${repoName}` : `\nPush failed: ${result.error}`);
