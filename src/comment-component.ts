import { IssueComment } from './github';
import { timeAgo } from './time-ago';

const avatarArgs = '?v=3&s=88';
const displayAssociations: { [association: string]: string; } = {
  COLLABORATOR: 'Collaborator',
  CONTRIBUTOR: 'Contributor',
  MEMBER: 'Member',
  OWNER: 'Owner'
};

export class CommentComponent {
  public readonly element: HTMLElement;

  constructor(
    public comment: IssueComment,
    private currentUser: string | null
  ) {
    const { user, html_url, created_at, body_html, author_association } = comment;
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');
    if (user.login === currentUser) {
      this.element.classList.add('current-user');
    }
    const association = displayAssociations[author_association];
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
          ${association ? `<span class="author-association-badge">${association}</span>` : ''}
        </header>
        <div class="markdown-body markdown-body-scrollable">
          ${body_html}
        </div>
      </div>`;

    this.retargetLinks();
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

  private retargetLinks() {
    const links = this.element.lastElementChild!.lastElementChild!.querySelectorAll('a');
    let j = links.length;
    while (j--) {
      const link = links.item(j);
      link.target = '_blank';
    }
  }
}
