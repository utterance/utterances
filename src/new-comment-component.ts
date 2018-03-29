import { User, renderMarkdown } from './github';
import { publishResize } from './bus';

// tslint:disable-next-line:max-line-length
const anonymousAvatar = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 14 16" version="1.1"><path fill="rgb(179,179,179)" fill-rule="evenodd" d="M8 10.5L9 14H5l1-3.5L5.25 9h3.5L8 10.5zM10 6H4L2 7h10l-2-1zM9 2L7 3 5 2 4 5h6L9 2zm4.03 7.75L10 9l1 2-2 3h3.22c.45 0 .86-.31.97-.75l.56-2.28c.14-.53-.19-1.08-.72-1.22zM4 9l-3.03.75c-.53.14-.86.69-.72 1.22l.56 2.28c.11.44.52.75.97.75H5l-2-3 1-2z"></path></svg>`;
// base64 encoding works in IE, Edge. UTF-8 does not.
const anonymousAvatarUrl = `data:image/svg+xml;base64,${btoa(anonymousAvatar)}`;

const nothingToPreview = 'Nothing to preview';

export class NewCommentComponent {
  public readonly element: HTMLElement;

  private avatarAnchor: HTMLAnchorElement;
  private avatar: HTMLImageElement;
  private form: HTMLFormElement;
  private textarea: HTMLTextAreaElement;
  private preview: HTMLDivElement;
  private submitButton: HTMLButtonElement;

  private submitting = false;
  private renderTimeout = 0;

  constructor(
    private user: User | null,
    private readonly submit: (markdown: string) => Promise<void>
  ) {
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');
    this.element.addEventListener('mousemove', publishResize); // todo: measure, throttle

    this.element.innerHTML = `
      <a class="avatar" target="_blank" tabindex="-1">
        <img height="44" width="44">
      </a>
      <form class="comment" accept-charset="UTF-8" action="javascript:">
        <header class="new-comment-header">
          <nav class="tabnav-tabs" role="tablist">
            <button type="button" class="tabnav-tab tab-write selected"
                    role="tab" aria-selected="true">
              Write
            </button>
            <button type="button" class="tabnav-tab tab-preview"
                    role="tab">
              Preview
            </button>
          </nav>
        </header>
        <div class="comment-body">
          <textarea placeholder="Leave a comment" aria-label="comment"></textarea>
          <div class="markdown-body" style="display: none">
            ${nothingToPreview}
          </div>
        </div>
        <footer class="comment-footer">
          <a class="text-link markdown-info" tabindex="-1" target="_blank"
             href="https://guides.github.com/features/mastering-markdown/">
            Styling with Markdown is supported
          </a>
          <button class="btn btn-primary" type="submit">Comment</button>
        </footer>
      </form>`;

    this.avatarAnchor = this.element.firstElementChild as HTMLAnchorElement;
    this.avatar = this.avatarAnchor.firstElementChild as HTMLImageElement;
    this.form = this.avatarAnchor.nextElementSibling as HTMLFormElement;
    this.textarea = this.form!.firstElementChild!.nextElementSibling!.firstElementChild as HTMLTextAreaElement;
    this.preview = this.form!.firstElementChild!.nextElementSibling!.lastElementChild as HTMLDivElement;
    this.submitButton = this.form!.lastElementChild!.lastElementChild as HTMLButtonElement;

    this.setUser(user);

    this.textarea.addEventListener('input', this.handleInput);
    this.form.addEventListener('submit', this.handleSubmit);
    this.form.addEventListener('click', this.handleClick);
  }

  public setUser(user: User | null) {
    this.user = user;
    this.submitButton.textContent = user ? 'Comment' : 'Sign in to comment';
    this.submitButton.disabled = !!user;

    if (user) {
      this.avatarAnchor.href = user.html_url;
      this.avatar.alt = '@' + user.login;
      this.avatar.src = user.avatar_url + '?v=3&s=88';
    } else {
      this.avatarAnchor.removeAttribute('href');
      this.avatar.alt = '@anonymous';
      this.avatar.src = anonymousAvatarUrl;
      this.textarea.disabled = true;
    }
  }

  public clear() {
    this.textarea.value = '';
  }

  private handleInput = () => {
    const text = this.textarea.value;
    const isWhitespace = /^\s*$/.test(text);
    this.submitButton.disabled = isWhitespace;
    if (this.textarea.scrollHeight < 450 && this.textarea.offsetHeight < this.textarea.scrollHeight) {
      this.textarea.style.height = `${this.textarea.scrollHeight}px`;
      publishResize();
    }

    clearTimeout(this.renderTimeout);
    if (isWhitespace) {
      this.preview.textContent = nothingToPreview;
    } else {
      this.preview.textContent = 'Loading preview...';
      this.renderTimeout = setTimeout(
        () => renderMarkdown(text).then(html => this.preview.innerHTML = html).then(publishResize),
        500);
    }
  }

  private handleSubmit = (event: Event) => {
    event.preventDefault();
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    if (this.user) {
      this.textarea.disabled = true;
      this.submitButton.disabled = true;
    }
    this.submit(this.textarea.value).catch(() => 0).then(() => {
      this.submitting = false;
      this.textarea.disabled = !this.user;
      this.textarea.value = '';
      this.submitButton.disabled = false;
      this.handleClick({ target: this.form.querySelector('.tabnav-tab.tab-write') } as any);
      this.preview.textContent = nothingToPreview;
    });
  }

  private handleClick = ({ target }: Event) => {
    if (!(target instanceof HTMLButtonElement) || !target.classList.contains('tabnav-tab')) {
      return;
    }
    if (target.classList.contains('selected')) {
      return;
    }
    this.form.querySelector('.tabnav-tab.selected')!.classList.remove('selected');
    target.classList.add('selected');
    const isPreview = target.classList.contains('tab-preview');
    this.textarea.style.display = isPreview ? 'none' : '';
    this.preview.style.display = isPreview ? '' : 'none';
    publishResize();
  }
}
