import { pageAttributes as page } from './page-attributes';
import {
  Issue,
  setRepoContext,
  loadIssueByTerm,
  loadIssueByNumber,
  loadCommentsPage,
  loadUser,
  postComment,
  createIssue,
  PAGE_SIZE,
  IssueComment
} from './github';
import { TimelineComponent } from './timeline-component';
import { NewCommentComponent } from './new-comment-component';
import { startMeasuring, scheduleMeasure } from './measure';
import { loadTheme } from './theme';
import { getRepoConfig } from './repo-config';
import { loadToken } from './oauth';
import { enableReactions } from './reactions';

setRepoContext(page);

function loadIssue(): Promise<Issue | null> {
  if (page.issueNumber !== null) {
    return loadIssueByNumber(page.issueNumber);
  }
  return loadIssueByTerm(page.issueTerm as string);
}

async function bootstrap() {
  await loadToken();
  // tslint:disable-next-line:prefer-const
  let [issue, user] = await Promise.all([
    loadIssue(),
    loadUser(),
    loadTheme(page.theme, page.origin)
  ]);

  startMeasuring(page.origin);

  const timeline = new TimelineComponent(user, issue);
  document.body.appendChild(timeline.element);

  if (issue && issue.comments > 0) {
    renderComments(issue, timeline);
  }

  scheduleMeasure();

  if (issue && issue.locked) {
    return;
  }

  enableReactions(!!user);

  const submit = async (markdown: string) => {
    await assertOrigin();
    if (!issue) {
      issue = await createIssue(
        page.issueTerm as string,
        page.url,
        page.title,
        page.description || '',
        page.label
      );
      timeline.setIssue(issue);
    }
    const comment = await postComment(issue.number, markdown);
    timeline.insertComment(comment, true);
    newCommentComponent.clear();
  };

  const newCommentComponent = new NewCommentComponent(user, submit);
  timeline.element.appendChild(newCommentComponent.element);
}

bootstrap();

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

async function renderComments(issue: Issue, timeline: TimelineComponent) {
  const renderPage = (page: IssueComment[]) => {
    for (const comment of page) {
      timeline.insertComment(comment, false);
    }
  };

  const pageCount = Math.ceil(issue.comments / PAGE_SIZE);
  // always load the first page.
  const pageLoads = [loadCommentsPage(issue.number, 1)];
  // if there are multiple pages, load the last page.
  if (pageCount > 1) {
    pageLoads.push(loadCommentsPage(issue.number, pageCount));
  }
  // if the last page is small, load the penultimate page.
  if (pageCount > 2 && issue.comments % PAGE_SIZE < 3 &&
    issue.comments % PAGE_SIZE !== 0) {
    pageLoads.push(loadCommentsPage(issue.number, pageCount - 1));
  }
  // await all loads to reduce jank.
  const pages = await Promise.all(pageLoads);
  for (const page of pages) {
    renderPage(page);
  }
  // enable loading hidden pages.
  let hiddenPageCount = pageCount - pageLoads.length;
  let nextHiddenPage = 2;
  const renderLoader = (afterPage: IssueComment[]) => {
    if (hiddenPageCount === 0) {
      return;
    }
    const load = async () => {
      loader.setBusy();
      const page = await loadCommentsPage(issue.number, nextHiddenPage);
      loader.remove();
      renderPage(page);
      hiddenPageCount--;
      nextHiddenPage++;
      renderLoader(page);
    };
    const afterComment = afterPage.pop()!;
    const loader = timeline.insertPageLoader(afterComment, hiddenPageCount * PAGE_SIZE, load);
  };
  renderLoader(pages[0]);
}

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
