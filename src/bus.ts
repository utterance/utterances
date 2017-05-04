export interface ResizeMessage {
  type: 'resize';
  height: number;
}

let hostOrigin: string;

export function setHostOrigin(origin: string) {
  hostOrigin = origin;
  addEventListener('resize', publishResize);
}

let lastHeight = -1;

export function publishResize() {
  const { body, documentElement: html } = document;
  const height = Math.max(
    body.scrollHeight,
    body.offsetHeight,
    html.clientHeight,
    html.scrollHeight,
    html.offsetHeight) + 15;
  if (height === lastHeight) {
    return;
  }
  lastHeight = height;
  const message: ResizeMessage = { type: 'resize', height };
  parent.postMessage(message, hostOrigin);
}
