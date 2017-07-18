import { pageAttributes as page } from './page-attributes';
import {
  LoadResult,
  IssueComment,
  setRepoContext,
  postComment,
  createIssue,
  loadByNumber,
  loadByTerm
} from './github';
import { login } from './oauth';
import { TimelineComponent } from './timeline-component';
import { NewCommentComponent } from './new-comment-component';
import { setHostOrigin, publishResize } from './bus';

setRepoContext(page);

function load() {
  if (page.issueNumber !== null) {
    return loadByNumber(page.issueNumber);
  }
  return loadByTerm(page.issueTerm as string);
}

load().then(bootstrap);

function bootstrap({ config, user, issue }: LoadResult) {
  if (config === null) {
    throw new Error(`${page.configPath} was not found in ${page.owner}/${page.repo}.`);
  }
  if (!Array.isArray(config.origins) || config.origins.indexOf(page.origin) === -1) {
    throw new Error(`The origins specified in ${page.configPath} do not include ${page.origin}`);
  }
  setHostOrigin(page.origin);

  const timeline = new TimelineComponent(user, issue, page.owner);
  document.body.appendChild(timeline.element);

  if (issue && issue.locked) {
    return;
  }

  const submit = (markdown: string) => {
    if (user) {
      let commentPromise: Promise<IssueComment>;
      if (issue) {
        commentPromise = postComment(issue.number, markdown);
      } else {
        commentPromise = createIssue(
          page.issueTerm as string,
          page.url,
          page.title,
          page.description
        ).then(newIssue => {
          issue = newIssue;
          timeline.setIssue(issue);
          return postComment(issue.number, markdown);
        });
      }
      return commentPromise.then(comment => {
        timeline.appendComment(comment);
        newCommentComponent.clear();
      });
    }

    return login().then(() => load()).then(result => {
      user = result.user;
      timeline.setUser(user);
      newCommentComponent.setUser(user);
    });
  };

  const newCommentComponent = new NewCommentComponent(user, submit);
  timeline.element.appendChild(newCommentComponent.element);
  publishResize();
}
