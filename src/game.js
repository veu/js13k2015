'use strict';

var events = require('./events.js');
var blockTypes = require('./blocks.js');
var unitTypes = require('./units.js');
var canvas = require('./canvas.js');
var Map = require('./map.js').Map;
var MapContext = require('./context.js').MapContext;

var MODE_EDITOR = 0;
var MODE_PLAY = 1;
var mode = MODE_EDITOR;
var fps = 30;

var TYPE_CLIMBER = 0;
var TYPE_FIGHTER = 1;
var TYPE_SHADOW = 2;
var unitTypeMap = {
    climber: TYPE_CLIMBER,
    fighter: TYPE_FIGHTER,
    shadow: TYPE_SHADOW
};

var map = new Map();
var unitPositions = [];
var units = [];
var placeableElements = [
    new blockTypes.Cube(0, 0, 0),
    new blockTypes.Ramp(0, 0, 0, 'x'),
    new blockTypes.Ramp(0, 0, 0, 'y'),
    new unitTypes.Fighter(0, 0, 0),
    new unitTypes.Climber(0, 0, 0),
    new unitTypes.Shadow(0, 0, 0),
    new blockTypes.Target(0, 0, 0)
];
var selectedPlaceableIndex = 0;

var tick = 0;
var score = 0;

function update() {
    if (mode === MODE_PLAY) {
        if (tick % 15 === 0) {
            units.forEach(function (unit) {
                unit.move(map, units);
            });
            units = units.filter(function (unit) {
                if (unit.life <= 0) {
                    return false;
                }
                if (map.target && unit.x === map.target.x && unit.y === map.target.y && unit.z === map.target.z) {
                    score ++;
                    return false;
                }
                return true;
            });
        }
    } else if (mode === MODE_EDITOR) {
        if (window.level) {
            loadLevel(window.level);
            window.level = null;
        }
    }
    tick++;
}

function render() {
    canvas.drawBackground();
    if (mode === MODE_EDITOR) {
        canvas.drawText('edit mode', 10, 20);

        canvas.translate(35, 30);
        placeableElements[selectedPlaceableIndex].render(canvas, map);
        canvas.pop();
    } else {
        canvas.drawText('score: ' + score, 10, 20);
    }
    canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 180);
    if (mode === MODE_EDITOR) {
        renderEditHelpers();
    }
    map.render(canvas);

    var orderedUnits = units.slice();
    if (mode === MODE_EDITOR) {
        orderedUnits = unitPositions.slice();
    } else {
        orderedUnits = units.slice();
    }
    orderedUnits.sort(function (a, b) {
        return (a.x - b.x) + (a.y - b.y);
    });
    orderedUnits.forEach(function (unit) {
        unit.render(canvas, map);
    });

    canvas.pop();
}

function renderEditHelpers() {
    for (var y = map.size.y; y--;) {
        for (var x = map.size.x; x--;) {
            canvas.translate3d(x, y, -1);
            canvas.drawPolygon3d('#9c7f8a', [0,0,0, 1,0,0, 1,1,0, 0,1,0], new MapContext({x: x, y: y, z: -1}, 'z'));
            canvas.pop();
        }
    }
    for (var z = map.size.z; z--;) {
        for (var x = map.size.x; x--;) {
            canvas.translate3d(x, -1, z);
            canvas.drawPolygon3d('#cec1ba', [1,1,0, 0,1,0, 0,1,1, 1,1,1], new MapContext({x: x, y: -1, z: z}, 'y'));
            canvas.pop();
        }
    }
    for (var z = map.size.z; z--;) {
        for (var y = map.size.y; y--;) {
            canvas.translate3d(-1, y, z);
            canvas.drawPolygon3d('#846076', [1,1,0, 1,0,0, 1,0,1, 1,1,1], new MapContext({x: -1, y: y, z: z}, 'x'));
            canvas.pop();
        }
    }
}

function reverseRoles() {
    console.log('what?');
    units = units.map(function (unit) {
        if (unit.type === 'climber') {
            return new unitTypes.Fighter(unit.x, unit.y, unit.z);
        }
        if (unit.type === 'fighter') {
            return new unitTypes.Climber(unit.x, unit.y, unit.z);
        }
        return unit;
    });
};

