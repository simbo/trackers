'use strict';

var defineProperties = require('functions/define-properties'),
    onValueUpdate = require('functions/on-value-update'),
    renderTemplate = require('functions/render-template'),
    Tracker = require('classes/tracker');

var storage = window.localStorage;

/**
 * TrackerCollection class
 * @param {object} $        dom elements
 * @param {string} template tracker template string
 * @return {void}
 */
function TrackerCollection($, template) {

    var nextTrackerID = 0,
        trackers = {};

    if (!($.wrap instanceof HTMLDivElement)) throw new Error('invalid container');
    if (!($.list instanceof HTMLUListElement)) throw new Error('invalid list');
    if (!($.add instanceof HTMLButtonElement)) throw new Error('invalid button');
    if (!($.merge instanceof HTMLButtonElement)) throw new Error('invalid button');
    if (!($.delete instanceof HTMLButtonElement)) throw new Error('invalid button');
    if (typeof template !== 'string') throw new Error('invalid template');

    if (!storage) {
        throw new Error('localStorage not available');
    }

    defineProperties(this, {

        trackers: {
            get: function() {
                return trackers;
            }
        },

        minified: {
            get: function() {
                return Object.keys(trackers).reduce(function(trackerArr, trackerID) {
                    return trackerArr.concat([trackers[trackerID].minified]);
                }, []);
            }
        },

        mergeMode: {
            get: function() {
                return (/(^|\ )trackers-merge-mode(\ |$)/i).test($.wrap.className);
            }
        },

        deleteMode: {
            get: function() {
                return (/(^|\ )trackers-delete-mode(\ |$)/i).test($.wrap.className);
            }
        }

    });

    /**
     * add a tracker to tracker list
     * @param {tracker} tracker tracker instance
     * @param {boolean} store   whether to store the tracker collection after adding or not
     * @return {trackerCollection} this
     */
    this.add = function(tracker, store) {
        var container,
            trackerID = nextTrackerID++;
        store = typeof store === 'boolean' ? store : true;
        tracker = trackers[trackerID] = tracker instanceof Tracker ? tracker : new Tracker();
        container = renderTemplate(template, {
            tracked: tracker.format(),
            description: tracker.description,
            tracking: tracker.tracking,
            id: trackerID
        });
        $.list.insertBefore(container, $.list.firstChild);
        this.addTrackerEvents(tracker, trackerID, {
            container: container,
            tracked: container.querySelector('.tracker-tracked'),
            description: container.querySelector('.tracker-description'),
            toggle: container.querySelector('.tracker-toggle'),
            merge: container.querySelector('.tracker-merge'),
            remove: container.querySelector('.tracker-remove')
        });
        if (store) this.store();
        return this;
    };

    this.remove = function(trackerID, store) {
        store = typeof store === 'boolean' ? store : true;
        if (trackers.hasOwnProperty(trackerID)) {
            delete trackers[trackerID];
            $.list.removeChild(document.getElementById('tracker-' + trackerID));
            if (store) this.store();
        }
        return this;
    };

    this.enableMergeMode = function() {
        this.disableDeleteMode();
        $.wrap.className += ' trackers-merge-mode';
    };

    this.disableMergeMode = function() {
        $.wrap.className = $.wrap.className.replace(/(^|\ )trackers-merge-mode(\ |$)/ig, '$2');
    };

    this.enableDeleteMode = function() {
        this.disableMergeMode();
        $.wrap.className += ' trackers-delete-mode';
    };

    this.disableDeleteMode = function() {
        $.wrap.className = $.wrap.className.replace(/(^|\ )trackers-delete-mode(\ |$)/ig, '$2');
    };

    // add event handler to add-tracker button
    $.add.addEventListener('click', function() {
        var trackerID = nextTrackerID;
        this.add();
        trackers[trackerID].start();
        document.getElementById('tracker-' + trackerID).querySelector('.tracker-description').focus();
    }.bind(this));

    // add event handler to toggle-merge button
    $.merge.addEventListener('click', function() {
        this.toggleMergeMode();
    }.bind(this));

    // add event handler to toggle-delete button
    $.delete.addEventListener('click', function() {
        this.toggleDeleteMode();
    }.bind(this));

}

