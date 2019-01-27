import { loadJsonFile } from './github';
import { pageAttributes } from './page-attributes';

export interface RepoConfig {
  origins: string[];
}

let promise: Promise<RepoConfig>;

export function getRepoConfig() {
  if (!promise) {
    promise = loadJsonFile<RepoConfig>('utterances.json').then(
      data => {
        if (!Array.isArray(data.origins)) {
          data.origins = [];
        }
        return data;
      },
      () => ({
        origins: [pageAttributes.origin]
      })
    );
  }

  return promise;
}
