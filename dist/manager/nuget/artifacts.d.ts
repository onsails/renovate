import { UpdateArtifact, UpdateArtifactsResult } from '../common';
export declare function updateArtifacts({ packageFileName, newPackageFileContent, config, updatedDeps, }: UpdateArtifact): Promise<UpdateArtifactsResult[] | null>;
