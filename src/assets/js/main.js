'use strict';

var onDomReady = require('modules/on-dom-ready'),
    onValueUpdate = require('modules/on-value-update'),
    renderTemplate = require('modules/render-template'),
    textareaAutosize = require('modules/textarea-autosize'),
    Tracker = require('modules/tracker');

var $trackerList,
    storage = window.localStorage || {},
    trackers = [],
    trackerTemplate;

if (!window.localStorage) {
    throw new Error('localStorage not available');
}

onDomReady(function() {

    $trackerList = document.getElementById('tracker-list');
    trackerTemplate = document.getElementById('tracker-template').innerHTML;

    document.getElementById('add-tracker').addEventListener('click', addTracker);

    restoreTrackers();

});

/**
 * add a tracker to tracker list
 * @param {tracker} tracker tracker instance
 * @return {void}
 */
function addTracker(tracker) {
    var $tracker,
        $trackerDescription,
        trackerID = trackers.length;
    tracker = trackers[trackerID] = tracker instanceof Tracker ? tracker : new Tracker();
    $tracker = renderTemplate(trackerTemplate, tracker);
    $trackerList.insertBefore($tracker, $trackerList.firstChild);
    $trackerDescription = $tracker.querySelectorAll('.tracker-description')[0];
    textareaAutosize($trackerDescription);
    onValueUpdate($trackerDescription, function() {
        tracker.description = this.value;
        storeTrackers();
    });
    storeTrackers();
}

/**
 * store tracker in local storage
 * @return {void}
 */
function storeTrackers() {
    storage.setItem('trackers',
        JSON.stringify(trackers.reduce(function(trackerArr, tracker) {
            return trackerArr.concat([[
                tracker.tracked,
                tracker.tracking ? tracker.trackingStart : false,
                tracker.description
            ]]);
        }, []))
    );
}

/**
 * restore trackers from local storage
 * @return {void}
 */
function restoreTrackers() {
    (JSON.parse(storage.getItem('trackers')) || []).forEach(function(data) {
        data.unshift(null);
        addTracker(new (Function.prototype.bind.apply(Tracker, data)));
    });
}
