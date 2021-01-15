"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../test/util");
const node_1 = require("../../../versioning/node");
const node_version_1 = require("./node-version");
jest.mock('../../../util/fs');
describe('getNodeConstraint', () => {
    const config = {
        packageFile: 'package.json',
        constraints: { node: '^12.16.0' },
    };
    it('returns package.json range', async () => {
        util_1.fs.readLocalFile = jest.fn();
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        const res = await node_version_1.getNodeConstraint(config);
        expect(res).toEqual('^12.16.0');
    });
    it('augments to avoid node 15', async () => {
        util_1.fs.readLocalFile = jest.fn();
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        const res = await node_version_1.getNodeConstraint({
            ...config,
            constraints: { node: '>= 12.16.0' },
        });
        const isAugmentedRange = res === '>= 12.16.0 <15';
        const node16IsStable = node_1.isStable('16.100.0');
        expect(isAugmentedRange || node16IsStable).toBe(true);
    });
    it('returns .node-version value', async () => {
        util_1.fs.readLocalFile = jest.fn();
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        util_1.fs.readLocalFile.mockResolvedValueOnce('12.16.1\n');
        const res = await node_version_1.getNodeConstraint(config);
        expect(res).toEqual('12.16.1');
    });
    it('returns .nvmrc value', async () => {
        util_1.fs.readLocalFile = jest.fn();
        util_1.fs.readLocalFile.mockResolvedValueOnce('12.16.2\n');
        const res = await node_version_1.getNodeConstraint(config);
        expect(res).toEqual('12.16.2');
    });
    it('ignores unusable ranges in dotfiles', async () => {
        util_1.fs.readLocalFile = jest.fn();
        util_1.fs.readLocalFile.mockResolvedValueOnce('latest');
        util_1.fs.readLocalFile.mockResolvedValueOnce('lts');
        const res = await node_version_1.getNodeConstraint(config);
        expect(res).toEqual('^12.16.0');
    });
    it('returns no constraint', async () => {
        util_1.fs.readLocalFile = jest.fn();
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        util_1.fs.readLocalFile.mockResolvedValueOnce(null);
        const res = await node_version_1.getNodeConstraint({ ...config, constraints: null });
        expect(res).toBeNull();
    });
});
//# sourceMappingURL=node-version.spec.js.map