'use strict';

var events = require('./events.js');
var blockTypes = require('./blocks.js');
var unitTypes = require('./units.js');
var canvas = require('./canvas.js');
var Map = require('./map.js').Map;
var MapContext = require('./context.js').MapContext;
var Vector = require('./vector.js').Vector;

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
            units.sort(function (a, b) {
                return a.type > b.type ? -1 : a.type < b.type ? 1 : 0;
            });
            units.forEach(function (unit) {
                unit.move(map, units);
            });
            units = units.filter(function (unit) {
                if (unit.life <= 0) {
                    return false;
                }
                if (map.target && unit.pos.equals(map.target.pos)) {
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
        return (a.pos.x - b.pos.x) + (a.pos.y - b.pos.y);
    });
    orderedUnits.forEach(function (unit) {
        unit.render(canvas, map, tick);
    });

    canvas.pop();

    tick++;
}

function renderEditHelpers() {
    for (var y = map.size.y; y--;) {
        for (var x = map.size.x; x--;) {
            canvas.translate3d(x, y, -1);
            canvas.drawPolygon3d('#9c7f8a', [0,0,0, 1,0,0, 1,1,0, 0,1,0], new MapContext(new Vector(x, y, -1), 'z'));
            canvas.pop();
        }
    }
    for (var z = map.size.z; z--;) {
        for (var x = map.size.x; x--;) {
            canvas.translate3d(x, -1, z);
            canvas.drawPolygon3d('#cec1ba', [1,1,0, 0,1,0, 0,1,1, 1,1,1], new MapContext(new Vector(x, -1, z), 'y'));
            canvas.pop();
        }
    }
    for (var z = map.size.z; z--;) {
        for (var y = map.size.y; y--;) {
            canvas.translate3d(-1, y, z);
            canvas.drawPolygon3d('#846076', [1,1,0, 1,0,0, 1,0,1, 1,1,1], new MapContext(new Vector(-1, y, z), 'x'));
            canvas.pop();
        }
    }
}

function reverseRoles() {
    var unitMap = {climber: 'fighter', fighter: 'climber', shadow: 'shadow' };
    units = units.map(function (unit) {
        var newUnit = unitTypes.createUnit(unitMap[unit.type], unit.pos.x, unit.pos.y, unit.pos.z);
        newUnit.last = unit.last;
        return newUnit;
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
                return unitTypes.createUnit(unit.type, unit.pos.x, unit.pos.y, unit.pos.z);
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
        return '' + [unitTypeMap[unit.type], unit.pos.x, unit.pos.y, unit.pos.z];
    }, '');

    return [strUnits.join(';'), map.target && map.target.pos || '', map].join('.');
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

    map = new Map(level[2]);

    if (level[1]) {
        var coords = level[1].split(',');
        map.target = new blockTypes.Target(+coords[0], +coords[1], +coords[2]);
    }
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
    if (mode === MODE_EDITOR) {
        if (context.type === 'unit') {
            unitPositions = unitPositions.filter(function (unit) {
                return !unit.pos.equals(context.unit.pos);
            });
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
            } else if (element.type === 'target') {
                map.target = new blockTypes.Target(x, y, z);
            } else if (['fighter', 'climber', 'shadow'].indexOf(element.type) >= 0) {
                unitPositions.push(unitTypes.createUnit(element.type, x, y, z));
            }
        }
    };
});
