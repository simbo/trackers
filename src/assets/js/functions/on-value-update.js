'use strict';

/**
 * set event handlers for input/textarea content update
 * @param  {node}     input input/textarea dom node
 * @param  {Function} fn    event handler
 * @return {void}
 */
function onValueUpdate(input, fn) {

    /**
     * delayed event to get the already changed text
     * @param {event} event event object
     * @return {void}
     */
    function delayedFn(event) {
        window.setTimeout(function() {
            fn(event);
        }, 0);
    }

    input.addEventListener('change', fn);
    input.addEventListener('cut', delayedFn);
    input.addEventListener('paste', delayedFn);
    input.addEventListener('drop', delayedFn);
    input.addEventListener('keydown', delayedFn);

}

module.exports = onValueUpdate;
