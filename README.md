# utterances 🔮

A lightweight comments widget built on GitHub issues. Use GitHub issues for blog comments, wiki pages and more!

- [Open source](https://github.com/utterance). 🙌
- No tracking, no ads, always free. 📡🚫
- No lock-in. All data stored in GitHub issues. 🔓
- Styled with [Primer](http://primer.style), the css toolkit that powers GitHub. 💅
- Dark theme. 🌘
- Lightweight. Vanilla TypeScript. No font downloads, JavaScript frameworks or polyfills for evergreen browsers. 🐦🌲

## how it works

When Utterances loads, the GitHub [issue search API](https://developer.github.com/v3/search/#search-issues) is used to find the issue associated with the page based on `url`, `pathname` or `title`. If we cannot find an issue that matches the page, no problem, [utterances-bot](https://github.com/utterances-bot) will automatically create an issue the first time someone comments.

To comment, users must authorize the utterances app to post on their behalf using the GitHub [OAuth flow](https://developer.github.com/v3/oauth/#web-application-flow). Alternatively, users can comment on the GitHub issue directly.

## configuration

## sites using utterances

- Haxe [documentation](https://haxe.org/manual) and [cookbook](https://code.haxe.org/)
- [sadsloth.net](https://sadsloth.net/)
- [danyow.net](https://danyow.net)
- **[and many more...](https://github.com/topics/utterances)**

Are you using utterances? [Add the `utterances` topic on your repo](https://docs.github.com/en/github/administering-a-repository/classifying-your-repository-with-topics)!

# try it out 👇👇👇
