'use strict';

var arrayify = require('arrayify');

module.exports = [

    'start watchers',

    function() {
        var watchers = [
            {
                glob: this.paths.js + '/**/*.js',
                tasks: ['build:js', 'livereload']
            }, {
                glob: this.paths.css + '/**/*.styl',
                tasks: ['build:css', 'livereload']
            }
        ];
        watchers.forEach(function(watcher) {
            this.gulp.watch(watcher.glob, function() {
                this.runSequence.apply(this.gulp, arrayify(watcher.tasks));
            }.bind(this)).on('change', this.log.watch.bind(this));
        }.bind(this));
    }

];
