export function loadTheme(theme: string, origin: string) {
  return new Promise(resolve => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.setAttribute('crossorigin', 'anonymous');
    link.onload = resolve;
    link.href = `/stylesheets/themes/${theme}/utterances.css`;
    document.head.appendChild(link);

    addEventListener('message', event => {
      if (event.origin === origin && event.data.type === 'set-theme') {
        link.href = `/stylesheets/themes/${event.data.theme}/utterances.css`;
      }
    });
  });
}
