import { pageAttributes as page } from './page-attributes';
import { User, renderMarkdown } from './github';
import { scheduleMeasure } from './measure';
import { processRenderedMarkdown } from './comment-component';
import { getRepoConfig } from './repo-config';
import { getLoginUrl } from './oauth';

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
  private signInAnchor: HTMLAnchorElement;

  private submitting = false;
  private renderTimeout = 0;

  constructor(
    private user: User | null,
    private readonly submit: (markdown: string) => Promise<void>
  ) {
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');

    this.element.innerHTML = `
      <a class="avatar" target="_blank" tabindex="-1">
        <img height="44" width="44">
      </a>
      <form class="comment" accept-charset="UTF-8" action="javascript:">
        <header class="new-comment-header tabnav">
          <div class="tabnav-tabs" role="tablist">
            <button type="button" class="tabnav-tab tab-write"
                    role="tab" aria-selected="true">
              Write
            </button>
            <button type="button" class="tabnav-tab tab-preview"
                    role="tab">
              Preview
            </button>
          </div>
        </header>
        <div class="comment-body">
          <textarea class="form-control" placeholder="Leave a comment" aria-label="comment"></textarea>
          <div class="markdown-body" style="display: none">
            ${nothingToPreview}
          </div>
        </div>
        <footer class="new-comment-footer">
          <a class="text-link markdown-info" tabindex="-1" target="_blank"
             href="https://guides.github.com/features/mastering-markdown/">
            <svg class="octicon v-align-bottom" viewBox="0 0 16 16" version="1.1"
              width="16" height="16" aria-hidden="true">
              <path fill-rule="evenodd" d="M14.85 3H1.15C.52 3 0 3.52 0 4.15v7.69C0 12.48.52 13 1.15
                13h13.69c.64 0 1.15-.52 1.15-1.15v-7.7C16 3.52 15.48 3 14.85 3zM9 11H7V8L5.5 9.92 4
                8v3H2V5h2l1.5 2L7 5h2v6zm2.99.5L9.5 8H11V5h2v3h1.5l-2.51 3.5z">
              </path>
            </svg>
            Styling with Markdown is supported
          </a>
          <button class="btn btn-primary" type="submit">Comment</button>
          <a class="btn btn-primary" href="${getLoginUrl(page.url)}" target="_top">Sign in to comment</a>
        </footer>
      </form>`;

    this.avatarAnchor = this.element.firstElementChild as HTMLAnchorElement;
    this.avatar = this.avatarAnchor.firstElementChild as HTMLImageElement;
    this.form = this.avatarAnchor.nextElementSibling as HTMLFormElement;
    this.textarea = this.form!.firstElementChild!.nextElementSibling!.firstElementChild as HTMLTextAreaElement;
    this.preview = this.form!.firstElementChild!.nextElementSibling!.lastElementChild as HTMLDivElement;
    this.signInAnchor = this.form!.lastElementChild!.lastElementChild! as HTMLAnchorElement;
    this.submitButton = this.signInAnchor.previousElementSibling! as HTMLButtonElement;

    this.setUser(user);
    this.submitButton.disabled = true;

    this.textarea.addEventListener('input', this.handleInput);
    this.form.addEventListener('submit', this.handleSubmit);
    this.form.addEventListener('click', this.handleClick);
    this.form.addEventListener('keydown', this.handleKeyDown);
    handleTextAreaResize(this.textarea);
  }

  public setUser(user: User | null) {
    this.user = user;
    this.submitButton.hidden = !user;
    this.signInAnchor.hidden = !!user;
    if (user) {
      this.avatarAnchor.href = user.html_url;
      this.avatar.alt = '@' + user.login;
      this.avatar.src = user.avatar_url + '?v=3&s=88';
      this.textarea.disabled = false;
      this.textarea.placeholder = 'Leave a comment';
    } else {
      this.avatarAnchor.removeAttribute('href');
      this.avatar.alt = '@anonymous';
      this.avatar.src = anonymousAvatarUrl;
      this.textarea.disabled = true;
      this.textarea.placeholder = 'Sign in to comment';
    }
  }

  public clear() {
    this.textarea.value = '';
  }

  private handleInput = () => {
    getRepoConfig(); // preload repo config
    const text = this.textarea.value;
    const isWhitespace = /^\s*$/.test(text);
    this.submitButton.disabled = isWhitespace;
    if (this.textarea.scrollHeight < 450 && this.textarea.offsetHeight < this.textarea.scrollHeight) {
      this.textarea.style.height = `${this.textarea.scrollHeight}px`;
      scheduleMeasure();
    }

    clearTimeout(this.renderTimeout);
    if (isWhitespace) {
      this.preview.textContent = nothingToPreview;
    } else {
      this.preview.textContent = 'Loading preview...';
      this.renderTimeout = setTimeout(
        () => renderMarkdown(text).then(html => this.preview.innerHTML = html)
          .then(() => processRenderedMarkdown(this.preview))
          .then(scheduleMeasure),
        500);
    }
  }

  private handleSubmit = async (event: Event) => {
    event.preventDefault();
    if (this.submitting) {
      return;
    }
    this.submitting = true;
    this.textarea.disabled = true;
    this.submitButton.disabled = true;
    await this.submit(this.textarea.value).catch(() => 0);
    this.submitting = false;
    this.textarea.disabled = !this.user;
    this.textarea.value = '';
    this.submitButton.disabled = false;
    this.handleClick({ ...event, target: this.form.querySelector('.tabnav-tab.tab-write') });
    this.preview.textContent = nothingToPreview;
  }

  private handleClick = ({ target }: Event) => {
    if (!(target instanceof HTMLButtonElement) || !target.classList.contains('tabnav-tab')) {
      return;
    }
    if (target.getAttribute('aria-selected') === 'true') {
      return;
    }
    this.form.querySelector('.tabnav-tab[aria-selected="true"]')!.setAttribute('aria-selected', 'false');
    target.setAttribute('aria-selected', 'true');
    const isPreview = target.classList.contains('tab-preview');
    this.textarea.style.display = isPreview ? 'none' : '';
    this.preview.style.display = isPreview ? '' : 'none';
    scheduleMeasure();
  }

  private handleKeyDown = ({ which, ctrlKey }: KeyboardEvent) => {
    if (which === 13 && ctrlKey && !this.submitButton.disabled) {
      this.form.dispatchEvent(new CustomEvent('submit'));
    }
  }
}

function handleTextAreaResize(textarea: HTMLTextAreaElement) {
  const stopTracking = () => {
    removeEventListener('mousemove', scheduleMeasure);
    removeEventListener('mouseup', stopTracking);
  };
  const track = () => {
    addEventListener('mousemove', scheduleMeasure);
    addEventListener('mouseup', stopTracking);
  };
  textarea.addEventListener('mousedown', track);
}
