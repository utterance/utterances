import { param } from './deparam';
import { ResizeMessage } from './bus';

const script = document.currentScript as HTMLScriptElement;

// gather script element's attributes
const attrs: { [name: string]: string; } = {};
for (let i = 0; i < script.attributes.length; i++) {
  const attribute = script.attributes.item(i);
  attrs[attribute.name] = attribute.value;
}

// gather page attributes
attrs.url = location.href;
attrs.origin = location.origin;
attrs.pathname = location.pathname.substr(1).replace(/\.\w+$/, '');
attrs.title = document.title;
const descriptionMeta = document.querySelector(`meta[name='description']`) as HTMLMetaElement;
attrs.description = descriptionMeta ? descriptionMeta.content : '';

// create the comments iframe
const page = script.src.replace(/\/utterances(\.min)?\.js(?:$|\?)/, '/embed/index$1.html');
const iframe = document.createElement('iframe');
iframe.classList.add('utterances');
iframe.setAttribute('allowtransparency', 'true');
iframe.src = `${page}?${param(attrs)}`;
script.insertAdjacentElement('afterend', iframe);
script.parentElement!.removeChild(script);

// adjust the iframe's size when the size of it's content changes
addEventListener('message', event => {
  const data = event.data as ResizeMessage;
  if (data && data.type === 'resize' && data.height) {
    iframe.style.minHeight = `${data.height}px`;
  }
});
