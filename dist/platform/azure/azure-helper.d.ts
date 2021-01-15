import { GitCommit, GitPullRequestMergeStrategy, GitRef } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { HostRule } from '../../types';
import { GitOptions } from '../../types/git';
export declare function getStorageExtraCloneOpts(config: HostRule): GitOptions;
export declare function getRefs(repoId: string, branchName?: string): Promise<GitRef[]>;
export interface AzureBranchObj {
    name: string;
    oldObjectId: string;
}
export declare function getAzureBranchObj(repoId: string, branchName: string, from?: string): Promise<AzureBranchObj>;
export declare function getFile(repoId: string, filePath: string, branchName: string): Promise<string | null>;
export declare function max4000Chars(str: string): string;
export declare function getCommitDetails(commit: string, repoId: string): Promise<GitCommit>;
export declare function getProjectAndRepo(str: string): {
    project: string;
    repo: string;
};
export declare function getMergeMethod(repoId: string, project: string, branchRef?: string): Promise<GitPullRequestMergeStrategy>;
