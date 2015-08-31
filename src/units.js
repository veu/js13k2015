'use strict';

var config = require('./config.js').units;
var animations = require('./animations.js');
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
            reachableEnemies.sort(function (a, b) {
                return a.life - b.life || a.x - b.x || a.y - b.y;
            });
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
    this.life = this.maxLife = config.fighter.life;
    this.damage = config.fighter.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        var groundBlock = map.get(this.pos.sub(0, 0, 1));
        if (!groundBlock) {
            this.animation = new animations.FallingAnimation(
                this.pos, map.getUnitRenderPosition(this.pos.sub(0, 0, 1)), 15
            );
            this.pos = this.pos.sub(0, 0, 1);
            if (map.get(this.pos.sub(0, 0, 1))) {
                this.life -= config.fighter.fallDamage;
            }
            return;
        }
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation(15);
            return;
        }
        if (!map.target || this.pos.equals(map.target.pos)) {
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

        this.animation = new animations.MovementAnimation(
            map.getUnitRenderPosition(this.pos), map.getUnitRenderPosition(newPos), 15
        );
        this.pos = newPos;
    };

    this.render = function (canvas, map, tick) {
        canvas.translate3d(map.getUnitRenderPosition(this.pos));
        if (this.animation) {
            this.animation.beforeRendering(canvas);
        }
        canvas.drawPolygon('rgba(141,164,182,0.5)', [-5,6, 5,6, 5,25, -5,25], new UnitContext(this));
        canvas.drawPolygon('#46515a', [-6,5, 6,5, 6,6, -6,6]);
        canvas.drawPolygon('#46515a', [6,5, 6,25, 5,25, 5,5]);
        canvas.drawPolygon('#46515a', [-6,5, -6,25, -5,25, -5,5]);
        var partLife = this.life / this.maxLife;
        canvas.drawPolygon('#ee3796', [-5,25-19*partLife, 5,25-19*partLife, 5,25, -5,25]);
        canvas.drawPolygon('#db0087', [-5,25-15*partLife, 5,25, -5,25]);
        canvas.drawPolygon('#000', [-1,8, -1,11, -2,11, -2,8]);
        canvas.drawPolygon('#000', [2,8, 2,11, 3,11, 3,8]);
        if (this.animation) {
            this.animation.afterRendering(canvas);
            if (this.animation.hasEnded()) {
                this.animation = null;
            }
        }
        canvas.pop();
    };
};

exports.Climber = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'climber';
    this.life = this.maxLife = config.climber.life;
    this.damage = config.climber.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation(15);
            return;
        }
        if (!map.target || this.pos.equals(map.target.pos)) {
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

        this.animation = new animations.MovementAnimation(
            map.getUnitRenderPosition(this.pos), map.getUnitRenderPosition(newPos), 15
        );
        this.pos = newPos;
    };

    this.render = function (canvas, map, tick) {
        canvas.translate3d(map.getUnitRenderPosition(this.pos));
        if (this.animation) {
            this.animation.beforeRendering(canvas);
        }
        canvas.drawPolygon('rgba(141,164,182,0.5)', [-5,6, 5,6, 5,25, -5,25], new UnitContext(this));
        canvas.drawPolygon('#46515a', [-6,5, 6,5, 6,6, -6,6]);
        canvas.drawPolygon('#46515a', [6,5, 6,25, 5,25, 5,5]);
        canvas.drawPolygon('#46515a', [-6,5, -6,25, -5,25, -5,5]);
        var partLife = this.life / this.maxLife;
        canvas.drawPolygon('#24ff78', [-5,25-19*partLife, 5,25-19*partLife, 5,25, -5,25]);
        canvas.drawPolygon('#11c869', [-5,25-15*partLife, 5,25, -5,25]);
        canvas.drawPolygon('#000', [-1,8, -1,11, -2,11, -2,8]);
        canvas.drawPolygon('#000', [2,8, 2,11, 3,11, 3,8]);
        if (this.animation) {
            this.animation.afterRendering(canvas);
            if (this.animation.hasEnded()) {
                this.animation = null;
            }
        }
        canvas.pop();
    };
};

exports.Shadow = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'shadow';
    this.life = this.maxLife = config.shadow.life;
    this.damage = config.shadow.damage;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation(15);
        }
    };

    this.render = function (canvas, map, tick) {
        canvas.translate3d(map.getUnitRenderPosition(this.pos));
        if (this.animation) {
            this.animation.beforeRendering(canvas);
        }
        canvas.drawPolygon('rgba(141,164,182,0.5)', [-5,6, 5,6, 5,25, -5,25], new UnitContext(this));
        canvas.drawPolygon('#46515a', [-6,5, 6,5, 6,6, -6,6]);
        canvas.drawPolygon('#46515a', [6,5, 6,25, 5,25, 5,5]);
        canvas.drawPolygon('#46515a', [-6,5, -6,25, -5,25, -5,5]);
        var partLife = this.life / this.maxLife;
        canvas.drawPolygon('#3a0033', [-5,25-19*partLife, 5,25-19*partLife, 5,25, -5,25]);
        canvas.drawPolygon('#850075', [-1,8, -1,11, -2,11, -2,8]);
        canvas.drawPolygon('#850075', [2,8, 2,11, 3,11, 3,8]);
        if (this.animation) {
            this.animation.afterRendering(canvas);
            if (this.animation.hasEnded()) {
                this.animation = null;
            }
        }
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
