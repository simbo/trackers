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
