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

Add the following script tag to your blog's template. Position it where you want the comments to appear. Customize the layout using the .utterances and .utterances-frame selectors.
```html
<script src="https://utteranc.es/client.js"
        repo="<repo>"
        issue-term="<issue-term>"
        label="<label>"
        theme="<theme>"
        crossorigin="anonymous"
        async>
</script>
```
The above variables are explained below:
* repo: Choose the repository utterances will connect to.
    * Make sure the repo is public, otherwise your readers will not be able to view the issues/comments.
    * Make sure the [utterances app](https://github.com/apps/utterances) is installed on the repo, otherwise users will not be able to post comments.
    * If your repo is a fork, navigate to its settings tab and confirm the issues feature is turned on.
    * Format: `owner/repo`, eg: `utterance/utterances`
* issue-term: Choose the mapping between blog posts and GitHub issues. Issue term can have one of the following values
    * pathname - Utterances will search for an issue whose title contains the blog post's pathname URL component. If a matching issue is not found, Utterances will automatically create one the first time someone comments on your post. 
    * url - Utterances will search for an issue whose title contains the blog post's URL. If a matching issue is not found, Utterances will automatically create one the first time someone comments on your post. 
    * title - Utterances will search for an issue whose title contains the blog post's title. If a matching issue is not found, Utterances will automatically create one the first time someone comments on your post. 
    * og:title - Utterances will search for an issue whose title contains the page's Open Graph title meta. If a matching issue is not found, Utterances will automatically create one the first time someone comments on your post. 
    * [ISSUE NUMBER] - You configure Utterances to load a specific issue by number. Issues are not automatically created. 
    * [SPECIFIC ISSUE TERM] - You configure Utterances to search for an issue whose title contains a specific term of your choosing. If a matching issue is not found, Utterances will automatically create one the first time someone comments on your post. The issue's title will be the term you chose. 
* label: Choose the label that will be assigned to issues created by Utterances. 
    * Label names are case sensitive. 
    * The label must exist in your repo- Utterances cannot attach labels that do not exist. 
    * Emoji are supported in label names.✨💬✨ 
 * theme: Choose an Utterances theme that matches your blog. Currently, Utterances supports the following themes
    * github-light
    * github-dark
    * preferred-color-scheme
    * github-dark-orange
    * icy-dark
    * dark-blue
    * photon-dark
    * boxy-light
    
    Can't find a theme you like? [Contribute](https://github.com/utterance/utterances/blob/master/CONTRIBUTING.md) a custom theme.

## sites using utterances

- Haxe [documentation](https://haxe.org/manual) and [cookbook](https://code.haxe.org/)
- [sadsloth.net](https://sadsloth.net/)
- [danyow.net](https://danyow.net)
- **[and many more...](https://github.com/topics/utterances)**

Are you using utterances? [Add the `utterances` topic on your repo](https://docs.github.com/en/github/administering-a-repository/classifying-your-repository-with-topics)!

# try it out 👇👇👇
