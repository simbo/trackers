'use strict';

var path = require('path');

var browserify = require('browserify'),
    eventStream = require('event-stream'),
    glob = require('glob'),
    vinylBuffer = require('vinyl-buffer'),
    vinylSource = require('vinyl-source-stream');

module.exports = [

    'build javascripts',

    function(done) {
        glob(path.join(this.paths.js, '*.js'), function(err, files) {
            if (err) {
                this.log.error(err);
                return;
            }
            eventStream.merge(files.map(function(file) {
                return browserify({
                    entries: [file],
                    insertGlobals: false,
                    paths: [
                        this.paths.js,
                        this.paths.node
                    ],
                    debug: true,
                    transform: []
                })
                    .bundle().on('error', this.log.error)
                    .pipe(vinylSource(path.relative(this.paths.js, file)))
                    .pipe(vinylBuffer())
                    .pipe(this.plugins.sourcemaps.init({
                        loadMaps: true
                    }))
                    .pipe(this.env === 'production' ?
                        this.plugins.uglify() : this.util.noop()
                    )
                    .pipe(this.plugins.sourcemaps.write('.', {
                        includeContent: true,
                        sourceRoot: '.'
                    }))
                    .pipe(this.gulp.dest(this.paths.jsDest))
                    .on('error', this.log.error);
            }.bind(this))).on('end', done);
        }.bind(this));
    }

];
