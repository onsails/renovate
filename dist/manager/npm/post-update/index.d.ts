/// <reference types="node" />
import { PackageFile, PostUpdateConfig } from '../../common';
export interface DetermineLockFileDirsResult {
    yarnLockDirs: string[];
    npmLockDirs: string[];
    pnpmShrinkwrapDirs: string[];
    lernaDirs: string[];
}
export declare function determineLockFileDirs(config: PostUpdateConfig, packageFiles: AdditionalPackageFiles): DetermineLockFileDirsResult;
export declare function writeExistingFiles(config: PostUpdateConfig, packageFiles: AdditionalPackageFiles): Promise<void>;
export declare function writeUpdatedPackageFiles(config: PostUpdateConfig): Promise<void>;
export interface AdditionalPackageFiles {
    npm?: Partial<PackageFile>[];
}
interface ArtifactError {
    lockFile: string;
    stderr: string;
}
interface UpdatedArtifacts {
    name: string;
    contents: string | Buffer;
}
export interface WriteExistingFilesResult {
    artifactErrors: ArtifactError[];
    updatedArtifacts: UpdatedArtifacts[];
}
export declare function getAdditionalFiles(config: PostUpdateConfig, packageFiles: AdditionalPackageFiles): Promise<WriteExistingFilesResult>;
export {};
