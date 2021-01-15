import { RenovateConfig } from '../../../config/common';
import { PackageFile } from '../../../manager/common';
import { RepoInitConfig } from '../../../workers/repository/init/common';
export interface BaseBranchCache {
    sha: string;
    configHash: string;
    packageFiles: Record<string, PackageFile[]>;
}
export interface BranchUpgradeCache {
    currentDigest?: string;
    currentValue?: string;
    datasource?: string;
    depName?: string;
    fixedVersion?: string;
    fromVersion?: string;
    lookupName?: string;
    newDigest?: string;
    newValue?: string;
    toVersion?: string;
    sourceUrl?: string;
}
export interface BranchCache {
    automerge: boolean;
    branchName: string;
    isModified: boolean;
    prNo: number | null;
    sha: string | null;
    parentSha: string | null;
    upgrades: BranchUpgradeCache[];
}
export interface Cache {
    branches?: BranchCache[];
    repository?: string;
    init?: RepoInitConfig;
    scan?: Record<string, BaseBranchCache>;
}
export declare function getCacheFileName(config: RenovateConfig): string;
export declare function initialize(config: RenovateConfig): Promise<void>;
export declare function getCache(): Cache;
export declare function finalize(): Promise<void>;
