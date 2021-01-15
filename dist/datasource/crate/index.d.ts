import { GetReleasesConfig, ReleaseResult } from '../common';
export declare const id = "crate";
export declare function getIndexSuffix(lookupName: string): string;
export declare function getReleases({ lookupName, }: GetReleasesConfig): Promise<ReleaseResult | null>;
