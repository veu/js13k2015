'use strict';

var UnitContext = require('./context.js').UnitContext;
var config = require('./config.js').units;

var Unit = {
    attack: function (map, units) {
        var adjacent = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];
        var reachableUnits = units.filter(function (unit) {
            var diff = {
                x: Math.abs(unit.x - this.x),
                y: Math.abs(unit.y - this.y),
                z: Math.abs(unit.z - this.z)
            };
            if (diff.x + diff.y !== 1) {
                return false;
            }
            if (diff.z === 0) {
                return true;
            }

            var dir = diff.x > 0 ? 'x' : 'y';
            var thisBlock = map.get(this.x, this.y, this.z - 1);
            var unitBlock = map.get(unit.x, unit.y, unit.z - 1);

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
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = 'fighter';
    this.life = config.fighter.life;
    this.damage = config.fighter.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        if (this.attack(map, units)) {
            return;
        }
        if (map.target) {
            if (this.x === map.target.x && this.y === map.target.y && this.z === map.target.z) {
                return;
            }
            var climbingDirections = map.getDirectionsForTarget(map.target, true);
            var newPos;
            var current = this;
            while (current = climbingDirections[current.z][current.y][current.x]) {
                if (map.get(current.x, current.y, current.z - 1)) {
                    newPos = map.getDirectionsForTarget(current)[this.z][this.y][this.x] || newPos;
                }
            }
            if (!newPos) {
                return;
            }
            var newPosIsTaken = units.some(function (unit) {
                return unit.x === newPos.x && unit.y === newPos.y && unit.z === newPos.z;
            });
            if (newPosIsTaken) {
                return;
            }
            this.x = newPos.x;
            this.y = newPos.y;
            this.z = newPos.z;
        }
    };

    this.render = function (canvas, map) {
        var z = this.z;
        var block = map.get(this.x, this.y, this.z - 1);
        if (block && block.type === 'ramp') {
            z -= 0.5;
        }
        canvas.translate3d(this.x, this.y, z);
        canvas.drawPolygon('#ee3796', [-6,5, 6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#db0087', [-6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#000', [-2,8, -2,11, -4,11, -4,8]);
        canvas.drawPolygon('#000', [2,8, 2,11, 4,11, 4,8]);
        canvas.pop();
    };
};

exports.Climber = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = 'climber';
    this.life = config.climber.life;
    this.damage = config.climber.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        if (this.attack(map, units)) {
            return;
        }
        if (map.target) {
            if (this.x === map.target.x && this.y === map.target.y && this.z === map.target.z) {
                return;
            }
            var directions = map.getDirectionsForTarget(map.target, true);
            var newPos = directions[this.z][this.y][this.x];
            if (!newPos) {
                return;
            }
            var newPosIsTaken = units.some(function (unit) {
                return unit.x === newPos.x && unit.y === newPos.y && unit.z === newPos.z;
            });
            if (newPosIsTaken) {
                return;
            }
            this.x = newPos.x;
            this.y = newPos.y;
            this.z = newPos.z;
        }
    };

    this.render = function (canvas, map) {
        var z = this.z;
        var block = map.get(this.x, this.y, this.z - 1);
        if (block && block.type === 'ramp') {
            z -= 0.5;
        }
        canvas.translate3d(this.x, this.y, z);
        canvas.drawPolygon('#11c869', [-6,5, 6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#24ff78', [-6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#000', [-2,8, -2,11, -4,11, -4,8]);
        canvas.drawPolygon('#000', [2,8, 2,11, 4,11, 4,8]);
        canvas.pop();
    };
};

exports.Shadow = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = 'shadow';
    this.life = config.shadow.life;
    this.damage = config.shadow.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        this.attack(map, units);
    };

    this.render = function (canvas, map) {
        var z = this.z;
        var block = map.get(this.x, this.y, this.z - 1);
        if (block && block.type === 'ramp') {
            z -= 0.5;
        }
        canvas.translate3d(this.x, this.y, z);
        canvas.drawPolygon('#3a0033', [-6,5, 6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#4a1144', [-6,5, 6,25, -6,25], new UnitContext(this));
        canvas.drawPolygon('#6f7', [-2,8, -2,11, -4,11, -4,8]);
        canvas.drawPolygon('#6f7', [2,8, 2,11, 4,11, 4,8]);
        canvas.pop();
    };
};
