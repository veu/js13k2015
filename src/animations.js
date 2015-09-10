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

exports.FightingAnimation = function () {
    var step = 0;
    var length = 16;

    this.beforeRendering = function (canvas) {
        canvas.translate(0, -Math.pow(7 - Math.abs(7 - step), 2) / 8);
    };

    this.afterRendering = function (canvas) {
        canvas.pop();
        step++;
    };

    this.hasEnded = function () {
        return step === length;
    };

    this.getPosition = function () {
    };
};
