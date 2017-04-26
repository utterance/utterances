import { param } from './deparam';
import { ResizeMessage } from './bus';

addEventListener('message', event => {
  const data = event.data as ResizeMessage;
  if (data && data.type === 'resize' && data.height) {
    iframe.style.minHeight = `${data.height}px`;
  }
});

const options: { [name: string]: string; } = {};
const script = document.currentScript as HTMLScriptElement;
const attributes = script.attributes;
for (let i = 0; i < attributes.length; i++) {
  const attribute = attributes.item(i);
  options[attribute.name] = attribute.value;
}
options.origin = location.origin;

const page = script.src.replace(/\.js(?:$|\?)/, '.html');

const iframe = document.createElement('iframe');
iframe.classList.add('utterances');
iframe.setAttribute('allowtransparency', 'true');
iframe.src = `${page}?${param(options)}`;
script.insertAdjacentElement('afterend', iframe);
