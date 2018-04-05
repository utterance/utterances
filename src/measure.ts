export interface ResizeMessage {
  type: 'resize';
  height: number;
}

let hostOrigin: string;

export function startMeasuring(origin: string) {
  hostOrigin = origin;
  addEventListener('resize', scheduleMeasure);
  addEventListener('load', scheduleMeasure);
}

let lastHeight = -1;

function measure() {
  const height = document.body.scrollHeight;
  if (height === lastHeight) {
    return;
  }
  lastHeight = height;
  const message: ResizeMessage = { type: 'resize', height };
  parent.postMessage(message, hostOrigin);
}

let publishTimeout = 0;

export function scheduleMeasure() {
  clearTimeout(publishTimeout);
  publishTimeout = setTimeout(measure);
}
