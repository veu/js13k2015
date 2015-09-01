'use strict';

var events = require('./events.js');
var game = require('./game.js');

exports.start = function () {

    var levels = [
        "0,3,7,5.3,3,5.AAAAAAAAAAAQAEAAAAEABFAVAAAAAAAAAAAAAEAAAAAAAAAAQAIAAAAAAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAAAAAAABAAAAAAAAAAEAAAAAAAAAAAAAFAVAAAAAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "1,7,8,2;2,5,6,4.3,2,7.AAAAAAAEABAAQAUAEABABQAQAEAAAAAAABAAQAAAFQBAAAAVAEAAAAEAAAAAQAAAAQBUAAABAFQAAAMAAAAAAAAAAQAEAFABAAQAkAAAAAAAAAAAAAAEABAAQAUAMAAAAAAAAAAAAAAAABAAQAAACQAAAAAAAAAAAAAAAAAAQAAAAwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
        "2,5,5,1;0,8,5,1.0,5,5.AAAAAAAAQFUBVQVUVVVVQFUBAAAAAAAAAAAAVQFUCVAVQJUAVQEAAAAAAAAAAABUAFABQAkAFQBUAAAAAAAAAAAAAAAAQAAAAQAEAAAAAAAAAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"
    ];

    var Map = require('./map.js').Map;
    var currentLevel = 0;
    events.on('level-won', function () {
        game.deactivate();
        if (currentLevel === levels.length) {
            alert('fin');
            return;
        }
        currentLevel ++;
        game.activate(Map.load(levels[currentLevel]))
    });
    events.on('level-lost', function () {
        game.deactivate();
        game.activate(Map.load(levels[currentLevel]))
    });
    game.activate(Map.load(levels[currentLevel]));

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
};
