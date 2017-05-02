import { User, Issue, IssueComment } from './github';
import { CommentComponent } from './comment-component';
import { publishResize } from './bus';

export class TimelineComponent {
  public readonly element: HTMLElement;
  private readonly timeline: CommentComponent[] = [];
  private readonly countAnchor: HTMLAnchorElement;
  private readonly marker: Node;

  constructor(
    private user: User | null,
    private issue: Issue | null,
    private repoOwner: string
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
    this.setIssue(issue);
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
      this.countAnchor.textContent = `${issue.comments} Comment${issue.comments === 1 ? '' : 's'}`;
      this.countAnchor.href = issue.html_url;
    } else {
      this.countAnchor.textContent = `0 Comments`;
      this.countAnchor.removeAttribute('href');
    }
  }

  public appendComment(comment: IssueComment) {
    const component = new CommentComponent(
      comment,
      this.user ? this.user.login : null,
      this.repoOwner);
    this.timeline.push(component);
    this.element.insertBefore(component.element, this.marker);
    publishResize();
  }

  public replaceComments(comments: IssueComment[]) {
    let i;
    for (i = 0; i < comments.length; i++) {
      const comment = comments[i];
      if (i <= this.timeline.length) {
        this.appendComment(comment);
        continue;
      }
      this.timeline[i].setComment(comment);
    }
    for (; i < this.timeline.length; i++) {
      this.element.removeChild(this.element.lastElementChild!);
    }
    publishResize();
  }
}
