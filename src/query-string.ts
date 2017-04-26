import { deparam } from './deparam';

function readQueryString() {
  const queryString = deparam(location.search.substr(1));

  let issueTerm: string | null = null;
  let issueNumber: number | null = null;
  if ('issue-term' in queryString) {
    issueTerm = queryString['issue-term'];
    if (issueTerm !== undefined) {
      if (issueTerm === '') {
        throw new Error('When issue-term is specified, it cannot be blank.');
      }
      if (['title', 'url', 'pathname'].indexOf(issueTerm) !== -1) {
        issueTerm = queryString[issueTerm];
      }
    }
  } else if ('issue-number' in queryString) {
    issueNumber = +queryString['issue-number'];
    if (issueNumber.toString(10) !== queryString['issue-number']) {
      throw new Error(`issue-number is invalid. "${queryString['issue-number']}`);
    }
  } else {
    throw new Error('Invalid query string arguments. Either "issue-term" or "issue-number" must be specified.');
  }

  if (!('repo' in queryString)) {
    throw new Error('Invalid query string arguments. "repo" is required.');
  }

  if (!('origin' in queryString)) {
    throw new Error('Invalid query string arguments. "origin" is required.');
  }

  const matches = /^([a-z][\w-]+)\/([a-z][\w-]+)$/i.exec(queryString.repo);
  if (matches === null) {
    throw new Error(`Invalid repo: "${queryString.repo}"`);
  }

  return {
    owner: matches[1],
    repo: matches[2],
    branch: 'branch' in queryString ? queryString.branch : 'master',
    configPath: 'config-path' in queryString ? queryString['config-path'] : 'utterances.json',
    issueTerm,
    issueNumber,
    origin: queryString.origin,
    url: queryString.origin + queryString.pathname,
    title: queryString.title,
    description: queryString.description
  };
}

export default readQueryString();
