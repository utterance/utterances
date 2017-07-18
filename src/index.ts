import { setRepoContext, loadFile } from './github';
import { ConfigurationComponent } from './configuration-component';

const context = {
  owner: 'utterance',
  repo: 'utterances',
  branch: 'master'
};

setRepoContext(context);

loadFile('master', 'README.md')
  .then(html => {
    const commentDiv = document.querySelector('.comment') as HTMLDivElement;
    commentDiv.insertAdjacentHTML('beforeend', html);
    // commentDiv.querySelector('#user-content-configuration')!.parentElement!
    //   .insertAdjacentElement('afterend', new ConfigurationComponent().element);
  });
