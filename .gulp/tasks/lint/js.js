'use strict';

module.exports = [

    'lint javascripts',

    function() {
        return this.gulp
            .src(this.paths.js + '/**/*.js')
            .pipe(this.plugins.eslint())
            .pipe(this.plugins.eslint.format())
            .pipe(this.env === 'production' ?
                this.plugins.eslint.failAfterError() : this.util.noop()
            );
    }

];
