'use strict';

var defineProperties = require('functions/define-properties');

/**
 * Tracker class
 * @param {number} tracked     tracked milliseconds
 * @param {mixed}  tracking    false or timestamp from track start
 * @param {string} description tracker description
 * @return {tracker} instance
 */
function Tracker(tracked, tracking, description) {

    /**
     * plain object for storing private properties
     * @type {object}
     */
    var properties = {
        tracked: 0,
        tracking: false,
        description: ''
    };

    /**
     * plain object for storing event handlers
     * @type {Object}
     */
    var events = {};

    /**
     * define properties of this using getters/setters
     */
    defineProperties(this, {

        /**
         * stored tracking duration without current tracking duration
         */
        tracked: {

            /**
             * return duration
             * @return {number} milliseconds
             */
            get: function() {
                return properties.tracked;
            },

            /**
             * set duration
             * @param {mixed} duration accepts a number, string, array or object
             * @return {void}
             */
            set: function(duration) {
                if (typeof duration !== 'undefined') {
                    properties.tracked = Tracker.durationToNumber(Tracker.anyToDuration(duration));
                }
            }

        },

        /**
         * stored tracking duration plus eventually current tracking duration
         */
        trackedTotal: {

            /**
             * return duration
             * @return {number} milliseconds
             */
            get: function() {
                return !this.tracking ? this.tracked :
                    properties.tracked + Tracker.now() - properties.tracking;
            }

        },

        /**
         * current tracking status
         */
        tracking: {

            /**
             * return whether tracker is currently tracking
             * @return {boolean} tracking status
             */
            get: function() {
                return properties.tracking !== false;
            },

            /**
             * accepts a boolean to start/stop tracking or a number, string,
             * array or object representing current tracking duration
             * @param {mixed} tracking boolean or duration
             * @return {void}
             */
            set: function(tracking) {
                if (typeof tracking === 'boolean') {
                    properties.tracked = this.trackedTotal;
                    if (tracking) properties.tracking = Tracker.now();
                    else properties.tracking = false;
                } else if (typeof tracking !== 'undefined') {
                    properties.tracking = Tracker.now() - Tracker.durationToNumber(Tracker.anyToDuration());
                }
            }

        },

        /**
         * current tracking duration start point
         */
        trackingSince: {

            /**
             * return utc timestamp
             * @return {number} milliseconds
             */
            get: function() {
                return this.tracking ? properties.tracking : undefined;
            },

            /**
             * set utc timestamp
             * @param {number} trackingSince an utc timestamp in milliseconds
             * @return {void}
             */
            set: function(trackingSince) {
                if (typeof trackingSince !== 'undefined') {
                    trackingSince = parseInt(trackingSince, 10);
                    if (!isNaN(trackingSince)) properties.tracking = trackingSince;
                }
            }

        },

        /**
         * tracker description
         */
        description: {

            /**
             * return tracker description
             * @return {string} description
             */
            get: function() {
                return properties.description;
            },

            /**
             * set any string as tracker description
             * @param {string} description a tracker description text
             * @return {void}
             */
            set: function(description) {
                if (typeof description === 'string' && (description = description.trim()).length > 0) {
                    properties.description = description;
                }
            }

        },

        /**
         * return data to restore this tracker
         * @type {Object}
         */
        minified: {

            /**
             * return values of private properties storage
             * @return {array} constructor arguments
             */
            get: function() {
                return [
                    properties.tracked,
                    properties.tracking,
                    properties.description
                ];
            }

        }

    });

    /**
     * merge this tracker with another tracker instance
     * @param  {tracker} tracker another tracker instance
     * @return {tracker}         this
     */
    this.merge = function(tracker) {
        if (tracker instanceof Tracker) {
            properties.tracked += Tracker.durationToNumber(tracker.trackedTotal);
            properties.description += '\n' + tracker.descroption;
        }
        return this;
    };

    /**
     * set an event handler
     * @param  {string}   event event name
     * @param  {Function} fn    event handler function
     * @return {void}
     */
    this.on = function(event, fn) {
        if (typeof fn === 'function') events[event] = fn;
    };

    /**
     * trigger an event handler
     * @param  {string} event event name
     * @return {void}
     */
    this.trigger = function(event) {
        if (events.hasOwnProperty(event)) events[event]();
    };

    /**
     * set initial property values
     */
    this.tracked = tracked;
    this.trackingSince = tracking;
    this.description = description;

}

/**
 * start tracking and trigger event
 * @return {tracker} this
 */
