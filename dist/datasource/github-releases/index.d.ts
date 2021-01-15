import { GetReleasesConfig, ReleaseResult } from '../common';
export declare const id = "github-releases";
export declare const defaultRegistryUrls: string[];
export declare const registryStrategy = "first";
/**
 * github.getReleases
 *
 * This function can be used to fetch releases with a customisable versioning (e.g. semver) and with releases.
 *
 * This function will:
 *  - Fetch all releases
 *  - Sanitize the versions if desired (e.g. strip out leading 'v')
 *  - Return a dependency object containing sourceUrl string and releases array
 */
export declare function getReleases({ lookupName: repo, registryUrl, }: GetReleasesConfig): Promise<ReleaseResult | null>;
