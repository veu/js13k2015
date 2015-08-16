var Game = function (Events, Cube, Ramp, Fighter) {
    var MODE_EDITOR = 0;
    var MODE_PLAY = 1;
    var mode = MODE_PLAY;
    var fps = 30;

    var map = new Map();
    var units = [new Fighter(8, 8, 1)];

    var tick = 0;

    function update() {
        if (tick % 15 === 0) {
            units.forEach(function (unit) {
                unit.move(map);
            });
        }
        tick++;
    }

    function render() {
        canvas.drawBackground();
        canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 180);
        map.render(canvas);
        units.forEach(function (unit) {
            unit.render(canvas, map);
        });
        canvas.pop();
    }

    (function loop() {
        update();
        window.requestAnimationFrame(render);
        setTimeout(loop, 1000 / fps);
    })();

    Events.on('canvas-clicked', function (data) {
        if (mode === MODE_PLAY) {
            var target = {};
            for (var i in data.block) {
                target[i] = data.block[i];
            }
            target.z++;
            units[0].target = target;
        }

        if (mode === MODE_EDITOR) {
            var block = data.block;
            if (event.button === 1) {
                if (block.type === 'cube') {
                    map.set(block.x, block.y, block.z, new Ramp(block.x, block.y, block.z, 'x'));
                } else if (block.dir === 'x') {
                    map.set(block.x, block.y, block.z, new Ramp(block.x, block.y, block.z, 'y'));
                } else {
                    map.set(block.x, block.y, block.z, new Cube(block.x, block.y, block.z));
                }
            } else if (data.event.shiftKey) {
                map.set(block.x, block.y, block.z, null);
            } else {
                var x = block.x + +(data.face === 'x');
                var y = block.y + +(data.face === 'y');
                var z = block.z + +(data.face === 'z');
                if (map.isValid(x, y, z)) {
                    map.set(x, y, z, new Cube(x, y, z));
                }
            }
        };
    });
}(Events, Cube, Ramp, Fighter);
