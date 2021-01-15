import { PackageDependency } from '../common';
export declare const keyValueExtractionRegex: RegExp;
export interface ExtractionResult {
    lineNumber: number;
    dependencies: PackageDependency[];
}
export declare enum TerragruntDependencyTypes {
    unknown = "unknown",
    terragrunt = "terraform"
}
export interface TerraformManagerData {
    terragruntDependencyType: TerragruntDependencyTypes;
}
export declare enum TerragruntResourceTypes {
    unknown = "unknown"
}
export interface ResourceManagerData extends TerraformManagerData {
    resourceType?: TerragruntResourceTypes;
    chart?: string;
    image?: string;
    name?: string;
    repository?: string;
}
export declare function getTerragruntDependencyType(value: string): TerragruntDependencyTypes;
export declare function checkFileContainsDependency(content: string, checkList: string[]): boolean;
