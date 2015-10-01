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
     * @return {void}
     */
    function delayedFn() {
        window.setTimeout(fn.bind(input), 0);
    }

    input.addEventListener('change', fn.bind(input));
    input.addEventListener('cut', delayedFn);
    input.addEventListener('paste', delayedFn);
    input.addEventListener('drop', delayedFn);
    input.addEventListener('keydown', delayedFn);

}

module.exports = onValueUpdate;
