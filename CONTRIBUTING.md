# Contributing

1. Install yarn: https://yarnpkg.com
2. Clone the repo:
    ```bash
    git clone https://github.com/utterance/utterances
    ```
3. Install the project's dependencies using yarn:
    ```bash
    cd utterances
    yarn install
    ```
4. Start developing!
    ```bash
    yarn start
    ```
    This command compiles the source files and starts a development webserver. Any change you make to the source TypeScript, HTML and SCSS files will automatically be recompiled. Go to http://localhost:4000/index.html to view your changes.

## Theme Development

Each theme is located in a subdirectory of `src/stylesheets/themes`. Themes must have an `index.scss` and `utterances.scss` files. These are the entrypoint stylesheets for the utterances homepage and utterances widget respectively. *Todo: more instructions*
