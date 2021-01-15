import { HTTPError, Response } from 'got';
import { HttpOptions, HttpPostOptions } from '../../util/http';
import { BbbsRestPr, BbsPr } from './types';
export declare function prInfo(pr: BbbsRestPr): BbsPr;
export declare function accumulateValues<T = any>(reqUrl: string, method?: string, options?: HttpOptions | HttpPostOptions, limit?: number): Promise<T[]>;
export interface BitbucketCommitStatus {
    failed: number;
    inProgress: number;
    successful: number;
}
export declare type BitbucketBranchState = 'SUCCESSFUL' | 'FAILED' | 'INPROGRESS' | 'STOPPED';
export interface BitbucketStatus {
    key: string;
    state: BitbucketBranchState;
}
interface BitbucketErrorResponse {
    errors?: {
        exceptionName?: string;
        reviewerErrors?: {
            context?: string;
        }[];
    }[];
}
interface BitbucketError extends HTTPError {
    readonly response: Response<BitbucketErrorResponse>;
}
export declare function isInvalidReviewersResponse(err: BitbucketError): boolean;
export declare function getInvalidReviewers(err: BitbucketError): string[];
export {};
