'use strict';

import gulp from 'gulp';
import Target from './target';
import gulpIf from 'gulp-if';
import gulpExtend from 'gulp-extend';
import sass from 'gulp-sass';
import watch from 'gulp-watch';
import {argv} from 'yargs';

import lazypipe from 'lazypipe';
import fs from 'fs';
import {join} from 'path'

function getDirectories(srcpath) {
    return fs.readdirSync(srcpath).filter(function(file) {
        return fs.statSync(join(srcpath, file)).isDirectory();
    });
}

var buildTarget = function (target) {
    return lazypipe()
        // Targets
        .pipe(function () { // add merged target and deps to stream
            return target.pipe();
        })
        .pipe(function () { // special rule for merge
            return gulpIf('config.json', gulpExtend('config.json'))
        })
        // Build process
        .pipe(function () {
            return gulpIf('**/*.{sass,scss}', sass())
        })();
};

gulp.task('build', () => {

    var target = new Target(argv.target || 'common');
    var task = gulp.src([])
        .pipe(buildTarget(target))
        .pipe(gulp.dest('dist'));

    if (argv.watch) {
        gulp.watch(target.sources(), ['build']);
    }
    return task;
});

gulp.task('export', function () {
    var targets = getDirectories('targets');

    return targets.map(function (targetName) {
        return new Target(targetName);
    }).map(function (target) {
        return gulp.src([])
            .pipe(buildTarget(target))
            .pipe(gulp.dest(join('dist', target.name)))
    })

});
