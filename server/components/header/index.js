const _ = require('lodash');
const mime = require('../mime');
const time = require('../time');

function cacheControl(options, res) {
    let age;

    if (_.isString(options)) {
        if (options.indexOf('max-age') === 0) {
            age = options;
        } else {
            age = `max-age=${time.string2seconds(options)}`;
        }
    } else if (_.isNumber(options)) {
        age = `max-age=${options}`;
    }

    if (age) {
        res.set('Cache-Control', age);
    }
}

function expire(options, res) {
    let exp;

    if (_.isString(options)) {
        exp = new Date(Date.now() + (time.string2seconds(options) * 1000));
    } else if (_.isNumber(options)) {
        exp = new Date(Date.now() + (options * 1000));
    }

    if (exp) {
        res.set('Expires', exp.toGMTString());
    }
}

function contentType(options, res) {
    let type;

    if (_.isString(options)) {
        type = mime[options];
    }

    if (type) {
        res.set('Content-Type', type);
    }
}

function lastModified(options, res) {
    if (!options) {
        options = {};
    }

    if (!options.time) {
        options.time = (new Date()).toGMTString();
    }

    res.set('Last-Modified', options.time.toGMTString());
}

exports.contentType = contentType;
exports.cacheControl = cacheControl;
exports.lastModified = lastModified;
exports.expire = expire;
