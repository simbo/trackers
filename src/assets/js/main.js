'use strict';

var onDomReady = require('functions/on-dom-ready'),
    TrackerCollection = require('classes/tracker-collection');

var trackers;

onDomReady(function() {

    // initiate trackers
    trackers = new TrackerCollection(
        {
            wrap: document.getElementById('trackers-wrap'),
            list: document.getElementById('trackers-list')
        },
        document.getElementById('tracker-template').innerHTML
    );

    // restore trackers from local storage
    trackers.restore();

    // set button event handlers
    [
        ['trackers-button--add', trackers.new],
        ['trackers-button--delete', trackers.toggleDeleteMode],
        ['trackers-button--rem-all', trackers.removeAll],
        ['trackers-button--cancel-del', trackers.disableDeleteMode],
        ['trackers-button--merge', trackers.toggleMergeMode],
        ['trackers-button--merge-sel', trackers.mergeSelected],
        ['trackers-button--cancel-merge', trackers.disableMergeMode]
    ].forEach(function(handle) {
        document.getElementById(handle[0]).addEventListener('click', handle[1].bind(trackers));
    });

});
