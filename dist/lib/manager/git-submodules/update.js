"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const simple_git_1 = __importDefault(require("simple-git"));
const upath_1 = __importDefault(require("upath"));
async function updateDependency({ fileContent, upgrade, }) {
    const git = simple_git_1.default(upgrade.localDir);
    const submoduleGit = simple_git_1.default(upath_1.default.join(upgrade.localDir, upgrade.depName));
    try {
        await git.submoduleUpdate(['--init', upgrade.depName]);
        await submoduleGit.checkout([upgrade.newVersion]);
        return fileContent;
    }
    catch (err) {
        return null;
    }
}
exports.default = updateDependency;
//# sourceMappingURL=update.js.map