import { token } from './oauth';
import { decodeBase64UTF8 } from './encoding';

const GITHUB_API = 'https://api.github.com/';
const GITHUB_ENCODING__HTML_JSON = 'application/vnd.github.VERSION.html+json';
const GITHUB_ENCODING__HTML = 'application/vnd.github.VERSION.html';
const GITHUB_ENCODING__REACTIONS_PREVIEW = 'application/vnd.github.squirrel-girl-preview';
const UTTERANCES_API = 'https://utterances-oauth.herokuapp.com';

const PAGE_SIZE = 100;

let owner: string;
let repo: string;
let branch: string;

export function setRepoContext(context: { owner: string; repo: string; branch: string; }) {
  owner = context.owner;
  repo = context.repo;
  branch = context.branch;
}

function githubRequest(relativeUrl: string, init?: RequestInit) {
  init = init || {};
  init.mode = 'cors';
  init.cache = 'no-cache'; // force conditional request
  const request = new Request(GITHUB_API + relativeUrl, init);
  request.headers.set('Accept', GITHUB_ENCODING__REACTIONS_PREVIEW);
  if (token.value !== null) {
    request.headers.set('Authorization', `token ${token.value}`);
  }
  return request;
}

const rateLimit = {
  standard: {
    limit: Number.MAX_VALUE,
    remaining: Number.MAX_VALUE,
    reset: 0
  },
  search: {
    limit: Number.MAX_VALUE,
    remaining: Number.MAX_VALUE,
    reset: 0
  }
};

function processRateLimit(response: Response) {
  const limit = response.headers.get('X-RateLimit-Limit') as string;
  const remaining = response.headers.get('X-RateLimit-Remaining') as string;
  const reset = response.headers.get('X-RateLimit-Reset') as string;

  const isSearch = /\/search\//.test(response.url);
  const rate = isSearch ? rateLimit.search : rateLimit.standard;

  rate.limit = +limit;
  rate.remaining = +remaining;
  rate.reset = +reset;

  if (response.status === 403 && rate.remaining === 0) {
    const resetDate = new Date(0);
    resetDate.setUTCSeconds(rate.reset);
    const mins = Math.round((resetDate.getTime() - new Date().getTime()) / 1000 / 60);
    const apiType = isSearch ? 'search API' : 'non-search APIs';
    console.warn(`Rate limit exceeded for ${apiType}. Resets in ${mins} minute${mins === 1 ? '' : 's'}.`);
  }
}

function readRelNext(response: Response) {
  const link = response.headers.get('link');
  if (link === null) {
    return 0;
  }
  const match = /\?page=([2-9][0-9]*)>; rel="next"/.exec(link);
  if (match === null) {
    return 0;
  }
  return +match[1];
}

function githubFetch(request: Request) {
  return fetch(request).then(response => {
    if (response.status === 401) {
      token.value = null;
    }
    processRateLimit(response);
    return response;
  });
}

export function loadJsonFile<T>(path: string, html = false) {
  const request = githubRequest(`repos/${owner}/${repo}/contents/${path}?ref=${branch}`);
  if (html) {
    request.headers.set('accept', GITHUB_ENCODING__HTML);
  }
  return githubFetch(request).then<FileContentsResponse | string>(response => {
    if (response.status === 404) {
      throw new Error(`Repo "${owner}/${repo}" does not have a file named "${path}" in the "${branch}" branch.`);
    }
    if (!response.ok) {
      throw new Error(`Error fetching ${path}.`);
    }
    return html ? response.text() : response.json();
  }).then<T>(file => {
    if (html) {
      return file;
    }
    const { content } = file as FileContentsResponse;
    const decoded = decodeBase64UTF8(content);
    return JSON.parse(decoded);
  });
}

export function loadIssueByTerm(term: string) {
  const q = `"${term}" type:issue in:title repo:${owner}/${repo}`;
  const request = githubRequest(`search/issues?q=${encodeURIComponent(q)}&sort=created&order=asc`);
  return githubFetch(request).then<IssueSearchResponse>(response => {
    if (!response.ok) {
      throw new Error('Error fetching issue via search.');
    }
    return response.json();
  }).then(results => {
    if (results.total_count === 0) {
      return null;
    }
    if (results.total_count > 1) {
      console.warn(`Multiple issues match "${q}". Using earliest created.`);
    }
    return results.items[0];
  });
}

