"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs = __importStar(require("fs-extra"));
describe('manager metadata', () => {
    const managerList = fs
        .readdirSync(__dirname, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .filter((name) => !name.startsWith('__'))
        .sort();
    test.each(managerList)('%s has readme with no h1 or h2', async (manager) => {
        let readme;
        try {
            readme = await fs.readFile(`${__dirname}/${manager}/readme.md`, 'utf8');
        }
        catch (err) {
            // do nothing
        }
        expect(readme).toBeDefined();
        const lines = readme.split('\n');
        let isCode = false;
        const res = [];
        for (const line of lines) {
            if (line.startsWith('```')) {
                isCode = !isCode;
            }
            else if (!isCode) {
                res.push(line);
            }
        }
        expect(res.some((line) => line.startsWith('# ') || line.startsWith('## '))).toBe(false);
    });
});
//# sourceMappingURL=metadata.spec.js.map