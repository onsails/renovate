import { updateArtifacts } from './artifacts';
import { extractPackageFile } from './extract';
declare const language = "rust";
export declare const supportsLockFileMaintenance = true;
export { extractPackageFile, updateArtifacts, language };
export declare const defaultConfig: {
    commitMessageTopic: string;
    additionalBranchPrefix: string;
    fileMatch: string[];
    versioning: string;
    rangeStrategy: string;
};
