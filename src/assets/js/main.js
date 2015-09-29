'use strict';

const Tracker = require('./modules/tracker.js');

const tracker = new Tracker();

tracker.start();

window.setTimeout(() => {
    tracker.stop();
    console.log(tracker.tracked);
}, 1000);

