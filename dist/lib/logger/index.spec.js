"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const host_rules_1 = require("../util/host-rules");
const sanitize_1 = require("../util/sanitize");
const _1 = require(".");
jest.unmock('.');
jest.mock('fs-extra');
const fs = fs_extra_1.default;
describe('logger', () => {
    it('inits', () => {
        expect(_1.logger).toBeDefined();
    });
    it('sets and gets context', () => {
        _1.setContext('abc123');
        expect(_1.getContext()).toEqual('abc123');
    });
    it('supports logging with metadata', () => {
        expect(() => _1.logger.debug({ some: 'meta' }, 'some meta')).not.toThrow();
    });
    it('supports logging with only metadata', () => {
        expect(() => _1.logger.debug({ some: 'meta' })).not.toThrow();
    });
    it('supports logging without metadata', () => {
        expect(() => _1.logger.debug('some meta')).not.toThrow();
    });
    it('sets meta', () => {
        expect(() => _1.setMeta({ any: 'test' })).not.toThrow();
    });
    it('adds meta', () => {
        expect(() => _1.addMeta({ new: 'test' })).not.toThrow();
    });
    it('removes meta', () => {
        expect(() => _1.removeMeta(['new'])).not.toThrow();
    });
    it('sets level', () => {
        expect(() => _1.levels('stdout', 'debug')).not.toThrow();
    });
    it('saves problems', () => {
        sanitize_1.add('p4$$w0rd');
        _1.levels('stdout', 'fatal');
        _1.logger.error('some meta');
        _1.logger.error({ some: 'meta', password: 'super secret' });
        _1.logger.error({ some: 'meta' }, 'message');
        _1.logger.warn('a warning with a p4$$w0rd');
        _1.logger.info('ignored');
        expect(_1.getProblems()).toMatchSnapshot();
        _1.clearProblems();
        expect(_1.getProblems()).toHaveLength(0);
    });
    it('should contain path or stream parameters', () => {
        expect(() => _1.addStream({
            name: 'logfile',
            level: 'error',
        })).toThrow("Missing 'stream' or 'path' for bunyan stream");
    });
    it("doesn't support rotating files", () => {
        expect(() => _1.addStream({
            name: 'logfile',
            path: 'file.log',
            level: 'error',
            type: 'rotating-file',
        })).toThrow("Rotating files aren't supported");
    });
    it('supports file-based logging', () => {
        let chunk = null;
        fs.createWriteStream.mockReturnValueOnce({
            writable: true,
            write(x) {
                chunk = x;
            },
        });
        _1.addStream({
            name: 'logfile',
            path: 'file.log',
            level: 'error',
        });
        _1.logger.error('foo');
        expect(JSON.parse(chunk).msg).toEqual('foo');
    });
    it('handles cycles', () => {
        let logged = null;
        fs.createWriteStream.mockReturnValueOnce({
            writable: true,
            write(x) {
                logged = JSON.parse(x);
            },
        });
        _1.addStream({
            name: 'logfile',
            path: 'file.log',
            level: 'error',
        });
        const meta = { foo: null, bar: [] };
        meta.foo = meta;
        meta.bar.push(meta);
        _1.logger.error(meta, 'foo');
        expect(logged.msg).toEqual('foo');
        expect(logged.foo.foo).toEqual('[Circular]');
        expect(logged.foo.bar).toEqual(['[Circular]']);
        expect(logged.bar).toEqual('[Circular]');
    });
    it('sanitizes secrets', () => {
        let logged = null;
        fs.createWriteStream.mockReturnValueOnce({
            writable: true,
            write(x) {
                logged = JSON.parse(x);
            },
        });
        _1.addStream({
            name: 'logfile',
            path: 'file.log',
            level: 'error',
        });
        host_rules_1.add({ password: 'secret"password' });
        _1.logger.error({
            foo: 'secret"password',
            bar: ['somethingelse', 'secret"password'],
            npmToken: 'token',
            buffer: Buffer.from('test'),
            content: 'test',
            prBody: 'test',
        });
        expect(logged.foo).not.toEqual('secret"password');
        expect(logged.bar[0]).toEqual('somethingelse');
        expect(logged.foo).toContain('redacted');
        expect(logged.bar[1]).toContain('redacted');
        expect(logged.npmToken).not.toEqual('token');
        expect(logged.buffer).toEqual('[content]');
        expect(logged.content).toEqual('[content]');
        expect(logged.prBody).toEqual('[Template]');
    });
});
//# sourceMappingURL=index.spec.js.map