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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigEntry = void 0;
const core = __importStar(require("@actions/core"));
const matcher_1 = __importDefault(require("matcher"));
class ConfigEntry {
    label;
    head;
    headRegExp;
    base;
    baseRegExp;
    constructor(raw) {
        this.label = raw.label;
        this.head = raw.head;
        this.headRegExp = raw.headRegExp;
        if (this.head && this.headRegExp) {
            throw new Error('Config can only contain one of: head, headRegExp');
        }
        this.base = raw.base;
        this.baseRegExp = raw.baseRegExp;
        if (this.base && this.baseRegExp) {
            throw new Error('Config can only contain one of: base, baseRegExp');
        }
    }
    getLabel(headRef, baseRef) {
        const headMatches = ConfigEntry.getMatches(headRef, this.head, this.headRegExp);
        const baseMatches = ConfigEntry.getMatches(baseRef, this.base, this.baseRegExp);
        if ((this.head || this.headRegExp) && (this.base || this.baseRegExp)) {
            if (headMatches && baseMatches) {
                const label = this.getLabelFromMatches(headMatches.concat(baseMatches));
                core.info(`Matched "${headRef}" to "${this.head ? this.head : this.headRegExp.toString()}" and "${baseRef}" to "${this.base ? this.base : this.baseRegExp.toString()}". Setting label to "${label}"`);
                return label;
            }
            return undefined;
        }
        if ((this.head || this.headRegExp) && headMatches) {
            const label = this.getLabelFromMatches(headMatches);
            core.info(`Matched "${headRef}" to "${this.head ? this.head : this.headRegExp.toString()}". Setting label to "${label}"`);
            return label;
        }
        if ((this.base || this.baseRegExp) && baseMatches) {
            const label = this.getLabelFromMatches(baseMatches);
            core.info(`Matched "${baseRef}" to "${this.base ? this.base : this.baseRegExp.toString()}". Setting label to "${label}"`);
            return label;
        }
        return undefined;
    }
    getLabelFromMatches(matches) {
        if (!this.label.includes('$')) {
            return this.label;
        }
        const matchPosString = (this.label.match(/[$][0-9]*/) ?? [''])[0].replace('$', '');
        const matchPosNumber = parseInt(matchPosString);
        if (isNaN(matchPosNumber) || matchPosNumber < 1) {
            return this.label;
        }
        const actualMatches = matches.filter(match => match != '');
        if (matchPosNumber > actualMatches.length) {
            return this.label;
        }
        return this.label.replace(`$${matchPosNumber}`, actualMatches[matchPosNumber - 1]);
    }
    static getMatches(ref, patterns, patternsRegExp) {
        if (patterns) {
            if (Array.isArray(patterns)) {
                core.debug(`Trying to match "${ref}" to ${JSON.stringify(patterns)}`);
                return patterns.some(pattern => matcher_1.default.isMatch(ref, pattern)) ? [''] : undefined;
            }
            core.debug(`Trying to match "${ref}" to "${patterns}"`);
            return matcher_1.default.isMatch(ref, patterns) ? [''] : undefined;
        }
        if (patternsRegExp) {
            if (Array.isArray(patternsRegExp)) {
                core.debug(`Trying to match "${ref}" to ${JSON.stringify(patternsRegExp.map(x => x.toString()))}`);
                const matches = patternsRegExp
                    .map((pattern) => this.getRegExpMatch(ref, pattern) || null)
                    .filter((match) => match !== null);
                return matches.length === 0 ? undefined : matches.flat();
            }
            core.debug(`Trying to match "${ref}" to "${patternsRegExp.toString()}"`);
            return ConfigEntry.getRegExpMatch(ref, patternsRegExp);
        }
        return undefined;
    }
    static getRegExpMatch(ref, pattern) {
        const regExpResult = pattern.exec(ref);
        if (regExpResult === null) {
            return undefined;
        }
        if (regExpResult.length === 0) {
            return [''];
        }
        return regExpResult.slice(1);
    }
}
exports.ConfigEntry = ConfigEntry;
