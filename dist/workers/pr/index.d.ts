import { RenovateConfig } from '../../config';
import { PlatformPrOptions, Pr } from '../../platform';
import { BranchConfig, PrResult } from '../common';
export declare function addAssigneesReviewers(config: RenovateConfig, pr: Pr): Promise<void>;
export declare function getPlatformPrOptions(config: RenovateConfig & PlatformPrOptions): PlatformPrOptions;
export declare function ensurePr(prConfig: BranchConfig): Promise<{
    prResult: PrResult;
    pr?: Pr;
}>;
export declare function checkAutoMerge(pr: Pr, config: BranchConfig): Promise<boolean>;
