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
options.url = location.href;
options.origin = location.origin;
options.pathname = location.pathname.substr(1).replace(/\.\w+$/, '');
options.title = document.title;
const descriptionMeta = document.querySelector(`meta[name='description']`) as HTMLMetaElement;
options.description = descriptionMeta ? descriptionMeta.content : '';

const page = script.src.replace(/utterances\.js(?:$|\?)/, '/embed/');

const iframe = document.createElement('iframe');
iframe.classList.add('utterances');
iframe.setAttribute('allowtransparency', 'true');
iframe.src = `${page}?${param(options)}`;
script.insertAdjacentElement('afterend', iframe);
