'use strict';

var events = require('./events.js');
var canvas = require('./canvas.js');
var blockTypes = require('./blocks.js');
var unitTypes = require('./units.js');
var Map = require('./map.js').Map;
var MapContext = require('./context.js').MapContext;
var Vector = require('./vector.js').Vector;

var placeableElements = [
    new blockTypes.Cube(0, 0, 1),
    new blockTypes.Ramp(0, 0, 0, 'x'),
    new blockTypes.Ramp(0, 0, 0, 'y'),
    new unitTypes.Fighter(0, 0, 0),
    new unitTypes.Climber(0, 0, 0),
    new unitTypes.Shadow(0, 0, 0),
    new blockTypes.Target(0, 0, 0)
];
var selectedPlaceableIndex = 0;
var map;
var mapEvents;
var active = false;
var textarea = document.querySelector('textarea');

function onKeyPressed(data) {
    if (data.key === 'N') {
        selectedPlaceableIndex = (selectedPlaceableIndex + 1) % placeableElements.length;
    }
}

function renderEditHelpers() {
    for (var z = map.size.z; --z;) {
        for (var x = map.size.x; x--;) {
            canvas.translate3d(x, -1, z);
            canvas.drawPolygon3d('#cec1ba', [1,1,0, 0,1,0, 0,1,1, 1,1,1], new MapContext(new Vector(x, -1, z), 'y'));
            canvas.pop();
        }
    }
    for (var z = map.size.z; --z;) {
        for (var y = map.size.y; y--;) {
            canvas.translate3d(-1, y, z);
            canvas.drawPolygon3d('#846076', [1,1,0, 1,0,0, 1,0,1, 1,1,1], new MapContext(new Vector(-1, y, z), 'x'));
            canvas.pop();
        }
    }
}

function render() {
    canvas.reset();
    canvas.drawText('edit mode', 80, 30);
    canvas.translate(80, 50);
    placeableElements[selectedPlaceableIndex].render(canvas, map);
    canvas.pop();
    canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 360);
    renderEditHelpers();
    map.render(canvas);
    canvas.pop();
}

function onPaste(event) {
    if (event.clipboardData.types.length === 1 && event.clipboardData.types[0] === 'text/plain') {
        var level = JSON.parse(event.clipboardData.getData('text/plain'));
        map = Map.load(level.map);
        mapEvents = level.events;
    }
}

function onCanvasClicked(context) {
    if (context.type === 'unit') {
        map.units = map.units.filter(function (unit) {
            return unit !== context.unit;
        });
        updateLevelString();
        return;
    }

    var block = context.block;
    var element = placeableElements[selectedPlaceableIndex];
    if (event.shiftKey) {
        if (block.z > 0 && map.isValid(block.x, block.y, block.z)) {
            map.set(block.x, block.y, block.z, null);
            updateLevelString();
        }
        return;
    }

    var x = block.x + +(context.face === 'x');
    var y = block.y + +(context.face === 'y');
    var z = block.z + +(context.face === 'z');
    if (!map.isValid(x, y, z)) {
        return;
    }

    var spotTaken = map.units.some(function (unit) {
        return unit.pos.equals(x, y, z);
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
        map.units.push(unitTypes.createUnit(element.type, x, y, z));
    }
    updateLevelString();
}

function onCanvasResized(data) {
    textarea.style.width = (data.width * 6 / 7 | 0) + 'px';
    textarea.style.height = (data.height / 4 | 0) + 'px';
    textarea.style.right = ((window.innerWidth - data.width) / 2 | 0) + 'px';
}

function updateLevelString() {
    var level = {
        map: '' + map,
        events: mapEvents
    };
    textarea.value = JSON.stringify(level);
}

exports.activate = function (level) {
    map = Map.load(level.map);
    mapEvents = level.events;
    events.on('key-pressed', onKeyPressed);
    events.on('render', render);
    events.on('canvas-clicked', onCanvasClicked);
    events.on('canvas-resized', onCanvasResized);
    textarea.style.display = 'block';
    textarea.onpaste = onPaste;
    updateLevelString();
    active = true;
    canvas.resize();
};

exports.deactivate = function () {
    exports.level = {
        map: '' + map,
        events: mapEvents
    };
    events.off('key-pressed', onKeyPressed);
    events.off('render', render);
    events.off('canvas-clicked', onCanvasClicked);
    events.off('canvas-resized', onCanvasResized);
    textarea.style.display = 'none';
    active = false;
};

exports.isActive = function () {
    return active;
};
