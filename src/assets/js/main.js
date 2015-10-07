'use strict';

var onDomReady = require('functions/on-dom-ready'),
    TrackerCollection = require('classes/tracker-collection');

var trackers;

onDomReady(function() {

    // initiate trackers
    trackers = new TrackerCollection(
        document.getElementById('trackers'),
        document.getElementById('tracker-template').innerHTML
    );

    // restore trackers from local storage
    trackers.restore();

});
