import { Issue, ReactionID, Reactions, reactionTypes, toggleReaction } from './github';
import { reactionEmoji, reactionNames } from './reactions';

class EmptyReactions implements Reactions {
  '+1' = 0;
  '-1' = 0;
  confused = 0;
  eyes = 0;
  heart = 0;
  hooray = 0;
  laugh = 0;
  rocket = 0;
  // tslint:disable-next-line:variable-name
  total_count = 0;
  url = '';
}

export class PostReactionComponent {
  public readonly element: HTMLElement;
  private readonly countAnchor: HTMLAnchorElement;
  private readonly reactionListContainer: HTMLFormElement;
  private reactions: Reactions = new EmptyReactions();
  private reactionsCount: number = 0;
  private issueURL: string = '';

  constructor(
    private issue: Issue | null,
    private createIssue: () => Promise<null>
  ) {
    this.element = document.createElement('section');
    this.element.classList.add('post-reactions');
    this.element.innerHTML = `
      <header>
        <a class="text-link" target="_blank"></a>
      </header>
       <form class="post-reaction-list BtnGroup" action="javascript:">
       </form>`;
    this.countAnchor = this.element.querySelector('header a') as HTMLAnchorElement;
    this.reactionListContainer = this.element.querySelector('.post-reaction-list') as HTMLFormElement;
    this.setIssue(this.issue)
    this.render();
    this.setupSubmitHandler();
  }

  public setIssue(issue: Issue | null) {
    this.issue = issue;
    if (issue) {
      this.reactions = issue.reactions;
      this.reactionsCount = issue.reactions.total_count;
      this.issueURL = issue.html_url;
      this.render();
    }
  }

  private setupSubmitHandler() {
    const handler = async (event: Event) => {
      event.preventDefault();

      const issueExists = !!this.issue;
      if (!issueExists) {
        await this.createIssue();
      }

      const button = event.target as HTMLButtonElement;
      button.disabled = true;
      const url = button.formAction;
      const id = button.value as ReactionID;
      const {deleted} = await toggleReaction(url, id);
      const selector = `button[post-reaction][formaction="${url}"][value="${id}"],[reaction-count][reaction-url="${url}"]`;
      const elements = Array.from(this.element.querySelectorAll(selector));
      const delta = deleted ? -1 : 1;
      for (const element of elements) {
        element.setAttribute(
          'reaction-count',
          (parseInt(element.getAttribute('reaction-count')!, 10) + delta).toString());
      }
      button.disabled = false;
    }

    const buttons = this.element.querySelectorAll('button[post-reaction]');
    buttons.forEach(button => button.addEventListener('click', handler, true))
  }

  private getSubmitButtons(): string {
    function buttonFor(url: string, reaction: ReactionID, disabled: boolean, count: number): string {
      return `
        <button
          post-reaction
          type="submit"
          action="javascript:"
          formaction="${url}"
          class="btn BtnGroup-item btn-outline post-reaction-button"
          value="${reaction}"
          aria-label="Toggle ${reactionNames[reaction]} reaction"
          reaction-count="${count}"
          ${disabled ? 'disabled' : ''}>
          ${reactionEmoji[reaction]}
        </button>`;
    }

    return reactionTypes
      .map(id => buttonFor(this.reactions.url, id, false, this.reactions[id]))
      .join('')
  }

  private render() {
    if (this.issueURL !== '') {
      this.countAnchor.href = this.issueURL;
    } else {
      this.countAnchor.removeAttribute('href');
    }
    this.countAnchor.textContent = `${this.reactionsCount} Reaction${this.reactionsCount === 1 ? '' : 's'}`;
    this.reactionListContainer.innerHTML = this.getSubmitButtons();
  }
}
