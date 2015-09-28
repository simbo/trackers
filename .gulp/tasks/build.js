'use strict';

module.exports = [

    'build everything',

    function(done) {
        this.runSequence(
            'lint:js',
            'clean',
            [
                'build:css',
                'build:js'
            ],
            done
        );
    }

];
