import { deparam } from './deparam';
import repoRegex from './repo-regex';

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
      if (['title', 'url', 'pathname', 'og:title'].indexOf(issueTerm) !== -1) {
        if (!params[issueTerm]) {
          throw new Error(`Unable to find "${issueTerm}" metadata.`);
        }
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

  let repo = params.repo;
  let repoParts = repo.split('/');

  if (repoParts.length >= 2) {
    let repoOwner = repoParts[repoParts.length - 2];
    let colonIndex = repoOwner.lastIndexOf(':');
    if (colonIndex > -1 && repoOwner.length - 1 > colonIndex) {
      repoOwner = repoOwner.substring(colonIndex + 1);
    }

    let repoName = repoParts[repoParts.length - 1];
    let gitExtension = '.git';
    if (repoName.endsWith(gitExtension)) {
      repoName = repoName.substring(0, repoName.length - gitExtension.length - 1);
    }

    repo = repoOwner + '/' + repoName;
  }

  const matches = repoRegex.exec(repo);
  if (matches === null) {
    throw new Error(`Invalid repo: "${params.repo}"`);
  }

  return {
    owner: matches[1],
    repo: matches[2],
    issueTerm,
    issueNumber,
    origin: params.origin,
    url: params.url,
    title: params.title,
    description: params.description,
    label: params.label,
    theme: params.theme || 'github-light',
    session: params.session
  };
}

export const pageAttributes = readPageAttributes();
