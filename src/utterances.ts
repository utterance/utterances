import { pageAttributes as page } from './page-attributes';
import {
  Issue,
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
import { startMeasuring, scheduleMeasure } from './measure';
import { loadTheme } from './theme';
import { getRepoConfig } from './repo-config';

setRepoContext(page);

function loadIssue(): Promise<Issue | null> {
  if (page.issueNumber !== null) {
    return loadIssueByNumber(page.issueNumber);
  }
  return loadIssueByTerm(page.issueTerm as string);
}

Promise.all([loadIssue(), loadUser(), loadTheme(page.theme, page.origin)])
  .then(([issue, user]) => bootstrap(issue, user));

function bootstrap(issue: Issue | null, user: User | null) {
  startMeasuring(page.origin);

  const timeline = new TimelineComponent(user, issue);
  document.body.appendChild(timeline.element);

  if (issue && issue.comments > 0) {
    loadCommentsPage(issue.number, 1)
      .then(({ items }) => items.forEach(comment => timeline.appendComment(comment)));
  }

  if (issue && issue.locked) {
    return;
  }

  const submit = async (markdown: string) => {
    if (user) {
      await assertOrigin();
      if (!issue) {
        issue = await createIssue(
          page.issueTerm as string,
          page.url,
          page.title,
          page.description,
          page.label
        );
        timeline.setIssue(issue);
      }
      const comment = await postComment(issue.number, markdown);
      timeline.appendComment(comment);
      newCommentComponent.clear();
      return;
    }

    login(page.url);
  };

  const newCommentComponent = new NewCommentComponent(user, submit);
  timeline.element.appendChild(newCommentComponent.element);
  scheduleMeasure();
}

addEventListener('not-installed', function handleNotInstalled() {
  removeEventListener('not-installed', handleNotInstalled);
  document.querySelector('.timeline')!.insertAdjacentHTML('afterbegin', `
  <div class="flash flash-error">
    Error: utterances is not installed on <code>${page.owner}/${page.repo}</code>.
    If you own this repo,
    <a href="https://github.com/apps/utterances" target="_top"><strong>install the app</strong></a>.
    Read more about this change in
    <a href="https://github.com/utterance/utterances/pull/25" target="_top">the PR</a>.
  </div>`);
  scheduleMeasure();
});

export async function assertOrigin() {
  const { origins } = await getRepoConfig();
  const { origin, owner, repo } = page;
  if (origins.indexOf(origin) !== -1) {
    return;
  }

  document.querySelector('.timeline')!.lastElementChild!.insertAdjacentHTML('beforebegin', `
  <div class="flash flash-error flash-not-installed">
    Error: <code>${origin}</code> is not permitted to post to <code>${owner}/${repo}</code>.
    Confirm this is the correct repo for this site's comments. If you own this repo,
    <a href="https://github.com/${owner}/${repo}/edit/master/utterances.json" target="_top">
      <strong>update the utterances.json</strong>
    </a>
    to include <code>${origin}</code> in the list of origins.<br/><br/>
    Suggested configuration:<br/>
    <pre><code>${JSON.stringify({ origins: [origin] }, null, 2)}</code></pre>
  </div>`);
  scheduleMeasure();
  throw new Error('Origin not permitted.');
}
