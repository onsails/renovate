import type { Merge } from 'type-fest';
import { RenovateConfig } from '../../../config';
import { BranchConfig } from '../../common';
export declare type BranchifiedConfig = Merge<RenovateConfig, {
    branches: BranchConfig[];
    branchList: string[];
}>;
export declare function branchifyUpgrades(config: RenovateConfig, packageFiles: Record<string, any[]>): Promise<BranchifiedConfig>;
