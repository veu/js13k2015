'use strict';

exports.MovementAnimation = function (last, current) {
    var step = 0;
    var length = 16;

    this.beforeRendering = function (canvas) {
        var part = step / (length - 1);
        canvas.translate3d(current.times(part).add(last.times(1 - part)).sub(current));
    };

    this.afterRendering = function (canvas) {
        canvas.pop();
        step++;
    };

    this.hasEnded = function () {
        return step === length;
    };
};

exports.FallingAnimation = function (last, current) {
    var step = 0;
    var length = 8;

    this.beforeRendering = function (canvas) {
        var part = step / (length - 1);
        canvas.translate3d(current.times(part).add(last.times(1 - part)).sub(current));
        canvas.rotate(0.1);
    };

    this.afterRendering = function (canvas) {
        canvas.rotate(0);
        canvas.pop();
        step++;
    };

    this.hasEnded = function () {
        return step === length;
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
};
