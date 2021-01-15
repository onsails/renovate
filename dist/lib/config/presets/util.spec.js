"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../test/util");
const util_2 = require("./util");
const config = {
    pkgName: 'some/repo',
    filePreset: 'default',
    endpoint: 'endpoint',
    fetch: undefined,
};
const fetch = jest.fn(() => Promise.resolve({}));
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        fetch.mockReset();
    });
    it('works', async () => {
        fetch.mockResolvedValue({ sub: { preset: { foo: true } } });
        expect(await util_2.fetchPreset({ ...config, fetch })).toEqual({
            sub: { preset: { foo: true } },
        });
        expect(await util_2.fetchPreset({ ...config, filePreset: 'some/sub', fetch })).toEqual({ preset: { foo: true } });
        expect(await util_2.fetchPreset({ ...config, filePreset: 'some/sub/preset', fetch })).toEqual({ foo: true });
    });
    it('fails', async () => {
        fetch.mockRejectedValueOnce(new Error('fails'));
        await expect(util_2.fetchPreset({ ...config, fetch })).rejects.toThrow('fails');
    });
    it(util_2.PRESET_DEP_NOT_FOUND, async () => {
        fetch.mockResolvedValueOnce(null);
        await expect(util_2.fetchPreset({ ...config, fetch })).rejects.toThrow(util_2.PRESET_DEP_NOT_FOUND);
        fetch.mockRejectedValueOnce(new Error(util_2.PRESET_DEP_NOT_FOUND));
        fetch.mockRejectedValueOnce(new Error(util_2.PRESET_DEP_NOT_FOUND));
        await expect(util_2.fetchPreset({ ...config, fetch })).rejects.toThrow(util_2.PRESET_DEP_NOT_FOUND);
    });
    it(util_2.PRESET_NOT_FOUND, async () => {
        fetch.mockResolvedValueOnce({});
        await expect(util_2.fetchPreset({ ...config, filePreset: 'some/sub/preset', fetch })).rejects.toThrow(util_2.PRESET_NOT_FOUND);
        fetch.mockResolvedValueOnce({ sub: {} });
        await expect(util_2.fetchPreset({ ...config, filePreset: 'some/sub/preset', fetch })).rejects.toThrow(util_2.PRESET_NOT_FOUND);
    });
});
//# sourceMappingURL=util.spec.js.map