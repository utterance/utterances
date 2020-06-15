import {
  createIssue as createGitHubIssue,
  Issue,
  loadIssueByNumber,
  ReactionID,
  Reactions,
  reactionTypes,
  toggleReaction,
  User
} from './github';
import { EmptyReactions, reactionEmoji, reactionNames } from './reactions';
import { pageAttributes as page } from './page-attributes';

export class PostReactionComponent {
  public readonly element: HTMLElement;
  private readonly countAnchor: HTMLAnchorElement;
  private readonly reactionListContainer: HTMLFormElement;
  private reactions: Reactions = new EmptyReactions();
  private reactionsCount: number = 0;
  private issueURL: string = '';

  constructor(
    private user: User | null,
    private issue: Issue | null,
    private createIssueCallback: (issue: Issue) => Promise<null>
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
    const buttons = this.reactionListContainer.querySelectorAll('button');

    function toggleButtons(disabled: boolean) {
      buttons.forEach(b => b.disabled = disabled);
    }

    const handler = async (event: Event) => {
      event.preventDefault();

      const button = event.target as HTMLButtonElement;
      toggleButtons(true);
      const id = button.value as ReactionID;
      const issueExists = !!this.issue;

      if (!issueExists) {
        const newIssue = await createGitHubIssue(
          page.issueTerm as string,
          page.url,
          page.title,
          page.description || '',
          page.label
        );
        const issue = await loadIssueByNumber(newIssue.number);
        this.issue = issue;
        this.reactions = issue.reactions;
        await this.createIssueCallback(issue);
      }

      const url = this.reactions.url;
      const {deleted} = await toggleReaction(url, id);
      const delta = deleted ? -1 : 1;
      this.reactions[id] += delta;
      this.reactions.total_count += delta;
      this.issue!.reactions = this.reactions;
      toggleButtons(false);
      this.setIssue(this.issue);
    }

    buttons.forEach(b => b.addEventListener('click', handler, true))
  }

  private getSubmitButtons(): string {
    function buttonFor(url: string, reaction: ReactionID, disabled: boolean, count: number): string {
      return `
        <button
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

    const issueLocked = this.issue ? this.issue.locked : false;
    return reactionTypes
      .map(id => buttonFor(this.reactions.url, id, !this.user || issueLocked, this.reactions[id]))
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
    this.setupSubmitHandler();
  }
}
