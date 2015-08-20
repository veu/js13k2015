'use strict';

var listeners = {};

exports.on = function (name, callback) {
    if (!listeners[name]) {
        listeners[name] = [];
    }
    listeners[name].push(callback);
};
exports.off = function (name, callback) {
    if (!listeners[name]) {
        return;
    }
    listeners[name] = listeners[name].filter(function (listener) {
        return listener !== callback;
    });
};
exports.emit = function (name, data) {
    if (!listeners[name]) {
        return;
    }
    console.log('emitting ' + name + ' with ' + listeners[name].length + ' listeners');
    listeners[name].forEach(function (listener) {
        listener(data);
    });
};
