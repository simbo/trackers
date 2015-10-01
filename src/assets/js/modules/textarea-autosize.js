'use strict';

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

    /**
     * delayed resize to get the already changed text
     * @return {void}
     */
    function delayedResize() {
        window.setTimeout(resize, 0);
    }

    textarea.addEventListener('change', resize);
    textarea.addEventListener('cut', delayedResize);
    textarea.addEventListener('paste', delayedResize);
    textarea.addEventListener('drop', delayedResize);
    textarea.addEventListener('keydown', delayedResize);

    resize();

}

module.exports = textareaAutosize;
