import { token } from './oauth';

const GITHUB_API = 'https://api.github.com/';
const GITHUB_ENCODING__HTML_JSON = 'application/vnd.github.VERSION.html+json';
const GITHUB_ENCODING__REACTIONS_PREVIEW = 'application/vnd.github.squirrel-girl-preview';
// const UTTERANCES_API = 'https://utterances-oauth.herokuapp.com';
const UTTERANCES_API = 'https://utterances-oauth.azurewebsites.net';

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

function githubFetch(request: Request) {
  return fetch(request).then(response => {
    if (response.status === 401) {
      token.value = null;
    }
    return response;
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

export function loadByTerm(term: string) {
  return load(`"${term}" in:title repo:${owner}/${repo}`);
}

export function loadByNumber(issueNumber: number) {
  return load(`repo:${owner}/${repo} number:${issueNumber}`);
}

function load(issueQuery: string): Promise<LoadResult> {
  const body = JSON.stringify({
    query: `
      query ($owner: String!, $repo: String!, $issueQuery: String!) {
        search(query: $issueQuery, type: ISSUE, first: 1) {
          issueCount
          edges {
            node {
              ... on Issue {
                number
                title
                url
                locked
                comments(first: 100) {
                  totalCount
                  edges { node { databaseId, createdAt, bodyHTML, author { login , url, avatarUrl} } }
                }
              }
            }
          }
        }

        rateLimit { cost, limit, remaining, resetAt }

        repository(owner: $owner, name: $repo) {
          object(expression: "${branch}:utterances.json") {
            ... on Blob {
              text
            }
          }
        }

        viewer { login, url, avatarUrl }
      }`,
    variables: {
      issueQuery,
      owner,
      repo
    }
  });

  return githubFetch(githubRequest('graphql', { method: 'POST', body }))
    .then<Graph>(response => response.json())
    .then(({ data: { viewer, repository, search } }) => {
      const config: UtterancesConfig | null = repository.object ? JSON.parse(repository.object.text) : null;
      let issue: Issue | null = null;
      if (search.issueCount === 1) {
        const raw = search.edges[0].node;
        issue = {
          number: raw.number,
          title: raw.title,
          url: raw.url,
          locked: raw.locked,
          comments: raw.comments.edges.map(({ node: { author, bodyHTML, createdAt, databaseId } }) => ({
            databaseId,
            createdAt: new Date(createdAt),
            bodyHTML,
            author
          }))
        };
      }
      return { config, user: viewer, issue };
    });
}

export interface LoadResult {
  config: UtterancesConfig | null;
  user: User;
  issue: Issue | null;
}

export interface User {
  login: string;
  url: string;
  avatarUrl: string;
}

export interface UtterancesConfig {
  origins: string[];
}

export interface Issue {
  number: number;
  title: string;
  url: string;
  locked: boolean;
  comments: IssueComment[];
}

export interface IssueComment {
  databaseId: number;
  createdAt: Date;
  bodyHTML: string;
  author: User;
}

interface Graph {
  data: {
    search: {
      issueCount: number;
      edges:
      {
        node: {
          number: number;
          title: string;
          url: string;
          locked: boolean;
          comments: {
            totalCount: number;
            edges:
            {
              node: {
                databaseId: number;
                createdAt: string;
                bodyHTML: string;
                author: {
                  login: string;
                  url: string;
                  avatarUrl: string;
                }
              }
            }[];
          }
        }
      }[]
    };
    rateLimit: {
      cost: number;
      limit: number;
      remaining: number;
      resetAt: string;
    };
    repository: {
      object: {
        text: string;
      };
    };
    viewer: {
      login: string;
      url: string;
      avatarUrl: string;
    }
  };
}

export function loadFile(branch: string, filename: string) {
  const request = githubRequest('graphql', {
    method: 'POST',
    body: JSON.stringify({
      query: `query {
          repository(owner: "${owner}", name: "${repo}") {
            object(expression: "${branch}:${filename}") {
              ... on Blob {
                text
              }
            }
          }
        }`
    })
  });
  return githubFetch(request)
    .then(response => response.json())
    .then(result => result.data.repository.object.text as string);
}

/*
query IssueComments($owner: String!, $repo: String!, $issueQuery: String!) {
  search(query: $issueQuery, type: ISSUE, first: 1) {
    issueCount
    edges {
      node {
        ... on Issue {
          id
          title,
          comments(first: 100) {
          	totalCount
            edges {
              node {
                id,
                createdAt,
                bodyHTML,
                author {
                  avatarUrl,
                  login
                }
              }
            }
          }
        }
      }
    }
  }

  rateLimit {
    cost
    limit
    remaining
    resetAt
  }

  repository(owner: $owner, name: $repo) {
    object(expression: "master:utterances.json") {
      ... on Blob {
        text
      }
    }
  }
}

{
  "issueQuery": "user:jdanyow repo:utterances-demo debug",
  "owner": "jdanyow",
  "repo": "utterances-demo"
}
*/
