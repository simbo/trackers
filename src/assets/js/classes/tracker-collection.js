'use strict';

var defineProperties = require('functions/define-properties'),
    onValueUpdate = require('functions/on-value-update'),
    removeClass = require('functions/remove-class'),
    renderTemplate = require('functions/render-template'),
    Tracker = require('classes/tracker');

var storage = window.localStorage;

/**
 * TrackerCollection class
 * @param {node}   wrap     trackers main wrapper
 * @param {string} template tracker template string
 * @return {void}
 */
function TrackerCollection(wrap, template) {

    var $ = {wrap: wrap},
        deleteMode = false,
        mergeMode = false,
        nextTrackerID = 0,
        trackers = {};

    if (!($.wrap instanceof HTMLDivElement)) throw new Error('invalid container');
    if (typeof template !== 'string') throw new Error('invalid template');

    $.list = $.wrap.querySelector('.trackers-list');
    $.add = $.wrap.querySelector('.trackers-button--add');
    $.remAll = $.wrap.querySelector('.trackers-button--rem-all');
    $.delete = $.wrap.querySelector('.trackers-button--delete');
    $.cancelDel = $.wrap.querySelector('.trackers-button--cancel-del');
    $.merge = $.wrap.querySelector('.trackers-button--merge');
    $.mergeSel = $.wrap.querySelector('.trackers-button--merge-sel');
    $.cancelMerge = $.wrap.querySelector('.trackers-button--cancel-merge');

    if (!storage) {
        throw new Error('localStorage not available');
    }

    defineProperties(this, {

        trackers: {
            get: function() {
                return trackers;
            }
        },

        trackersSize: {
            get: function() {
                return Object.keys(trackers).length;
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
                return mergeMode;
            },
            set: function(mode) {
                if (typeof mode === 'boolean') {
                    if (mode && this.trackersSize === 0 || mergeMode === mode) return;
                    if (deleteMode && mode) deleteMode = false;
                    mergeMode = mode;
                    setModeStatus.call(this, $);
                }
            }
        },

        deleteMode: {
            get: function() {
                return deleteMode;
            },
            set: function(mode) {
                if (typeof mode === 'boolean') {
                    if (mode && this.trackersSize === 0 || deleteMode === mode) return;
                    if (mergeMode && mode) mergeMode = false;
                    deleteMode = mode;
                    setModeStatus.call(this, $);
                }
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
        addTrackerEvents.apply(this, [tracker, trackerID, {
            container: container,
            tracked: container.querySelector('.tracker-tracked'),
            description: container.querySelector('.tracker-description'),
            toggle: container.querySelector('.tracker-toggle'),
            merge: container.querySelector('.tracker-merge'),
            remove: container.querySelector('.tracker-remove')
        }]);
        this.deleteMode = false;
        this.mergeMode = false;
        if (store) {
            onTrackersListEdit.call(this, $);
            this.store();
        }
        return this;
    };

    this.remove = function(trackerID, store) {
        store = typeof store === 'boolean' ? store : true;
        if (trackers.hasOwnProperty(trackerID)) {
            delete trackers[trackerID];
            $.list.removeChild(document.getElementById('tracker-' + trackerID));
            if (store) {
                onTrackersListEdit.call(this, $);
                this.store();
            }
        }
        return this;
    };

    this.new = function() {
        var trackerID = nextTrackerID;
        this.add();
        trackers[trackerID].start();
        document.getElementById('tracker-' + trackerID).querySelector('.tracker-description').focus();
    }.bind(this);

    setUiEvents.call(this, $);

}

function onTrackersListEdit($) {
    if (this.trackersSize === 0) {
        $.delete.parentNode.className += ' inactive';
        this.deleteMode = false;
    }
    else removeClass($.delete.parentNode, 'inactive');
    if (this.trackersSize <= 1) {
        $.merge.parentNode.className += ' inactive';
        this.mergeMode = false;
    }
    else removeClass($.merge.parentNode, 'inactive');
}

function setModeStatus($) {
    var inputs = $.list.querySelectorAll('input, textarea'),
        noMode = !this.mergeMode && !this.deleteMode;
    removeClass($.wrap, 'trackers-(merge|delete)-mode', '$3');
    if (this.mergeMode) $.wrap.className += ' trackers-merge-mode';
    if (this.deleteMode) $.wrap.className += ' trackers-delete-mode';
    Object.keys(inputs).forEach(function(i) {
        inputs[i].readOnly = !noMode;
    });
}

function setUiEvents($) {

    $.add.addEventListener('click', function() {
        this.new();
    }.bind(this));

    $.remAll.addEventListener('click', this.removeAll.bind(this));

    $.delete.addEventListener('click', function() {
        this.deleteMode = !this.deleteMode;
    }.bind(this));

    $.cancelDel.addEventListener('click', function() {
        this.deleteMode = false;
    }.bind(this));

    $.mergeSel.addEventListener('click', this.mergeSelected.bind(this));

    $.merge.addEventListener('click', function() {
        this.mergeMode = !this.mergeMode;
    }.bind(this));

    $.cancelMerge.addEventListener('click', function() {
        this.mergeMode = false;
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
    var trackersArr;
    try {
        Object.keys(this.trackers).forEach(function(trackerID) {
            this.remove(trackerID);
        }.bind(this));
        trackersArr = JSON.parse(storage.getItem('trackers')) || [];
        trackersArr.forEach(function(data, i) {
            data.unshift(null);
            this.add(new (Function.prototype.bind.apply(Tracker, data)), trackersArr.length-1 === i);
        }.bind(this));
    } catch (err) {
        throw new Error('could not restore trackers');
    }
    return this;
};

TrackerCollection.prototype.removeAll = function() {
    Object.keys(this.trackers).forEach(function(trackerID) {
        this.remove(trackerID, this.trackersSize === 1);
    }.bind(this));
    this.deleteMode = false;
    return this;
};

TrackerCollection.prototype.mergeSelected = function() {
    return this;
};

/**
 * add events to a tracker
 * @param {Tracker} tracker   tracker instance
 * @param {number}  trackerID plain object containing dom nodes
 * @param {object}  $         plain object containing dom nodes
 * @return {void}
 */
function addTrackerEvents(tracker, trackerID, $) {

    var trackerInterval;

    onValueUpdate($.description, function() {
        if (this.mergeMode || this.deleteMode) return;
        tracker.description = $.description.value;
        resizeTextarea();
        this.store();
    }.bind(this));

    $.tracked.addEventListener('focus', function() {
        $.tracked.dataset.prevValue = $.tracked.value;
    });

    onValueUpdate($.tracked, function() {
        if (this.mergeMode || this.deleteMode) return;
        if (tracker.format('%h:%m:%s', Tracker.anyToDuration($.tracked.value)) !== $.tracked.dataset.prevValue) {
            tracker.tracked = Tracker.stringToDuration($.tracked.value);
            if (tracker.tracking) tracker.trackingSince = Tracker.now();
            this.store();
        }
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
        startTrackerUpdate.call(this);
        setTrackerClass();
        resizeTextarea();
    }.bind(this));

    tracker.on('stop', function() {
        stopTrackerUpdate();
        setTrackerClass();
        resizeTextarea();
    });

    if (tracker.tracking) startTrackerUpdate.call(this);

    resizeTextarea();

    /**
     * set tracker container class attribute depending on tracking status
     * @return {void}
     */
    function setTrackerClass() {
        removeClass($.container, 'tracker--(not-)?tracking', '$3');
        $.container.className += ' tracker--' + (tracker.tracking ? '' : 'not-') + 'tracking';
    }

    /**
     * start auto-updating total tracking duration input value
     * @return {void}
     */
    function startTrackerUpdate() {
        if (trackerInterval) clearInterval(trackerInterval);
        trackerInterval = window.setInterval(function() {
            if ($.tracked !== document.activeElement || this.mergeMode || this.deleteMode) {
                $.tracked.value = tracker.format();
            }
        }.bind(this));
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
