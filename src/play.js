'use strict';

var events = require('./events.js');
var game = require('./game.js');

exports.start = function () {

    var levels = [
        {
            map: "1,7,7,1.2,2,3.VQFUBVAlQFUAdQEAAAAAAAAAAAAAAEAFABUAVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: [
                {
                    type: 'start',
                    msg: [
                        "Hi there, I'm glad you could join us but there isn't anything for you to do right now.",
                        "Our tiny friend is perfectly capable of reaching the goal all by itself."
                    ]
                },
                {
                    type: 'at',
                    pos: {x: 4, y: 2, z: 2},
                    unit: 0,
                    msg: [
                        "...apart from the fact that it can't climb walls in its current form.",
                        "Mind pressing space to help it out?"
                    ]
                }
            ]
        }
    ];

    var Map = require('./map.js').Map;
    var currentLevel = 0;
    events.on('level-won', function () {
        game.deactivate();
        currentLevel++;
        if (currentLevel === levels.length) {
            alert('fin');
            return;
        }
        game.activate(Map.load(levels[currentLevel].map), levels[currentLevel].events)
    });
    events.on('level-lost', function () {
        game.deactivate();
        game.activate(Map.load(levels[currentLevel].map), levels[currentLevel].events);
    });
    game.activate(Map.load(levels[currentLevel].map), levels[currentLevel].events);

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
