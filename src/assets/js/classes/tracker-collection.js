'use strict';

var onValueUpdate = require('functions/on-value-update'),
    renderTemplate = require('functions/render-template'),
    textareaAutosize = require('functions/textarea-autosize'),
    Tracker = require('classes/tracker');

/**
 * TrackerCollection class
 * @param {node} $list      tracker container
 * @param {string} template tracker template string
 * @return {void}
 */
function TrackerCollection($list, template) {

    var storage = window.localStorage || {},
        trackers = [];

    if (!window.localStorage) {
        throw new Error('localStorage not available');
    }

    /**
     * add a tracker to tracker list
     * @param {tracker} tracker tracker instance
     * @return {void}
     */
    this.add = function(tracker) {
        var $tracker,
            $trackerDescription,
            that = this,
            trackerID = trackers.length;
        tracker = trackers[trackerID] = tracker instanceof Tracker ? tracker : new Tracker();
        $tracker = renderTemplate(template, tracker);
        $list.insertBefore($tracker, $list.firstChild);
        $trackerDescription = $tracker.querySelectorAll('.tracker-description')[0];
        textareaAutosize($trackerDescription);
        onValueUpdate($trackerDescription, function() {
            tracker.description = this.value;
            that.store();
        });
        this.store();
    };

    /**
     * store tracker in local storage
     * @return {void}
     */
    this.store = function() {
        storage.setItem('trackers',
            JSON.stringify(trackers.reduce(function(trackerArr, tracker) {
                return trackerArr.concat([[
                    tracker.tracked,
                    tracker.tracking ? tracker.trackingStart : false,
                    tracker.description
                ]]);
            }, []))
        );
    };

    /**
     * restore trackers from local storage
     * @return {void}
     */
    this.restore = function() {
        (JSON.parse(storage.getItem('trackers')) || []).forEach(function(data) {
            data.unshift(null);
            this.add(new (Function.prototype.bind.apply(Tracker, data)));
        }.bind(this));
    };

}

module.exports = TrackerCollection;