Tracker.prototype.start = function() {
    this.tracking = true;
    this.trigger('start');
    return this;
};

/**
 * stop tracking and trigger event
 * @return {tracker} this
 */
Tracker.prototype.stop = function() {
    this.tracking = false;
    this.trigger('stop');
    return this;
};

/**
 * toggle tracking
 * @return {tracker} this
 */
Tracker.prototype.toggle = function() {
    if (this.tracking) this.stop();
    else this.start();
};

/**
 * format this trackers total duration to a string like HH:MM:SS
 * @param  {string} format   duration format string
 * @return {string}          formatted duration
 */
Tracker.prototype.format = function(format) {
    return Tracker.format(Tracker.numberToDuration(this.trackedTotal), format);
};

/**
 * get current utc timestamp in milliseconds
 * @return {[type]} [description]
 */
Tracker.now = function() {
    return new Date().getTime();
};

/**
 * get an object containing hours, minutes, seconds and milliseconds from a number representing milliseconds
 * @param  {number} num milliseconds
 * @return {object}     plain object containing properties h, m, s and ms
 */
Tracker.numberToDuration = function(num) {
    return {
        h: Math.floor(num / (1000 * 60 * 60)),
        m: Math.floor(num / (1000 * 60) % 60),
        s: Math.floor(num / 1000 % 60),
        ms: Math.floor(num % 1000)
    };
};

/**
 * get an object containing hours, minutes, seconds and milliseconds from a string
 * @param  {srtink} str a string like '12:34:56:789'
 * @return {object}     plain object containing properties h, m, s and ms
 */
Tracker.stringToDuration = function(str) {
    return Tracker.arrayToDuration(
        (typeof str === 'string' ? str : str.toString() || '')
        .replace(/[^0-9:]/g, '').split(':')
    );
};

/**
 * get an object containing hours, minutes, seconds and milliseconds from an array containing at least one of these values
 * @param  {array} arr array containing values for hours, minutes, seconds and/or milliseconds
 * @return {object}    plain object containing properties h, m, s and ms
 */
Tracker.arrayToDuration = function(arr) {
    return ['h', 'm', 's', 'ms'].reduce(function(duration, prop, i) {
        var value = parseInt(arr[i], 10);
        duration[prop] = !isNaN(value) ? value : 0;
        return duration;
    }, {});
};

/**
 * get a number representing milliseconds from an object containing hours, minutes, seconds and/or milliseconds
 * @param  {object} duration plain object containing properties h, m, s and/or ms
 * @return {number}          milliseconds
 */
Tracker.durationToNumber = function(duration) {
    var ms = 0;
    if (duration.hasOwnProperty('h')) ms += parseInt(duration.h, 10) * 60 * 60 * 1000;
    if (duration.hasOwnProperty('m')) ms += parseInt(duration.m, 10) * 60 * 1000;
    if (duration.hasOwnProperty('s')) ms += parseInt(duration.s, 10) * 1000;
    if (duration.hasOwnProperty('ms')) ms += parseInt(duration.ms, 10);
    return ms;
};

/**
 * get an object containing hours, minutes, seconds and milliseconds from almost anything
 * @param  {mixed} any a number, string, array or object representing a duration
 * @return {object}    plain object containing properties h, m, s and/or ms
 */
Tracker.anyToDuration = function(any) {
    if (typeof any === 'number' && !isNaN(any)) {
        return Tracker.numberToDuration(any);
    } else if (Array.isArray(any)) {
        return Tracker.arrayToDuration(any);
    } else if (typeof any === 'string') {
        return Tracker.stringToDuration(any);
    } else if (typeof any === 'object') {
        return Tracker.numberToDuration(Tracker.durationToNumber(any));
    }
    throw new Error('unexpected duration type: ' + typeof any);
};

/**
 * format a duration to a string like HH:MM:SS
 * @param  {mixed}  duration anything that can be converted to a duration object
 * @param  {string} format   duration format string
 * @return {string}          formatted duration
 */
Tracker.format = function(duration, format) {
    format = typeof format === 'string' ? format : '%h:%m:%s';
    duration = typeof duration !== 'undefined' ? Tracker.anyToDuration(duration) : 0;
    return Object.keys(duration).reverse().reduce(function(formatted, propertyName) {
        return formatted.replace(new RegExp('%' + propertyName, 'ig'), ('0' + duration[propertyName]).slice(-2));
    }, format);
};

module.exports = Tracker;
