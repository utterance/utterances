import { User } from './github';
import { publishResize } from './bus';

// tslint:disable-next-line:max-line-length
const anonymousAvatarUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 16" version="1.1"><path fill="rgb(179,179,179)" fill-rule="evenodd" d="M8 10.5L9 14H5l1-3.5L5.25 9h3.5L8 10.5zM10 6H4L2 7h10l-2-1zM9 2L7 3 5 2 4 5h6L9 2zm4.03 7.75L10 9l1 2-2 3h3.22c.45 0 .86-.31.97-.75l.56-2.28c.14-.53-.19-1.08-.72-1.22zM4 9l-3.03.75c-.53.14-.86.69-.72 1.22l.56 2.28c.11.44.52.75.97.75H5l-2-3 1-2z"></path></svg>`;

export class NewCommentComponent {
  public readonly element: HTMLDivElement;

  constructor(
    private user: User | null,
    private readonly submit: (markdown: string) => Promise<void>
  ) {
    this.element = document.createElement('div');
    this.element.classList.add('comment-wrapper');
    this.element.addEventListener('mousemove', publishResize); // todo: measure, throttle

    this.element.innerHTML = `
      <div class="comment-avatar">
        <a target="_blank">
          <img class="avatar" height="44" width="44">
        </a>
      </div>
      <div class="comment current-user">
        <div class="comment-header">
          <div class="comment-header-text">
            <strong>
              Write
            </strong>
          </div>
        </div>
        <div class="comment-body editable">
          <form class="comment-form" accept-charset="UTF-8">
            <textarea class="comment-area" placeholder="Leave a comment" aria-label="comment"></textarea>
            <div class="comment-form-actions">
              <a class="markdown-info" tabindex="-1" target="_blank"
                  href="https://guides.github.com/features/mastering-markdown/" target="_blank">
                Styling with Markdown is supported
              </a>
              <button class="btn btn-primary" type="submit">Comment</button>
            </div>
          </form>
        </div>
      </div>`;

    this.setUser(user);
  }

  public setUser(user: User | null) {
    this.user = user;
    const avatarAnchor = this.element.firstElementChild!.firstElementChild as HTMLAnchorElement;
    const avatar = avatarAnchor.firstElementChild as HTMLImageElement;
    if (user) {
      avatarAnchor.href = user.html_url;
      avatar.alt = '@' + user.login;
      avatar.src = user.avatar_url + '?v=3&s=88';
    } else {
      avatarAnchor.removeAttribute('href');
      avatar.alt = '@anonymous';
      avatar.src = anonymousAvatarUrl;
    }

    const form = this.element.lastElementChild!.lastElementChild!.firstElementChild as HTMLFormElement;
    const textarea = form.firstElementChild as HTMLTextAreaElement;
    const submitButton = textarea.nextElementSibling!.lastElementChild as HTMLButtonElement;

    submitButton.textContent = user ? 'Comment' : 'Sign in to comment';

    textarea.disabled = !user;

    const isEmpty = () => textarea.value.replace(/^\s+|\s+$/g, '').length === 0;
    textarea.addEventListener('input', () => submitButton.disabled = isEmpty());

    let submitting = false;
    form.addEventListener('submit', event => {
      event.preventDefault();

      if (submitting) {
        return;
      }
      submitting = true;
      textarea.disabled = true;
      submitButton.disabled = true;

      this.submit(textarea.value).catch().then(() => {
        textarea.disabled = !user;
        submitButton.disabled = false;
      });
    });
  }

  public clear() {
    const textarea = this.element.lastElementChild!.lastElementChild!
      .firstElementChild!.firstElementChild as HTMLTextAreaElement;
    textarea.value = '';
  }
}
