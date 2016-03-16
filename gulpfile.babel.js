'use strict';

import gulp from 'gulp';
import Target from './target';
import gulpIf from 'gulp-if';
import gulpExtend from 'gulp-extend';
import sass from 'gulp-sass';
import watch from 'gulp-watch';
import {argv} from 'yargs';

var isWatching = argv.watch || false;
var target = new Target('targetA');

gulp.task('target', () => {
    return gulp.src([])
        .pipe(target.pipe()) // add merged target and deps to stream
        .pipe(gulpIf('config.json', gulpExtend('config.json'))) // by default deep extending
        .pipe(gulp.dest('.target/targetA'));
});

gulp.task('build', ['target'], () => {
    return gulp.src('.target/**/*')
        .pipe(gulpIf('**/*.{sass,scss}', sass()))
        .pipe(gulp.dest('dist'));
});

gulp.task('default', ['build'], function () {
    gulp.watch(target.sources(), ['target']);
    gulp.watch('.target/**/*', ['build'])
});