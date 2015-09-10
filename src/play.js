'use strict';

var events = require('./events.js');
var editor = require('./editor.js');
var game = require('./game.js');
var save = require('./save.js');
var canvas = require('./canvas.js');

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
                },
                'won': {
                    msg: [
                        "Right on! Remember: red is for fighting and green for climbing."
                    ]
                }
            }
        },
        { // concurrency 1

            map: "2,4,2,2;2,2,5,2;0,2,7,1;2,2,2,3;1,8,3,1.0,0,4.VQVUFVBVQlUBVQVUFQADAAAAAABUAVAFQBUAVQAAAAAAAAAAAAAAAFAAQAEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: [
                        "These two have opposite colors. Pressing space reverses their roles.",
                        "Can you get one of them to the goal?"
                    ]
                },
                'won': {
                    msg: [
                        "Amazing!"
                    ]
                }
            }
        },
        { // avoiding
            map: "2,3,0,3;2,3,3,3;2,3,7,3;2,1,8,3;2,0,2,4;2,6,8,2;2,6,5,2;2,6,2,2;0,8,7,1.0,0,4.VQlUVVBVQVUFVRVUVVBVQVUFVRVUAVAFQBUAVQBUAVAFQBUAVQCUAFAAQAEABQAUAFAAQAIAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: [
                        "Sometimes it‘s best to avoid confrontation."
                    ]
                },
                'won':{
                    msg: ["Impressive!"]
                }
            }
        },
        { // concurrency 2
            map: "2,1,1,5;2,4,4,2;0,8,3,1;0,3,6,1.0,0,6.VQBUAVAFQBUAAAEAAAAAAAAAAABUAVAFQBUAVQAAAAAAAAAAAAAAAFAFQBUA1QCUAAAAAAAAAAAAAAAAQAAABAAAAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: [
                        "This is going to take some teamwork."
                    ]
                },
                'lost': {
                    msg: [
                        "The enemies can only attack one of ours at a time; use it to your advantage.",
                        "Press enter to reset the level faster."
                    ]
                }
            }
        },
        { // fun
            map: "1,6,0,6;1,7,0,6;1,6,1,6;1,7,1,6;1,8,0,6;1,8,1,6;1,8,2,6;1,6,2,6;1,7,2,6;1,0,6,6;1,1,6,6;1,2,6,6;1,0,7,6;1,1,7,6;1,2,7,6;1,0,8,6;1,1,8,6;1,2,8,6;2,7,6,1;2,8,7,1;2,8,6,1;2,7,8,1;2,6,7,1;2,6,8,1;2,5,7,1;2,5,6,1;2,5,5,1;2,6,5,1;2,7,5,1;2,5,8,1;2,8,5,1;2,6,6,1.7,7,2.FVBVQFUBFQAAAAAAAFABQAUQFQBUQFUBVQVUAAAAAAAAQAUAFQBUAFABVQEUERABAAAAAAAAFQAUABABQAVUFVBVQAUAAAAAAABUAFABQAUAFVBVQFUBFQAAAAAAAFABQAUAFQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: ["The last one was too hard. Have some fun!"]
                },
                'won': {
                    msg: ["Good times!"]
                }
            }
        },
        { // concurrency 3
            map: "2,1,1,5;2,0,4,2;0,0,8,1;2,4,0,3;0,7,0,1.0,0,6.VRVUBVAVQFUAVQEMAAAAAAAAAABUFVAFQBUAVQAAAAAAAAAAAAAAAFAJQAUAFQAMAAAAAAAAAAAAAAAAQAUABQAMAAAAAAAAAAAAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA",
            events: {
                'start': {
                    msg: ["I don‘t even know how to win this one."]
                },
                'won': {
                    msg: ["Clever!"]
                }
            }
        }
    ];

    var Map = require('./map.js').Map;
    var currentLevel = save.getCurrentLevel();
    var activeEvents;
    var map;
    var edited = false;

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
        if (!edited) {
            currentLevel++;
            if (currentLevel === levels.length) {
                return;
            }
            save.unlockLevel(currentLevel);
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
    events.on('key-pressed', function (data) {
        if (data.key === 'E') {
            edited = true;
            if (editor.isActive()) {
                editor.deactivate();
                levels[currentLevel] = editor.level;
                startLevel();
            } else {
                game.deactivate();
                editor.activate(levels[currentLevel]);
            }
        }
        if (data.code === 27) {
            document.location.href = 'index.html';
        }
        if (data.code === 13) {
            game.deactivate();
            restartLevel();
        }
    });
    startLevel();

    var fps = 30;

    (function loop() {
        events.emit('update');
        window.requestAnimationFrame(function render() {
            events.emit('render');
            canvas.drawText('Level ' + (+currentLevel + 1), 20, 880, 20, 'left');
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

        map = Map.load(levels[currentLevel].map);
        game.activate(map);
    }

    function restartLevel() {
        game.activate(map);
    }

    document.onkeydown = function (event) {
        if (event.target !== document.body) {
            return;
        }
        var key = String.fromCharCode(event.keyCode);
        events.emit('key-pressed', {key: key, code: event.keyCode});
    }

    document.onclick = function (event) {
        events.emit('clicked');
    }
};
