import * as core from '@actions/core';
import * as github from '@actions/github';
import * as Context from '@actions/github/lib/context';
import yaml from 'js-yaml';
import path from 'path';
import { ConfigEntry } from './ConfigEntry';
const CONFIG_PATH = '.github';

export async function getConfig(
  octokit: ReturnType<typeof github.getOctokit>,
  fileName: string,
  context: Context.Context,
): Promise<ConfigEntry[]> {
  core.debug(`getConfig ${fileName}`);
  try {
    const configFile = {
      owner: context.repo.owner,
      repo: context.repo.repo,
      path: path.posix.join(CONFIG_PATH, fileName),
      ref: context.payload.pull_request!.head.sha,
    };
    core.debug(`Getting contents of ${JSON.stringify(configFile)}`);
    const response = await octokit.rest.repos.getContent(configFile);
    if (Array.isArray(response.data)) {
      throw new Error(`${fileName} is not a file.`);
    }
    if (!('content' in response.data) || response.data.content === undefined) {
      throw new Error(`${fileName} is empty.`);
    }
    return parseConfig(response.data.content);
  } catch (error: any) {
    core.debug(`getConfig error: ${error.toString()}`);
    if (error.status === 404) {
      return [];
    }

    throw error;
  }
}

function parseConfig(content: string): ConfigEntry[] {
  core.debug(`parseConfig ${content}`);
  const configObject = (yaml.load(Buffer.from(content, 'base64').toString()) ?? {}) as Record<string, string>;
  if (Object.keys(configObject).length === 0) {
    return [];
  }

  core.debug(`configObject: ${JSON.stringify(configObject)}`);

  return Object.entries(configObject).reduce((entries: ConfigEntry[], [label, object]: [string, any]) => {
    const headPattern = object.head || (typeof object === 'string' || Array.isArray(object) ? object : undefined);
    const basePattern = object.base;
    let headRegExp;
    let baseRegExp;

    try {
      headRegExp = extractRegExp(object.headRegExp);
      baseRegExp = extractRegExp(object.baseRegExp);
    } catch {
      throw new Error('config.yml has invalid structure.');
    }

    if (headPattern || basePattern || headRegExp || baseRegExp) {
      entries.push(
        new ConfigEntry({
          label: label,
          head: headPattern,
          headRegExp: headRegExp,
          base: basePattern,
          baseRegExp: baseRegExp,
        }),
      );
    } else {
      throw new Error('config.yml has invalid structure.');
    }

    return entries;
  }, []);
}

function extractRegExp(regExpString?: string | string[]): RegExp | RegExp[] | undefined {
  if (!regExpString) return undefined;
  return Array.isArray(regExpString)
    ? regExpString.map(x => new RegExp(x.replace('//', '/')))
    : new RegExp(regExpString.replace('//', '/'));
}
