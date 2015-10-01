'use strict';

var path = require('path');

var jade = require('jade');

module.exports = [

    'build html',

    function() {

        jade.filters.stripWhitespace = function(str) {
            return this.env !== 'production' ?
                str : str.split(/[\n\r]/).reduce(function(lines, line) {
                    line = line.trim();
                    return lines.concat(line.length > 0 ? [line] : []);
                }, []).join(' ');
        }.bind(this);

        this.gulp
            .src(path.join(this.paths.src, '**/*.jade'))
            .pipe(this.plugins.jade({
                jade: jade,
                pretty: this.env !== 'production'
            }))
            .pipe(this.gulp.dest(this.paths.dest));

    }

];
