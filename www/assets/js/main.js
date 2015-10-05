(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

var defineProperties = require('functions/define-properties'),
    onValueUpdate = require('functions/on-value-update'),
    renderTemplate = require('functions/render-template'),
    Tracker = require('classes/tracker');

var storage = window.localStorage;

/**
 * TrackerCollection class
 * @param {object} $        dom elements
 * @param {string} template tracker template string
 * @return {void}
 */
function TrackerCollection($, template) {

    var nextTrackerID = 0,
        trackers = {};

    if (!($.wrap instanceof HTMLDivElement)) throw new Error('invalid container');
    if (!($.list instanceof HTMLUListElement)) throw new Error('invalid list');
    if (!($.add instanceof HTMLButtonElement)) throw new Error('invalid button');
    if (!($.merge instanceof HTMLButtonElement)) throw new Error('invalid button');
    if (!($.delete instanceof HTMLButtonElement)) throw new Error('invalid button');
    if (typeof template !== 'string') throw new Error('invalid template');

    if (!storage) {
        throw new Error('localStorage not available');
    }

    defineProperties(this, {

        trackers: {
            get: function() {
                return trackers;
            }
        },

        minified: {
            get: function() {
                return Object.keys(trackers).reduce(function(trackerArr, trackerID) {
                    return trackerArr.concat([trackers[trackerID].minified]);
                }, []);
            }
        },

        mergeMode: {
            get: function() {
                return (/(^|\ )trackers-merge-mode(\ |$)/i).test($.wrap.className);
            }
        },

        deleteMode: {
            get: function() {
                return (/(^|\ )trackers-delete-mode(\ |$)/i).test($.wrap.className);
            }
        }

    });

    /**
     * add a tracker to tracker list
     * @param {tracker} tracker tracker instance
     * @param {boolean} store   whether to store the tracker collection after adding or not
     * @return {trackerCollection} this
     */
    this.add = function(tracker, store) {
        var container,
            trackerID = nextTrackerID++;
        store = typeof store === 'boolean' ? store : true;
        tracker = trackers[trackerID] = tracker instanceof Tracker ? tracker : new Tracker();
        container = renderTemplate(template, {
            tracked: tracker.format(),
            description: tracker.description,
            tracking: tracker.tracking,
            id: trackerID
        });
        $.list.insertBefore(container, $.list.firstChild);
        this.addTrackerEvents(tracker, {
            container: container,
            tracked: container.querySelector('.tracker-tracked'),
            description: container.querySelector('.tracker-description'),
            toggle: container.querySelector('.tracker-toggle')
        });
        if (store) this.store();
        return this;
    };

    this.remove = function(trackerID, store) {
        store = typeof store === 'boolean' ? store : true;
        if (trackers.hasOwnProperty(trackerID)) {
            delete trackers[trackerID];
            $.list.removeChild(document.getElementById('tracker-' + trackerID));
            if (store) this.store();
        }
        return this;
    };

    this.enableMergeMode = function() {
        this.disableDeleteMode();
        $.wrap.className += ' trackers-merge-mode';
    };

    this.disableMergeMode = function() {
        $.wrap.className = $.wrap.className.replace(/(^|\ )trackers-merge-mode(\ |$)/ig, '$2');
    };

    this.enableDeleteMode = function() {
        this.disableMergeMode();
        $.wrap.className += ' trackers-delete-mode';
    };

    this.disableDeleteMode = function() {
        $.wrap.className = $.wrap.className.replace(/(^|\ )trackers-delete-mode(\ |$)/ig, '$2');
    };

    // add event handler to add-tracker button
    $.add.addEventListener('click', function() {
        var trackerID = nextTrackerID;
        this.add();
        trackers[trackerID].start();
        document.getElementById('tracker-' + trackerID).querySelector('.tracker-description').focus();
    }.bind(this));

    // add event handler to toggle-merge button
    $.merge.addEventListener('click', function() {
        this.toggleMergeMode();
    }.bind(this));

    // add event handler to toggle-delete button
    $.delete.addEventListener('click', function() {
        this.toggleDeleteMode();
    }.bind(this));

}

/**
 * store tracker in local storage
 * @return {void}
 */
TrackerCollection.prototype.store = function() {
    try {
        storage.setItem('trackers', JSON.stringify(this.minified));
    } catch (err) {
        throw new Error('could not store trackers');
    }
};

/**
 * restore trackers from local storage
 * @return {void}
 */
TrackerCollection.prototype.restore = function() {
    try {
        Object.keys(this.trackers).forEach(function(trackerID) {
            this.remove(trackerID);
        }.bind(this));
        (JSON.parse(storage.getItem('trackers')) || []).forEach(function(data) {
            data.unshift(null);
            this.add(new (Function.prototype.bind.apply(Tracker, data)), false);
        }.bind(this));
    } catch (err) {
        throw new Error('could not restore trackers');
    }
};

TrackerCollection.prototype.toggleMergeMode = function() {
    if (this.mergeMode) this.disableMergeMode();
    else this.enableMergeMode();
};

TrackerCollection.prototype.toggleDeleteMode = function() {
    if (this.deleteMode) this.disableDeleteMode();
    else this.enableDeleteMode();
};

/**
 * add events
 * @param {Tracker} tracker tracker instance
 * @param {object}  $       plain object containing dom nodes
 * @return {void}
 */
TrackerCollection.prototype.addTrackerEvents = function(tracker, $) {

    var trackerInterval;

    onValueUpdate($.description, function() {
        tracker.description = $.description.value;
        resizeTextarea();
        this.store();
    }.bind(this));

    onValueUpdate($.tracked, function() {
        tracker.tracked = Tracker.stringToDuration($.tracked.value);
        if (tracker.tracking) tracker.trackingSince = Tracker.now();
        this.store();
    }.bind(this));

    $.tracked.addEventListener('blur', function() {
        $.tracked.value = tracker.format();
    });

    $.toggle.addEventListener('click', function() {
        tracker.toggle();
        this.store();
    }.bind(this));

    tracker.on('start', function() {
        Object.keys(this.trackers).forEach(function(trackerID) {
            if (this.trackers[trackerID] !== tracker) this.trackers[trackerID].stop();
        }.bind(this));
        startTrackerUpdate();
        setTrackerClass();
        resizeTextarea();
    }.bind(this));

    tracker.on('stop', function() {
        stopTrackerUpdate();
        setTrackerClass();
        resizeTextarea();
    });

    if (tracker.tracking) startTrackerUpdate();

    resizeTextarea();

    /**
     * set tracker container class attribute depending on tracking status
     * @return {void}
     */
    function setTrackerClass() {
        $.container.className = $.container.className.replace(/(^|\ )tracker--(not-)?tracking(\ |$)/ig, '$3');
    }

    /**
     * start auto-updating total tracking duration input value
     * @return {void}
     */
    function startTrackerUpdate() {
        if (trackerInterval) clearInterval(trackerInterval);
        trackerInterval = window.setInterval(function() {
            if ($.tracked !== document.activeElement) $.tracked.value = tracker.format();
        });
    }

    /**
     * stop auto-updating total tracking duration input value
     * @return {void}
     */
    function stopTrackerUpdate() {
        clearInterval(trackerInterval);
    }

    /**
     * resize tracker description textarea depending on content height
     * @return {void}
     */
    function resizeTextarea() {
        $.description.style.height = 'auto';
        $.description.style.height = $.description.scrollHeight + 'px';
    }

};

// export class
module.exports = TrackerCollection;

},{"classes/tracker":2,"functions/define-properties":3,"functions/on-value-update":5,"functions/render-template":6}],2:[function(require,module,exports){
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
 * format a duration to a string like HH:MM:SS
 * @param  {string} format   duration format string
 * @param  {mixed}  duration anything that can be converted to a duration object
 * @return {string}          formatted duration
 */
Tracker.prototype.format = function(format, duration) {
    format = typeof format === 'string' ? format : '%h:%m:%s';
    duration = typeof duration !== 'undefined' ?
        Tracker.anyToDuration(duration) : Tracker.numberToDuration(this.trackedTotal);
    return Object.keys(duration).reverse().reduce(function(formatted, propertyName) {
        return formatted.replace(new RegExp('%' + propertyName, 'ig'), ('0' + duration[propertyName]).slice(-2));
    }, format);
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

module.exports = Tracker;

},{"functions/define-properties":3}],3:[function(require,module,exports){
'use strict';

/**
 * wrapper for Object.defineProperties() with default fallbacks
 * @param  {object} obj         object to which properties are added
 * @param  {object} definitions plain object containing property definitions
 * @param  {object} defaults    plain object containing property definition defaults
 * @return {object}             modified object
 */
function defineProperties(obj, definitions, defaults) {

    if (typeof obj !== 'object') throw new Error('no valid object to add properties');
    if (typeof definitions !== 'object') throw new Error('no valid definitions object');

    defaults = typeof defaults === 'object' ? defaults : {
        get: noop,
        set: noop,
        enumerable: true
    };

    Object.defineProperties(obj, Object.keys(definitions).reduce(function(propertyDefinitions, propertyName) {
        propertyDefinitions[propertyName] = Object.keys(defaults).reduce(function(definition, key) {
            if (!definition.hasOwnProperty(key)) {
                definition[key] = defaults[key];
            }
            return definition;
        }, definitions[propertyName]);
        return propertyDefinitions;
    }, {}));

}

/**
 * do nothing
 * @return {void}
 */
function noop() {
    return;
}

module.exports = defineProperties;
module.exports.noop = noop;

},{}],4:[function(require,module,exports){
'use strict';

/**
 * set or trigger dom ready event handler
 * @param  {Function} fn handler
 * @return {void}
 */
function onDomReady(fn) {
    if (document.readyState !== 'loading') fn();
    else document.addEventListener('DOMContentLoaded', fn);
}

module.exports = onDomReady;

},{}],5:[function(require,module,exports){
'use strict';

/**
 * set event handlers for input/textarea content update
 * @param  {node}     input input/textarea dom node
 * @param  {Function} fn    event handler
 * @return {void}
 */
function onValueUpdate(input, fn) {

    /**
     * delayed event to get the already changed text
     * @param {event} event event object
     * @return {void}
     */
    function delayedFn(event) {
        window.setTimeout(function() {
            fn(event);
        }, 0);
    }

    input.addEventListener('change', fn);
    input.addEventListener('cut', delayedFn);
    input.addEventListener('paste', delayedFn);
    input.addEventListener('drop', delayedFn);
    input.addEventListener('keydown', delayedFn);

}

module.exports = onValueUpdate;

},{}],6:[function(require,module,exports){
'use strict';

/**
 * template cache
 * @type {Object}
 */
var cache = {};

/**
 * render a html/js template
 * inspired by john resig's micro templating:
 * http://ejohn.org/blog/javascript-micro-templating/
 *
 * @param  {string} str     template string
 * @param  {object} data    template data object
 * @return {HTMLCollection} rendered template
 */
function renderTemplate(str, data) {
    var dom = document.implementation.createHTMLDocument(),
        fn = cache[str] = cache[str] ||
            new Function('obj', // eslint-disable-line no-new-func
                'var p=[],print=function(){p.push.apply(p,arguments);};' +
                'with(obj){p.push(\'' +
                str.replace(/[\r\t\n]/g, ' ')
                    .split('{%').join('\t')
                    .replace(/((^|%\})[^\t]*)"/g, '$1\r')
                    .replace(/\t=(.*?)%\}/g, '\',$1,\'')
                    .split('\t').join('\');')
                    .split('%}').join('p.push(\'')
                    .split('\r').join('"') +
                '\');}return p.join("");');
    data = typeof data === 'object' ? data : {};
    dom.body.innerHTML = fn(data);
    return dom.body.children.length > 1 ?
        dom.body.children : dom.body.children[0];
}

module.exports = renderTemplate;

},{}],7:[function(require,module,exports){
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

},{"classes/tracker-collection":1,"functions/on-dom-ready":4}]},{},[7])


//# sourceMappingURL=main.js.map