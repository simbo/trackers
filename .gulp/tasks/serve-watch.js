'use strict';

module.exports = [

    'start serve task, then watch task',

    function(done) {
        this.runSequence(
            'serve',
            'watch',
            done
        );
    }

];
