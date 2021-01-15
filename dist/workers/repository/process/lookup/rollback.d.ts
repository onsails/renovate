import { Release } from '../../../../datasource/common';
import { LookupUpdate } from '../../../../manager/common';
export interface RollbackConfig {
    currentValue?: string;
    depName?: string;
    packageFile?: string;
    versioning: string;
}
export declare function getRollbackUpdate(config: RollbackConfig, versions: Release[]): LookupUpdate;
