import { PackageDependency } from '../common';
import { ExtractionResult } from './util';
export declare function extractTerragruntModule(startingLine: number, lines: string[]): ExtractionResult;
export declare function analyseTerragruntModule(dep: PackageDependency): void;
