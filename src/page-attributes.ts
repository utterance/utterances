import { deparam } from './deparam';

function readPageAttributes() {
  const params = deparam(location.search.substr(1));

  let issueTerm: string | null = null;
  let issueNumber: number | null = null;
  if ('issue-term' in params) {
    issueTerm = params['issue-term'];
    if (issueTerm !== undefined) {
      if (issueTerm === '') {
        throw new Error('When issue-term is specified, it cannot be blank.');
      }
      if (['title', 'url', 'pathname'].indexOf(issueTerm) !== -1) {
        issueTerm = params[issueTerm];
      }
    }
  } else if ('issue-number' in params) {
    issueNumber = +params['issue-number'];
    if (issueNumber.toString(10) !== params['issue-number']) {
      throw new Error(`issue-number is invalid. "${params['issue-number']}`);
    }
  } else {
    throw new Error('"issue-term" or "issue-number" must be specified.');
  }

  if (!('repo' in params)) {
    throw new Error('"repo" is required.');
  }

  if (!('origin' in params)) {
    throw new Error('"origin" is required.');
  }

  const matches = /^([a-z][\w-]+)\/([a-z][\w-]+)$/i.exec(params.repo);
  if (matches === null) {
    throw new Error(`Invalid repo: "${params.repo}"`);
  }

  return {
    owner: matches[1],
    repo: matches[2],
    branch: 'branch' in params ? params.branch : 'master',
    configPath: 'config-path' in params ? params['config-path'] : 'utterances.json',
    issueTerm,
    issueNumber,
    origin: params.origin,
    url: params.url,
    title: params.title,
    description: params.description
  };
}

export const pageAttributes = readPageAttributes();
