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
            reachableEnemies.shift().damageTaken += this.damage;
            return true;
        }
        return false;
    },
    render: function (canvas, map, colors) {
        canvas.translate3d(map.getUnitRenderPosition(this.pos));
        if (this.animation) {
            this.animation.beforeRendering(canvas);
        }
        canvas.drawPolygon('rgba(141,164,182,0.5)', [-10,12, 10,12, 10,50, -10,50], new UnitContext(this));
        canvas.drawPolygon('#46515a', [-12,10, 12,10, 12,12, -12,12]);
        canvas.drawPolygon('#46515a', [12,10, 12,50, 10,50, 10,10]);
        canvas.drawPolygon('#46515a', [-12,10, -12,50, -10,50, -10,10]);
        var partLife = this.life / this.maxLife;
        canvas.drawPolygon(colors[0], [-10,50-38*partLife, 10,50-38*partLife, 10,50, -10,50]);
        canvas.drawPolygon(colors[1], [-10,50-30*partLife, 10,50, -10,50]);
        if (this.lookingLeft) {
            canvas.drawPolygon(colors[2], [-4,16, -4,22, -6,22, -6,16]);
            canvas.drawPolygon(colors[2], [2,16, 2,22, 4,22, 4,16]);
        } else {
            canvas.drawPolygon(colors[2], [-2,16, -2,22, -4,22, -4,16]);
            canvas.drawPolygon(colors[2], [4,16, 4,22, 6,22, 6,16]);
        }
        if (this.animation) {
            this.animation.afterRendering(canvas);
            if (this.animation.hasEnded()) {
                this.animation = null;
            }
        }
        canvas.pop();
    }
};

exports.Fighter = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'fighter';
    this.life = this.maxLife = config.fighter.life;
    this.damage = config.fighter.damage;
    this.damageTaken = 0;
    this.falling = false;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        var groundBlock = map.get(this.pos.sub(0, 0, 1));
        if (!groundBlock) {
            this.animation = new animations.FallingAnimation(
                this.pos, map.getUnitRenderPosition(this.pos.sub(0, 0, 1))
            );
            this.pos = this.pos.sub(0, 0, 1);
            this.falling = true;
            return;
        }
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation();
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
            map.getUnitRenderPosition(this.pos), map.getUnitRenderPosition(newPos)
        );

        if (newPos.x !== this.pos.x || newPos.y !== this.pos.y) {
            this.lookingLeft = newPos.x < this.pos.x || newPos.x > this.pos.x;
        }

        this.pos = newPos;
    };

    this.render = function (canvas, map) {
        Unit.render.call(this, canvas, map, ['#ee3796', '#db0087', '#000']);
    };
};

exports.Climber = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'climber';
    this.life = this.maxLife = config.climber.life;
    this.damage = config.climber.damage;
    this.damageTaken = 0;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation();
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
            map.getUnitRenderPosition(this.pos), map.getUnitRenderPosition(newPos)
        );

        if (newPos.x !== this.pos.x || newPos.y !== this.pos.y) {
            this.lookingLeft = newPos.x < this.pos.x || newPos.x > this.pos.x;
        }

        this.pos = newPos;
    };

    this.render = function (canvas, map) {
        Unit.render.call(this, canvas, map, ['#24ff78', '#11c869', '#000']);
    };
};

exports.Shadow = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'shadow';
    this.life = this.maxLife = config.shadow.life;
    this.damage = config.shadow.damage;
    this.damageTaken = 0;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation();
        }
    };

    this.render = function (canvas, map) {
        Unit.render.call(this, canvas, map, ['#3a0033', '#3a0033', '#850075']);
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
