import { RenovateConfig } from '../../../config';
import { RepoFileConfig } from './common';
export declare function detectRepoFileConfig(): Promise<RepoFileConfig>;
export declare function checkForRepoConfigError(repoConfig: RepoFileConfig): void;
export declare function mergeRenovateConfig(config: RenovateConfig): Promise<RenovateConfig>;
export declare function getRepoConfig(config_: RenovateConfig): Promise<RenovateConfig>;
