'use strict';

var config = require('./config.js').units;
var events = require('./events.js');
var canvas = require('./canvas.js');
var unitTypes = require('./units.js');

var map;
var units = [];
var tick;
var score;
var targetScore = 1;
var roleReversalScheduled;

function update() {
    if (tick % 15 !== 0) {
        return;
    }
    if (roleReversalScheduled) {
        reverseRoles();
        roleReversalScheduled = false;
    }
    units = units.filter(function (unit) {
        if (unit.life <= 0) {
            return false;
        }
        if (isUnitWithLowestLifeAtPosition(unit)) {
            return false;
        }
        if (map.target && unit.pos.equals(map.target.pos)) {
            score ++;
            events.emit('level-won');
            return false;
        }
        return true;
    });
    units.sort(function (a, b) {
        return a.type > b.type ? -1 : a.type < b.type ? 1 : 0;
    });
    units.forEach(function (unit) {
        unit.move(map, units);
    });
    if (units.length === 0 && score < targetScore) {
        events.emit('level-lost');
    }
}

function render() {
    canvas.drawBackground();
    canvas.drawText(score + ' / ' + targetScore, 10, 20);
    canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 180);
    map.render(canvas);

    var orderedUnits = units.slice();
    orderedUnits.sort(function (a, b) {
        return (a.pos.x - b.pos.x) + (a.pos.y - b.pos.y);
    });
    orderedUnits.forEach(function (unit) {
        unit.render(canvas, map, tick);
    });

    canvas.pop();

    tick++;
}

function reverseRoles() {
    var unitMap = {climber: 'fighter', fighter: 'climber', shadow: 'shadow' };
    units = units.map(function (unit) {
        var newUnit = unitTypes.createUnit(unitMap[unit.type], unit.pos.x, unit.pos.y, unit.pos.z);
        newUnit.animation = unit.animation;
        newUnit.life = unit.life;
        return newUnit;
    });
}

function isUnitWithLowestLifeAtPosition(unit) {
    return units.some(function (otherUnit) {
        return otherUnit !== unit && otherUnit.pos.equals(unit.pos) && otherUnit.life >= unit.life;
    });
}

function onKeyPressed(key) {
    if (key === ' ') {
        roleReversalScheduled = true;
    }
}

exports.activate = function (newMap) {
    map = newMap;
    tick = 0;
    score = 0;
    roleReversalScheduled = false;
    units = map.units.map(function (unit) {
        return unitTypes.createUnit(unit.type, unit.pos.x, unit.pos.y, unit.pos.z);
    });
    events.on('key-pressed', onKeyPressed);
    events.on('update', update);
    events.on('render', render);
};

exports.deactivate = function () {
    events.off('key-pressed', onKeyPressed);
    events.off('update', update);
    events.off('render', render);
};
