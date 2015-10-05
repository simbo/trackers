'use strict';

var onDomReady = require('functions/on-dom-ready'),
    TrackerCollection = require('classes/tracker-collection');

var trackers;

onDomReady(function() {

    // initiate trackers
    trackers = new TrackerCollection(
        {
            wrap: document.getElementById('trackers-wrap'),
            list: document.getElementById('trackers-list'),
            add: document.getElementById('trackers-button--add'),
            merge: document.getElementById('trackers-button--merge'),
            delete: document.getElementById('trackers-button--delete')
        },
        document.getElementById('tracker-template').innerHTML
    );

    // restore trackers from local storage
    trackers.restore();

});
