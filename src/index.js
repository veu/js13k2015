'use strict';

var events = require('./events.js');
var editor = require('./editor.js');
var game = require('./game.js');
var Map = require('./map.js').Map;

var editing = true;
editor.activate();

events.on('key-pressed', function (key) {
    if (key !== 'E') {
        return;
    }
    editing = !editing;
    if (editing) {
        game.deactivate();
        editor.activate();
    } else {
        editor.deactivate();
        game.activate(editor.map, editor.unitPositions);
    }

});

document.onkeydown = function (event) {
    var key = String.fromCharCode(event.keyCode);
    events.emit('key-pressed', key);
}

var fps = 30;

(function loop() {
    events.emit('update');
    window.requestAnimationFrame(function render() {
        events.emit('render');
    });
    setTimeout(loop, 1000 / fps);
})();
