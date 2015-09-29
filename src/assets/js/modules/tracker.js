'use strict';

module.exports = Tracker;

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

        description: {
            get: function() {
                return properties.tracked;
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

Tracker.now = function() {
    return new Date().getTime();
};

Tracker.msToDuration = function(ms) {
    return {
        h: Math.floor(ms / (1000 * 60 * 60)),
        m: Math.floor(ms / (1000 * 60) % 60),
        s: Math.floor(ms / 1000 % 60),
        ms: Math.floor(ms % 1000)
    };
};

Tracker.durationToMs = function(duration) {
    var ms = 0;
    if (duration.h) ms += parseInt(duration.h, 10) * 60 * 60 * 1000;
    if (duration.m) ms += parseInt(duration.m, 10) * 60 * 1000;
    if (duration.s) ms += parseInt(duration.s, 10) * 1000;
    if (duration.ms) ms += parseInt(duration.ms, 10);
    return ms;
};
