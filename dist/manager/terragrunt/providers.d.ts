import { ExtractionResult } from './util';
export declare const sourceExtractionRegex: RegExp;
export declare function extractTerragruntProvider(startingLine: number, lines: string[], moduleName: string): ExtractionResult;
