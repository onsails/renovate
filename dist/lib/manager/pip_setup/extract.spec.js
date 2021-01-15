"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const exec_util_1 = require("../../../test/exec-util");
const util_1 = require("../../../test/util");
const extract_1 = require("./extract");
jest.mock('child_process');
jest.mock('../../util/exec/env');
describe(util_1.getName(__filename), () => {
    beforeEach(() => {
        jest.resetAllMocks();
        jest.resetModules();
        extract_1.resetModule();
        util_1.env.getChildProcessEnv.mockReturnValue(exec_util_1.envMock.basic);
    });
    describe('parsePythonVersion', () => {
        it('returns major and minor version numbers', () => {
            expect(extract_1.parsePythonVersion('Python 2.7.15rc1')).toEqual([2, 7]);
        });
    });
    describe('getPythonAlias', () => {
        it('returns the python alias to use', async () => {
            const execSnapshots = exec_util_1.mockExecSequence(exec_util_1.exec, [
                { stdout: '', stderr: 'Python 2.7.17\\n' },
                new Error(),
                { stdout: 'Python 3.8.0\\n', stderr: '' },
            ]);
            const result = await extract_1.getPythonAlias();
            expect(extract_1.pythonVersions).toContain(result);
            expect(result).toMatchSnapshot();
            expect(await extract_1.getPythonAlias()).toEqual(result);
            expect(execSnapshots).toMatchSnapshot();
            expect(execSnapshots).toHaveLength(3);
        });
    });
});
//# sourceMappingURL=extract.spec.js.map