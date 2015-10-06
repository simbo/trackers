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
        ['trackers-button--rem-all', trackers.removeAll],
        ['trackers-button--delete', function() {
            trackers.deleteMode = !trackers.deleteMode;
        }],
        ['trackers-button--cancel-del', function() {
            trackers.deleteMode = false;
        // ['trackers-button--merge-sel', trackers.mergeSelected],
        // ['trackers-button--merge', function() {
        //     trackers.mergeMode = !trackers.mergeMode;
        // }],
        // }],
        // ['trackers-button--cancel-merge', function() {
        //     trackers.mergeMode = false;
        }]
    ].forEach(function(handle) {
        document.getElementById(handle[0]).addEventListener('click', handle[1].bind(trackers));
    });

});
