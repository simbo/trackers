'use strict';

var onDomReady = require('./modules/on-dom-ready.js'),
    renderTemplate = require('./modules/render-template.js'),
    textareaAutosize = require('./modules/textarea-autosize.js'),
    Tracker = require('./modules/tracker.js');

var $trackerList,
    trackerTemplate;

onDomReady(function() {

    $trackerList = document.getElementById('tracker-list');
    trackerTemplate = document.getElementById('tracker-template').innerHTML;

    document.getElementById('add-tracker').addEventListener('click', addTracker);

});

/**
 * add a tracker to tracker list
 * @param {tracker} tracker tracker instance
 * @return {void}
 */
function addTracker(tracker) {
    var $tracker,
        $trackerDescription;
    tracker = tracker instanceof Tracker ? tracker : new Tracker();
    $tracker = renderTemplate(trackerTemplate, tracker);
    $trackerList.appendChild($tracker);
    $trackerDescription = $tracker.querySelectorAll('.tracker-description')[0];
    textareaAutosize($trackerDescription);
}
