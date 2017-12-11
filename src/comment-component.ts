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
      <a class="avatar" href="${user.html_url}" target="_blank">
        <img alt="@${user.login}" height="44" width="44"
              src="${user.avatar_url}${avatarArgs}">
      </a>
      <div class="comment">
        <header class="comment-header">
          <a class="text-link" href="${user.html_url}" target="_blank"><strong>${user.login}</strong></a>
          commented
          <a class="text-link" href="${html_url}" target="_blank">${timeAgo(Date.now(), new Date(created_at))}</a>
          ${association ? `<span class="author-association-badge">${association}</span>` : ''}
        </header>
        <div class="markdown-body">
          ${body_html}
        </div>
      </div>`;

    this.retargetLinks();
  }

  public setComment(comment: IssueComment) {
    const commentDiv = this.element.lastElementChild as HTMLDivElement;
    const { user, html_url, created_at, body_html } = comment;

    if (this.comment.user.login !== user.login) {
      if (user.login === this.currentUser) {
        this.element.classList.add('current-user');
      } else {
        this.element.classList.remove('current-user');
      }

      const avatarAnchor = this.element.firstElementChild as HTMLAnchorElement;
      const avatarImg = avatarAnchor.firstElementChild as HTMLImageElement;
      avatarAnchor.href = user.html_url;
      avatarImg.alt = '@' + user.login;
      avatarImg.src = user.avatar_url + avatarArgs;

      const authorAnchor = commentDiv
        .firstElementChild!.firstElementChild as HTMLAnchorElement;
      authorAnchor.href = user.html_url;
      authorAnchor.textContent = user.login;
    }

    if (this.comment.created_at !== created_at || this.comment.html_url !== html_url) {
      const timestamp = commentDiv.firstElementChild!.firstElementChild!.lastElementChild as HTMLAnchorElement;
      timestamp.href = html_url;
      timestamp.textContent = timeAgo(Date.now(), new Date(created_at));
    }

    if (this.comment.body_html !== body_html) {
      const body = commentDiv.lastElementChild as HTMLDivElement;
      body.innerHTML = body_html;
      this.retargetLinks();
    }

    this.comment = comment;
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

  // private fallbackEmoji() {
  //   const emojis = this.element.lastElementChild!.lastElementChild!.querySelectorAll('g-emoji');
  //   let i = emojis.length;
  //   while (i--) {
  //     const emoji = emojis.item(i);
  //     emoji.innerHTML = '';
  //     const img = document.createElement('img');
  //     img.classList.add('emoji');
  //     img.alt = emoji.getAttribute('alias') as string;
  //     img.height = 20;
  //     img.width = 20;
  //     img.src = emoji.getAttribute('fallback-src') as string;
  //     emoji.appendChild(img);
  //   }
  // }
}
