'use strict';

var path = require('path'),
    spawn = require('child_process').spawn;

module.exports = [

    'release www/ to gh-pages',

    function(done) {
        var destPath = path.relative(this.paths.cwd, this.paths.dest),
            processOptions = {
                stdio: 'inherit',
                cwd: this.paths.cwd
            };
        spawn('git', ['subtree', 'push', '--prefix=' + destPath, 'origin', 'gh-pages'], processOptions)
            .on('close', done);
    }

];