export function loadIssueByNumber(issueNumber: number) {
  const request = githubRequest(`repos/${owner}/${repo}/issues/${issueNumber}`);
  return githubFetch(request).then<Issue>(response => {
    if (!response.ok) {
      throw new Error('Error fetching issue via issue number.');
    }
    return response.json();
  });
}

function commentsRequest(issueNumber: number, page: number) {
  const url = `repos/${owner}/${repo}/issues/${issueNumber}/comments?page=${page}&per_page=${PAGE_SIZE}`;
  const request = githubRequest(url);
  const accept = `${GITHUB_ENCODING__HTML_JSON},${GITHUB_ENCODING__REACTIONS_PREVIEW}`;
  request.headers.set('Accept', accept);
  return request;
}

export function loadCommentsPage(issueNumber: number, page: number) {
  const request = commentsRequest(issueNumber, page);
  return githubFetch(request).then(response => {
    if (!response.ok) {
      throw new Error('Error fetching comments.');
    }
    const nextPage = readRelNext(response);
    return response.json()
      .then<CommentsPage>((items: IssueComment[]) => ({ items, nextPage }));
  });
}

export function loadUser(): Promise<User | null> {
  if (token.value === null) {
    return Promise.resolve(null);
  }
  return githubFetch(githubRequest('user'))
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      return null;
    });
}

export function createIssue(issueTerm: string, documentUrl: string, title: string, description: string) {
  const request = new Request(`${UTTERANCES_API}/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: JSON.stringify({
      title: issueTerm,
      body: `# ${title}\n\n${description}\n\n[${documentUrl}](${documentUrl})`
    })
  });
  request.headers.set('Accept', GITHUB_ENCODING__REACTIONS_PREVIEW);
  return fetch(request).then<Issue>(response => {
    if (!response.ok) {
      throw new Error('Error creating comments container issue');
    }
    return response.json();
  });
}

export function postComment(issueNumber: number, markdown: string) {
  const url = `repos/${owner}/${repo}/issues/${issueNumber}/comments`;
  const body = JSON.stringify({ body: markdown });
  const request = githubRequest(url, { method: 'POST', body });
  const accept = `${GITHUB_ENCODING__HTML_JSON},${GITHUB_ENCODING__REACTIONS_PREVIEW}`;
  request.headers.set('Accept', accept);
  return githubFetch(request).then<IssueComment>(response => {
    if (!response.ok) {
      throw new Error('Error posting comment.');
    }
    return response.json();
  });
}

interface IssueSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: Issue[];
}

export interface User {
  login: string;
  id: number;
  avatar_url: string;
  gravatar_id: string;
  url: string;
  html_url: string;
  followers_url: string;
  following_url: string;
  gists_url: string;
  starred_url: string;
  subscriptions_url: string;
  organizations_url: string;
  repos_url: string;
  events_url: string;
  received_events_url: string;
  type: string;
}

export interface Issue {
  url: string;
  repository_url: string;
  labels_url: string;
  comments_url: string;
  events_url: string;
  html_url: string;
  id: number;
  number: number;
  title: string;
  user: User;
  locked: boolean;
  labels: {
    url: string;
    name: string;
    color: string;
  }[];
  state: string;
  assignee: null; // todo,
  milestone: null; // todo,
  comments: number;
  created_at: string;
  updated_at: string;
  closed_at: null; // todo,
  pull_request: {
    html_url: null; // todo,
    diff_url: null; // todo,
    patch_url: null; // todo
  };
  body: string;
  score: number;
  reactions: {
    total_count: number;
    '+1': number;
    '-1': number;
    laugh: number;
    confused: number;
    heart: number;
    hooray: number;
    url: string;
  };
}

interface FileContentsResponse {
  type: string;
  encoding: string;
  size: number;
  name: string;
  path: string;
  content: string;
  sha: string;
  url: string;
  git_url: string;
  html_url: string;
  download_url: string;
}

export interface IssueComment {
  id: number;
  url: string;
  html_url: string;
  body_html: string;
  user: User;
  created_at: string;
  updated_at: string;
}

export interface CommentsPage {
  items: IssueComment[];
  nextPage: number;
}
