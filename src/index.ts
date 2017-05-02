import {
  setRepoContext,
  loadJsonFile
} from './github';

const context = {
  owner: 'utterance',
  repo: 'utterances',
  branch: 'master'
};

setRepoContext(context);

loadJsonFile<string>('README.md', true).then(html => {
  const commentDiv = document.querySelector('.comment') as HTMLDivElement;
  commentDiv.insertAdjacentHTML('beforeend', html);
});
