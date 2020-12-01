import { param, deparam } from './deparam';
import { ResizeMessage } from './measure';
import { preferredThemeId, preferredTheme } from './preferred-theme';

// slice session from query string
const params = deparam(location.search.substr(1));
const session = params.utterances;
if (session) {
  localStorage.setItem('utterances-session', session);
  delete params.utterances;
  let search = param(params);
  if (search.length) {
    search = '?' + search;
  }
  history.replaceState(undefined, document.title, location.pathname + search + location.hash);
}

let script = document.currentScript as HTMLScriptElement;
if (script === undefined) {
  // Internet Explorer :(
  // tslint:disable-next-line:max-line-length
  script = document.querySelector('script[src^="https://utteranc.es/client.js"],script[src^="http://localhost:4000/client.js"]') as HTMLScriptElement;
}

// gather script element's attributes
const attrs: Record<string, string> = {};
for (let i = 0; i < script.attributes.length; i++) {
  const attribute = script.attributes.item(i)!;
  attrs[attribute.name.replace(/^data-/, '')] = attribute.value; // permit using data-theme instead of theme.
}
if (attrs.theme === preferredThemeId) {
  attrs.theme = preferredTheme;
}

// gather page attributes
const canonicalLink = document.querySelector(`link[rel='canonical']`) as HTMLLinkElement;
attrs.url = canonicalLink ? canonicalLink.href : location.origin + location.pathname + location.search;
attrs.origin = location.origin;
attrs.pathname = location.pathname.length < 2 ? 'index' : location.pathname.substr(1).replace(/\.\w+$/, '');
attrs.title = document.title;
const descriptionMeta = document.querySelector(`meta[name='description']`) as HTMLMetaElement;
attrs.description = descriptionMeta ? descriptionMeta.content : '';
// truncate descriptions that would trigger 414 "URI Too Long"
const len = encodeURIComponent(attrs.description).length;
if (len > 1000) {
  attrs.description = attrs.description.substr(0, Math.floor(attrs.description.length * 1000 / len));
}
const ogtitleMeta = document.querySelector(`meta[property='og:title'],meta[name='og:title']`) as HTMLMetaElement;
attrs['og:title'] = ogtitleMeta ? ogtitleMeta.content : '';
attrs.session = session || localStorage.getItem('utterances-session') || '';

// create the standard utterances styles and insert them at the beginning of the
// <head> for easy overriding.
// NOTE: the craziness with "width" is for mobile safari :(
document.head.insertAdjacentHTML(
  'afterbegin',
  `<style>
    .utterances {
      position: relative;
      box-sizing: border-box;
      width: 100%;
      max-width: 760px;
      margin-left: auto;
      margin-right: auto;
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
const utterancesOrigin = script.src.match(/^https:\/\/utteranc\.es|http:\/\/localhost:\d+/)![0];
const url = `${utterancesOrigin}/utterances.html`;
script.insertAdjacentHTML(
  'afterend',
  `<div class="utterances">
    <iframe class="utterances-frame" title="Comments" scrolling="no" src="${url}?${param(attrs)}" loading="lazy"></iframe>
  </div>`);
const container = script.nextElementSibling as HTMLDivElement;
script.parentElement!.removeChild(script);

// adjust the iframe's height when the height of it's content changes
addEventListener('message', event => {
  if (event.origin !== utterancesOrigin) {
    return;
  }
  const data = event.data as ResizeMessage;
  if (data && data.type === 'resize' && data.height) {
    container.style.height = `${data.height}px`;
  }
});
