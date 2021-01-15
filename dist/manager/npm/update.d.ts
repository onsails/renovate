import { ReleaseType } from 'semver';
import { BumpPackageVersionResult, UpdateDependencyConfig } from '../common';
export declare function bumpPackageVersion(content: string, currentValue: string, bumpVersion: ReleaseType | string): BumpPackageVersionResult;
export declare function updateDependency({ fileContent, upgrade, }: UpdateDependencyConfig): string | null;
