'use strict';

var canvas = require('./canvas.js');
var events = require('./events.js');
var blockTypes = require('./blocks.js');
var unitTypes = require('./units.js');
var save = require('./save.js');

exports.start = function () {
    var lineLength = 0;
    var fps = 30;

    function render() {
        lineLength = lineLength + (250 - lineLength) / 12 + 1 | 0;

        canvas.reset();
        canvas.drawText('Castle Climb', 600, 100, 40);
        canvas.drawLine('#fff', [600 - lineLength, 115, 600 + lineLength, 115]);
        canvas.drawText('by Rebecca', 600, 140, 20);
        canvas.rotate(0.55);
        canvas.drawText('Level', 825, 257, 20);
        canvas.rotate(0);
        canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 360);

        for (var i = 0; i <= save.getUnlockedLevel(); i++) {
            canvas.translate3d(1, 1, i);
            var block = new blockTypes.Cube(0, i, 1);
            block.render(canvas);
            canvas.drawText(i + 1, -42, 40, 20, 'right');
            canvas.pop();
        }
        var unit = unitTypes.createUnit('fighter', 0, 0, 0);
        canvas.translate3d(1, 1, i);
        unit.render(canvas);
        canvas.pop();

        canvas.pop();
    }

    (function loop() {
        window.requestAnimationFrame(render);
        setTimeout(loop, 1000 / fps);
    })();

    events.on('canvas-clicked', function (data) {
        save.setCurrentLevel(data.block.y);
        document.location.href = 'play.html';
    });
};
