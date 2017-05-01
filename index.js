(function () {
'use strict';

var Token = (function () {
    function Token() {
        this.storageKey = 'OAUTH_TOKEN';
    }
    Object.defineProperty(Token.prototype, "value", {
        get: function () {
            return localStorage.getItem(this.storageKey);
        },
        set: function (newValue) {
            if (newValue === null) {
                localStorage.removeItem(this.storageKey);
            }
            else {
                localStorage.setItem(this.storageKey, newValue);
            }
        },
        enumerable: true,
        configurable: true
    });
    return Token;
}());
var token = new Token();

function decodeBase64UTF8(encoded) {
    encoded = encoded.replace(/\s/g, '');
    return decodeURIComponent(escape(atob(encoded)));
}

var GITHUB_API = 'https://api.github.com/';
var GITHUB_ENCODING__HTML = 'application/vnd.github.VERSION.html';
var GITHUB_ENCODING__REACTIONS_PREVIEW = 'application/vnd.github.squirrel-girl-preview';
var owner;
var repo;
var branch;
function setRepoContext(context) {
    owner = context.owner;
    repo = context.repo;
    branch = context.branch;
}
function githubRequest(relativeUrl, init) {
    init = init || {};
    init.mode = 'cors';
    init.cache = 'no-cache';
    var request = new Request(GITHUB_API + relativeUrl, init);
    request.headers.set('Accept', GITHUB_ENCODING__REACTIONS_PREVIEW);
    if (token.value !== null) {
        request.headers.set('Authorization', "token " + token.value);
    }
    return request;
}
var rateLimit = {
    standard: {
        limit: Number.MAX_VALUE,
        remaining: Number.MAX_VALUE,
        reset: 0
    },
    search: {
        limit: Number.MAX_VALUE,
        remaining: Number.MAX_VALUE,
        reset: 0
    }
};
function processRateLimit(response) {
    var limit = response.headers.get('X-RateLimit-Limit');
    var remaining = response.headers.get('X-RateLimit-Remaining');
    var reset = response.headers.get('X-RateLimit-Reset');
    var isSearch = /\/search\//.test(response.url);
    var rate = isSearch ? rateLimit.search : rateLimit.standard;
    rate.limit = +limit;
    rate.remaining = +remaining;
    rate.reset = +reset;
    if (response.status === 403 && rate.remaining === 0) {
        var resetDate = new Date(0);
        resetDate.setUTCSeconds(rate.reset);
        var mins = Math.round((resetDate.getTime() - new Date().getTime()) / 1000 / 60);
        var apiType = isSearch ? 'search API' : 'non-search APIs';
        console.warn("Rate limit exceeded for " + apiType + ". Resets in " + mins + " minute" + (mins === 1 ? '' : 's') + ".");
    }
}
function githubFetch(request) {
    return fetch(request).then(function (response) {
        if (response.status === 401) {
            token.value = null;
        }
        processRateLimit(response);
        return response;
    });
}
function loadJsonFile(path, html) {
    if (html === void 0) { html = false; }
    var request = githubRequest("repos/" + owner + "/" + repo + "/contents/" + path + "?ref=" + branch);
    if (html) {
        request.headers.set('accept', GITHUB_ENCODING__HTML);
    }
    return githubFetch(request).then(function (response) {
        if (response.status === 404) {
            throw new Error("Repo \"" + owner + "/" + repo + "\" does not have a file named \"" + path + "\" in the \"" + branch + "\" branch.");
        }
        if (!response.ok) {
            throw new Error("Error fetching " + path + ".");
        }
        return html ? response.text() : response.json();
    }).then(function (file) {
        if (html) {
            return file;
        }
        var content = file.content;
        var decoded = decodeBase64UTF8(content);
        return JSON.parse(decoded);
    });
}

var context = {
    owner: 'utterance',
    repo: 'utterances',
    branch: 'master'
};
setRepoContext(context);
loadJsonFile('README.md', true).then(function (html) {
    var commentDiv = document.querySelector('.comment');
    commentDiv.insertAdjacentHTML('beforeend', html);
});

}());
