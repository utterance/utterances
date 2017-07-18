import repoRegex from './repo-regex';

export class ConfigurationComponent {
  public element: HTMLFormElement;
  private script: HTMLDivElement;
  private utterancesJson: HTMLDivElement;
  private createJsonButton: HTMLButtonElement;
  private repo: HTMLInputElement;
  private branch: HTMLInputElement;
  private blog: HTMLInputElement;
  private repoIsValid: boolean;
  private branchIsValid: boolean;

  constructor() {
    this.element = document.createElement('form');
    this.element.innerHTML = `
      <h3>Repository & Branch</h3>
      <p>Enter the GitHub repository and branch Utterances will connect to.</p>
      <fieldset>
        <div>
          <label for="repo">Repo:</label><br/>
          <input id="repo" class="form-control" type="text" placeholder="owner/repo">
          <p class="note">
            A <strong>public</strong> GitHub repository. This is where the blog
            post issues and issue-comments will be posted.
          </p>
        </div>
        <div>
          <label for="branch">Branch:</label><br/>
          <input id="branch" class="form-control" type="text" placeholder="master" value="master">
          <p class="note">
            The branch where the utterances.json file will be stored.
          </p>
        </div>
      </fieldset>

      <h3>Blog Post<->Issue Mapping</h3>
      <p>Choose how Utterances will map blog posts to GitHub issues.</p>
      <fieldset>
        <div class="form-checkbox">
          <label>
            <input type="radio" value="pathname" name="mapping" checked="checked">
            Issue title contains page pathname
            <p class="note">
              Utterances will search for an issue whose title contains the blog post's pathname
              URL component. If a matching issue is not found, Utterances will automatically
              create one the first time someone comments on your post.
            </p>
          </label>
        </div>
        <div class="form-checkbox">
          <label>
            <input type="radio" value="url" name="mapping">
            Issue title contains page URL
            <p class="note">
              Utterances will search for an issue whose title contains the blog post's URL.
              If a matching issue is not found, Utterances will automatically create one the first
              time someone comments on your post.
            </p>
          </label>
        </div>
        <div class="form-checkbox">
          <label>
            <input type="radio" value="title" name="mapping">
            Issue title contains page title
            <p class="note">
              Utterances will search for an issue whose title contains the blog post's title.
              If a matching issue is not found, Utterances will automatically create one the first
              time someone comments on your post.
            </p>
          </label>
        </div>
        <div class="form-checkbox">
          <label>
            <input type="radio" value="issue-number" name="mapping">
            Specific issue number
            <p class="note">
              You configure Utterances to load a specific issue by number. Issues are not automatically
              created.
            </p>
          </label>
        </div>
        <div class="form-checkbox">
          <label>
            <input type="radio" value="specific-term" name="mapping">
            Issue title contains specific term
            <p class="note">
              You configure Utterances to search for an issue whose title contains a specific term.
              If a matching issue is not found, Utterances will automatically create one the first
              time someone comments on your post.
            </p>
          </label>
        </div>
      </fieldset>

      <h3>Blog</h3>
      <p>Choose the blog(s) that will be permitted to post issues and issue comments to
      your GitHub repository via Utterances.</p>
      <fieldset>
        <div>
          <label for="blog">Blog URL:</label><br/>
          <input id="blog" class="form-control" type="text" placeholder="https://interesting.net/blog/">
          <p class="note">
            The base url of the blog that will post issues and comments to
            the repo. Separate multiple urls with a comma.
          </p>
        </div>
      </fieldset>

      <h3>Enable Utterances</h3>

      <p>Add the utterances.json file to your GitHub repo</p>
      <div class="config-field" id="utterances-json" class="highlight highlight-text-html-basic"></div>
      <button id="create-utterances-json" type="button" class="btn btn-blue code-action" disabled>Create...</button>
      <br/>
      <br/>

      <p>Add the following script tag to your blog's template. Position it where you want the
      comments to appear. Customize the layout using the <code>.utterances</code> and
      <code>.utterances-frame</code> selectors.
      </p>
      <div class="config-field" id="script" class="highlight highlight-text-html-basic"></div>
      <button id="copy-button" type="button" class="btn btn-blue code-action">Copy</button>
      <br/>
      <br/>`;

    this.element.addEventListener('submit', event => event.preventDefault());
    this.element.action = 'javascript:';

    this.script = this.element.querySelector('#script') as HTMLDivElement;
    this.utterancesJson = this.element.querySelector('#utterances-json') as HTMLDivElement;

    this.repo = this.element.querySelector('#repo') as HTMLInputElement;
    this.repoValidation();
    this.branch = this.element.querySelector('#branch') as HTMLInputElement;
    this.branchValidation();
    this.blog = this.element.querySelector('#blog') as HTMLInputElement;

    this.createJsonButton = this.element.querySelector('#create-utterances-json') as HTMLButtonElement;
    this.createJsonButton.addEventListener('click', () => {
      const encodedJson = encodeURIComponent(this.utterancesJson.textContent as string);
      // tslint:disable-next-line:max-line-length
      const url = `https://github.com/${this.repo.value}/new/${encodeURIComponent(this.branch.value)}?filename=utterances.json&value=${encodedJson}`;
      window.open(url, '_blank');
    });

    const copyButton = this.element.querySelector('#copy-button') as HTMLButtonElement;
    copyButton.addEventListener(
      'click',
      () => this.copyTextToClipboard(this.script.textContent as string));

    this.element.addEventListener('change', () => this.outputConfig());
    this.element.addEventListener('input', () => this.outputConfig());
    this.outputConfig();
  }

