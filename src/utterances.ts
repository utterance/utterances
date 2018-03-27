import { pageAttributes as page } from './page-attributes';
import {
  Issue,
  IssueComment,
  User,
  setRepoContext,
  loadIssueByTerm,
  loadIssueByNumber,
  loadCommentsPage,
  loadUser,
  postComment,
  createIssue
} from './github';
import { login } from './oauth';
import { TimelineComponent } from './timeline-component';
import { NewCommentComponent } from './new-comment-component';
import { setHostOrigin, publishResize } from './bus';

setRepoContext(page);

function loadIssue(): Promise<Issue | null> {
  if (page.issueNumber !== null) {
    return loadIssueByNumber(page.issueNumber);
  }
  return loadIssueByTerm(page.issueTerm as string);
}

Promise.all([loadIssue(), loadUser()])
  .then(([issue, user]) => bootstrap(issue, user));

function bootstrap(issue: Issue | null, user: User | null) {
  setHostOrigin(page.origin);

  const timeline = new TimelineComponent(user, issue);
  document.body.appendChild(timeline.element);

  if (issue && issue.comments > 0) {
    loadCommentsPage(issue.number, 1)
      .then(({ items }) => items.forEach(comment => timeline.appendComment(comment)));
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

    return login().then(() => loadUser()).then(u => {
      user = u;
      timeline.setUser(user);
      newCommentComponent.setUser(user);
    });
  };

  const newCommentComponent = new NewCommentComponent(user, submit);
  timeline.element.appendChild(newCommentComponent.element);
  publishResize();
}

addEventListener('not-installed', function handleNotInstalled() {
  removeEventListener('not-installed', handleNotInstalled);
  document.querySelector('.timeline')!.insertAdjacentHTML('afterbegin', `
  <div class="flash flash-error flash-not-installed">
    Error: utterances is not installed on <code>${page.owner}/${page.repo}</code>.
    If you own this repo,
    <a href="https://github.com/apps/utterances" target="_blank"><strong>install the app</strong></a>.
    Read more about this change in
    <a href="https://github.com/utterance/utterances/pull/25" target="_blank">the PR</a>.
  </div>`);
});
