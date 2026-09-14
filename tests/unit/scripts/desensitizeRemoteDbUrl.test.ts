import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const repoRoot = path.resolve(__dirname, '..', '..', '..');
const scriptSource = path.join(repoRoot, 'docker', 'desensitize_data.sql.sh');

const RESOLUTION_KEYS = ['REMOTE_DB_URL', 'SUPABASE_REMOTE_DB_URL', 'SUPABASE_DB_URL', 'CONN'];

function withoutResolutionKeys(): NodeJS.ProcessEnv {
  const env = { ...process.env };
  for (const key of RESOLUTION_KEYS) {
    delete env[key];
  }
  return env;
}

/**
 * The script resolves its `.env` candidates relative to its own location, so the
 * fixture copy lives in `<fixture>/repo/docker/` and the sibling candidates are
 * `<fixture>/worker/.env` and `<fixture>/tiangong-lca-worker/.env`.
 *
 * `--print-remote-db-url` prints the resolved value and exits before any input,
 * backup, database or Docker work, so the lookup can be characterized without
 * touching production state.
 */
function withFixture(
  run: (fixture: {
    root: string;
    writeEnv: (sibling: string, key: string, value: string) => void;
    lookup: (env?: NodeJS.ProcessEnv) => { status: number | null; stdout: string; stderr: string };
  }) => void,
): void {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'desensitize-env-'));
  const dockerDir = path.join(root, 'repo', 'docker');
  fs.mkdirSync(dockerDir, { recursive: true });
  const scriptPath = path.join(dockerDir, 'desensitize_data.sql.sh');
  fs.copyFileSync(scriptSource, scriptPath);
  fs.chmodSync(scriptPath, 0o755);
  try {
    run({
      root,
      writeEnv(sibling, key, value) {
        const dir = path.join(root, sibling);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, '.env'), `${key}=${value}\n`);
      },
      lookup(env = {}) {
        const result = spawnSync('bash', [scriptPath, '--print-remote-db-url'], {
          encoding: 'utf8',
          env: { ...withoutResolutionKeys(), ...env },
        });
        return { status: result.status, stdout: result.stdout.trim(), stderr: result.stderr };
      },
    });
  } finally {
    fs.rmSync(root, { recursive: true, force: true });
  }
}

describe('docker/desensitize_data.sql.sh remote DB URL resolution', () => {
  it('resolves the canonical worker sibling .env', () => {
    withFixture(({ writeEnv, lookup }) => {
      writeEnv(
        'worker',
        'REMOTE_DB_URL',
        'postgresql://canonical@host.docker.internal:54322/postgres',
      );
      const result = lookup();
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('postgresql://canonical@host.docker.internal:54322/postgres');
    });
  });

  it('keeps the pre-rename worker sibling as bounded compatibility', () => {
    withFixture(({ writeEnv, lookup }) => {
      writeEnv(
        'tiangong-lca-worker',
        'CONN',
        'postgresql://legacy-worker@host.docker.internal:54322/postgres',
      );
      const result = lookup();
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('postgresql://legacy-worker@host.docker.internal:54322/postgres');
    });
  });

  it('prefers the canonical worker sibling when both layouts exist', () => {
    withFixture(({ writeEnv, lookup }) => {
      writeEnv(
        'worker',
        'REMOTE_DB_URL',
        'postgresql://canonical@host.docker.internal:54322/postgres',
      );
      writeEnv(
        'tiangong-lca-worker',
        'REMOTE_DB_URL',
        'postgresql://legacy-worker@host.docker.internal:54322/postgres',
      );
      expect(lookup().stdout).toBe('postgresql://canonical@host.docker.internal:54322/postgres');
    });
  });

  it('keeps the retired calculator sibling as the last legacy fallback', () => {
    withFixture(({ writeEnv, lookup }) => {
      writeEnv(
        'tiangong-lca-calculator',
        'SUPABASE_DB_URL',
        'postgresql://calculator@host.docker.internal:54322/postgres',
      );
      expect(lookup().stdout).toBe('postgresql://calculator@host.docker.internal:54322/postgres');
    });
  });

  it('keeps an explicit environment value authoritative over every file', () => {
    withFixture(({ writeEnv, lookup }) => {
      writeEnv(
        'worker',
        'REMOTE_DB_URL',
        'postgresql://canonical@host.docker.internal:54322/postgres',
      );
      expect(
        lookup({ REMOTE_DB_URL: 'postgresql://explicit@host.docker.internal:54322/postgres' })
          .stdout,
      ).toBe('postgresql://explicit@host.docker.internal:54322/postgres');
    });
  });

  it('prints an empty value when no candidate configures a connection', () => {
    withFixture(({ lookup }) => {
      const result = lookup();
      expect(result.status).toBe(0);
      expect(result.stdout).toBe('');
    });
  });
});
