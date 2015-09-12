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
            var attackedEnemy = reachableEnemies.shift();
            attackedEnemy.damageTaken += this.damage;
            this.lookingLeft = this.pos.y < attackedEnemy.pos.y || this.pos.x > attackedEnemy.pos.x;
            return true;
        }


        return false;
    },
    render: function (canvas, colors) {
        if (this.animation) {
            this.animation.beforeRendering(canvas);
        }
        canvas.drawPolygon('rgba(141,164,182,0.5)', [-10,22, 10,22, 10,50, -10,50], new UnitContext(this));
        canvas.drawPolygon('#46515a', [-12,20, 12,20, 12,22, -12,22]);
        canvas.drawPolygon('#46515a', [12,20, 12,50, 10,50, 10,20]);
        canvas.drawPolygon('#46515a', [-12,20, -12,50, -10,50, -10,20]);
        var partLife = this.life / this.maxLife;
        canvas.drawPolygon(colors[0], [-10,50-28*partLife, 10,50-28*partLife, 10,50, -10,50]);
        canvas.drawPolygon(colors[1], [-10,50-20*partLife, 10,50, -10,50]);
        if (this.lookingLeft) {
            canvas.drawPolygon(colors[2], [-4,26, -4,32, -6,32, -6,26]);
            canvas.drawPolygon(colors[2], [0,26, 0,32, 2,32, 2,26]);
        } else {
            canvas.drawPolygon(colors[2], [0,26, 0,32, -2,32, -2,26]);
            canvas.drawPolygon(colors[2], [4,26, 4,32, 6,32, 6,26]);
        }
        if (this.animation) {
            this.animation.afterRendering(canvas);
            if (this.animation.hasEnded()) {
                this.animation = null;
            }
        }
    }
};

exports.Fighter = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'fighter';
    this.life = this.maxLife = config.fighter.life;
    this.damage = config.fighter.damage;
    this.damageTaken = 0;
    this.fallDamageTaken = 0;
    this.falling = false;

    this.attack = Unit.attack;

    this.move = function (map, units) {
        var groundBlock = map.get(this.pos.sub(0, 0, 1));
        if (!groundBlock) {
            this.animation = new animations.MovementAnimation(
                map.getUnitRenderPosition(this.pos), map.getUnitRenderPosition(this.pos.sub(0, 0, 1))
            );
            this.pos = this.pos.sub(0, 0, 1);
            this.falling = true;
            return;
        }
        if (this.attack(map, units)) {
            this.animation = new animations.FightingAnimation(this);
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

    this.render = function (canvas) {
        if (this.falling) {
            canvas.rotate(0.1);
        }
        Unit.render.call(this, canvas, ['#ee3796', '#db0087', '#000']);
        if (this.falling) {
            canvas.rotate(0);
        }
    };

    this.getRenderPosition = function (map) {
        return this.animation && this.animation.getPosition() || map.getUnitRenderPosition(this.pos);
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
            this.animation = new animations.FightingAnimation(this);
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

    this.render = function (canvas) {
        Unit.render.call(this, canvas, ['#24ff78', '#11c869', '#000']);
    };

    this.getRenderPosition = function (map) {
        return this.animation && this.animation.getPosition() || map.getUnitRenderPosition(this.pos);
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
            this.animation = new animations.FightingAnimation(this);
        }
    };

    this.render = function (canvas) {
        Unit.render.call(this, canvas, ['#3a0033', '#3a0033', '#850075']);
    };

    this.getRenderPosition = function (map) {
        return this.pos;
    }
};

exports.createUnit = function (type, x, y, z) {
    var types = {
        climber: exports.Climber,
        fighter: exports.Fighter,
        shadow: exports.Shadow
    };

    return new types[type](x, y, z);
};
