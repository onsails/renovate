"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("../../../../../test/util");
const config_description_1 = require("./config-description");
describe('workers/repository/onboarding/pr/config-description', () => {
    describe('getConfigDesc()', () => {
        let config;
        beforeEach(() => {
            jest.resetAllMocks();
            config = util_1.getConfig();
        });
        it('returns empty', () => {
            delete config.description;
            const res = config_description_1.getConfigDesc(config);
            expect(res).toMatchSnapshot();
        });
        it('returns a full list', () => {
            const packageFiles = {
                npm: [],
                dockerfile: [],
            };
            config.description = [
                'description 1',
                'description two',
                'something else',
                'this is Docker-only',
            ];
            const res = config_description_1.getConfigDesc(config, packageFiles);
            expect(res).toMatchSnapshot();
            expect(res.indexOf('Docker-only')).not.toBe(-1);
        });
        it('assignees, labels and schedule', () => {
            delete config.description;
            config.packageFiles = [];
            config.assignees = ['someone', '@someone-else'];
            config.labels = ['renovate', 'deps'];
            config.schedule = ['before 5am'];
            const res = config_description_1.getConfigDesc(config);
            expect(res).toMatchSnapshot();
        });
        it('contains the onboardingConfigFileName if set', () => {
            delete config.description;
            config.schedule = ['before 5am'];
            config.onboardingConfigFileName = '.github/renovate.json';
            const res = config_description_1.getConfigDesc(config);
            expect(res).toMatchSnapshot();
            expect(res.indexOf('`.github/renovate.json`')).not.toBe(-1);
            expect(res.indexOf('`renovate.json`')).toBe(-1);
        });
        it('falls back to "renovate.json" if onboardingConfigFileName is not set', () => {
            delete config.description;
            config.schedule = ['before 5am'];
            config.onboardingConfigFileName = undefined;
            const res = config_description_1.getConfigDesc(config);
            expect(res).toMatchSnapshot();
            expect(res.indexOf('`renovate.json`')).not.toBe(-1);
        });
        it('falls back to "renovate.json" if onboardingConfigFileName is not valid', () => {
            delete config.description;
            config.schedule = ['before 5am'];
            config.onboardingConfigFileName = 'foo.bar';
            const res = config_description_1.getConfigDesc(config);
            expect(res).toMatchSnapshot();
            expect(res.indexOf('`renovate.json`')).not.toBe(-1);
        });
    });
});
//# sourceMappingURL=config-description.spec.js.map