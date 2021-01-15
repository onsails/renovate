"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const env_1 = require("./env");
describe('getChildProcess environment when trustlevel set to low', () => {
    const envVars = [
        'HTTP_PROXY',
        'HTTPS_PROXY',
        'NO_PROXY',
        'HOME',
        'PATH',
        'LC_ALL',
        'LANG',
        'DOCKER_HOST',
    ];
    beforeEach(() => {
        envVars.forEach((env) => {
            process.env[env] = env;
        });
    });
    afterEach(() => {
        envVars.forEach((env) => delete process.env[env]);
    });
    it('returns default environment variables', () => {
        expect(env_1.getChildProcessEnv()).toMatchInlineSnapshot(`
      Object {
        "DOCKER_HOST": "DOCKER_HOST",
        "HOME": "HOME",
        "HTTPS_PROXY": "HTTPS_PROXY",
        "HTTP_PROXY": "HTTP_PROXY",
        "LANG": "LANG",
        "LC_ALL": "LC_ALL",
        "NO_PROXY": "NO_PROXY",
        "PATH": "PATH",
      }
    `);
    });
    it('returns environment variable only if defined', () => {
        delete process.env.PATH;
        expect(env_1.getChildProcessEnv()).not.toHaveProperty('PATH');
    });
    it('returns custom environment variables if passed and defined', () => {
        process.env.FOOBAR = 'FOOBAR';
        expect(env_1.getChildProcessEnv(['FOOBAR'])).toMatchInlineSnapshot(`
      Object {
        "DOCKER_HOST": "DOCKER_HOST",
        "FOOBAR": "FOOBAR",
        "HOME": "HOME",
        "HTTPS_PROXY": "HTTPS_PROXY",
        "HTTP_PROXY": "HTTP_PROXY",
        "LANG": "LANG",
        "LC_ALL": "LC_ALL",
        "NO_PROXY": "NO_PROXY",
        "PATH": "PATH",
      }
    `);
        delete process.env.LANG;
    });
    describe('getChildProcessEnv when trustlevel set to high', () => {
        it('returns process.env if trustlevel set to high', () => {
            global.trustLevel = 'high';
            expect(env_1.getChildProcessEnv()).toMatchObject(process.env);
            delete global.trustLevel;
        });
    });
});
//# sourceMappingURL=env.spec.js.map