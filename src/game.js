'use strict';

var config = require('./config.js').units;
var events = require('./events.js');
var canvas = require('./canvas.js');
var unitTypes = require('./units.js');
var animations = require('./animations.js');

var map;
var units = [];
var tick;
var roleReversalScheduled;
var message;
var underline;
var levelState;

function update() {
    if (message) {
        return;
    }
    if (tick % 16 === 8) {
        updateFallingUnits();
        return;
    }
    if (tick % 16 !== 0) {
        return;
    }
    units.forEach(function (unit) {
        events.emit('unit-at', unit);
    });
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
            events.emit('unit-died');
            return false;
        }
        if (isUnitWithLowestLifeAtPosition(unit)) {
            return false;
        }
        if (map.target && unit.pos.equals(map.target.pos)) {
            levelState = 'won';
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
    if (!levelState && !units.some(function (unit) { return unit.type !== 'shadow'; })) {
        levelState = 'lost';
    }
    if (levelState) {
        events.emit('level-' + levelState);
    }
}

function updateFallingUnits() {
    units.forEach(function (unit) {
        if (unit.falling) {
            unit.fallDamageTaken += config.fighter.fallDamage;
            if (map.get(unit.pos.sub(0, 0, 1))) {
                unit.life = Math.max(0, unit.life - unit.fallDamageTaken);
                unit.fallDamageTaken = 0;
                unit.falling = false;
            }
        }
    });
}

function render() {
    canvas.reset();
    canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 360);
    map.render(canvas, units);
    canvas.pop();

    if (message) {
        var offset = 0;
        message.forEach(function (part) {
            canvas.drawText(part, canvas.getWidth() / 2, 120 + offset);
            offset += 32;
        });
        underline.render(canvas, 600, 105 + offset);
        canvas.drawText('click to continue', canvas.getWidth() / 2, 130 + offset, 18);
    }

    tick++;
}

function reverseRoles() {
    var unitMap = {climber: 'fighter', fighter: 'climber', shadow: 'shadow' };
    units = units.map(function (unit) {
        var newUnit = unitTypes.createUnit(unitMap[unit.type], unit.pos.x, unit.pos.y, unit.pos.z);
        newUnit.animation = unit.animation;
        newUnit.life = unit.life / unit.maxLife * newUnit.maxLife | 0;
        newUnit.lookingLeft = unit.lookingLeft;
        return newUnit;
    });
}

function isUnitWithLowestLifeAtPosition(unit) {
    return units.some(function (otherUnit) {
        return otherUnit !== unit && otherUnit.pos.equals(unit.pos) && otherUnit.life >= unit.life;
    });
}

function onKeyPressed(data) {
    if (!message && data.key === ' ') {
        roleReversalScheduled = true;
    }
}

function onClicked(key) {
    message = false;
}

exports.activate = function (newMap) {
    levelState = null;
    map = newMap;
    tick = 0;
    roleReversalScheduled = false;
    units = map.units.map(function (unit) {
        return unitTypes.createUnit(unit.type, unit.pos.x, unit.pos.y, unit.pos.z);
    });
    events.on('key-pressed', onKeyPressed);
    events.on('clicked', onClicked);
    events.on('update', update);
    events.on('render', render);

    events.emit('level-started');
};

exports.deactivate = function () {
    events.off('key-pressed', onKeyPressed);
    events.off('clicked', onClicked);
    events.off('update', update);
    events.off('render', render);
};

exports.showMessage = function (msg) {
    underline = new animations.AnimatedLine(400);
    message = msg;
};

exports.hideMessage = function () {
    message = null;
};
