import { GitPullRequest, GitStatusContext } from 'azure-devops-node-api/interfaces/GitInterfaces';
import { AzurePr } from './types';
export declare function getNewBranchName(branchName?: string): string;
export declare function getGitStatusContextCombinedName(context: GitStatusContext): string | undefined;
export declare function getGitStatusContextFromCombinedName(context: string): GitStatusContext | undefined;
export declare function getBranchNameWithoutRefsheadsPrefix(branchPath: string): string | undefined;
export declare function getBranchNameWithoutRefsPrefix(branchPath?: string): string | undefined;
export declare function getRenovatePRFormat(azurePr: GitPullRequest): AzurePr;
