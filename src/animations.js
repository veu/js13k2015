'use strict';

var Vector = require('./vector.js').Vector;

exports.MovementAnimation = function (last, current) {
    var step = 0;
    var length = 16;
    var isVertical = (last.x === current.x && last.y === current.y);

    this.beforeRendering = function (canvas) {
    };

    this.afterRendering = function (canvas) {
        step++;
    };

    this.hasEnded = function () {
        return step === length;
    };

    this.getPosition = function () {
        var part = step / (length - 1);
        var position = current.times(part).add(last.times(1 - part));
        if (!isVertical) {
            position = position.add(0, 0, [0,.03,.07,.03][step%4]);
        }
        return position;
    };
};

exports.FightingAnimation = function (unit) {
    var step = 0;
    var length = 16;

    this.beforeRendering = function (canvas) {
        var offset = Math.pow(7 - Math.abs(7 - step), 2) / 8;
        canvas.translate(unit.lookingLeft ? -offset : offset, -offset);
        canvas.rotate(unit.lookingLeft ? -step / length / 6 : step / length / 6);
    };

    this.afterRendering = function (canvas) {
        canvas.rotate(0);
        canvas.pop();
        step++;
    };

    this.hasEnded = function () {
        return step === length;
    };

    this.getPosition = function () {
    };
};

exports.AnimatedLine = function (maxLength) {
    var length = 0;

    this.render = function (canvas, x, y) {
        length = length + (maxLength - length) / 12 + 1 | 0;
        canvas.drawLine('#fff', [x - length, y, x + length, y]);
    }
};
