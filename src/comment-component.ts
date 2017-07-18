import { IssueComment } from './github';
import { timeAgo } from './time-ago';

const avatarArgs = '?v=3&s=88';

export class CommentComponent {
  public readonly element: HTMLElement;

  constructor(
    public comment: IssueComment,
    private issueUrl: string,
    private currentUser: string | null,
    private repoOwner: string
  ) {
    const { author, createdAt, databaseId, bodyHTML } = comment;
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');
    if (author.login === currentUser) {
      this.element.classList.add('current-user');
    }
    if (author.login === repoOwner) {
      this.element.classList.add('repo-owner');
    }
    this.element.innerHTML = `
      <a class="avatar" href="${author.url}" target="_blank">
        <img alt="@${author.login}" height="44" width="44"
              src="${author.avatarUrl}${avatarArgs}">
      </a>
      <div class="comment">
        <header class="comment-header">
          <a class="text-link" href="${author.url}" target="_blank">
            <strong>${author.login}</strong>
          </a>
          commented
          <a class="text-link" href="${this.issueUrl}#issuecomment-${databaseId}" target="_blank">
            ${timeAgo(Date.now(), new Date(createdAt))}
          </a>
        </header>
        <div class="markdown-body">
          ${bodyHTML}
        </div>
      </div>`;

    this.retargetLinks();
  }

  public setComment(comment: IssueComment) {
    const commentDiv = this.element.lastElementChild as HTMLDivElement;
    const { author, createdAt, databaseId, bodyHTML } = comment;

    if (this.comment.author.login !== author.login) {
      if (author.login === this.currentUser) {
        this.element.classList.add('current-user');
      } else {
        this.element.classList.remove('current-user');
      }
      if (author.login === this.repoOwner) {
        this.element.classList.add('repo-owner');
      } else {
        this.element.classList.remove('repo-owner');
      }

      const avatarAnchor = this.element.firstElementChild as HTMLAnchorElement;
      const avatarImg = avatarAnchor.firstElementChild as HTMLImageElement;
      avatarAnchor.href = author.url;
      avatarImg.alt = '@' + author.login;
      avatarImg.src = author.avatarUrl + avatarArgs;

      const authorAnchor = commentDiv
        .firstElementChild!.firstElementChild as HTMLAnchorElement;
      authorAnchor.href = author.url;
      authorAnchor.textContent = author.login;
    }

    if (this.comment.createdAt !== createdAt || this.comment.databaseId !== databaseId) {
      const timestamp = commentDiv.firstElementChild!.firstElementChild!.lastElementChild as HTMLAnchorElement;
      timestamp.href = `${this.issueUrl}#issuecomment-${databaseId}`;
      timestamp.textContent = timeAgo(Date.now(), createdAt);
    }

    if (this.comment.bodyHTML !== bodyHTML) {
      const body = commentDiv.lastElementChild as HTMLDivElement;
      body.innerHTML = bodyHTML;
      this.retargetLinks();
    }

    this.comment = comment;
  }

  public setCurrentUser(currentUser: string | null) {
    if (this.currentUser === currentUser) {
      return;
    }

    const commentDiv = this.element.firstElementChild as HTMLDivElement;
    if (this.comment.author.login === this.currentUser) {
      commentDiv.classList.add('current-user');
    } else {
      commentDiv.classList.remove('current-user');
    }
    if (this.comment.author.login === this.repoOwner) {
      this.element.classList.add('repo-owner');
    } else {
      this.element.classList.remove('repo-owner');
    }

    this.currentUser = currentUser;
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
