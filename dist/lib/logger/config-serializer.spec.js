"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_serializer_1 = __importDefault(require("./config-serializer"));
describe('logger/config-serializer', () => {
    it('squashes templates', () => {
        const config = {
            nottoken: 'b',
            prBody: 'foo',
        };
        expect(config_serializer_1.default(config)).toMatchSnapshot();
    });
    it('suppresses content', () => {
        const config = {
            content: {},
        };
        expect(config_serializer_1.default(config)).toMatchSnapshot();
    });
});
//# sourceMappingURL=config-serializer.spec.js.map