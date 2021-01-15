export declare function regEx(pattern: string, flags?: string): RegExp;
export declare function escapeRegExp(input: string): string;
export declare function isConfigRegex(input: unknown): input is string;
declare type ConfigRegexPredicate = (string: any) => boolean;
export declare function configRegexPredicate(input: string): ConfigRegexPredicate;
export {};
