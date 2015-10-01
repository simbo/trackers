'use strict';

var arrayify = require('arrayify');

module.exports = [

    'start watchers',

    function() {
        var watchers = [
            {
                glob: this.paths.js + '/**/*.js',
                tasks: [
                    'clean:js',
                    'build:js',
                    'livereload'
                ]
            }, {
                glob: this.paths.css + '/**/*.styl',
                tasks: [
                    'clean:css',
                    'build:css',
                    'livereload'
                ]
            }, {
                glob: this.paths.src + '/**/*.jade',
                tasks: [
                    'clean:html',
                    'build:html',
                    'livereload'
                ]
            }
        ];
        watchers.forEach(function(watcher) {
            this.gulp.watch(watcher.glob, function() {
                this.runSequence.apply(this.gulp, arrayify(watcher.tasks));
            }.bind(this)).on('change', this.log.watch.bind(this));
        }.bind(this));
    }

];
