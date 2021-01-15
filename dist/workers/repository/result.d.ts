import { RenovateConfig } from '../../config';
declare type ProcessStatus = 'disabled' | 'enabled' | 'onboarding' | 'unknown';
export interface ProcessResult {
    res: string;
    status: ProcessStatus;
    enabled: boolean;
    onboarded: boolean;
}
export declare function processResult(config: RenovateConfig, res: string): ProcessResult;
export {};