/**
 * store tracker in local storage
 * @return {void}
 */
TrackerCollection.prototype.store = function() {
    try {
        storage.setItem('trackers', JSON.stringify(this.minified));
    } catch (err) {
        throw new Error('could not store trackers');
    }
    return this;
};

/**
 * restore trackers from local storage
 * @return {void}
 */
TrackerCollection.prototype.restore = function() {
    try {
        Object.keys(this.trackers).forEach(function(trackerID) {
            this.remove(trackerID);
        }.bind(this));
        (JSON.parse(storage.getItem('trackers')) || []).forEach(function(data) {
            data.unshift(null);
            this.add(new (Function.prototype.bind.apply(Tracker, data)), false);
        }.bind(this));
    } catch (err) {
        throw new Error('could not restore trackers');
    }
    return this;
};

TrackerCollection.prototype.removeAll = function() {
    Object.keys(this.trackers).forEach(function(trackerID) {
        this.remove(trackerID, false);
    }.bind(this));
    this.store();
    return this;
};

TrackerCollection.prototype.mergeSelected = function() {
    return this;
};

TrackerCollection.prototype.toggleMergeMode = function() {
    if (this.mergeMode) this.disableMergeMode();
    else this.enableMergeMode();
    return this;
};

TrackerCollection.prototype.toggleDeleteMode = function() {
    if (this.deleteMode) this.disableDeleteMode();
    else this.enableDeleteMode();
    return this;
};

/**
 * add events
 * @param {Tracker} tracker   tracker instance
 * @param {number}  trackerID plain object containing dom nodes
 * @param {object}  $         plain object containing dom nodes
 * @return {void}
 */
TrackerCollection.prototype.addTrackerEvents = function(tracker, trackerID, $) {

    var trackerInterval;

    onValueUpdate($.description, function() {
        tracker.description = $.description.value;
        resizeTextarea();
        this.store();
    }.bind(this));

    onValueUpdate($.tracked, function() {
        tracker.tracked = Tracker.stringToDuration($.tracked.value);
        if (tracker.tracking) tracker.trackingSince = Tracker.now();
        this.store();
    }.bind(this));

    $.tracked.addEventListener('blur', function() {
        $.tracked.value = tracker.format();
    });

    $.toggle.addEventListener('click', function() {
        tracker.toggle();
        this.store();
    }.bind(this));

    $.remove.addEventListener('click', function() {
        this.remove(trackerID);
    }.bind(this));

    $.merge.addEventListener('click', function() {
        $.container.className += ' tracker-merge-select';
    });

    tracker.on('start', function() {
        Object.keys(this.trackers).forEach(function(trackerID) {
            if (this.trackers[trackerID] !== tracker) this.trackers[trackerID].stop();
        }.bind(this));
        startTrackerUpdate();
        setTrackerClass();
        resizeTextarea();
    }.bind(this));

    tracker.on('stop', function() {
        stopTrackerUpdate();
        setTrackerClass();
        resizeTextarea();
    });

    if (tracker.tracking) startTrackerUpdate();

    resizeTextarea();

    /**
     * set tracker container class attribute depending on tracking status
     * @return {void}
     */
    function setTrackerClass() {
        $.container.className = $.container.className.replace(/(^|\ )tracker--(not-)?tracking(\ |$)/ig, '$3');
        $.container.className += ' tracker--' + (tracker.tracking ? '' : 'not-') + 'tracking';
    }

    /**
     * start auto-updating total tracking duration input value
     * @return {void}
     */
    function startTrackerUpdate() {
        if (trackerInterval) clearInterval(trackerInterval);
        trackerInterval = window.setInterval(function() {
            if ($.tracked !== document.activeElement) $.tracked.value = tracker.format();
        });
    }

    /**
     * stop auto-updating total tracking duration input value
     * @return {void}
     */
    function stopTrackerUpdate() {
        clearInterval(trackerInterval);
    }

    /**
     * resize tracker description textarea depending on content height
     * @return {void}
     */
    function resizeTextarea() {
        $.description.style.height = 'auto';
        $.description.style.height = $.description.scrollHeight + 'px';
    }

    return this;

};

// export class
module.exports = TrackerCollection;
