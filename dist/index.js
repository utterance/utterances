(function () {
'use strict';

function deparam(query) {
    var match;
    var plus = /\+/g;
    var search = /([^&=]+)=?([^&]*)/g;
    var decode = function (s) { return decodeURIComponent(s.replace(plus, ' ')); };
    var params = {};
    while (match = search.exec(query)) {
        params[decode(match[1])] = decode(match[2]);
    }
    return params;
}
function param(obj) {
    var parts = [];
    for (var name_1 in obj) {
        if (obj.hasOwnProperty(name_1)) {
            parts.push(encodeURIComponent(name_1) + "=" + encodeURIComponent(obj[name_1]));
        }
    }
    return parts.join('&');
}

function readQueryString() {
    var queryString = deparam(location.search.substr(1));
    var issueTerm = null;
    var issueNumber = null;
    if ('issue-term' in queryString) {
        issueTerm = queryString['issue-term'];
        if (issueTerm !== undefined) {
            if (issueTerm === '') {
                throw new Error('When issue-term is specified, it cannot be blank.');
            }
            if (['title', 'url', 'pathname'].indexOf(issueTerm) !== -1) {
                issueTerm = queryString[issueTerm];
            }
        }
    }
    else if ('issue-number' in queryString) {
        issueNumber = +queryString['issue-number'];
        if (issueNumber.toString(10) !== queryString['issue-number']) {
            throw new Error("issue-number is invalid. \"" + queryString['issue-number']);
        }
    }
    else {
        throw new Error('Invalid query string arguments. Either "issue-term" or "issue-number" must be specified.');
    }
    if (!('repo' in queryString)) {
        throw new Error('Invalid query string arguments. "repo" is required.');
    }
    if (!('origin' in queryString)) {
        throw new Error('Invalid query string arguments. "origin" is required.');
    }
    var matches = /^([a-z][\w-]+)\/([a-z][\w-]+)$/i.exec(queryString.repo);
    if (matches === null) {
        throw new Error("Invalid repo: \"" + queryString.repo + "\"");
    }
    return {
        owner: matches[1],
        repo: matches[2],
        branch: 'branch' in queryString ? queryString.branch : 'master',
        configPath: 'config-path' in queryString ? queryString['config-path'] : 'utterances.json',
        issueTerm: issueTerm,
        issueNumber: issueNumber,
        origin: queryString.origin,
        url: queryString.origin + queryString.pathname,
        title: queryString.title,
        description: queryString.description
    };
}
var options = readQueryString();

var authorizeUri = 'https://github.com/login/oauth/authorize';
var tokenUri = 'https://utterances-oauth.herokuapp.com/access-token';
var redirect_uri = 'https://utteranc.es/authorized.html';
var client_id = '1a560753410b181458de';
var scopes = 'public_repo';
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
function popup(url) {
    var resolve;
    window.resolveOpenWindow = function (query) {
        window.resolveOpenWindow = null;
        resolve(deparam(query));
    };
    var promise = new Promise(function (r) { return resolve = r; });
    window.open(url);
    return promise;
}
function requestAuthorizationCode() {
    var args = {
        client_id: client_id,
        redirect_uri: redirect_uri,
        scope: scopes,
        state: Math.floor(Math.random() * 100000).toString()
    };
    var url = authorizeUri + "?" + param(args);
    return popup(url)
        .then(function (result) {
        if (!(result.code && result.state)) {
            throw new Error('Redirect did not include code and state parameters.');
        }
        if (result.state !== args.state) {
            throw new Error('State mismatch.');
        }
        return result;
    });
}
function requestAccessToken(_a) {
    var code = _a.code, state = _a.state;
    var args = { code: code, state: state };
    var url = tokenUri + "?" + param(args);
    return fetch(url)
        .then(function (response) { return response.text(); })
        .then(function (body) { return deparam(body); });
}
function login() {
    return requestAuthorizationCode()
        .then(function (response) { return requestAccessToken(response); })
        .then(function (_a) {
        var access_token = _a.access_token;
        return token.value = access_token;
    })
        .catch(function (reason) {
        token.value = null;
        throw reason;
    });
}

function decodeBase64UTF8(encoded) {
    encoded = encoded.replace(/\s/g, '');
    return decodeURIComponent(escape(atob(encoded)));
}

var GITHUB_API = 'https://api.github.com/';
var GITHUB_ENCODING__HTML_JSON = 'application/vnd.github.VERSION.html+json';
var GITHUB_ENCODING__REACTIONS_PREVIEW = 'application/vnd.github.squirrel-girl-preview';
var UTTERANCES_API = 'https://utterances-oauth.herokuapp.com';
var PAGE_SIZE = 100;
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
function readRelNext(response) {
    var link = response.headers.get('link');
    if (link === null) {
        return 0;
    }
    var match = /\?page=([2-9][0-9]*)>; rel="next"/.exec(link);
    if (match === null) {
        return 0;
    }
    return +match[1];
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
function loadJsonFile(path) {
    var request = githubRequest("repos/" + owner + "/" + repo + "/contents/" + path + "?ref=" + branch);
    return githubFetch(request).then(function (response) {
        if (response.status === 404) {
            throw new Error("Repo \"" + owner + "/" + repo + "\" does not have a file named \"" + path + "\" in the \"" + branch + "\" branch.");
        }
        if (!response.ok) {
            throw new Error("Error fetching " + path + ".");
        }
        return response.json();
    }).then(function (_a) {
        var content = _a.content;
        var json = decodeBase64UTF8(content);
        var config = JSON.parse(json);
        return config;
    });
}
function loadIssueByTerm(term) {
    var q = "\"" + term + "\" type:issue in:title repo:" + owner + "/" + repo;
    var request = githubRequest("search/issues?q=" + encodeURIComponent(q) + "&sort=created&order=asc");
    return githubFetch(request).then(function (response) {
        if (!response.ok) {
            throw new Error('Error fetching issue via search.');
        }
        return response.json();
    }).then(function (results) {
        if (results.total_count === 0) {
            return null;
        }
        if (results.total_count > 1) {
            console.warn("Multiple issues match \"" + q + "\". Using earliest created.");
        }
        return results.items[0];
    });
}
function loadIssueByNumber(issueNumber) {
    var request = githubRequest("repos/" + owner + "/" + repo + "/issues/" + issueNumber);
    return githubFetch(request).then(function (response) {
        if (!response.ok) {
            throw new Error('Error fetching issue via issue number.');
        }
        return response.json();
    });
}
function commentsRequest(issueNumber, page) {
    var url = "repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/comments?page=" + page + "&per_page=" + PAGE_SIZE;
    var request = githubRequest(url);
    var accept = GITHUB_ENCODING__HTML_JSON + "," + GITHUB_ENCODING__REACTIONS_PREVIEW;
    request.headers.set('Accept', accept);
    return request;
}
function loadCommentsPage(issueNumber, page) {
    var request = commentsRequest(issueNumber, page);
    return githubFetch(request).then(function (response) {
        if (!response.ok) {
            throw new Error('Error fetching comments.');
        }
        var nextPage = readRelNext(response);
        return response.json()
            .then(function (items) { return ({ items: items, nextPage: nextPage }); });
    });
}
function loadUser() {
    if (token.value === null) {
        return Promise.resolve(null);
    }
    return githubFetch(githubRequest('user'))
        .then(function (response) {
        if (response.ok) {
            return response.json();
        }
        return null;
    });
}
function createIssue(issueTerm, documentUrl, title, description) {
    var request = new Request(UTTERANCES_API + "/repos/" + owner + "/" + repo + "/issues", {
        method: 'POST',
        body: JSON.stringify({
            title: issueTerm,
            body: "# " + title + "\n\n" + description + "\n\n" + documentUrl + "\n\n> :crystal_ball: *Issue created by [utteranc.es](https://utteranc.es) bot*"
        })
    });
    request.headers.set('Accept', GITHUB_ENCODING__REACTIONS_PREVIEW);
    return fetch(request).then(function (response) {
        if (!response.ok) {
            throw new Error('Error creating comments container issue');
        }
        return response.json();
    });
}
function postComment(issueNumber, markdown) {
    var url = "repos/" + owner + "/" + repo + "/issues/" + issueNumber + "/comments";
    var body = JSON.stringify({ body: markdown });
    var request = githubRequest(url, { method: 'POST', body: body });
    var accept = GITHUB_ENCODING__HTML_JSON + "," + GITHUB_ENCODING__REACTIONS_PREVIEW;
    request.headers.set('Accept', accept);
    return githubFetch(request).then(function (response) {
        if (!response.ok) {
            throw new Error('Error posting comment.');
        }
        return response.json();
    });
}

var thresholds = [
    1000, 'second',
    1000 * 60, 'minute',
    1000 * 60 * 60, 'hour',
    1000 * 60 * 60 * 24, 'day',
    1000 * 60 * 60 * 24 * 7, 'week',
    1000 * 60 * 60 * 24 * 27, 'month'
];
var formatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
function timeAgo(current, value) {
    var elapsed = current - value.getTime();
    if (elapsed < 5000) {
        return 'just now';
    }
    var i = 0;
    while (i + 2 < thresholds.length && elapsed * 1.1 > thresholds[i + 2]) {
        i += 2;
    }
    var divisor = thresholds[i];
    var text = thresholds[i + 1];
    var units = Math.round(elapsed / divisor);
    if (units > 3 && i === thresholds.length - 2) {
        return "on " + value.toLocaleDateString(undefined, formatOptions);
    }
    return units === 1 ? (text === 'hour' ? 'an' : 'a') + " " + text + " ago" : units + " " + text + "s ago";
}

var avatarArgs = '?v=3&s=88';
var CommentComponent = (function () {
    function CommentComponent(comment, currentUser, repoOwner) {
        this.comment = comment;
        this.currentUser = currentUser;
        var user = comment.user, html_url = comment.html_url, created_at = comment.created_at, body_html = comment.body_html;
        this.element = document.createElement('div');
        this.element.classList.add('comment-wrapper');
        this.element.innerHTML = "\n      <div class=\"comment-avatar\">\n        <a href=\"" + user.html_url + "\" target=\"_blank\">\n          <img class=\"avatar\" alt=\"@" + user.login + "\" height=\"44\" width=\"44\"\n               src=\"" + user.avatar_url + avatarArgs + "\">\n        </a>\n      </div>\n      <div class=\"comment " + (user.login === currentUser ? 'current-user' : '') + "\">\n        <div class=\"comment-header\">\n          <div class=\"comment-header-text\">\n            <strong>\n              <a class=\"author\" href=\"" + user.html_url + "\" target=\"_blank\">" + user.login + "</a>\n            </strong>\n            commented\n            <a class=\"timestamp\" href=\"" + html_url + "\" target=\"_blank\">\n              " + timeAgo(Date.now(), new Date(created_at)) + "\n            </a>\n          </div>\n          " + (repoOwner === user.login ? '<span class="comment-label">Owner</span>' : '') + "\n          <!--<div class=\"comment-actions\"></div>-->\n        </div>\n        <div class=\"comment-body\">\n          " + body_html + "\n        </div>\n      </div>";
        this.retargetLinks();
    }
    CommentComponent.prototype.setComment = function (comment) {
        var commentDiv = this.element.lastElementChild;
        var user = comment.user, html_url = comment.html_url, created_at = comment.created_at, body_html = comment.body_html;
        if (this.comment.user.login !== user.login) {
            var avatarAnchor = this.element.firstElementChild.firstElementChild;
            var avatar = avatarAnchor.firstElementChild;
            avatarAnchor.href = user.html_url;
            avatar.alt = '@' + user.login;
            avatar.src = user.avatar_url + avatarArgs;
            if (user.login === this.currentUser) {
                commentDiv.classList.add('current-user');
            }
            else {
                commentDiv.classList.remove('current-user');
            }
            var authorAnchor = commentDiv
                .firstElementChild.firstElementChild
                .firstElementChild.firstElementChild;
            authorAnchor.href = user.html_url;
            authorAnchor.textContent = user.login;
        }
        if (this.comment.created_at !== created_at || this.comment.html_url !== html_url) {
            var timestamp = commentDiv.firstElementChild.firstElementChild.lastElementChild;
            timestamp.href = html_url;
            timestamp.textContent = timeAgo(Date.now(), new Date(created_at));
        }
        if (this.comment.body_html !== body_html) {
            var body = commentDiv.lastElementChild;
            body.innerHTML = body_html;
            this.retargetLinks();
        }
        this.comment = comment;
    };
    CommentComponent.prototype.setCurrentUser = function (currentUser) {
        if (this.currentUser === currentUser) {
            return;
        }
        var commentDiv = this.element.firstElementChild;
        if (this.comment.user.login === this.currentUser) {
            commentDiv.classList.add('current-user');
        }
        else {
            commentDiv.classList.remove('current-user');
        }
        this.currentUser = currentUser;
    };
    CommentComponent.prototype.retargetLinks = function () {
        var links = this.element.lastElementChild.lastElementChild.querySelectorAll('a');
        var j = links.length;
        while (j--) {
            var link = links.item(j);
            link.target = '_blank';
        }
    };
    return CommentComponent;
}());

var hostOrigin;
function setHostOrigin(origin) {
    hostOrigin = origin;
    addEventListener('resize', publishResize);
}
var lastHeight = -1;
function publishResize() {
    var body = document.body, html = document.documentElement;
    var height = Math.max(body.scrollHeight, body.offsetHeight, html.clientHeight, html.scrollHeight, html.offsetHeight);
    if (height === lastHeight) {
        return;
    }
    lastHeight = height;
    var message = { type: 'resize', height: height };
    parent.postMessage(message, hostOrigin);
}

var TimelineComponent = (function () {
    function TimelineComponent(user, issue, repoOwner) {
        this.user = user;
        this.issue = issue;
        this.repoOwner = repoOwner;
        this.timeline = [];
        this.element = document.createElement('div');
        this.element.classList.add('timeline');
    }
    TimelineComponent.prototype.setUser = function (user) {
        this.user = user;
        var login = user ? user.login : null;
        for (var i = 0; i < this.timeline.length; i++) {
            this.timeline[i].setCurrentUser(login);
        }
        publishResize();
    };
    TimelineComponent.prototype.setIssue = function (issue) {
        this.issue = issue;
    };
    TimelineComponent.prototype.appendComment = function (comment) {
        var component = new CommentComponent(comment, this.user ? this.user.login : null, this.repoOwner);
        this.timeline.push(component);
        this.element.appendChild(component.element);
        publishResize();
    };
    TimelineComponent.prototype.replaceComments = function (comments) {
        var i;
        for (i = 0; i < comments.length; i++) {
            var comment = comments[i];
            if (i <= this.timeline.length) {
                this.appendComment(comment);
                continue;
            }
            this.timeline[i].setComment(comment);
        }
        for (; i < this.timeline.length; i++) {
            this.element.removeChild(this.element.lastElementChild);
        }
        publishResize();
    };
    return TimelineComponent;
}());

var anonymousAvatarUrl = "data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 14 16\" version=\"1.1\"><path fill=\"rgb(179,179,179)\" fill-rule=\"evenodd\" d=\"M8 10.5L9 14H5l1-3.5L5.25 9h3.5L8 10.5zM10 6H4L2 7h10l-2-1zM9 2L7 3 5 2 4 5h6L9 2zm4.03 7.75L10 9l1 2-2 3h3.22c.45 0 .86-.31.97-.75l.56-2.28c.14-.53-.19-1.08-.72-1.22zM4 9l-3.03.75c-.53.14-.86.69-.72 1.22l.56 2.28c.11.44.52.75.97.75H5l-2-3 1-2z\"></path></svg>";
var NewCommentComponent = (function () {
    function NewCommentComponent(user, submit) {
        this.user = user;
        this.submit = submit;
        this.element = document.createElement('div');
        this.element.classList.add('comment-wrapper');
        this.element.addEventListener('mousemove', publishResize);
        this.element.innerHTML = "\n      <div class=\"comment-avatar\">\n        <a target=\"_blank\">\n          <img class=\"avatar\" height=\"44\" width=\"44\">\n        </a>\n      </div>\n      <div class=\"comment current-user\">\n        <div class=\"comment-header\">\n          <div class=\"comment-header-text\">\n            <strong>\n              Write\n            </strong>\n          </div>\n        </div>\n        <div class=\"comment-body editable\">\n          <form class=\"comment-form\" accept-charset=\"UTF-8\">\n            <textarea class=\"comment-area\" placeholder=\"Leave a comment\" aria-label=\"comment\"></textarea>\n            <div class=\"comment-form-actions\">\n              <a class=\"markdown-info\" tabindex=\"-1\" target=\"_blank\"\n                  href=\"https://guides.github.com/features/mastering-markdown/\" target=\"_blank\">\n                Styling with Markdown is supported\n              </a>\n              <button class=\"btn btn-primary\" type=\"submit\">Comment</button>\n            </div>\n          </form>\n        </div>\n      </div>";
        this.setUser(user);
    }
    NewCommentComponent.prototype.setUser = function (user) {
        var _this = this;
        this.user = user;
        var avatarAnchor = this.element.firstElementChild.firstElementChild;
        var avatar = avatarAnchor.firstElementChild;
        if (user) {
            avatarAnchor.href = user.html_url;
            avatar.alt = '@' + user.login;
            avatar.src = user.avatar_url + '?v=3&s=88';
        }
        else {
            avatarAnchor.removeAttribute('href');
            avatar.alt = '@anonymous';
            avatar.src = anonymousAvatarUrl;
        }
        var form = this.element.lastElementChild.lastElementChild.firstElementChild;
        var textarea = form.firstElementChild;
        var submitButton = textarea.nextElementSibling.lastElementChild;
        submitButton.textContent = user ? 'Comment' : 'Sign in to comment';
        textarea.disabled = !user;
        var isEmpty = function () { return textarea.value.replace(/^\s+|\s+$/g, '').length === 0; };
        textarea.addEventListener('input', function () { return submitButton.disabled = isEmpty(); });
        var submitting = false;
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            if (submitting) {
                return;
            }
            submitting = true;
            textarea.disabled = true;
            submitButton.disabled = true;
            _this.submit(textarea.value).catch().then(function () {
                textarea.disabled = !user;
                submitButton.disabled = false;
            });
        });
    };
    NewCommentComponent.prototype.clear = function () {
        var textarea = this.element.lastElementChild.lastElementChild
            .firstElementChild.firstElementChild;
        textarea.value = '';
    };
    return NewCommentComponent;
}());

setRepoContext(options);
function loadIssue() {
    if (options.issueNumber !== null) {
        return loadIssueByNumber(options.issueNumber);
    }
    return loadIssueByTerm(options.issueTerm);
}
function normalizeConfig(filename, rawConfig) {
    if (!Array.isArray(rawConfig.origins)) {
        throw new Error(filename + ": origins must be an array");
    }
    return rawConfig;
}
Promise.all([loadJsonFile(options.configPath), loadIssue(), loadUser()])
    .then(function (_a) {
    var config = _a[0], issue = _a[1], user = _a[2];
    return bootstrap(config, issue, user);
});
function bootstrap(rawConfig, issue, user) {
    var config = normalizeConfig(options.configPath, rawConfig);
    if (config.origins.indexOf(options.origin) === -1) {
        throw new Error("The origins specified in " + options.configPath + " do not include " + options.origin);
    }
    setHostOrigin(options.origin);
    var timeline = new TimelineComponent(user, issue, options.owner);
    document.body.appendChild(timeline.element);
    if (issue && issue.comments > 0) {
        loadCommentsPage(issue.number, 1).then(function (_a) {
            var items = _a.items;
            return timeline.replaceComments(items);
        });
    }
    if (issue && issue.locked) {
        return;
    }
    var submit = function (markdown) {
        if (user) {
            var commentPromise = void 0;
            if (issue) {
                commentPromise = postComment(issue.number, markdown);
            }
            else {
                commentPromise = createIssue(options.issueTerm, options.url, options.title, options.description).then(function (newIssue) {
                    issue = newIssue;
                    timeline.setIssue(issue);
                    return postComment(issue.number, markdown);
                });
            }
            return commentPromise.then(function (comment) {
                timeline.appendComment(comment);
                newCommentComponent.clear();
            });
        }
        return login().then(function () { return loadUser(); }).then(function (u) {
            user = u;
            timeline.setUser(user);
            newCommentComponent.setUser(user);
        });
    };
    var newCommentComponent = new NewCommentComponent(user, submit);
    document.body.appendChild(newCommentComponent.element);
    publishResize();
}

}());
