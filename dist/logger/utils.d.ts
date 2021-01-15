/// <reference types="node" />
import { Stream } from 'stream';
import bunyan from 'bunyan';
export interface BunyanRecord extends Record<string, any> {
    level: number;
    msg: string;
    module?: string;
}
export declare class ProblemStream extends Stream {
    private _problems;
    readable: boolean;
    writable: boolean;
    constructor();
    write(data: BunyanRecord): boolean;
    getProblems(): BunyanRecord[];
    clearProblems(): void;
}
export default function prepareError(err: Error): Record<string, unknown>;
export declare function sanitizeValue(value: unknown, seen?: WeakMap<object, any>): any;
export declare function withSanitizer(streamConfig: bunyan.Stream): bunyan.Stream;
