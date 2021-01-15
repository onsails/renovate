import { GetReleasesConfig, ReleaseResult } from '../common';
export declare const id = "helm";
export declare const defaultRegistryUrls: string[];
export declare const registryStrategy = "first";
export declare const defaultConfig: {
    additionalBranchPrefix: string;
    commitMessageTopic: string;
    group: {
        commitMessageTopic: string;
    };
};
export declare function getRepositoryData(repository: string): Promise<ReleaseResult[]>;
export declare function getReleases({ lookupName, registryUrl: helmRepository, }: GetReleasesConfig): Promise<ReleaseResult | null>;
