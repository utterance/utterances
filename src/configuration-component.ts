import { preferredThemeId, preferredTheme } from './preferred-theme';

export class ConfigurationComponent {
  public readonly element: HTMLFormElement;
  private readonly script: HTMLDivElement;
  private readonly repo: HTMLInputElement;
  private readonly label: HTMLInputElement;
  private readonly theme: HTMLSelectElement;

  constructor() {
    this.element = document.createElement('form');
    this.element.innerHTML = `
      <h3 id="heading-repository">Repository</h3>
      <p>
        Choose the repository utterances will connect to.
      </p>
      <ol>
        <li>Make sure the repo is public, otherwise your readers will not be able to view the issues/comments.</li>
        <li>Make sure the <a href="https://github.com/apps/utterances">utterances app</a>
          is installed on the repo, otherwise users will not be able to post comments.
        </li>
        <li>If your repo is a fork, navigate to its <em>settings</em> tab and confirm
          the <em>issues</em> feature is turned on. </li>
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

      <h3 id="heading-mapping">Blog Post ↔️ Issue Mapping</h3>
      <p>Choose the mapping between blog posts and GitHub issues.</p>
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
            <input type="radio" value="og:title" name="mapping">
            Issue title contains page og:title
            <p class="note">
              Utterances will search for an issue whose title contains the page's
              <a href="http://ogp.me/">Open Graph</a> title meta.
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

      <h3 id="heading-issue-label">Issue Label</h3>
      <p>
        Choose the label that will be assigned to issues created by Utterances.
      </p>
      <fieldset>
        <div>
          <label for="label">label (optional):</label><br/>
          <input id="label" class="form-control" type="text" placeholder="Comment">
          <p class="note">
            Label names are case sensitive.
            The label must exist in your repo-
            Utterances cannot attach labels that do not exist.
            Emoji are supported in label names.✨💬✨
          </p>
        </div>
      </fieldset>

      <h3 id="heading-theme">Theme</h3>
      <p>
        Choose an Utterances theme that matches your blog.
        Can't find a theme you like?
        <a href="https://github.com/utterance/utterances/blob/master/CONTRIBUTING.md">Contribute</a> a custom theme.
      </p>

      <select id="theme" class="form-select" value="github-light" aria-label="Theme">
        <option value="github-light">GitHub Light</option>
        <option value="github-dark">GitHub Dark</option>
        <option value="preferred-color-scheme">Preferred Color Scheme</option>
        <option value="github-dark-orange">GitHub Dark Orange</option>
        <option value="icy-dark">Icy Dark</option>
        <option value="dark-blue">Dark Blue</option>
        <option value="photon-dark">Photon Dark</option>
        <option value="boxy-light">Boxy Light</option>
      </select>

      <h3 id="heading-enable">Enable Utterances</h3>

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

    this.label = this.element.querySelector('#label') as HTMLInputElement;

    this.theme = this.element.querySelector('#theme') as HTMLSelectElement;

    const themeStylesheet = document.getElementById('theme-stylesheet') as HTMLLinkElement;
    this.theme.addEventListener('change', () => {
      let theme = this.theme.value;
      if (theme === preferredThemeId) {
        theme = preferredTheme
      }
      themeStylesheet.href = `/stylesheets/themes/${theme}/index.css`;
      const message = {
        type: 'set-theme',
        theme
      };
      const utterances = document.querySelector('iframe')!;
      utterances.contentWindow!.postMessage(message, location.origin);
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
      mappingAttr = this.makeConfigScriptAttribute('issue-number', '[ENTER ISSUE NUMBER HERE]');
    } else if (mapping.value === 'specific-term') {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', '[ENTER TERM HERE]');
    } else {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', mapping.value);
    }
    this.script.innerHTML = this.makeConfigScript(
      this.makeConfigScriptAttribute('repo', this.repo.value === '' ? '[ENTER REPO HERE]' : this.repo.value) + '\n' +
      mappingAttr + '\n' +
      (this.label.value ? this.makeConfigScriptAttribute('label', this.label.value) + '\n' : '') +
      this.makeConfigScriptAttribute('theme', this.theme.value) + '\n' +
      this.makeConfigScriptAttribute('crossorigin', 'anonymous'));
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
