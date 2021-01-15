/// <reference types="node" />
import { DiffResult as DiffResult_, StatusResult as StatusResult_ } from 'simple-git';
import { GitOptions, GitProtocol } from '../../types/git';
export * from './private-key';
declare module 'fs-extra' {
    function exists(pathLike: string): Promise<boolean>;
}
export declare type StatusResult = StatusResult_;
export declare type DiffResult = DiffResult_;
export declare type CommitSha = string;
interface StorageConfig {
    localDir: string;
    currentBranch?: string;
    url: string;
    extraCloneOpts?: GitOptions;
    gitAuthorName?: string;
    gitAuthorEmail?: string;
    cloneSubmodules?: boolean;
}
export declare function initRepo(args: StorageConfig): Promise<void>;
export declare function setBranchPrefix(branchPrefix: string): Promise<void>;
export declare function getSubmodules(): Promise<string[]>;
export declare function syncGit(): Promise<void>;
export declare function getRepoStatus(): Promise<StatusResult>;
export declare function branchExists(branchName: string): boolean;
export declare function getBranchCommit(branchName: string): CommitSha | null;
export declare function getBranchParentSha(branchName: string): Promise<CommitSha | null>;
export declare function getCommitMessages(): Promise<string[]>;
export declare function checkoutBranch(branchName: string): Promise<CommitSha>;
export declare function getFileList(): Promise<string[]>;
export declare function getBranchList(): string[];
export declare function isBranchStale(branchName: string): Promise<boolean>;
export declare function isBranchModified(branchName: string): Promise<boolean>;
export declare function deleteBranch(branchName: string): Promise<void>;
export declare function mergeBranch(branchName: string): Promise<void>;
export declare function getBranchLastCommitTime(branchName: string): Promise<Date>;
export declare function getBranchFiles(branchName: string): Promise<string[]>;
export declare function getFile(filePath: string, branchName?: string): Promise<string | null>;
export declare function hasDiff(branchName: string): Promise<boolean>;
/**
 * File to commit
 */
export interface File {
    /**
     * Relative file path
     */
    name: string;
    /**
     * file contents
     */
    contents: string | Buffer;
}
export declare type CommitFilesConfig = {
    branchName: string;
    files: File[];
    message: string;
    force?: boolean;
};
export declare function commitFiles({ branchName, files, message, force, }: CommitFilesConfig): Promise<CommitSha | null>;
export declare function getUrl({ protocol, auth, hostname, host, repository, }: {
    protocol?: GitProtocol;
    auth?: string;
    hostname?: string;
    host?: string;
    repository: string;
}): string;
export declare function getHttpUrl(url: string, token?: string): string;
