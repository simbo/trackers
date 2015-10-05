'use strict';

// core requires
var path = require('path');

// module requires
var gulp = require('gulp'),
    gulpplug = require('gulpplug');

// gulpplug options
var plugOptions = {
    tasksDir: '.gulp/tasks'
};

// initialize gulpplug
var plug = new gulpplug.Plug(gulp, plugOptions);

// log messages
plug.log = require('./.gulp/log-messages.js')(plug);

// environment
plug.env = ['development', 'production']
    .indexOf(process.env.NODE_ENV) !== -1 ?
        process.env.NODE_ENV : 'development';

// display env
plug.util.log('Environment: ' + plug.util.colors.yellow(plug.env));

// paths
plug.paths = (function(paths) {
    paths.cwd = process.cwd();
    paths.node = path.join(paths.cwd, 'node_modules');
    paths.src = path.join(paths.cwd, 'src');
    paths.dest = path.join(paths.cwd, 'www');
    paths.assets = path.join(paths.src, 'assets');
    paths.assetsDest = path.join(paths.dest, 'assets');
    paths.js = path.join(paths.assets, 'js');
    paths.jsDest = path.join(paths.assetsDest, 'js');
    paths.css = path.join(paths.assets, 'stylus');
    paths.cssDest = path.join(paths.assetsDest, 'css');
    return paths;
})({});

// gulpplugging…
plug.loadPlugins()
    .addTasks()
    .addHelpTask();
