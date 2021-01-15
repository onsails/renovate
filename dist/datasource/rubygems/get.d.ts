import { ReleaseResult } from '../common';
export declare function fetch(dependency: string, registry: string, path: string): Promise<any>;
export declare function getDependency(dependency: string, registry: string): Promise<ReleaseResult | null>;
