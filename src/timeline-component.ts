import { User, Issue, IssueComment } from './github';
import { CommentComponent } from './comment-component';
import { publishResize } from './bus';

export class TimelineComponent {
  public readonly element: HTMLElement;
  private readonly timeline: CommentComponent[] = [];
  private readonly countAnchor: HTMLAnchorElement;
  private readonly marker: Node;
  private count: number = 0;

  constructor(
    private user: User | null,
    private issue: Issue | null
  ) {
    this.element = document.createElement('section');
    this.element.classList.add('timeline');
    this.element.innerHTML = `
      <h1 class="timeline-header">
        <a class="text-link" target="_blank"></a>
        <em>
          - powered by
          <a class="text-link" href="https://utteranc.es" target="_blank">utteranc.es</a>
        </em>
      </h1>`;
    this.countAnchor = this.element.firstElementChild!.firstElementChild as HTMLAnchorElement;
    this.marker = document.createComment('marker');
    this.element.appendChild(this.marker);
    this.setIssue(this.issue);
    this.renderCount();
  }

  public setUser(user: User | null) {
    this.user = user;
    const login = user ? user.login : null;
    for (let i = 0; i < this.timeline.length; i++) {
      this.timeline[i].setCurrentUser(login);
    }
    publishResize();
  }

  public setIssue(issue: Issue | null) {
    this.issue = issue;
    if (issue) {
      this.countAnchor.href = issue.html_url;
    } else {
      this.countAnchor.removeAttribute('href');
    }
  }

  public appendComment(comment: IssueComment) {
    const component = new CommentComponent(
      comment,
      this.user ? this.user.login : null);
    this.timeline.push(component);
    this.element.insertBefore(component.element, this.marker);
    this.count++;
    this.renderCount();
    publishResize();
  }

  private renderCount() {
    this.countAnchor.textContent = `${this.count} Comment${this.count === 1 ? '' : 's'}`;
  }
}
