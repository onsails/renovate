"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getReleases = exports.id = void 0;
const error_messages_1 = require("../../constants/error-messages");
const logger_1 = require("../../logger");
const external_host_error_1 = require("../../types/errors/external-host-error");
const packageCache = __importStar(require("../../util/cache/package"));
const http_1 = require("../../util/http");
exports.id = 'repology';
const http = new http_1.Http(exports.id);
const cacheNamespace = `datasource-${exports.id}`;
const cacheMinutes = 60;
const packageTypes = ['binname', 'srcname'];
async function queryPackages(url) {
    try {
        const res = await http.getJson(url);
        return res.body;
    }
    catch (err) {
        if (err.statusCode === 404) {
            // Return an array here because the api does not return proper http codes
            // and instead of an 404 error an empty array with code 200 is returned
            // When querying the resolver 404 is thrown if package could not be resolved
            // and 403 if the repo is not supported
            // 403 is handled later because in this case we are trying the API
            return [];
        }
        throw err;
    }
}
async function queryPackagesViaResolver(repoName, packageName, packageType) {
    const query = new URLSearchParams({
        repo: repoName,
        name_type: packageType,
        target_page: 'api_v1_project',
        noautoresolve: 'on',
        name: packageName,
    }).toString();
    // Retrieve list of packages by looking up Repology project
    const packages = await queryPackages(`https://repology.org/tools/project-by?${query}`);
    return packages;
}
async function queryPackagesViaAPI(packageName) {
    // Directly query the package via the API. This will only work if `packageName` has the
    // same name as the repology project
    const packages = await queryPackages(`https://repology.org/api/v1/project/${packageName}`);
    return packages;
}
function findPackageInResponse(response, repoName, pkgName, types) {
    let pkgs = response.filter((pkg) => pkg.repo === repoName);
    // In some cases Repology bundles multiple packages into a single project,
    // which would result in ambiguous results. If we have more than one result
    // left, we should try to determine the correct package by comparing either
    // binname or srcname (depending on `types`) to the given dependency name.
    if (pkgs.length > 1) {
        for (const pkgType of types) {
            pkgs = pkgs.filter((pkg) => !pkg[pkgType] || pkg[pkgType] === pkgName);
            if (pkgs.length === 1) {
                break;
            }
        }
    }
    // Abort if there is still more than one package left, as the result would
    // be ambiguous and unreliable. This should usually not happen...
    if (pkgs.length > 1) {
        logger_1.logger.warn({ repoName, pkgName, packageTypes, pkgs }, 'Repology lookup returned ambiguous results, ignoring...');
        return null;
    }
    // pkgs might be an empty array here and in that case we return undefined
    return pkgs[0];
}
async function queryPackage(repoName, pkgName) {
    let response;
    let pkg;
    // Try getting the packages from tools/project-by first for type binname and
    // afterwards for srcname. This needs to be done first, because some packages
    // resolve to repology projects which have a different name than the package
    // e.g. `pulseaudio-utils` resolves to project `pulseaudio`, BUT there is also
    // a project called `pulseaudio-utils` but it does not contain the package we
    // are looking for.
    try {
        for (const pkgType of packageTypes) {
            response = await queryPackagesViaResolver(repoName, pkgName, pkgType);
            pkg = findPackageInResponse(response, repoName, pkgName, [pkgType]);
            if (pkg) {
                // exit immediately if package found
                return pkg;
            }
        }
    }
    catch (err) {
        if (err.statusCode === 403) {
            logger_1.logger.debug({ repoName, pkgName }, 'Repology does not support tools/project-by lookups for repository. Will try direct API access now');
            // If the repository is not supported in tools/project-by we try directly accessing the
            // API. This will support all repositories but requires that the project name is equal to the
            // package name. This won't be always the case but for a good portion we might be able to resolve
            // the package this way.
            response = await queryPackagesViaAPI(pkgName);
            pkg = findPackageInResponse(response, repoName, pkgName, packageTypes);
            if (pkg) {
                // exit immediately if package found
                return pkg;
            }
        }
        throw err;
    }
    logger_1.logger.debug({ repoName, pkgName }, 'Repository or package not found on Repology');
    return null;
}
async function getCachedPackage(repoName, pkgName) {
    // Fetch previous result from cache if available
    const cacheKey = `${repoName}/${pkgName}`;
    const cachedResult = await packageCache.get(cacheNamespace, cacheKey);
    // istanbul ignore if
    if (cachedResult) {
        return cachedResult;
    }
    // Attempt a package lookup and return if successfully
    const pkg = await queryPackage(repoName, pkgName);
    if (pkg) {
        await packageCache.set(cacheNamespace, cacheKey, pkg, cacheMinutes);
        return pkg;
    }
    // No package was found on Repology
    return null;
}
async function getReleases({ lookupName, }) {
    var _a;
    // Ensure lookup name contains both repository and package
    const [repoName, pkgName] = lookupName.split('/', 2);
    if (!repoName || !pkgName) {
        throw new external_host_error_1.ExternalHostError(new Error('Repology lookup name must contain repository and package separated by slash (<repo>/<pkg>)'));
    }
    logger_1.logger.trace(`repology.getReleases(${repoName}, ${pkgName})`);
    try {
        // Attempt to retrieve (cached) package information from Repology
        const pkg = await getCachedPackage(repoName, pkgName);
        if (!pkg) {
            return null;
        }
        // Always prefer origversion if available, otherwise default to version
        // This is required as source packages usually have no origversion
        const version = (_a = pkg.origversion) !== null && _a !== void 0 ? _a : pkg.version;
        return { releases: [{ version }] };
    }
    catch (err) {
        if (err.message === error_messages_1.HOST_DISABLED) {
            // istanbul ignore next
            logger_1.logger.trace({ lookupName, err }, 'Host disabled');
        }
        else {
            logger_1.logger.warn({ lookupName, err }, 'Repology lookup failed with unexpected error');
        }
        throw new external_host_error_1.ExternalHostError(err);
    }
}
exports.getReleases = getReleases;
//# sourceMappingURL=index.js.map