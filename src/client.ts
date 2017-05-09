import { param } from './deparam';
import { ResizeMessage } from './bus';

let script = document.currentScript as HTMLScriptElement;
if (script === undefined) {
  // Internet Explorer :(
  script = document.querySelector('script[src^="https://utteranc.es/client.js"]') as HTMLScriptElement;
}

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

// create the standard utterances styles and insert them at the beginning of the
// <head> for easy overriding.
// NOTE: the craziness with "width" is for mobile safari :(
document.head.insertAdjacentHTML(
  'afterbegin',
  `<style>
    .utterances {
      position: relative;
      width: 100%;
    }
    .utterances-frame {
      position: absolute;
      left: 0;
      right: 0;
      width: 1px;
      min-width: 100%;
      max-width: 100%;
      height: 100%;
      border: 0;
    }
  </style>`);

// create the comments iframe and it's responsive container
const url = script.src.replace(/\/client(\.debug)?\.js(?:$|\?)/, '/utterances$1.html');
script.insertAdjacentHTML(
  'afterend',
  `<div class="utterances">
    <iframe class="utterances-frame" scrolling="no" src="${url}?${param(attrs)}"></iframe>
  </div>`);
const container = script.nextElementSibling as HTMLDivElement;
script.parentElement!.removeChild(script);

// adjust the iframe's height when the height of it's content changes
addEventListener('message', event => {
  const data = event.data as ResizeMessage;
  if (data && data.type === 'resize' && data.height) {
    container.style.height = `${data.height}px`;
  }
});
