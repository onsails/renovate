import { ReleaseResult } from '../common';
export declare function getDefaultFeed(): string;
export declare function getResourceUrl(url: string, resourceType?: string): Promise<string | null>;
export declare function getReleases(registryUrl: string, feedUrl: string, pkgName: string): Promise<ReleaseResult | null>;
