import options from './query-string';
import {
  Issue,
  IssueComment,
  User,
  setRepoContext,
  loadJsonFile,
  loadIssueByKeyword,
  loadIssueByNumber,
  loadCommentsPage,
  loadUser,
  postComment,
  createIssue
} from './github';
import { login } from './oauth';
import { TimelineComponent } from './timeline-component';
import { NewCommentComponent } from './new-comment-component';
import { setHostOrigin } from './bus';

setRepoContext(options);

/*

NOTES

comments repo must be public

MODES

- reactions widget
- comments widget

QUERY STRING OPTIONS

- repo foo/bar
- config (optional)
- branch (optional)

- issue_keyword
- issue_title, issue_body (optional)
or
- issue_number

CONFIG

- permitted origins
- polling
- permitted reactions
- stylesheet url
- issue create body?
- comment create body?

HOSTING

iframe, allowtransparency

GITHUB API

use conditional requests: https://developer.github.com/v3/#conditional-requests

DISPLAYING COMMENTS

find the issue matching the criteria
if it exists, fetch the comments
if it does not exist, show no comments

POLLING

if polling is enabled, periodically fetch comments or the issue.

COMMENTING

- github oauth
- existence of utterances.json file
-

to comment, we need a github oauth token and we need the id of the issue to comment on.

first have the user sign-in.

fetch(``)
*/

function loadIssue(): Promise<Issue | null> {
  if (options.issueNumber !== null) {
    return loadIssueByNumber(options.issueNumber);
  }
  return loadIssueByKeyword(options.issueKeyword as string);
}

type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};

interface Config {
  origins: string[];
}

type NormalizedConfig = Readonly<Config>;
type RawConfig = Partial<Config>;

function normalizeConfig(filename: string, rawConfig: RawConfig): NormalizedConfig {
  if (!Array.isArray(rawConfig.origins)) {
    throw new Error(`${filename}: origins must be an array`);
  }
  return rawConfig as NormalizedConfig;
}

Promise.all([loadJsonFile<RawConfig>(options.configPath), loadIssue(), loadUser()])
  .then(([config, issue, user]) => bootstrap(config, issue, user));

function bootstrap(rawConfig: RawConfig, issue: Issue | null, user: User | null) {
  const config = normalizeConfig(options.configPath, rawConfig);
  if (config.origins.indexOf(options.origin) === -1) {
    throw new Error(`The origins specified in ${options.configPath} do not include ${options.origin}`);
  }
  setHostOrigin(options.origin);

  const timeline = new TimelineComponent(user, issue, options.owner);
  document.body.appendChild(timeline.element);

  if (issue && issue.comments > 0) {
    loadCommentsPage(issue.number, 1).then(({ items }) => timeline.replaceComments(items));
  }

  if (issue && issue.locked) {
    return;
  }

  const submit = (markdown: string) => {
    if (user) {
      let commentPromise: Promise<IssueComment>;
      if (issue) {
        commentPromise = postComment(issue.number, markdown);
      } else {
        commentPromise = createIssue(options.issueKeyword as string).then(iss => {
          issue = iss;
          timeline.setIssue(issue);
          return postComment(issue.number, markdown);
        });
      }
      return commentPromise.then(comment => {
        timeline.appendComment(comment);
        newCommentComponent.clear();
      });
    }
    return login().then(() => loadUser()).then(u => {
      user = u;
      timeline.setUser(user);
      newCommentComponent.setUser(user);
    });
  };

  const newCommentComponent = new NewCommentComponent(user, submit);
  document.body.appendChild(newCommentComponent.element);
}

// "(\w+)": ".*"
// $1: string;
