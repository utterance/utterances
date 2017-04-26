import { User, Issue, IssueComment } from './github';
import { CommentComponent } from './comment-component';
import { publishResize } from './bus';

export class TimelineComponent {
  public readonly element: HTMLDivElement;
  private readonly timeline: CommentComponent[] = [];

  constructor(
    private user: User | null,
    private issue: Issue | null,
    private repoOwner: string
  ) {
    this.element = document.createElement('div');
    this.element.classList.add('timeline');
  }

  public setUser(user: User | null) {
    this.user = user;
    const login = user ? user.login : null;
    for (let i = 0; i < this.timeline.length; i++) {
      this.timeline[i].setCurrentUser(login);
    }
    publishResize();
  }

  public setIssue(issue: Issue) {
    this.issue = issue;
  }

  public appendComment(comment: IssueComment) {
    const component = new CommentComponent(
      comment,
      this.user ? this.user.login : null,
      this.repoOwner);
    this.timeline.push(component);
    this.element.appendChild(component.element);
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
