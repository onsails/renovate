import { Http, HttpOptions, HttpResponse, InternalHttpOptions } from '.';
export declare const setBaseUrl: (url: string) => void;
export declare class BitbucketServerHttp extends Http {
    constructor(options?: HttpOptions);
    protected request<T>(path: string, options?: InternalHttpOptions): Promise<HttpResponse<T> | null>;
}
