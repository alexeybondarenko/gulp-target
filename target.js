'use strict';

var
    lazypipe = require('lazypipe'),
    addSrc = require('gulp-add-src'),
    fs = require('fs'),
    path = require('path'),
    _ = require('lodash');

var targetsCache = {}; // common cache of target. to avoid duplicate target loading

function Target(name, options) {
    if (!name) {
        throw new Error('target name is required');
    }

    options = Object.assign({
        baseDir: 'targets',
        configName: 'target.json'
    }, options);

    this.name = name;
    this.options = options;

    // store calculated values here
    this.__config = {};
    this.__config.path = path.join(process.cwd(), options.baseDir, name);
    this.__config.matcher = path.join(this.__config.path, '**/*');

    this.config = require(path.join(this.__config.path, options.configName));

    if (!this.config) {
        throw new Error(`target config is required. Add target.json to the '${name}' target`);
    }

    this.__dependencies = (this.config.dependencies || []).map(function (name) {
            if (!targetsCache[name]) { //caching
                targetsCache[name] = new Target(name, options);
            }
            // TODO: catch circular deps
            return targetsCache[name];
        }) || [];
}

Target.prototype.pipe = function () {

    var stream = lazypipe();
    this.sources().forEach(function (source) {
        stream = stream.pipe(function () {
            return addSrc.append(source);
        });
    });

    return stream();
};
/**
 * Return matches for target files and all deps
 * @returns {Array} array of matcher for files in target and deps
 */
Target.prototype.sources = function () {
    return _.uniq(_.flattenDeep(this.__sources()));
};
Target.prototype.__sources = function () {
    return this.__dependencies.map(function (targetObj) {
        if (!targetObj.__dependencies.length) return targetObj.__config.matcher;
        return targetObj.__sources();
    }).concat([this.__config.matcher]);
};

Target.stream = function (targetName, options) {
    var target = new Target(targetName, options);
    return target.stream();
};

module.exports = Target;
