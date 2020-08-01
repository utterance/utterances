import { Issue } from './github';

export class NewCommentLink {
  public readonly element: HTMLElement;

  constructor(
    private readonly jump: () => void
  ) {
    this.element = document.createElement('article');
    this.element.classList.add('timeline-comment');

    this.element.innerHTML = `
      <div class="new-comment-footer" style="width: 100%;">
        <span class="timeline-header">Comments are recorded using GitHub Issues</span>
        <button class="btn btn-primary btn-large" target="_blank">Comment on GitHub</button>
      </div>`;

    this.element.lastChild.lastElementChild.addEventListener('click', this.jump);
  }
}
