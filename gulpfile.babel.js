'use strict';

import gulp from 'gulp';
import addSrc from 'gulp-add-src';
import fs from 'fs';
import path from 'path';
import gulpIf from 'gulp-if';
import gulpExtend from 'gulp-extend';

var targetsCache = {}; // common cache of target. to avoid duplicate target loading

function Target (name, options) {
    if (!name) {
        throw new Error('target name is required');
    }

    options = Object.assign({
        baseDir: './targets',
        configName: 'target.json',
        dest: 'dist'
    }, options);

    this.name = name;
    this.options = options;

    // store calculated values here
    this.__config = {};
    this.__config.path = path.join(options.baseDir, name);
    this.__config.matcher = path.join(this.__config.path, '**/*');

    this.config = require('./' + path.join(this.__config.path, options.configName));

    if (!this.config) {
        throw new Error(`target config is required. Add target.json to the '${name}' target`);
    }

    this.__dependencies = (this.config.dependencies || []).map(function (name) {
        if (!targetsCache[name]) { //caching
            targetsCache[name] = new Target(name, options);
        }
        return targetsCache[name]; // TODO:  add support of complex cross-deps.
    }) || [];
}

Target.prototype.stream = function () {

    var stream = gulp.src([]);
    this.sources().forEach(function (source) {
        stream = stream.pipe(addSrc.append(source));
    });

    return stream;
};
/**
 * Return matches for target files and all deps
 * @returns {Array} array of matcher for files in target and deps
 */
Target.prototype.sources = function () {
    return this.__dependencies.concat([this]).map(function (targetObj) {
        return targetObj.__config.matcher;
    });
};

Target.stream = function (targetName, options) {
    var target = new Target(targetName, options);
    return target.stream();
};

gulp.task('default', () => {
    return Target.stream('targetA')
        .pipe(gulpIf('config.json', gulpExtend('config.json'))) // by default deep extending
        .pipe(gulp.dest('build'));
});