(function loop() {
    update();
    window.requestAnimationFrame(render);
    setTimeout(loop, 1000 / fps);
})();

document.onkeydown = function (event) {
    var key = String.fromCharCode(event.keyCode);
    if (key === 'E') {
        mode = mode === MODE_PLAY ? MODE_EDITOR : MODE_PLAY;
        if (mode === MODE_PLAY) {
            score = 0;
            units = unitPositions.map(function (unit) {
                if (unit.type === 'climber') {
                    return new unitTypes.Climber(unit.x, unit.y, unit.z);
                }
                if (unit.type === 'fighter') {
                    return new unitTypes.Fighter(unit.x, unit.y, unit.z);
                }
                return new unitTypes.Shadow(unit.x, unit.y, unit.z);
            });
        }
    }
    if (key === 'S' && mode === MODE_EDITOR) {
        var level = saveLevel();
        console.log('level = "' + level + '"');
    }
    if (key === ' ' && mode === MODE_PLAY) {
        reverseRoles();
    }
};

function saveLevel() {
    var strUnits = unitPositions.map(function(unit) {
        return '' + [unitTypeMap[unit.type], unit.x, unit.y, unit.z];
    }, '');

    var level = strUnits.join(';') + '.' + map.toString();

    return level;
};

function loadLevel(level) {
    level = level.split('.');
    if (level[0]) {
        var strUnits = level[0].split(';');
        unitPositions = strUnits.map(function (strUnit) {
            var attributes = strUnit.split(',');
            if (+attributes[0] === TYPE_CLIMBER) {
                return new unitTypes.Climber(+attributes[1], +attributes[2], +attributes[3]);
            }
            if (+attributes[0] === TYPE_FIGHTER) {
                return new unitTypes.Fighter(+attributes[1], +attributes[2], +attributes[3]);
            }
            return new unitTypes.Shadow(+attributes[1], +attributes[2], +attributes[3]);
        });
    }

    map = new Map(level[1]);
};

document.onmousewheel = function (event) {
    if (event.wheelDelta > 0) {
        selectedPlaceableIndex++;
    } else {
        selectedPlaceableIndex--;
    }
    selectedPlaceableIndex = (selectedPlaceableIndex + placeableElements.length) % placeableElements.length;
}

events.on('canvas-clicked', function (context) {
    if (mode === MODE_PLAY) {
        var target = {};
        for (var i in context.block) {
            target[i] = context.block[i];
        }
        target.z++;
        units.forEach(function (unit) { unit.target = target; });
    }

    if (mode === MODE_EDITOR) {
        if (context.type === 'unit') {
            unitPositions = unitPositions.filter(function (unit) {
                return unit.x !== context.unit.x || unit.y !== context.unit.y || unit.z !== context.unit.z;
            })
            return;
        }
        var block = context.block;
        var element = placeableElements[selectedPlaceableIndex];
        if (event.shiftKey) {
            if (map.isValid(block.x, block.y, block.z)) {
                map.set(block.x, block.y, block.z, null);
            }
        } else {
            var x = block.x + +(context.face === 'x');
            var y = block.y + +(context.face === 'y');
            var z = block.z + +(context.face === 'z');
            if (!map.isValid(x, y, z)) {
                return;
            }
            var spotTaken = unitPositions.some(function (unit) {
                return unit.x === x && unit.y === y && unit.z === z;
            });
            if (spotTaken) {
                return;
            }
            if (element.type === 'cube') {
                map.set(x, y, z, new blockTypes.Cube(x, y, z));
            } else if (element.type === 'ramp') {
                map.set(x, y, z, new blockTypes.Ramp(x, y, z, element.dir));
            } else if (element.type === 'fighter') {
                unitPositions.push(new unitTypes.Fighter(x, y, z));
            } else if (element.type === 'climber') {
                unitPositions.push(new unitTypes.Climber(x, y, z));
            } else if (element.type === 'shadow') {
                unitPositions.push(new unitTypes.Shadow(x, y, z));
            } else if (element.type === 'target') {
                map.target = new blockTypes.Target(x, y, z);
            }
        }
    };
});
