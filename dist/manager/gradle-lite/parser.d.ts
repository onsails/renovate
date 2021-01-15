import { PackageDependency } from '../common';
import { ManagerData, PackageVariables } from './common';
export declare function parseGradle(input: string, initVars?: PackageVariables, packageFile?: string): {
    deps: PackageDependency<ManagerData>[];
    urls: string[];
};
export declare function parseProps(input: string, packageFile?: string): {
    vars: PackageVariables;
    deps: PackageDependency<ManagerData>[];
};
