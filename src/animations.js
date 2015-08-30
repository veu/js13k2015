'use strict';

exports.MovementAnimation = function (last, current, length) {
    var step = 0;

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
