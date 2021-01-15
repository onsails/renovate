export interface Registry {
    readonly url: string;
    readonly name?: string;
}
export declare function getRandomString(): string;
export declare function getDefaultRegistries(): Registry[];
export declare function getConfiguredRegistries(packageFile: string, localDir: string): Promise<Registry[] | undefined>;
