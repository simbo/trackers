'use strict';

module.exports = [

    'trigger connect server livereload',

    function(done) {
        setTimeout(function() {
            this.gulp
                .src(this.paths.dest, {read: false})
                .pipe(this.plugins.connect.reload());
            done();
        }.bind(this), 200);
    }

];
