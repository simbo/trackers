'use strict';

var onValueUpdate = require('functions/on-value-update'),
    renderTemplate = require('functions/render-template'),
    textareaAutosize = require('functions/textarea-autosize'),
    Tracker = require('classes/tracker');

/**
 * TrackerCollection class
 * @param {node}   list     tracker container
 * @param {string} template tracker template string
 * @return {void}
 */
function TrackerCollection(list, template) {

    var storage = window.localStorage || {},
        trackers = [];

    if (!(list instanceof HTMLUListElement)) throw new Error('invalid list');
    if (typeof template !== 'string') throw new Error('invalid template');

    if (!window.localStorage) {
        throw new Error('localStorage not available');
    }

    /**
     * add a tracker to tracker list
     * @param {tracker} tracker tracker instance
     * @param {boolean} store   whether to store the tracker collection after adding or not
     * @return {void}
     */
    this.add = function(tracker, store) {
        var container,
            trackerID = trackers.length;
        store = typeof store === 'boolean' ? store : true;
        tracker = trackers[trackerID] = tracker instanceof Tracker ? tracker : new Tracker();
        container = renderTemplate(template, tracker);
        list.insertBefore(container, list.firstChild);
        this.addTrackerEvents(tracker, {
            container: container,
            tracked: container.querySelectorAll('.tracker-tracked')[0],
            description: container.querySelectorAll('.tracker-description')[0],
            toggle: container.querySelectorAll('.tracker-toggle')[0]
        });
        if (store) this.store();
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
            this.add(new (Function.prototype.bind.apply(Tracker, data)), false);
        }.bind(this));
    };

}

/**
 * add events to a tracker node
 * @param {Tracker} tracker tracker instance
 * @param {object}  $       plain object containing dom nodes
 * @return {void}
 */
TrackerCollection.prototype.addTrackerEvents = function(tracker, $) {
    textareaAutosize($.description);
    onValueUpdate($.description, function(event) {
        var element = event.srcElement || event.target;
        tracker.description = element.value;
        this.store();
    }.bind(this));
    onValueUpdate($.tracked, function(event) {
        var element = event.srcElement || event.target;
        tracker.tracked = element.value.replace(/[^0-9:]/g, '')
            .split(':').reduce(function(tracked, slice) {
                slice = parseInt(slice, 10);
                return tracked.concat(!isNaN(slice) && typeof slice === 'number' ? [slice] : []);
            }, []);
        this.store();
    }.bind(this));
    $.tracked.addEventListener('blur', function(event) {
        var element = event.srcElement || event.target;
        element.value = tracker.trackedFormatted;
    });
};

module.exports = TrackerCollection;