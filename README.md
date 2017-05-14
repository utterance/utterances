# utterances :crystal_ball:

A lightweight comments widget using GitHub issues.

* [Open source](https://github.com/utterance) :octocat:
* No tracking, no ads, always free. :satellite::no_entry_sign:
* No lock-in. All data stored in GitHub issues. :unlock:
* Styled with [Primer](http://primercss.io/), the css toolkit that powers GitHub. :art:
* 9 KB gzipped. Vanilla TypeScript. No font downloads, no JavaScript libraries for evergreen browsers (bluebird, fetch and classList for IE 11 users) :shipit:

## how it works

When Utterances loads, the GitHub [issue search API](https://developer.github.com/v3/search/#search-issues) is used to find the issue associated with the page based on `url`, `pathname` or `title`. The issue's comments are displayed in the familiar GitHub style.

When a matching issue is not found, [utterances-bot](https://github.com/utterances-bot) will automatically create one the first time someone comments.

To comment, users must authorize the utterances app to post on their behalf using the GitHub [OAuth flow](https://developer.github.com/v3/oauth/#web-application-flow). Alternatively, users can comment on the GitHub issue directly.

## configuration

## sites using utterances

Using utterances? [Add your site](https://github.com/utterance/utterances/edit/master/README.md) to the list:

* [danyow.net](https://danyow.net)

# try it out :point_down::point_down::point_down:
