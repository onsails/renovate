import { DigestConfig, GetReleasesConfig, ReleaseResult } from '../common';
export declare const id = "github-tags";
export declare const defaultRegistryUrls: string[];
export declare const registryStrategy = "first";
/**
 * github.getDigest
 *
 * The `newValue` supplied here should be a valid tag for the docker image.
 *
 * This function will simply return the latest commit hash for the configured repository.
 */
export declare function getDigest({ lookupName: repo, registryUrl }: Partial<DigestConfig>, newValue?: string): Promise<string | null>;
export declare function getReleases(config: GetReleasesConfig): Promise<ReleaseResult | null>;
