'use strict';

var onDomReady = require('functions/on-dom-ready'),
    TrackerCollection = require('classes/tracker-collection');

var trackers;

onDomReady(function() {

    trackers = new TrackerCollection(
        document.getElementById('tracker-list'),
        document.getElementById('tracker-template').innerHTML
    );

    document.getElementById('add-tracker').addEventListener('click', trackers.add);

    trackers.restore();

});
