'use strict';

var config = require('./config.js').units;
var events = require('./events.js');
var canvas = require('./canvas.js');
var unitTypes = require('./units.js');

var map;
var mapEvents;
var currentEvent;
var units = [];
var tick;
var score;
var targetScore = 1;
var roleReversalScheduled;
var message;

function update() {
    if (message) {
        return;
    }
    if (tick % 16 === 8) {
        checkEvents();
        updateFallingUnits();
        return;
    }
    if (tick % 16 !== 0) {
        return;
    }
    checkEvents();
    if (roleReversalScheduled) {
        reverseRoles();
        roleReversalScheduled = false;
    }
    units.forEach(function (unit) {
        unit.life -= unit.damageTaken;
        unit.life = Math.max(unit.life, 0);
        unit.damageTaken = 0;
    });
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

function checkEvents() {
    if (currentEvent >= mapEvents.length) {
        return;
    }

    if (mapEvents[currentEvent].type === 'start') {
        message = mapEvents[currentEvent].msg;
        currentEvent++;
        return;
    }

    if (mapEvents[currentEvent].type === 'at') {
        units.some(function (unit) {
            if (unit.pos.equals(mapEvents[currentEvent].pos)) {
                message = mapEvents[currentEvent].msg;
                currentEvent++;
                return true;
            }
            return false;
        });
        return;
    }
};

function updateFallingUnits() {
    units.forEach(function (unit) {
        if (unit.falling) {
            unit.life = Math.max(unit.life - config.fighter.fallDamage, 0);
            if (map.get(unit.pos.sub(0, 0, 1))) {
                unit.falling = false;
            }
        }
    });
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

    if (message) {
        var offset = 0;
        message.forEach(function (part) {
            canvas.drawText(part, canvas.getWidth() / 2, 70 + offset, 'center');
            offset += 14;
        });
        canvas.drawText('[Press space to continue]', canvas.getWidth() / 2, 80 + offset, 'center');
    }

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
        if (message) {
            message = false;
        } else {
            roleReversalScheduled = true;
        }
    }
}

exports.activate = function (newMap, newEvents) {
    map = newMap;
    mapEvents = newEvents;
    currentEvent = 0;
    tick = 0;
    score = 0;
    roleReversalScheduled = false;
    units = map.units.map(function (unit) {
        return unitTypes.createUnit(unit.type, unit.pos.x, unit.pos.y, unit.pos.z);
    });
    events.on('key-pressed', onKeyPressed);
    events.on('update', update);
    events.on('render', render);

    checkEvents();
};

exports.deactivate = function () {
    events.off('key-pressed', onKeyPressed);
    events.off('update', update);
    events.off('render', render);
};
