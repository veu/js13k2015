'use strict';

var canvas = require('./canvas.js');
var events = require('./events.js');
var blockTypes = require('./blocks.js');
var unitTypes = require('./units.js');
var save = require('./save.js');

exports.start = function () {
    function render() {
        canvas.drawBackground();
        canvas.drawText('Castle Climb', 600, 100, 40);
        canvas.rotate(0.55);
        canvas.drawText('Level', 825, 257, 20);
        canvas.rotate(0);
        canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 360);

        for (var i = 0; i <= localStorage['unlockedLevel']; i++) {
            canvas.translate3d(1, 1, i);
            var block = new blockTypes.Cube(0, i, 0);
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
    render();

    events.on('canvas-clicked', function (data) {
        save.setCurrentLevel(data.block.y);
        document.location.href = 'play.html';
    });
};
