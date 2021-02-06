import { toggleReaction, ReactionID, reactionTypes } from './github';
import { getLoginUrl } from './oauth';
import { pageAttributes } from './page-attributes';
import { scheduleMeasure } from './measure';

export const reactionNames: Record<ReactionID, string> = {
  '+1': 'Thumbs Up',
  '-1': 'Thumbs Down',
  'laugh': 'Laugh',
  'hooray': 'Hooray',
  'confused': 'Confused',
  'heart': 'Heart',
  'rocket': 'Rocket',
  'eyes': 'Eyes'
};

export const reactionEmoji: Record<ReactionID, string> = {
  '+1': '👍',
  '-1': '👎',
  'laugh': '️😂',
  'hooray': '️🎉',
  'confused': '😕',
  'heart': '❤️',
  'rocket': '🚀',
  'eyes': '👀'
};

export function getReactionHtml(url: string, reaction: ReactionID, disabled: boolean, count: number) {
  return `
  <button
    reaction
    type="submit"
    action="javascript:"
    formaction="${url}"
    class="btn BtnGroup-item reaction-button"
    value="${reaction}"
    aria-label="Toggle ${reactionNames[reaction]} reaction"
    reaction-count="${count}"
    ${disabled ? 'disabled' : ''}>
    ${reactionEmoji[reaction]}
  </button>`;
}

export function enableReactions(authenticated: boolean) {
  const submitReaction = async (event: Event) => {
    const button = event.target instanceof HTMLElement && event.target.closest('button');
    if (!button) {
      return;
    }
    if (!button.hasAttribute('reaction')) {
      return;
    }
    event.preventDefault();
    if (!authenticated) {
      return;
    }
    button.disabled = true;
    const parentMenu = button.closest('details');
    if (parentMenu) {
      parentMenu.open = false;
    }
    const url = button.formAction;
    const id = button.value as ReactionID;
    const { deleted } = await toggleReaction(url, id);
    const selector = `button[reaction][formaction="${url}"][value="${id}"],[reaction-count][reaction-url="${url}"]`;
    const elements = Array.from(document.querySelectorAll(selector));
    const delta = deleted ? -1 : 1;
    for (const element of elements) {
      element.setAttribute(
        'reaction-count',
        (parseInt(element.getAttribute('reaction-count')!, 10) + delta).toString());
    }
    button.disabled = false;
    scheduleMeasure();
  };
  addEventListener('click', submitReaction, true);
}

export function getReactionsMenuHtml(url: string, align: 'center' | 'right') {
  const position = align === 'center' ? 'left: 50%;transform: translateX(-50%)' : 'right:6px';
  const alignmentClass = align === 'center' ? '' : 'Popover-message--top-right';
  const getButtonAndSpan = (id: ReactionID) => getReactionHtml(url, id, false, 0)
    + `<span class="reaction-name" aria-hidden="true">${reactionNames[id]}</span>`;
  return `
  <details class="details-overlay details-popover reactions-popover">
    <summary ${align === 'center' ? 'tabindex="-1"' : ''}>${addReactionSvgs}</summary>
    <div class="Popover" style="${position}">
      <form class="Popover-message ${alignmentClass} box-shadow-large" action="javascript:">
        <span class="reaction-name">Pick your reaction</span>
        <div class="BtnGroup">
          ${reactionTypes.slice(0, 4).map(getButtonAndSpan).join('')}
        </div>
        <div class="BtnGroup">
          ${reactionTypes.slice(4).map(getButtonAndSpan).join('')}
        </div>
      </form>
    </div>
  </details>`;
}

export function getSignInToReactMenuHtml(align: 'center' | 'right') {
  const position = align === 'center' ? 'left: 50%;transform: translateX(-50%)' : 'right:6px';
  const alignmentClass = align === 'center' ? '' : 'Popover-message--top-right';
  return `
  <details class="details-overlay details-popover reactions-popover">
    <summary aria-label="Reactions Menu">${addReactionSvgs}</summary>
    <div class="Popover" style="${position}">
      <div class="Popover-message ${alignmentClass} box-shadow-large" style="padding: 16px">
        <span><a href="${getLoginUrl(pageAttributes.url)}" target="_top">Sign in</a> to add your reaction.</span>
      </div>
    </div>
  </details>`;
}

// tslint:disable-next-line:max-line-length
const addReactionSvgs = `<svg class="octicon" style="margin-right:3px" viewBox="0 0 7 16" version="1.1" width="7" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M4 4H3v3H0v1h3v3h1V8h3V7H4V4z"></path></svg><svg class="octicon" viewBox="0 0 16 16" version="1.1" width="16" height="16" aria-hidden="true"><path fill-rule="evenodd" d="M8 0C3.58 0 0 3.58 0 8s3.58 8 8 8 8-3.58 8-8-3.58-8-8-8zm4.81 12.81a6.72 6.72 0 0 1-2.17 1.45c-.83.36-1.72.53-2.64.53-.92 0-1.81-.17-2.64-.53-.81-.34-1.55-.83-2.17-1.45a6.773 6.773 0 0 1-1.45-2.17A6.59 6.59 0 0 1 1.21 8c0-.92.17-1.81.53-2.64.34-.81.83-1.55 1.45-2.17.62-.62 1.36-1.11 2.17-1.45A6.59 6.59 0 0 1 8 1.21c.92 0 1.81.17 2.64.53.81.34 1.55.83 2.17 1.45.62.62 1.11 1.36 1.45 2.17.36.83.53 1.72.53 2.64 0 .92-.17 1.81-.53 2.64-.34.81-.83 1.55-1.45 2.17zM4 6.8v-.59c0-.66.53-1.19 1.2-1.19h.59c.66 0 1.19.53 1.19 1.19v.59c0 .67-.53 1.2-1.19 1.2H5.2C4.53 8 4 7.47 4 6.8zm5 0v-.59c0-.66.53-1.19 1.2-1.19h.59c.66 0 1.19.53 1.19 1.19v.59c0 .67-.53 1.2-1.19 1.2h-.59C9.53 8 9 7.47 9 6.8zm4 3.2c-.72 1.88-2.91 3-5 3s-4.28-1.13-5-3c-.14-.39.23-1 .66-1h8.59c.41 0 .89.61.75 1z"></path></svg>`;
