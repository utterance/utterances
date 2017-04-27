import { loadJsonFile } from './github';

type Partial<T> = {
  [P in keyof T]?: T[P];
};

export interface RepoConfig {
  readonly origins: string[];
}

type RawRepoConfig = Partial<RepoConfig>;

function normalizeConfig(filename: string, rawConfig: RawRepoConfig): RepoConfig {
  if (!Array.isArray(rawConfig.origins)) {
    throw new Error(`${filename}: origins must be an array`);
  }
  return rawConfig as RepoConfig;
}

export function loadRepoConfig(path: string) {
  return loadJsonFile<RawRepoConfig>(path)
    .then<RepoConfig>(config => normalizeConfig(path, config));
}
