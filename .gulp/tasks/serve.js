'use strict';

module.exports = [

    'start connect server',

    'build',

    function(done) {
        this.plugins.connect.server({
            root: this.paths.dest,
            port: 8080,
            livereload: {
                port: 35729
            }
        });
        done();
    }

];
