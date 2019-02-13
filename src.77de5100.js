// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  return newRequire;
})({"configuration-component.ts":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.ConfigurationComponent = void 0;

var ConfigurationComponent = function () {
  function ConfigurationComponent() {
    var _this = this;

    this.element = document.createElement('form');
    this.element.innerHTML = "\n      <h3 id=\"heading-repository\">Repository</h3>\n      <p>\n        Choose the repository utterances will connect to.\n      </p>\n      <ol>\n        <li>Make sure the repo is public, otherwise your readers will not be able to view the issues/comments.</li>\n        <li>Make sure the <a href=\"https://github.com/apps/utterances\">utterances app</a>\n          is installed on the repo, otherwise users will not be able to post comments.\n        </li>\n        <li>If your repo is a fork, navigate to it's <em>settings</em> tab and confirm\n          the <em>issues</em> feature is turned on. </li>\n      </ol>\n      <fieldset>\n        <div>\n          <label for=\"repo\">repo:</label><br/>\n          <input id=\"repo\" class=\"form-control\" type=\"text\" placeholder=\"owner/repo\">\n          <p class=\"note\">\n            A <strong>public</strong> GitHub repository. This is where the blog\n            post issues and issue-comments will be posted.\n          </p>\n        </div>\n      </fieldset>\n\n      <h3 id=\"heading-mapping\">Blog Post \u2194\uFE0F Issue Mapping</h3>\n      <p>Choose the mapping between blog posts and GitHub issues.</p>\n      <fieldset>\n        <div class=\"form-checkbox\">\n          <label>\n            <input type=\"radio\" value=\"pathname\" name=\"mapping\" checked=\"checked\">\n            Issue title contains page pathname\n            <p class=\"note\">\n              Utterances will search for an issue whose title contains the blog post's pathname\n              URL component. If a matching issue is not found, Utterances will automatically\n              create one the first time someone comments on your post.\n            </p>\n          </label>\n        </div>\n        <div class=\"form-checkbox\">\n          <label>\n            <input type=\"radio\" value=\"url\" name=\"mapping\">\n            Issue title contains page URL\n            <p class=\"note\">\n              Utterances will search for an issue whose title contains the blog post's URL.\n              If a matching issue is not found, Utterances will automatically create one the first\n              time someone comments on your post.\n            </p>\n          </label>\n        </div>\n        <div class=\"form-checkbox\">\n          <label>\n            <input type=\"radio\" value=\"title\" name=\"mapping\">\n            Issue title contains page title\n            <p class=\"note\">\n              Utterances will search for an issue whose title contains the blog post's title.\n              If a matching issue is not found, Utterances will automatically create one the first\n              time someone comments on your post.\n            </p>\n          </label>\n        </div>\n        <div class=\"form-checkbox\">\n          <label>\n            <input type=\"radio\" value=\"og:title\" name=\"mapping\">\n            Issue title contains page og:title\n            <p class=\"note\">\n              Utterances will search for an issue whose title contains the page's\n              <a href=\"http://ogp.me/\">Open Graph</a> title meta.\n              If a matching issue is not found, Utterances will automatically create one the first\n              time someone comments on your post.\n            </p>\n          </label>\n        </div>\n        <div class=\"form-checkbox\">\n          <label>\n            <input type=\"radio\" value=\"issue-number\" name=\"mapping\">\n            Specific issue number\n            <p class=\"note\">\n              You configure Utterances to load a specific issue by number. Issues are not automatically\n              created.\n            </p>\n          </label>\n        </div>\n        <div class=\"form-checkbox\">\n          <label>\n            <input type=\"radio\" value=\"specific-term\" name=\"mapping\">\n            Issue title contains specific term\n            <p class=\"note\">\n              You configure Utterances to search for an issue whose title contains a specific term of your choosing.\n              If a matching issue is not found, Utterances will automatically create one the first\n              time someone comments on your post. The issue's title will be the term you chose.\n            </p>\n          </label>\n        </div>\n      </fieldset>\n\n      <h3 id=\"heading-issue-label\">Issue Label</h3>\n      <p>\n        Choose the label that will be assigned to issues created by Utterances.\n      </p>\n      <fieldset>\n        <div>\n          <label for=\"label\">label (optional):</label><br/>\n          <input id=\"label\" class=\"form-control\" type=\"text\" placeholder=\"Comment\">\n          <p class=\"note\">\n            Label names are case sensitive.\n            The label must exist in your repo-\n            Utterances cannot attach labels that do not exist.\n            Emoji are supported in label names.\u2728\uD83D\uDCAC\u2728\n          </p>\n        </div>\n      </fieldset>\n\n      <h3 id=\"heading-theme\">Theme</h3>\n      <p>\n        Choose an Utterances theme that matches your blog.\n        Can't find a theme you like?\n        <a href=\"https://github.com/utterance/utterances/blob/master/CONTRIBUTING.md\">Contribute</a> a custom theme.\n      </p>\n\n      <select id=\"theme\" class=\"form-select\" value=\"github-light\" aria-label=\"Theme\">\n        <option value=\"github-light\">GitHub Light</option>\n        <option value=\"github-dark\">GitHub Dark</option>\n        <option value=\"github-dark-orange\">GitHub Dark Orange</option>\n      </select>\n\n      <h3 id=\"heading-enable\">Enable Utterances</h3>\n\n      <p>Add the following script tag to your blog's template. Position it where you want the\n      comments to appear. Customize the layout using the <code>.utterances</code> and\n      <code>.utterances-frame</code> selectors.\n      </p>\n      <div class=\"config-field\" id=\"script\" class=\"highlight highlight-text-html-basic\"></div>\n      <button id=\"copy-button\" type=\"button\" class=\"btn btn-blue code-action\">Copy</button>\n      <br/>\n      <br/>";
    this.element.addEventListener('submit', function (event) {
      return event.preventDefault();
    });
    this.element.action = 'javascript:';
    this.script = this.element.querySelector('#script');
    this.repo = this.element.querySelector('#repo');
    this.label = this.element.querySelector('#label');
    this.theme = this.element.querySelector('#theme');
    var themeStylesheet = document.getElementById('theme-stylesheet');
    this.theme.addEventListener('change', function () {
      themeStylesheet.href = "/stylesheets/themes/" + _this.theme.value + "/index.css";
      var message = {
        type: 'set-theme',
        theme: _this.theme.value
      };
      var utterances = document.querySelector('iframe');
      utterances.contentWindow.postMessage(message, location.origin);
    });
    var copyButton = this.element.querySelector('#copy-button');
    copyButton.addEventListener('click', function () {
      return _this.copyTextToClipboard(_this.script.textContent);
    });
    this.element.addEventListener('change', function () {
      return _this.outputConfig();
    });
    this.element.addEventListener('input', function () {
      return _this.outputConfig();
    });
    this.outputConfig();
  }

  ConfigurationComponent.prototype.outputConfig = function () {
    var mapping = this.element.querySelector('input[name="mapping"]:checked');
    var mappingAttr;

    if (mapping.value === 'issue-number') {
      mappingAttr = this.makeConfigScriptAttribute('issue-number', '[ENTER ISSUE NUMBER HERE]');
    } else if (mapping.value === 'specific-term') {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', '[ENTER TERM HERE]');
    } else {
      mappingAttr = this.makeConfigScriptAttribute('issue-term', mapping.value);
    }

    this.script.innerHTML = this.makeConfigScript(this.makeConfigScriptAttribute('repo', this.repo.value === '' ? '[ENTER REPO HERE]' : this.repo.value) + '\n' + mappingAttr + '\n' + (this.label.value ? this.makeConfigScriptAttribute('label', this.label.value) + '\n' : '') + this.makeConfigScriptAttribute('theme', this.theme.value) + '\n' + this.makeConfigScriptAttribute('crossorigin', 'anonymous'));
  };

  ConfigurationComponent.prototype.makeConfigScriptAttribute = function (name, value) {
    return "<span class=\"pl-s1\">        <span class=\"pl-e\">" + name + "</span>=<span class=\"pl-s\"><span class=\"pl-pds\">\"</span>" + value + "<span class=\"pl-pds\">\"</span></span></span>";
  };

  ConfigurationComponent.prototype.makeConfigScript = function (attrs) {
    return "<pre><span class=\"pl-s1\">&lt;<span class=\"pl-ent\">script</span> <span class=\"pl-e\">src</span>=<span class=\"pl-s\"><span class=\"pl-pds\">\"</span>https://utteranc.es/client.js<span class=\"pl-pds\">\"</span></span></span>\n" + attrs + "\n<span class=\"pl-s1\">        <span class=\"pl-e\">async</span>&gt;</span>\n<span class=\"pl-s1\">&lt;/<span class=\"pl-ent\">script</span>&gt;</span></pre>";
  };

  ConfigurationComponent.prototype.copyTextToClipboard = function (text) {
    var textArea = document.createElement('textarea');
    textArea.style.cssText = "position:fixed;top:0;left:0;width:2em;height:2em;padding:0;border:none;outline:none;box-shadow:none;background:transparent";
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();

    try {
      document.execCommand('copy');
    } catch (err) {}

    document.body.removeChild(textArea);
  };

  return ConfigurationComponent;
}();

exports.ConfigurationComponent = ConfigurationComponent;
},{}],"index.ts":[function(require,module,exports) {
"use strict";

var _configurationComponent = require("./configuration-component");

document.querySelector('h2#configuration').insertAdjacentElement('afterend', new _configurationComponent.ConfigurationComponent().element);
},{"./configuration-component":"configuration-component.ts"}]},{},["index.ts"], null)
//# sourceMappingURL=/src.77de5100.map