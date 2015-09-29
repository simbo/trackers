'use strict';

module.exports = [

    'delete all generated',

    function(done) {
        this.runSequence(
            [
                'clean:css',
                'clean:js',
                'clean:html'
            ],
            done
        );
    }

];
