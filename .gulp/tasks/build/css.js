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
                    path.join(this.paths.cwd, 'node_modules'),
                    path.join(this.paths.cwd, 'node_modules/collection.stylus/src/stylus/imports/')
                ],
                'include css': true,
                url: {
                    name: 'inline-url',
                    limit: false
                }
            }))

            .pipe(this.plugins.postcss([
                autoprefixer({
                    browsers: [
                        'last 2 versions',
                        '> 2%',
                        'Opera 11.1',
                        'Firefox ESR'
                    ]
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
