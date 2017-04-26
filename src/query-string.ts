import { deparam } from './deparam';

function readQueryString() {
  const queryString = deparam(location.search.substr(1));

  let issueKeyword: string | null = null;
  let issueNumber: number | null = null;
  if ('issue_keyword' in queryString) {
    issueKeyword = queryString.issue_keyword;
    if (!/^\w+$/.test(issueKeyword)) {
      throw new Error(`issue_keyword must match /^\\w+$/. "${issueKeyword}".`);
    }
  } else if ('issue_number' in queryString) {
    issueNumber = +queryString.issue_number;
    if (issueNumber.toString(10) !== queryString.issue_number) {
      throw new Error(`issue_number is invalid. "${queryString.issue_number}`);
    }
  } else {
    throw new Error('Invalid query string arguments. Either "issue_keyword" or "issue_number" must be specified.');
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
    origin: queryString.origin,
    owner: matches[1],
    repo: matches[2],
    branch: 'branch' in queryString ? queryString.branch : 'master',
    configPath: 'config_path' in queryString ? queryString.config : 'utterances.json',
    issueKeyword,
    issueNumber
  };
}

export default readQueryString();
