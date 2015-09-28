'use strict';

var path = require('path');

var gUtil = require('gulp-util');

module.exports = {

    del: function(items, done) {
        if (items.length > 0) {
            this.util.log(
                'Deleted ' + items.length +
                ' item' + (items.length === 1 ? '' : 's') + ': \n' +
                items.reduce(function(list, item) {
                    return list.concat([
                        gUtil.colors.red('  ✘ ') +
                        this.util.colors.gray(
                            path.relative(this.paths.cwd, item)
                        )
                    ]);
                }.bind(this), []).join('\n')
            );
        }
        done();
    },

    watch: function(event) {
        var eventIcon = this.util.colors.yellow('☀ '),
            eventPath = this.util.colors.magenta(
                path.relative(this.paths.cwd, event.path)
            ),
            eventType = this.util.colors.yellow(event.type);
        this.util.log(eventIcon + 'File ' + eventPath + ' was ' + eventType);
    },

    error: function(err) {
        var error = new gUtil.PluginError('gulptask', err, {showStack: true});
        gUtil.log(
            gUtil.colors.red(error.name) +
            (typeof error.path === 'string' ?
                ' in ' + gUtil.colors.yellow(
                    path.relative(this.paths.cwd, error.path)
                ) : ''
            ) +
            '\n' + error.stack
        );
        if (typeof this.emit === 'function') {
            this.emit('end');
        }
    }

};
