# VTEX development kit using es6 + scss
Hurry up don't waste your time, Do these commands in your terminal.

# Install
```bash
$ mkdir my-project
$ cd my-project
$ git clone {projectUrl} .
$ yarn install
$ gulp dev
```

# Important things
```
1 - Legacy files were placed at suggestive folder for convenience: styles/legacyFiles <> scripts/legacyFiles
2 - This legacy files are contatenated at the top of bundle.js: build/legacyPlusNew
3 - Legacy Templates are placed at suggestive folder too: templates/legacyFiles
4 - Never forget the ";" at end of legacy files
5 - Clean files created by your agency are placed outside of legacy folders and build files too
6 - Legacy files will always be merged with any entry js file, like "main_script.js/mundinho_script.js", just to keep older features working until being converted to the new pattern.
```
# Some patterns
```
1 - Javascript classes are named by Pascal case like (SomeClass/Person/Slider)
2 - Javascript methods are named by cameCase like (someMethod/myMethod/doSomeThing)
3 - Css classes follows the BEM pattern
4 - Entry files like "main_script and mundinho_script or main_style and mundinho_style" are named with contex prefix like "mundinho (for some secudary domain pages)" and so on, please keep this pattern.
```
# Features
```
1 - Support Gulp (ver=3.9)
2 - Support Sass(SCSS)
3 - Support ES6+ (Babel)
4 - Support BrowserSync
5 - Support Browserify (So You can write module import/export in your js file)
6 - Live reload any changes in (html, scss, js files), prevent crash while coding
n - What dou you want? leave an issue :)
```

# Examples

```css
body {
    background-color: green;
}

@include above(400px) {
    body {
        background-color: blue;
    }
}

@include below(400px) {
    body {
        background-color: pink;
    }
}
```