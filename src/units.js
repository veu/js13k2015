'use strict';

var config = require('./config.js').units;
var UnitContext = require('./context.js').UnitContext;
var Vector = require('./vector.js').Vector;

var Unit = {
    attack: function (map, units) {
        var reachableUnits = units.filter(function (unit) {
            var diff = this.pos.diff(unit.pos);
            if (diff.x + diff.y !== 1) {
                return false;
            }
            if (diff.z === 0) {
                return true;
            }

            var dir = diff.x > 0 ? 'x' : 'y';
            var thisBlock = map.get(this.pos.sub(0, 0, 1));
            var unitBlock = map.get(unit.pos.sub(0, 0, 1));

            if (diff.z === 1 && thisBlock && thisBlock.type === 'ramp' && thisBlock.type === dir) {
                return true;
            }
            if (diff.z === 1 && unitBlock && unitBlock.type === 'ramp' && unitBlock.type === dir) {
                return true;
            }
            return false;
        }, this);
        var reachableEnemies = reachableUnits.filter(function (unit) {
            return (this.type === 'shadow') === (unit.type !== 'shadow');
        }, this);
        if (reachableEnemies.length > 0) {
            var enemy = reachableEnemies.pop();
            enemy.life -= this.damage;
            return true;
        }
        return false;
    }
};

exports.Fighter = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'fighter';
    this.life = config.fighter.life;
    this.damage = config.fighter.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        this.last = null;
        if (this.attack(map, units) || !map.target || this.pos.equals(map.target.pos)) {
            return;
        }

        var climbingDirections = map.getDirectionsForTarget(map.target.pos, true);
        var newPos;
        for (var current = this.pos; current = climbingDirections[current]; ) {
            if (map.get(current.sub(0, 0, 1))) {
                newPos = map.getDirectionsForTarget(current)[this.pos] || newPos;
            }
        }
        if (!newPos) {
            return;
        }
        var newPosIsTaken = units.some(function (unit) {
            return unit.pos.equals(newPos);
        });
        if (newPosIsTaken) {
            return;
        }

        this.last = this.pos;
        this.pos = newPos;
    };

    this.render = function (canvas, map, tick) {
        var z = 0;
        var block = map.get(this.pos.sub(0, 0, 1));
        if (block && block.type === 'ramp') {
            z -= 0.5;
        }

        var part = tick % 15 ? tick % 15 / 14 : 0;
        var position = this.pos.add(0, 0, z);
        if (this.last) {
            var zLast = 0;
            block = map.get(this.last.sub(0, 0, 1));
            if (block && block.type === 'ramp') {
                zLast -= 0.5;
            }

            position = position.times(part).add(this.last.add(0, 0, zLast).times(1 - part));
        }

        canvas.translate3d(position.x, position.y, position.z);
        canvas.drawPolygon('#ee3796', [-6,5, 6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#db0087', [-6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#000', [-2,8, -2,11, -4,11, -4,8]);
        canvas.drawPolygon('#000', [2,8, 2,11, 4,11, 4,8]);
        canvas.pop();
    };
};

exports.Climber = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'climber';
    this.life = config.climber.life;
    this.damage = config.climber.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        this.last = null;
        if (this.attack(map, units) || !map.target || this.pos.equals(map.target.pos)) {
            return;
        }

        var directions = map.getDirectionsForTarget(map.target.pos, true);
        var newPos = directions[this.pos];
        if (!newPos) {
            return;
        }
        var newPosIsTaken = units.some(function (unit) {
            return unit.pos.equals(newPos);
        });
        if (newPosIsTaken) {
            return;
        }

        this.last = this.pos;
        this.pos = newPos;
    };

    this.render = function (canvas, map, tick) {
        var z = 0;
        var block = map.get(this.pos.sub(0, 0, 1));
        if (block && block.type === 'ramp') {
            z -= 0.5;
        }

        var part = tick % 15 ? tick % 15 / 14 : 0;
        var position = this.pos.add(0, 0, z);
        if (this.last) {
            var zLast = 0;
            block = map.get(this.last.sub(0, 0, 1));
            if (block && block.type === 'ramp') {
                zLast -= 0.5;
            }

            position = position.times(part).add(this.last.add(0, 0, zLast).times(1 - part));
        }

        canvas.translate3d(position.x, position.y, position.z);
        canvas.drawPolygon('#11c869', [-6,5, 6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#24ff78', [-6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#000', [-2,8, -2,11, -4,11, -4,8]);
        canvas.drawPolygon('#000', [2,8, 2,11, 4,11, 4,8]);
        canvas.pop();
    };
};

exports.Shadow = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'shadow';
    this.life = config.shadow.life;
    this.damage = config.shadow.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        this.attack(map, units);
    };

    this.render = function (canvas, map, tick) {
        var z = this.pos.z;
        var block = map.get(this.pos.sub(0, 0, 1));
        if (block && block.type === 'ramp') {
            z -= 0.5;
        }
        canvas.translate3d(this.pos.x, this.pos.y, z);
        canvas.drawPolygon('#3a0033', [-6,5, 6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#4a1144', [-6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#6f7', [-2,8, -2,11, -4,11, -4,8]);
        canvas.drawPolygon('#6f7', [2,8, 2,11, 4,11, 4,8]);
        canvas.pop();
    };
};

exports.createUnit = function (type, x, y, z) {
    var types = {
        climber: exports.Climber,
        fighter: exports.Fighter,
        shadow: exports.Shadow
    };

    return new types[type](x, y, z);
};
