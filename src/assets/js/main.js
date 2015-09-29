'use strict';

var Tracker = require('./modules/tracker.js');

var tracker = new Tracker();

tracker.start();

window.setTimeout(function() {
    tracker.stop();
    console.log(tracker.tracked);
}, 1000);

