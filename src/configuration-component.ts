export class ConfigurationComponent {
  public element: HTMLFormElement;
  private script: HTMLDivElement;
  private repo: HTMLInputElement;

  constructor() {
    this.element = document.createElement('form');
    this.element.innerHTML = `
      <h3>Repository</h3>
      <p>
        Choose the repository utterances will connect to.
      </p>
      <ol>
        <li>Make sure the repo is public, otherwise your readers will not be able to view the issues/comments.</li>
        <li>Make sure the <a href="https://github.com/apps/utterances">utterances app</a>
          is installed on the repo, otherwise users will not be able to post comments.
        </li>
      </ol>
      <fieldset>
        <div>
          <label for="repo">repo:</label><br/>
          <input id="repo" class="form-control" type="text" placeholder="owner/repo">
          <p class="note">
            A <strong>public</strong> GitHub repository. This is where the blog
            post issues and issue-comments will be posted.
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
              You configure Utterances to search for an issue whose title contains a specific term of your choosing.
              If a matching issue is not found, Utterances will automatically create one the first
              time someone comments on your post. The issue's title will be the term you chose.
            </p>
          </label>
        </div>
      </fieldset>

      <h3>Enable Utterances</h3>

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

    this.repo = this.element.querySelector('#repo') as HTMLInputElement;

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
      mappingAttr = this.makeConfigScriptAttribute('issue-number', '[ENTER ISSUE NUMBER HERE]');
    } else if (mapping.value === 'specific-term') {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', '[ENTER TERM HERE]');
    } else {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', mapping.value);
    }
    this.script.innerHTML = this.makeConfigScript(
      this.makeConfigScriptAttribute('repo', this.repo.value === '' ? '[ENTER REPO HERE]' : this.repo.value) + '\n' +
      mappingAttr);
  }

  private makeConfigScriptAttribute(name: string, value: string) {
    // tslint:disable-next-line:max-line-length
    return `<span class="pl-s1">        <span class="pl-e">${name}</span>=<span class="pl-s"><span class="pl-pds">"</span>${value}<span class="pl-pds">"</span></span></span>`;
  }

  private makeConfigScript(attrs: string) {
    // tslint:disable-next-line:max-line-length
    return `<pre><span class="pl-s1">&lt;<span class="pl-ent">script</span> <span class="pl-e">src</span>=<span class="pl-s"><span class="pl-pds">"</span>https://utteranc.es/client.js<span class="pl-pds">"</span></span></span>\n${attrs}\n<span class="pl-s1">        <span class="pl-e">async</span>&gt;</span>\n<span class="pl-s1">&lt;/<span class="pl-ent">script</span>&gt;</span></pre>`;
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
