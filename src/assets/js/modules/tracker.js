'use strict';

function now() {
    return new Date().getTime();
}

function msToDuration(ms) {
    return {
        h: Math.floor(ms / (1000 * 60 * 60)),
        m: Math.floor(ms / (1000 * 60) % 60),
        s: Math.floor(ms / 1000 % 60),
        ms: Math.floor(ms % 1000)
    };
}

function durationToMs(duration) {
    let ms = 0;
    if (duration.h) ms += parseInt(duration.h, 10) * 60 * 60 * 1000;
    if (duration.m) ms += parseInt(duration.m, 10) * 60 * 1000;
    if (duration.s) ms += parseInt(duration.s, 10) * 1000;
    if (duration.ms) ms += parseInt(duration.ms, 10);
    return ms;
}

class Tracker {

    constructor(description = '') {
        this._tracking = false;
        this._tracked = 0;
        this._description;
        this.description = description;
    }

    set description(description) {
        if (typeof description === 'string' && (description = description.trim()).length > 0) {
            this._description = description;
        }
    }

    get description() {
        return this._description;
    }

    get tracked() {
        return msToDuration(this._tracked);
    }

    set tracked(duration) {
        if (typeof duration === 'number') {
            duration = msToDuration();
        }
        else if (Array.isArray(duration)) {
            duration = duration.reduce((durationObj, item, i) => {
                const durationIndex = ['h', 'm', 's', 'ms'];
                durationObj[durationIndex[i]] = item;
                return durationObj;
            }, {});
        }
        if (typeof duration === 'object') {
            this._tracked = durationToMs(duration);
        }
    }

    start() {
        this._tracking = now();
        return this;
    }

    stop() {
        if (this._tracking) this._tracked += now() - this._tracking;
        return this;
    }

}

module.exports = Tracker;
