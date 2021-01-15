import { Preset } from '../common';
export declare function fetchJSONFile(repo: string, fileName: string, endpoint: string): Promise<Preset>;
export declare function getPresetFromEndpoint(pkgName: string, filePreset: string, endpoint: string): Promise<Preset>;
