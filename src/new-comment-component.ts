import { User } from './github';
import { publishResize } from './bus';

// tslint:disable-next-line:max-line-length
const anonymousAvatarUrl = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 16" version="1.1"><path fill="rgb(179,179,179)" fill-rule="evenodd" d="M8 10.5L9 14H5l1-3.5L5.25 9h3.5L8 10.5zM10 6H4L2 7h10l-2-1zM9 2L7 3 5 2 4 5h6L9 2zm4.03 7.75L10 9l1 2-2 3h3.22c.45 0 .86-.31.97-.75l.56-2.28c.14-.53-.19-1.08-.72-1.22zM4 9l-3.03.75c-.53.14-.86.69-.72 1.22l.56 2.28c.11.44.52.75.97.75H5l-2-3 1-2z"></path></svg>`;

export class NewCommentComponent {
  public readonly element: HTMLElement;

  constructor(
    private user: User | null,
    private readonly submit: (markdown: string) => Promise<void>
  ) {
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');
    this.element.addEventListener('mousemove', publishResize); // todo: measure, throttle

    this.element.innerHTML = `
      <a class="avatar" target="_blank">
        <img height="44" width="44">
      </a>
      <div class="new-comment">
        <header class="new-comment-header">
          Join the discussion
        </header>
        <form class="new-comment-body" id="comment-form" accept-charset="UTF-8" action="javascript:">
          <textarea placeholder="Leave a comment" aria-label="comment"></textarea>
        </form>
        <footer class="new-comment-footer">
          <a class="text-link markdown-info" tabindex="-1" target="_blank"
             href="https://guides.github.com/features/mastering-markdown/">
            Styling with Markdown is supported
          </a>
          <button class="btn btn-primary" form="comment-form" type="submit">Comment</button>
        </footer>
      </div>`;

    this.setUser(user);
  }

  public setUser(user: User | null) {
    this.user = user;
    const avatarAnchor = this.element.firstElementChild as HTMLAnchorElement;
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

    const form = avatarAnchor.nextElementSibling!.firstElementChild!.nextElementSibling as HTMLFormElement;
    const textarea = form.firstElementChild as HTMLTextAreaElement;
    const submitButton = form.nextElementSibling!.lastElementChild as HTMLButtonElement;

    submitButton.textContent = user ? 'Comment' : 'Sign in to comment';
    submitButton.disabled = !!user;

    textarea.disabled = !user;

    textarea.addEventListener('input', () => {
      submitButton.disabled = /^\s*$/.test(textarea.value);
      if (textarea.scrollHeight < 450 && textarea.offsetHeight < textarea.scrollHeight) {
        textarea.style.height = `${textarea.scrollHeight}px`;
        publishResize();
      }
    });

    let submitting = false;
    form.addEventListener('submit', event => {
      event.preventDefault();

      if (submitting) {
        return;
      }
      submitting = true;
      if (this.user) {
        textarea.disabled = true;
        submitButton.disabled = true;
      }
      this.submit(textarea.value).catch(() => 0).then(() => {
        submitting = false;
        textarea.disabled = !this.user;
        textarea.value = '';
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
