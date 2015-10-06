'use strict';

/**
 * remove a class from a dom element
 * @param  {node}   element   dom node
 * @param  {string} className class to remove
 * @param  {string} replace   replacement
 * @return {void}
 */
function removeClass(element, className, replace) {
    var regexp = new RegExp('(^|\ )' + className + '(\ |$)', 'ig');
    replace = replace || '$2';
    if (element && element.className) {
        element.className = element.className.replace(regexp, replace);
    }
}

module.exports = removeClass;
