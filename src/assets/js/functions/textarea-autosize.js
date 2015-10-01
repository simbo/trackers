'use strict';

var onValueUpdate = require('functions/on-value-update');

/**
 * adds auto-sizing event handlers to a textarea
 * @param  {node} textarea dom node
 * @return {void}
 */
function textareaAutosize(textarea) {

    /**
     * add styles for resizing
     * @return {void}
     */
    function resize() {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
    }

    onValueUpdate(textarea, resize);

    resize();

}

module.exports = textareaAutosize;
