"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.context = void 0;
exports.run = run;
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const config_1 = require("./config");
const ConfigEntry_1 = require("./ConfigEntry");
const CONFIG_FILENAME = 'pr-branch-labeler.yml';
const defaults = [
    new ConfigEntry_1.ConfigEntry({ label: 'feature', head: 'feature/*' }),
    new ConfigEntry_1.ConfigEntry({ label: 'bugfix', head: ['bugfix/*', 'hotfix/*'] }),
    new ConfigEntry_1.ConfigEntry({ label: 'chore', head: 'chore/*' }),
];
// Export the context to be able to mock the payload during tests.
exports.context = github.context;
async function run() {
    const repoToken = core.getInput('repo-token', { required: true });
    core.debug(`context: ${exports.context ? JSON.stringify(exports.context) : ''}`);
    if (exports.context && exports.context.payload && exports.context.payload.repository && exports.context.payload.pull_request) {
        const octokit = github.getOctokit(repoToken);
        const repoConfig = await (0, config_1.getConfig)(octokit, CONFIG_FILENAME, exports.context);
        core.debug(`repoConfig: ${JSON.stringify(repoConfig)}`);
        const config = repoConfig.length > 0 ? repoConfig : defaults;
        core.debug(`config: ${JSON.stringify(config)}`);
        const headRef = exports.context.payload.pull_request.head.ref;
        const baseRef = exports.context.payload.pull_request.base.ref;
        const labelsToAdd = config
            .map(entry => entry.getLabel(headRef, baseRef))
            .filter(label => label !== undefined)
            .map(label => label);
        core.debug(`Adding labels: ${labelsToAdd}`);
        if (labelsToAdd.length > 0) {
            await octokit.rest.issues.addLabels({
                issue_number: exports.context.payload.pull_request.number,
                labels: labelsToAdd,
                ...exports.context.repo,
            });
        }
    }
}
if (require.main === module) {
    run().catch((error) => {
        core.error(`ERROR! ${error.toString()}`);
        core.setFailed(error.message);
        throw error;
    });
}
