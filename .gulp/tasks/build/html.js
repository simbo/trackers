'use strict';

var path = require('path');

var jade = require('jade'),
    uglify = require('uglify-js');

module.exports = [

    'build html',

    function() {

        jade.filters.uglify = function(data) {
            return uglify.minify(data, {fromString: true}).code;
        };

        this.gulp
            .src(path.join(this.paths.src, '**/*.jade'))
            .pipe(this.plugins.jade({
            }))
                jade: jade
            .pipe(this.gulp.dest(this.paths.dest));

    }

];
