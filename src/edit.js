'use strict';

var events = require('./events.js');
var game = require('./game.js');
var editor = require('./editor.js');

exports.start = function () {
    var editing = true;

    editor.activate();
    events.on('key-pressed', function (data) {
        if (data.key !== 'E') {
            return;
        }
        editing = !editing;
        if (editing) {
            game.deactivate();
            editor.activate();
        } else {
            editor.deactivate();
            game.activate(editor.map);
        }

    });

    var fps = 30;

    (function loop() {
        events.emit('update');
        window.requestAnimationFrame(function render() {
            events.emit('render');
        });
        setTimeout(loop, 1000 / fps);
    })();

    document.onkeydown = function (event) {
        var key = String.fromCharCode(event.keyCode);
        events.emit('key-pressed', {key: key, code: event.keyCode});
    }
};
