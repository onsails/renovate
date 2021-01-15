import { ManagerApi } from './common';
import * as ansible from './ansible';
import * as ansibleGalaxy from './ansible-galaxy';
import * as azurePipelines from './azure-pipelines';
import * as batect from './batect';
import * as batectWrapper from './batect-wrapper';
import * as bazel from './bazel';
import * as buildkite from './buildkite';
import * as bundler from './bundler';
import * as cargo from './cargo';
import * as cdnurl from './cdnurl';
import * as circleci from './circleci';
import * as cocoapods from './cocoapods';
import * as composer from './composer';
import * as depsEdn from './deps-edn';
import * as dockerCompose from './docker-compose';
import * as dockerfile from './dockerfile';
import * as droneci from './droneci';
import * as gitSubmodules from './git-submodules';
import * as githubActions from './github-actions';
import * as gitlabci from './gitlabci';
import * as gitlabciInclude from './gitlabci-include';
import * as gomod from './gomod';
import * as gradle from './gradle';
import * as gradleLite from './gradle-lite';
import * as gradleWrapper from './gradle-wrapper';
import * as helmRequirements from './helm-requirements';
import * as helmValues from './helm-values';
import * as helmfile from './helmfile';
import * as helmv3 from './helmv3';
import * as homebrew from './homebrew';
import * as html from './html';
import * as jenkins from './jenkins';
import * as kubernetes from './kubernetes';
import * as kustomize from './kustomize';
import * as leiningen from './leiningen';
import * as maven from './maven';
import * as meteor from './meteor';
import * as mix from './mix';
import * as nodenv from './nodenv';
import * as npm from './npm';
import * as nuget from './nuget';
import * as nvm from './nvm';
import * as pip_requirements from './pip_requirements';
import * as pip_setup from './pip_setup';
import * as pipenv from './pipenv';
import * as poetry from './poetry';
import * as preCommit from './pre-commit';
import * as pub from './pub';
import * as regex from './regex';
import * as rubyVersion from './ruby-version';
import * as sbt from './sbt';
import * as setupCfg from './setup-cfg';
import * as swift from './swift';
import * as terraform from './terraform';
import * as terraformVersion from './terraform-version';
import * as terragrunt from './terragrunt';
import * as travis from './travis';
const api = new Map<string, ManagerApi>();
export default api;
api.set('ansible', ansible);
api.set('ansible-galaxy', ansibleGalaxy);
api.set('azure-pipelines', azurePipelines);
api.set('batect', batect);
api.set('batect-wrapper', batectWrapper);
api.set('bazel', bazel);
api.set('buildkite', buildkite);
api.set('bundler', bundler);
api.set('cargo', cargo);
api.set('cdnurl', cdnurl);
api.set('circleci', circleci);
api.set('cocoapods', cocoapods);
api.set('composer', composer);
api.set('deps-edn', depsEdn);
api.set('docker-compose', dockerCompose);
api.set('dockerfile', dockerfile);
api.set('droneci', droneci);
api.set('git-submodules', gitSubmodules);
api.set('github-actions', githubActions);
api.set('gitlabci', gitlabci);
api.set('gitlabci-include', gitlabciInclude);
api.set('gomod', gomod);
api.set('gradle', gradle);
api.set('gradle-lite', gradleLite);
api.set('gradle-wrapper', gradleWrapper);
api.set('helm-requirements', helmRequirements);
api.set('helm-values', helmValues);
api.set('helmfile', helmfile);
api.set('helmv3', helmv3);
api.set('homebrew', homebrew);
api.set('html', html);
api.set('jenkins', jenkins);
api.set('kubernetes', kubernetes);
api.set('kustomize', kustomize);
api.set('leiningen', leiningen);
api.set('maven', maven);
api.set('meteor', meteor);
api.set('mix', mix);
api.set('nodenv', nodenv);
api.set('npm', npm);
api.set('nuget', nuget);
api.set('nvm', nvm);
api.set('pip_requirements', pip_requirements);
api.set('pip_setup', pip_setup);
api.set('pipenv', pipenv);
api.set('poetry', poetry);
api.set('pre-commit', preCommit);
api.set('pub', pub);
api.set('regex', regex);
api.set('ruby-version', rubyVersion);
api.set('sbt', sbt);
api.set('setup-cfg', setupCfg);
api.set('swift', swift);
api.set('terraform', terraform);
api.set('terraform-version', terraformVersion);
api.set('terragrunt', terragrunt);
api.set('travis', travis);
