import { spawn, execFileSync } from 'node:child_process';
import { createServer } from 'node:http';
import { createWriteStream, existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { setTimeout as delay } from 'node:timers/promises';

// Disposable database and deterministic Codeforces responses; never uses the developer database.
const jar = resolve('../backend/target/backend-0.0.1-SNAPSHOT.jar');
if (!existsSync(jar)) throw new Error('Build the backend first: cd backend && ./mvnw package');
const problems = [
  { contestId: 999001, index: 'A', name: 'Audit Practice', rating: 1500, tags: ['math'], type: 'PROGRAMMING' },
  { contestId: 999001, index: 'B', name: 'Audit Search', rating: 1600, tags: ['dp'], type: 'PROGRAMMING' },
];
const cf = createServer((req, res) => {
  const url = new URL(req.url, 'http://localhost');
  let result;
  if (url.pathname.endsWith('/user.info')) result = [{ handle: url.searchParams.get('handles') }];
  else if (url.pathname.endsWith('/user.status')) result = [{ id: 12345, contestId: 999001, creationTimeSeconds: Math.floor(Date.now()/1000), problem: problems[0], author: { participantType: 'PRACTICE' }, programmingLanguage: 'Java', verdict: 'WRONG_ANSWER' }];
  else if (url.pathname.endsWith('/problemset.problems')) result = { problems, problemStatistics: [] };
  else result = [];
  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ status: 'OK', result }));
});
await new Promise(resolve => cf.listen(0, '127.0.0.1', resolve));
let container, backend;
const log = createWriteStream('e2e-backend.log');
const backendErrors = [];
try {
  container = execFileSync('docker', ['run', '-d', '--rm', '-e', 'POSTGRES_PASSWORD=audit', '-e', 'POSTGRES_DB=upsolve', '-p', '127.0.0.1::5432', 'postgres:16-alpine'], { encoding: 'utf8', windowsHide: true }).trim();
  const port = execFileSync('docker', ['port', container, '5432/tcp'], { encoding: 'utf8', windowsHide: true }).trim().split(':').at(-1);
  for (let i=0; i<60; i++) {
    try { execFileSync('docker', ['exec', container, 'pg_isready', '-U', 'postgres'], { stdio: 'pipe', windowsHide: true }); break; }
    catch { if (i === 59) throw new Error('Test database did not start'); await delay(1000); }
  }
  backend = spawn('java', ['-jar', jar], {
    windowsHide: true,
    env: { ...process.env, DB_HOST: '127.0.0.1', DB_PORT: port, DB_USER: 'postgres', DB_PASS: 'audit', SERVER_PORT: '18080',
      SPRING_PROFILES_ACTIVE: 'default', CF_API_BASE_URL: `http://127.0.0.1:${cf.address().port}/api`, CF_RATE_LIMIT_MS: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  backend.stdout.pipe(log); backend.stderr.pipe(log);
  // Detect backend failures even when the response was committed before session persistence failed.
  let pendingLine = '';
  backend.stdout.on('data', chunk => {
    const lines = (pendingLine + chunk.toString()).split('\n');
    pendingLine = lines.pop();
    backendErrors.push(...lines.filter(line => /\bERROR\b/.test(line)));
  });
  for (let i=0; i<120; i++) {
    try { const res = await fetch('http://127.0.0.1:18080/api/v1/health'); if (res.ok) break; }
    catch { /* waiting for backend */ }
    if (i === 119 || backend.exitCode !== null) throw new Error('Backend did not start; inspect e2e-backend.log');
    await delay(1000);
  }
  execFileSync('docker', ['exec', '-i', container, 'psql', '-U', 'postgres', '-d', 'upsolve', '-v', 'ON_ERROR_STOP=1'], {
    input: readFileSync('../backend/src/main/resources/db/seed/demo-seed.sql'), stdio: ['pipe', 'ignore', 'pipe'], windowsHide: true,
  });
  const playwright = spawn(process.execPath, ['node_modules/@playwright/test/cli.js', 'test', ...process.argv.slice(2)], {
    windowsHide: true, stdio: 'inherit', env: { ...process.env, API_PROXY_TARGET: 'http://127.0.0.1:18080' },
  });
  process.exitCode = await new Promise(resolve => playwright.on('exit', code => resolve(code ?? 1)));
  if (backendErrors.length) {
    console.error('Backend errors occurred during browser tests; inspect e2e-backend.log:', backendErrors);
    process.exitCode = 1;
  }
} finally {
  if (backend) { backend.kill(); await new Promise(resolve => backend.exitCode !== null ? resolve() : backend.once('exit', resolve)); }
  if (container) execFileSync('docker', ['stop', container], { stdio: 'ignore', windowsHide: true });
  cf.close(); log.end();
}
