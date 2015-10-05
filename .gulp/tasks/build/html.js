'use strict';

var path = require('path');

var jade = require('jade');

module.exports = [

    'build html',

    function() {


        this.gulp
            .src(path.join(this.paths.src, '**/*.jade'))
            .pipe(this.plugins.jade({
                jade: jade,
                pretty: this.env !== 'production'
            }))
            .pipe(this.gulp.dest(this.paths.dest));

    }

];
