'use strict';

module.exports = [

    'trigger connect server livereload',

    function() {
        return this.gulp
            .src(this.paths.dest, {read: false})
            .pipe(this.plugins.connect.reload());
    }

];
