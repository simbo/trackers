'use strict';

module.exports = [

    'build javascripts',

    function() {
        return this.gulp

            .src(this.paths.js + '/*.js')

            .pipe(this.plugins.browserify({
                insertGlobals: false,
                debug: true
            }))

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

    }

];
