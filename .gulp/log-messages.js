'use strict';

var path = require('path');

var gUtil = require('gulp-util');

module.exports = function(plug) {

    return {

        del: function(items, done) {
            if (items.length > 0) {
                plug.util.log('\n' +
                    items.reduce(function(list, item) {
                        return list.concat([
                            gUtil.colors.red('  ✘ ') +
                            plug.util.colors.gray(
                                path.relative(plug.paths.cwd, item)
                            )
                        ]);
                    }, []).join('\n')
                );
                plug.util.log(
                    'Deleted ' + items.length +
                    ' item' + (items.length === 1 ? '' : 's') + '.'
                );
            }
            done();
        },

        watch: function(event) {
            var eventIcon = plug.util.colors.yellow('☀ '),
                eventPath = plug.util.colors.magenta(
                    path.relative(plug.paths.cwd, event.path)
                ),
                eventType = plug.util.colors.yellow(event.type);
            plug.util.log(eventIcon + 'File ' + eventPath + ' was ' + eventType);
        },

        error: function(err) {
            var error = new gUtil.PluginError('gulptask', err, {showStack: true});
            gUtil.log(
                gUtil.colors.red(error.name) +
                (typeof error.path === 'string' ?
                    ' in ' + gUtil.colors.yellow(
                        path.relative(plug.paths.cwd, error.path)
                    ) : ''
                ) +
                '\n' + error.stack
            );
            if (typeof this.emit === 'function') {
                this.emit('end');
            }
        }

    }

};
