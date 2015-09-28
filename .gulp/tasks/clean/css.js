'use strict';

var del = require('del');

module.exports = [

    'delete generated stylesheets',

    function(done) {
        del(
            this.paths.cssDest + '/**/*.css?(.map)'
        ).then(function(files) {
            this.log.del.apply(this, [files, done]);
        }.bind(this));
    }

];
