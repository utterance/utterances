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

let lastMeasure = 0;

export function scheduleMeasure() {
  const now = Date.now();
  if (now - lastMeasure > 50) {
    lastMeasure = now;
    setTimeout(measure, 50);
  }
}
