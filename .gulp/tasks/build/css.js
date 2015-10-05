'use strict';

var path = require('path');

var autoprefixer = require('autoprefixer'),
    csswring = require('csswring'),
    mqpacker = require('css-mqpacker');

module.exports = [

    'build stylesheets',

    function() {
        return this.gulp

            .src(path.join(this.paths.css, '*.styl'))

            .pipe(this.plugins.sourcemaps.init())

            .pipe(this.plugins.stylus({
                paths: [
                    path.join(this.paths.css, 'imports'),
                    path.join(this.paths.assets, 'img'),
                    this.paths.node
                ],
                'include css': true,
                url: {
                    name: 'inline-url',
                    limit: false
                }
            }).on('error', this.log.error))

            .pipe(this.plugins.extReplace('.' + this.versionSlug + '.css', '.css'))

            .pipe(this.plugins.postcss([
                autoprefixer({
                    browsers: ['> 0.01%']
                }),
                mqpacker
            ].concat(this.env === 'production' ?
                [csswring({
                    preserveHacks: true
                })] : []
            )))

            .pipe(this.plugins.sourcemaps.write('.', {
                includeContent: true,
                sourceRoot: '.'
            }))

            .pipe(this.gulp.dest(this.paths.cssDest))

            .on('error', this.log.error);

    }

];
