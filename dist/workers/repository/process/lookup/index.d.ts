import { RenovateConfig, ValidationMessage } from '../../../../config';
import { Release } from '../../../../datasource';
import { LookupUpdate, RangeConfig } from '../../../../manager/common';
import { SkipReason } from '../../../../types';
import { FilterConfig } from './filter';
import { RollbackConfig } from './rollback';
export interface UpdateResult {
    sourceDirectory?: string;
    dockerRepository?: string;
    dockerRegistry?: string;
    changelogUrl?: string;
    dependencyUrl?: string;
    homepage?: string;
    deprecationMessage?: string;
    sourceUrl?: string;
    skipReason: SkipReason;
    releases: Release[];
    fixedVersion?: string;
    updates: LookupUpdate[];
    warnings: ValidationMessage[];
}
export interface LookupUpdateConfig extends RollbackConfig, FilterConfig, RangeConfig, RenovateConfig {
    separateMinorPatch?: boolean;
    digestOneAndOnly?: boolean;
    pinDigests?: boolean;
    rollbackPrs?: boolean;
    currentDigest?: string;
    lockedVersion?: string;
    vulnerabilityAlert?: boolean;
    separateMajorMinor?: boolean;
    separateMultipleMajor?: boolean;
    datasource: string;
    depName: string;
}
export declare function lookupUpdates(inconfig: LookupUpdateConfig): Promise<UpdateResult>;
