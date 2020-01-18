import { CommentAuthorAssociation, IssueComment, reactionTypes } from './github';
import { timeAgo } from './time-ago';
import { scheduleMeasure } from './measure';
import { getReactionsMenuHtml, getReactionHtml, getSignInToReactMenuHtml } from './reactions';

const avatarArgs = '?v=3&s=88';
const displayAssociations: Record<CommentAuthorAssociation, string> = {
  COLLABORATOR: 'Collaborator',
  CONTRIBUTOR: 'Contributor',
  MEMBER: 'Member',
  OWNER: 'Owner',
  FIRST_TIME_CONTRIBUTOR: 'First time contributor',
  FIRST_TIMER: 'First timer',
  NONE: ''
};

export class CommentComponent {
  public readonly element: HTMLElement;

  constructor(
    public comment: IssueComment,
    private currentUser: string | null,
    locked: boolean
  ) {
    const { user, html_url, created_at, body_html, author_association, reactions } = comment;
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');
    if (user.login === currentUser) {
      this.element.classList.add('current-user');
    }
    const association = displayAssociations[author_association];
    const reactionCount = reactionTypes.reduce((sum, id) => sum + reactions[id], 0);
    let headerReactionsMenu = '';
    let footerReactionsMenu = '';
    if (!locked) {
      if (currentUser) {
        headerReactionsMenu = getReactionsMenuHtml(comment.reactions.url, 'right');
        footerReactionsMenu = getReactionsMenuHtml(comment.reactions.url, 'center');
      } else {
        headerReactionsMenu = getSignInToReactMenuHtml('right');
        footerReactionsMenu = getSignInToReactMenuHtml('center');
      }
    }
    this.element.innerHTML = `
      <a class="avatar" href="${user.html_url}" target="_blank" tabindex="-1">
        <img alt="@${user.login}" height="44" width="44"
              src="${user.avatar_url}${avatarArgs}">
      </a>
      <div class="comment">
        <header class="comment-header">
          <span class="comment-meta">
            <a class="text-link" href="${user.html_url}" target="_blank"><strong>${user.login}</strong></a>
            commented
            <a class="text-link" href="${html_url}" target="_blank">${timeAgo(Date.now(), new Date(created_at))}</a>
          </span>
          <div class="comment-actions">
            ${association ? `<span class="author-association-badge">${association}</span>` : ''}
            ${headerReactionsMenu}
          </div>
        </header>
        <div class="markdown-body markdown-body-scrollable">
          ${body_html}
        </div>
        <div class="comment-footer" reaction-count="${reactionCount}" reaction-url="${reactions.url}">
          <form class="reaction-list BtnGroup" action="javascript:">
            ${reactionTypes.map(id => getReactionHtml(reactions.url, id, !currentUser || locked, reactions[id])).join('')}
          </form>
          ${footerReactionsMenu}
        </div>
      </div>`;

    const markdownBody = this.element.querySelector('.markdown-body')!;
    const emailToggle = markdownBody.querySelector('.email-hidden-toggle a') as HTMLAnchorElement;
    if (emailToggle) {
      const emailReply = markdownBody.querySelector('.email-hidden-reply') as HTMLDivElement;
      emailToggle.onclick = event => {
        event.preventDefault();
        emailReply.classList.toggle('expanded');
      };
    }

    processRenderedMarkdown(markdownBody);
  }

  public setCurrentUser(currentUser: string | null) {
    if (this.currentUser === currentUser) {
      return;
    }
    this.currentUser = currentUser;

    if (this.comment.user.login === this.currentUser) {
      this.element.classList.add('current-user');
    } else {
      this.element.classList.remove('current-user');
    }
  }
}

export function processRenderedMarkdown(markdownBody: Element) {
  Array.from(markdownBody.querySelectorAll<HTMLAnchorElement>(':not(.email-hidden-toggle) > a'))
    .forEach(a => { a.target = '_top'; a.rel = 'noopener noreferrer'; });
  Array.from(markdownBody.querySelectorAll<HTMLImageElement>('img'))
    .forEach(img => img.onload = scheduleMeasure);
  Array.from(markdownBody.querySelectorAll<HTMLAnchorElement>('a.commit-tease-sha'))
    .forEach(a => a.href = 'https://github.com' + a.pathname);
}