  private outputConfig() {
    const mapping = this.element.querySelector('input[name="mapping"]:checked') as HTMLInputElement;
    let mappingAttr: string;
    // tslint:disable-next-line:prefer-conditional-expression
    if (mapping.value === 'issue-number') {
      mappingAttr = this.makeConfigScriptAttribute('issue-number', '123');
    } else if (mapping.value === 'specific-term') {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', '????');
    } else {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', mapping.value);
    }
    this.script.innerHTML = this.makeConfigScript(
      this.makeConfigScriptAttribute('repo', this.repo.value) + '\n' +
      this.makeConfigScriptAttribute('branch', this.branch.value) + '\n' +
      mappingAttr);

    const origins = this.stringToOriginsArray(this.blog.value);

    this.utterancesJson.innerHTML = this.makeUtterancesJson(origins);
  }

  private makeConfigScriptAttribute(name: string, value: string) {
    // tslint:disable-next-line:max-line-length
    return `<span class="pl-s1">        <span class="pl-e">${name}</span>=<span class="pl-s"><span class="pl-pds">"</span>${value}<span class="pl-pds">"</span></span></span>`;
  }

  private makeConfigScript(attrs: string) {
    // tslint:disable-next-line:max-line-length
    return `<pre><span class="pl-s1">&lt;<span class="pl-ent">script</span> <span class="pl-e">src</span>=<span class="pl-s"><span class="pl-pds">"</span>https://utteranc.es/client.js<span class="pl-pds">"</span></span></span>\n${attrs}\n<span class="pl-s1">        <span class="pl-e">async</span>&gt;</span>\n<span class="pl-s1">&lt;/<span class="pl-ent">script</span>&gt;</span></pre>`;
  }

  private makeUtterancesJson(origins: string[]) {
    // tslint:disable-next-line:max-line-length
    const makeOriginHtml = (origin: string) => `<span class="pl-s"><span class="pl-pds">"</span>${origin}<span class="pl-pds">"</span></span>`;
    const originsHtml = origins.map(makeOriginHtml).join(', ');
    // tslint:disable-next-line:max-line-length
    return `<pre>{\n  <span class="pl-s"><span class="pl-pds">"</span>origins<span class="pl-pds">"</span></span>: [${originsHtml}]\n}</pre>`;
  }

  private stringToOriginsArray(value: string) {
    const a = document.createElement('a');
    return value.split(',')
      .map(x => x.trim())
      .filter(x => x.length)
      .map(x => {
        a.href = x;
        return a.protocol + '//' + a.host;
      });
  }

  private repoValidation() {
    const control = this.repo.parentElement as HTMLDivElement;
    this.repo.addEventListener('input', () => {
      this.createJsonButton.disabled = true;
      control.classList.remove('has-error', 'has-success');
    });
    this.repo.addEventListener('blur', () => {
      if (!repoRegex.test(this.repo.value)) {
        control.classList.add('has-error');
        return;
      }
      fetch('https://api.github.com/repos/' + this.repo.value, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            this.repoIsValid = true;
            this.createJsonButton.disabled = !this.branchIsValid;
            control.classList.add('has-success');
          } else if (response.status === 404) {
            control.classList.add('has-error');
          }
        });
    });
  }

  private branchValidation() {
    const control = this.branch.parentElement as HTMLDivElement;
    this.branch.addEventListener('input', () => {
      this.createJsonButton.disabled = true;
      control.classList.remove('has-error', 'has-success');
    });
    this.branch.addEventListener('blur', () => {
      if (!this.repoIsValid) {
        return;
      }
      if (!/^[\w\n-]+$/.test(this.branch.value)) {
        control.classList.add('has-error');
        return;
      }
      fetch(`https://api.github.com/repos/${this.repo.value}/branches/${this.branch.value}`, { method: 'HEAD' })
        .then(response => {
          if (response.ok) {
            this.branchIsValid = true;
            this.createJsonButton.disabled = !this.repoIsValid;
            control.classList.add('has-success');
          } else if (response.status === 404) {
            control.classList.add('has-error');
          }
        });
    });
  }

  private copyTextToClipboard(text: string) {
    const textArea = document.createElement('textarea');
    // tslint:disable-next-line:max-line-length
    textArea.style.cssText = `position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent`;
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      // tslint:disable-next-line:no-empty
    } catch (err) { }
    document.body.removeChild(textArea);
  }
}
