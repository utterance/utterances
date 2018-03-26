import { ConfigurationComponent } from './configuration-component';

document.querySelector('h2#configuration')!
  .insertAdjacentElement('afterend', new ConfigurationComponent().element);
