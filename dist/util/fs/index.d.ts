/// <reference types="node" />
import { RenovateConfig } from '../../config/common';
export * from './proxies';
export declare function setFsConfig(config: Partial<RenovateConfig>): void;
export declare function getSubDirectory(fileName: string): string;
export declare function getSiblingFileName(existingFileNameWithPath: string, otherFileName: string): string;
export declare function readLocalFile(fileName: string): Promise<Buffer>;
export declare function readLocalFile(fileName: string, encoding: 'utf8'): Promise<string>;
export declare function writeLocalFile(fileName: string, fileContent: string): Promise<void>;
export declare function deleteLocalFile(fileName: string): Promise<void>;
export declare function ensureDir(dirName: string): Promise<void>;
export declare function ensureLocalDir(dirName: string): Promise<void>;
export declare function ensureCacheDir(dirName: string, envPathVar?: string): Promise<string>;
export declare function localPathExists(pathName: string): Promise<boolean>;
