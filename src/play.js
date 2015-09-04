'use strict';

var events = require('./events.js');
var game = require('./game.js');

exports.start = function () {

    var levels = [
        { // climbing
            map: "1,7,7,1.2,2,3.VQFUBVAlQFUAdQEAAAAAAAAAAAAAAEAFABUAVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: [
                        "Hi there, I’m glad you could join us but there isn’t anything for you to do right now.",
                        "Our tiny friend is perfectly capable of reaching the goal all by himself."
                    ]
                },
                'at:4,2,2': {
                    msg: [
                        "...apart from the fact that he can’t climb walls in his current form.",
                        "Mind pressing space to help him out?"
                    ]
                },
                'won': {
                    msg: [
                        "Splendid! On to the next level."
                    ]
                }
            }
        },
        { // fighting
            map: "0,7,7,1;2,4,2,2.2,2,3.VQFUBVBVQlUAVQEAAAAAAAAAAAAAAEAFABUAVAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: [
                        "That guy looks dangerous but I'm sure our friend will avoid him."
                    ]
                },
                'lost': {
                    msg: [
                        "Looks like someone‘s hell-bent to fight but too weak in his current form.",
                        "Next time, press space to switch back before fighting."
                    ]
                }
            }
        },
        { // concurrency
            map: "2,1,1,5;2,4,4,2;0,8,3,1;0,3,6,1.0,0,6.VQBUAVAFQBUAAAEAAAAAAAAAAABUAVAFQBUAVQAAAAAAAAAAAAAAAFAFQBUA1QCUAAAAAAAAAAAAAAAAQAAABAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: [
                        "Now there's two of them. Can you get at least one to the goal?",
                    ]
                },
                'lost': {
                    msg: [
                        "The enemies can only attack one of ours at a time. Use that to your advantage."
                    ]
                }
            }
        },
        { // concurrency 2
            map: "2,1,1,5;2,0,4,2;0,0,8,1;2,4,0,3;0,7,0,1.0,0,6.VRVUBVAVQFUAVQEMAAAAAAAAAABUFVAFQBUAVQAAAAAAAAAAAAAAAFAJQAUAFQAMAAAAAAAAAAAAAAAAQAUABQAMAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'won': {
                    msg: ["You did it! You beat the last level."]
                }
            }
        }
    ];

    var Map = require('./map.js').Map;
    var currentLevel = 0;
    var activeEvents;

    events.on('unit-at', function (unit) {
        handleEvent('at:' + unit.pos);
    });
    events.on('unit-died', function (unit) {
        handleEvent('death');
    });
    events.on('level-started', function () {
    handleEvent('start');
    });
    events.on('level-won', function () {
        if (handleEvent('won')) {
            return;
        }
        game.deactivate();
        currentLevel++;
        if (currentLevel === levels.length) {
            alert('fin');
            return;
        }
        startLevel();
    });
    events.on('level-lost', function () {
        if (handleEvent('lost')) {
            return;
        }
        game.deactivate();
        restartLevel();
    });
    startLevel();

    var fps = 30;

    (function loop() {
        events.emit('update');
        window.requestAnimationFrame(function render() {
            events.emit('render');
        });
        setTimeout(loop, 1000 / fps);
    })();

    function handleEvent(type) {
        var event = activeEvents[type];
        if (!event) {
            return false;
        }
        delete activeEvents[type];
        if (event.next) {
            for (var e in event.next) {
                activeEvents[e] = event.next[e];
            }
        }
        game.showMessage(event.msg);
        return true;
    }

    function startLevel() {
        activeEvents = {};
        for (var e in levels[currentLevel].events) {
            activeEvents[e] = levels[currentLevel].events[e];
        }

        game.activate(Map.load(levels[currentLevel].map));
    }

    function restartLevel() {
        game.activate(Map.load(levels[currentLevel].map));
    }

    document.onkeydown = function (event) {
        var key = String.fromCharCode(event.keyCode);
        events.emit('key-pressed', key);
    }

    document.onclick = function (event) {
        events.emit('clicked');
    }
};
