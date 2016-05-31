# gulp-target

Merge multiple directories by dependencies to build WL or variants of the project.

## Install

```sh
$ npm install --save-dev gulp-target
```

## Usage

Base project structure

```sh
/targets
/targets/targetA - dir of the target `targetA`
/targets/targetB - dir of the target `targetB`
```

Target must have `target.json` file. These config is using for merge process.

Example:

```json
{
  "dependencies": [
    "common"
  ]
}
```

Adding this into your `Gulpfile.js`:

```js
var gulp = require('gulp');
var target = require('gulp-target');
```

Sample usage

```js

gulp.task('target', function () {

  var currentTarget = new target('targetName');

  return gulp.src([]) // some special files not from targets folders
    
    .pipe(currentTarget.pipe()) // <- files will be added here

    .pipe(gulp.dest('.target'))
    .on('error', function () {
      process.exit(1)
    });

});
```

Merging files

```js

gulp.task('target', function () {

  var currentTarget = new target('targetName');

  return gulp.src([]) // some special files not from targets folders
    
    .pipe(currentTarget.pipe())

    .pipe($.if('config.json', $.extend('config.json', { strict: true }))
    .pipe(gulp.dest('.target'))
    .on('error', function () {
      process.exit(1)
    });

});

```

### target.json

`dependencies` - are the names of the folders inside `targetFolder`. They will be included by order in the `target.json`.

## Options

`baseDir` - name of the folder, there targets are located. `targets` by default

`configName` - name of the target config file. `target.json` by default

```js
var currentTarget = new target('targetName', {
  baseDir: 'target',
  configName: 'target.json'
});
```

