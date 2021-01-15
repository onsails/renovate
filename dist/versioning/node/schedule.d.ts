interface NodeJsSchedule {
    lts?: string;
    maintenance?: string;
    end: string;
    start: string;
    codename?: string;
}
export declare type NodeJsData = Record<string, NodeJsSchedule>;
export declare const nodeSchedule: NodeJsData;
export interface NodeJsPolicies {
    all: number[];
    lts: number[];
    active: number[];
    lts_active: number[];
    lts_latest: number[];
    current: number[];
}
export declare function getPolicies(): NodeJsPolicies;
export {};
