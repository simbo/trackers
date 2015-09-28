'use strict';

var del = require('del');

module.exports = [

    'delete generated javascripts',

    function(done) {
        del(
            this.paths.jsDest + '/**/*.js?(.map)'
        ).then(function(files) {
            this.log.del.apply(this, [files, done]);
        }.bind(this));
    }

];
