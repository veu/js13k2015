var Events = function () {
    'use strict';

    var listeners = {};

    return {
        on: function (name, callback) {
            if (!listeners[name]) {
                listeners[name] = [];
            }
            listeners[name].push(callback);
        },
        off: function (name, callback) {
            if (!listeners[name]) {
                return;
            }
            listeners[name] = listeners[name].filter(function (listener) {
                return listener !== callback;
            });
        },
        emit: function (name, data) {
            if (!listeners[name]) {
                return;
            }
            listeners[name].forEach(function (listener) {
                listener(data);
            });
        }
    };
}();
