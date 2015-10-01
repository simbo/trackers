'use strict';

/**
 * Tracker class
 * @param {number} tracked     tracked milliseconds
 * @param {mixed} tracking     false or timestamp from track start
 * @param {string} description tracker description
 * @return {Tracker} instance
 */
function Tracker(tracked, tracking, description) {

    var properties = {
        tracked: 0,
        tracking: false,
        description: ''
    };

    Object.defineProperties(this, {

        tracked: {
            get: function() {
                return Tracker.msToDuration(properties.tracked);
            },
            set: function(duration) {
                if (typeof duration === 'number') {
                    duration = Tracker.msToDuration(duration);
                } else if (Array.isArray(duration)) {
                    duration = duration.reduce(function(durationObj, item, i) {
                        var durationIndex = ['h', 'm', 's', 'ms'];
                        durationObj[durationIndex[i]] = item;
                        return durationObj;
                    }, {});
                }
                if (typeof duration === 'object') {
                    properties.tracked = Tracker.durationToMs(duration);
                }
            }
        },

        trackedFormatted: {
            get: function() {
                var tracked = Tracker.msToDuration(properties.tracked);
                return Object.keys(tracked).reduce(function(trackedFormatted, prop) {
                    return trackedFormatted.concat([('0' + tracked[prop]).slice(-2)]);
                }, []).slice(0, 3).join(':');
            },
            set: function() {
                return;
            }
        },

        tracking: {
            get: function() {
                return properties.tracking !== false;
            },
            set: function(tracking) {
                if (typeof tracking === 'number' || tracking === false) {
                    properties.tracking = tracking;
                }
            }
        },

        trackingStart: {
            get: function() {
                return properties.tracking;
            },
            set: function() {
                return;
            }
        },

        description: {
            get: function() {
                return properties.description;
            },
            set: function(description) {
                if (typeof description === 'string' && (description = description.trim()).length > 0) {
                    properties.description = description;
                }
            }
        }

    });

    this.tracked = tracked;
    this.tracking = tracking;
    this.description = description;

    this.start = function() {
        properties.tracking = Tracker.now();
        return this;
    };

    this.stop = function() {
        if (this.tracking !== false) {
            properties.tracked += Tracker.now() - properties.tracking;
            properties.tracking = false;
        }
        return this;
    };

    this.merge = function(tracker) {
        if (tracker instanceof Tracker && !tracker.tracking) {
            properties.tracked += Tracker.durationToMs(tracker.tracked);
            properties.description += '\n' + tracker.description;
        }
        return this;
    };

}

/**
 * get current utc timestamp in milliseconds
 * @return {[type]} [description]
 */
Tracker.now = function() {
    return new Date().getTime();
};

/**
 * get an object containing hours, minutes, seconds and milliseconds from a number representing milliseconds
 * @param  {number} ms milliseconds
 * @return {object}    plain object containing properties h, m, s and ms
 */
Tracker.msToDuration = function(ms) {
    return {
        h: Math.floor(ms / (1000 * 60 * 60)),
        m: Math.floor(ms / (1000 * 60) % 60),
        s: Math.floor(ms / 1000 % 60),
        ms: Math.floor(ms % 1000)
    };
};

/**
 * get a number representing milliseconds from an object containing hours, minutes, seconds and/or milliseconds
 * @param  {object} duration plain object containing properties h, m, s and/or ms
 * @return {number}          milliseconds
 */
Tracker.durationToMs = function(duration) {
    var ms = 0;
    if (duration.h) ms += parseInt(duration.h, 10) * 60 * 60 * 1000;
    if (duration.m) ms += parseInt(duration.m, 10) * 60 * 1000;
    if (duration.s) ms += parseInt(duration.s, 10) * 1000;
    if (duration.ms) ms += parseInt(duration.ms, 10);
    return ms;
};

module.exports = Tracker;
