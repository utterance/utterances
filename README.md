# utterances :crystal_ball:

A lightweight comments widget using GitHub issues.

* [Open source](https://github.com/utterance) :octocat:
* No tracking, no ads, always free. :satellite::no_entry_sign:
* No lock-in. All data stored in GitHub issues. :unlock:
* Styled with [Primer](http://primercss.io/), the css toolkit that powers GitHub. :art:
* 9 KB gzipped. Vanilla TypeScript. No font downloads or script dependencies. :shipit:

## how it works

Utterances runs in an iframe. Upon load, the GitHub [issue search API](https://developer.github.com/v3/search/#search-issues) is used to find the issue associated with the page based on `url`, `pathname` or `title`. The issue's comments are displayed in the familiar GitHub style.

When a matching issue is not found, [utterances-bot](https://github.com/utterances-bot) will automatically create one when a user adds a comment.

To comment, users must authorize the utterances app to post on their behalf using the GitHub [OAuth flow](https://developer.github.com/v3/oauth/#web-application-flow). Alternatively, users can comment on the GitHub issue directly.

## basic setup

1. Choose a **public** repo.
1. Add an `utterances.json` file to the repo.
    - This authorizes utterances to post issues and issue comments.
    - The file can go anywhere but the root of the master branch is the default location.
    - List the origins of the sites that will be using utterances to post comments in your repo:
    ``` json
    {
      "origins": ["https://awesome-blog.net"]
    }
    ```
1. Add the utterances script to your blog template. Position the script where you want the comments to appear.
    ```html
    <script src="https://utteranc.es/client.js"
            repo="adalovelace/blog"
            issue-term="pathname"
            async>
    </script>
    ```
1. That's it! Read on for full configuration documentation.

## configuration

TODO:

- document putting utterances.json in non-master branches, non-root paths
- document `issue-term` options: `url`, `pathname`, `title`
- document `issue-number` attribute

## sites using utterances

Using utterances? [Add your site](https://github.com/utterance/utterances/edit/master/README.md) to the list:

* [danyow.net](https://danyow.net)

## try it out :point_down::point_down::point_down:
