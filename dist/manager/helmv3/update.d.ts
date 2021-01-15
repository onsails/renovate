import { ReleaseType } from 'semver';
import { BumpPackageVersionResult } from '../common';
export declare function bumpPackageVersion(content: string, currentValue: string, bumpVersion: ReleaseType | string): BumpPackageVersionResult;
