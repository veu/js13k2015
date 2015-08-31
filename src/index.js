'use strict';

var events = require('./events.js');
var game = require('./game.js');

var levels = [
    "0,3,7,5.3,3,5.AAAAAAAAAAAQAEAAAAEABFAVAAAAAAAAAAAAAEAAAAAAAAAAQAIAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAFAVAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "1,7,8,2;2,5,6,4.3,2,7.AAAAAAAEABAAQAUAEABABQAQAEAAAAAAABAAQAAAFQBAAAAVAEAAAAEAAAAAQAAAAQBUAAABAFQAAAMAAAAAAAAAAQAEAFABAAQAkAAAAAAAAAAAAAAEABAAQAUAMAAAAAAAAAAAAAAAABAAQAAACQAAAAAAAAAAAAAAAAAAQAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "2,5,5,1;0,8,5,1.0,5,5.AAAAAAAAQFUBVQVUVVVVQFUBAAAAAAAAAAAAVQFUCVAVQJUAVQEAAAAAAAAAAABUAFABQAkAFQBUAAAAAAAAAAAAAAAAQAAAAQAEAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
];

if (window.edit) {
    var editor = require('./editor.js');
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
            game.activate(editor.map);
        }

    });
} else {
    var Map = require('./map.js').Map;
    var currentLevel = levels[0];
    game.activate(Map.load(currentLevel));
}

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
    events.emit('key-pressed', key);
}
