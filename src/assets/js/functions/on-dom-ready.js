'use strict';

/**
 * set or trigger dom ready event handler
 * @param  {Function} fn handler
 * @return {void}
 */
function onDomReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
}

module.exports = onDomReady;
