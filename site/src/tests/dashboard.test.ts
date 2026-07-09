import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import vm from 'node:vm';
import { fileURLToPath } from 'node:url';

type MockResponse = {
  ok: boolean;
  status: number;
  json: () => Promise<unknown>;
};

async function loadGitHubAPI(fetchImpl: (url: string, options?: Record<string, unknown>) => Promise<MockResponse>) {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const scriptPath = path.resolve(__dirname, '../../../assets/js/dashboard.js');
  const script = await readFile(scriptPath, 'utf8');

  const document = {
    readyState: 'loading',
    addEventListener() {},
    querySelectorAll() {
      return [];
    },
    getElementById() {
      return null;
    },
  };

  const localStorage = {
    getItem() {
      return null;
    },
    setItem() {},
    removeItem() {},
  };

  const sandbox = {
    console: {
      error() {},
      log() {},
      warn() {},
    },
    document,
    fetch: fetchImpl,
    Chart: function Chart() {},
    localStorage,
    Date,
    Object,
    setTimeout,
    clearTimeout,
  };

  vm.createContext(sandbox);
  vm.runInContext(`${script}\nthis.__dashboardTestExports = { GitHubAPI };`, sandbox);

  const testSandbox = sandbox as typeof sandbox & {
    __dashboardTestExports: {
      GitHubAPI: {
        fetch: (endpoint: string, options?: Record<string, unknown>) => Promise<unknown>;
      };
    };
  };

  return testSandbox.__dashboardTestExports.GitHubAPI as {
    fetch: (endpoint: string, options?: Record<string, unknown>) => Promise<unknown>;
  };
}

const notFoundApi = await loadGitHubAPI(async () => ({
  ok: false,
  status: 404,
  async json() {
    return { message: 'Not Found' };
  },
}));

await assert.rejects(notFoundApi.fetch('/missing'), (error: Error & { status?: number }) => {
  assert.equal(error.message, 'GitHub API resource was not found: Not Found');
  assert.equal(error.status, 404);
  return true;
});

const serverErrorApi = await loadGitHubAPI(async () => ({
  ok: false,
  status: 503,
  async json() {
    return { message: 'Service Unavailable' };
  },
}));

await assert.rejects(serverErrorApi.fetch('/outage'), (error: Error & { status?: number }) => {
  assert.equal(error.message, 'GitHub API is temporarily unavailable: Service Unavailable');
  assert.equal(error.status, 503);
  return true;
});

const networkErrorApi = await loadGitHubAPI(async () => {
  throw new TypeError('Failed to fetch');
});

await assert.rejects(networkErrorApi.fetch('/network'), (error: Error) => {
  assert.equal(error.message, 'GitHub API network error while fetching /network');
  assert.equal(error.cause instanceof TypeError, true);
  return true;
});

const invalidJsonApi = await loadGitHubAPI(async () => ({
  ok: true,
  status: 200,
  async json() {
    throw new SyntaxError('Unexpected token');
  },
}));

await assert.rejects(invalidJsonApi.fetch('/invalid-json'), (error: Error) => {
  assert.equal(error.message, 'GitHub API returned invalid JSON for /invalid-json');
  assert.equal(error.cause instanceof SyntaxError, true);
  return true;
});

console.log('dashboard api error handling ok');
