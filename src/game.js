'use strict';

var events = require('./events.js');
var blockTypes = require('./blocks.js');
var unitTypes = require('./units.js');
var canvas = require('./canvas.js');
var Map = require('./map.js').Map;

var MODE_EDITOR = 0;
var MODE_PLAY = 1;
var mode = MODE_EDITOR;
var fps = 30;

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
            map.set(block.x, block.y, block.z, null);
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
