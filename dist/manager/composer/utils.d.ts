import { id as composerVersioningId } from '../../versioning/composer';
import { UpdateArtifactsConfig } from '../common';
import type { ComposerConfig, ComposerLock } from './types';
export { composerVersioningId };
export declare function getConstraint(config: UpdateArtifactsConfig): string;
export declare function extractContraints(composerJson: ComposerConfig, lockParsed: ComposerLock): Record<string, string>;
