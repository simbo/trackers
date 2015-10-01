'use strict';

var del = require('del');

module.exports = [

    'delete generated html',

    function(done) {
        del(
            this.paths.dest + '/**/*.html'
        ).then(function(files) {
            this.log.del.apply(this, [files, done]);
        }.bind(this));
    }

];
