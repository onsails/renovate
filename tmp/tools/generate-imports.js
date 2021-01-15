"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_extra_1 = __importDefault(require("fs-extra"));
const shelljs_1 = __importDefault(require("shelljs"));
shelljs_1.default.echo('generating imports');
const newFiles = new Set();
if (!fs_extra_1.default.existsSync('lib')) {
    shelljs_1.default.echo('> missing sources');
    shelljs_1.default.exit(0);
}
if (!fs_extra_1.default.existsSync('data')) {
    shelljs_1.default.echo('> missing data folder');
    shelljs_1.default.exit(0);
}
function findModules(dirname) {
    return fs_extra_1.default
        .readdirSync(dirname, { withFileTypes: true })
        .filter((dirent) => dirent.isDirectory())
        .map((dirent) => dirent.name)
        .filter((name) => !name.startsWith('__'))
        .sort();
}
async function updateFile(file, code) {
    const oldCode = fs_extra_1.default.existsSync(file) ? await fs_extra_1.default.readFile(file, 'utf8') : null;
    if (code !== oldCode) {
        await fs_extra_1.default.writeFile(file, code);
    }
    newFiles.add(file);
}
function camelCase(input) {
    return input
        .replace(/(?:^\w|[A-Z]|\b\w)/g, (char, index) => index === 0 ? char.toLowerCase() : char.toUpperCase())
        .replace(/-/g, '');
}
async function generate({ path, types, map = '', excludes = [], }) {
    shelljs_1.default.echo(`> lib/${path}/`);
    let imports = '';
    let maps = '';
    for (const ds of findModules(`lib/${path}`).filter((n) => !(excludes === null || excludes === void 0 ? void 0 : excludes.includes(n)))) {
        const name = camelCase(ds);
        imports += `import * as ${name} from './${ds}';\n`;
        maps += `api.set('${ds}', ${name}${map});\n`;
    }
    const code = `import { ${types.join(', ')} } from './common';
    ${imports}\n
    const api = new Map<string, ${types.join(' | ')}>();
    export default api;
    ${maps}`;
    await updateFile(`lib/${path}/api.generated.ts`, code.replace(/^\s+/gm, ''));
}
async function generateData() {
    const files = fs_extra_1.default
        .readdirSync('data', { withFileTypes: true })
        .filter((dirent) => dirent.isFile())
        .map((dirent) => dirent.name)
        .sort();
    const importDataFileType = files.map((x) => `  | '${x}'`).join('\n');
    const contentMapDecl = 'const data = new Map<DataFile, string>();';
    const contentMapAssignments = [];
    for (const file of files) {
        shelljs_1.default.echo(`> data/${file}`);
        const rawFileContent = await fs_extra_1.default.readFile(`data/${file}`, 'utf8');
        contentMapAssignments.push(`data.set('${file}', ${JSON.stringify(rawFileContent)});`);
    }
    await updateFile(`lib/data-files.generated.ts`, [
        `type DataFile =\n${importDataFileType};`,
        contentMapDecl,
        contentMapAssignments.join('\n'),
        `export default data;\n`,
    ].join('\n\n'));
}
// eslint-disable-next-line @typescript-eslint/no-floating-promises
(async () => {
    try {
        // data-files
        await generateData();
        // datasources
        await generate({ path: 'datasource', types: ['DatasourceApi'] });
        // managers
        await generate({ path: 'manager', types: ['ManagerApi'] });
        // platform
        await generate({
            path: 'platform',
            types: ['Platform'],
            excludes: ['utils', 'git'],
        });
        // versioning
        await generate({
            path: 'versioning',
            types: ['VersioningApi', 'VersioningApiConstructor'],
            map: '.api',
        });
        await Promise.all(shelljs_1.default
            .find('lib/**/*.generated.ts')
            .filter((f) => !newFiles.has(f))
            .map((file) => fs_extra_1.default.remove(file)));
    }
    catch (e) {
        shelljs_1.default.echo(e.toString());
        shelljs_1.default.exit(1);
    }
})();
