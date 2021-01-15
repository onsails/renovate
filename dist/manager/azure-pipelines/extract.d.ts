import { PackageDependency, PackageFile } from '../common';
interface Container {
    image: string;
}
interface Repository {
    type: 'git' | 'github' | 'bitbucket';
    name: string;
    ref: string;
}
interface Resources {
    repositories: Repository[];
    containers: Container[];
}
interface AzurePipelines {
    resources: Resources;
}
export declare function extractRepository(repository: Repository): PackageDependency | null;
export declare function extractContainer(container: Container): PackageDependency | null;
export declare function parseAzurePipelines(content: string, filename: string): AzurePipelines | null;
export declare function extractPackageFile(content: string, filename: string): PackageFile | null;
export {};
