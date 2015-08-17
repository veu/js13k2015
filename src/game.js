var Game = function (Events, Cube, Ramp, Fighter) {
    var MODE_EDITOR = 0;
    var MODE_PLAY = 1;
    var mode = MODE_EDITOR;
    var fps = 30;

    var map = new Map();
    var unitPositions = [];
    var units = [];
    var placeableElements = [
        new Cube(0, 0, 0),
        new Ramp(0, 0, 0, 'x'),
        new Ramp(0, 0, 0, 'y'),
        new Fighter(0, 0, 0)
    ];
    var selectedPlaceableIndex = 0;

    var tick = 0;

    function update() {
        if (mode === MODE_PLAY) {
            if (tick % 15 === 0) {
                units.forEach(function (unit) {
                    unit.move(map, units);
                });
            }
        }
        tick++;
    }

    function render() {
        canvas.drawBackground();
        if (mode === MODE_EDITOR) {
            canvas.drawText('edit mode', 10, 20);

            canvas.translate(35, 30);
            placeableElements[selectedPlaceableIndex].render(canvas, map);
            canvas.pop();
        }
        canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 180);
        map.render(canvas);
        if (mode === MODE_EDITOR) {
            unitPositions.forEach(function (unit) {
                unit.render(canvas, map);
            });
        } else {
            units.forEach(function (unit) {
                unit.render(canvas, map);
            });
        }
        canvas.pop();
    }

    (function loop() {
        update();
        window.requestAnimationFrame(render);
        setTimeout(loop, 1000 / fps);
    })();

    document.onkeydown = function (event) {
        var key = String.fromCharCode(event.keyCode);
        if (key === 'E') {
            mode = mode === MODE_PLAY ? MODE_EDITOR : MODE_PLAY;
        }
        if (mode === MODE_PLAY) {
            units = unitPositions.map(function (unit) {
                return new Fighter(unit.x, unit.y, unit.z);
            });
        }
    };

    document.onmousewheel = function (event) {
        if (event.wheelDelta > 0) {
            selectedPlaceableIndex++;
        } else {
            selectedPlaceableIndex--;
        }
        selectedPlaceableIndex = (selectedPlaceableIndex + placeableElements.length) % placeableElements.length;
    }

    Events.on('canvas-clicked', function (context) {
        if (mode === MODE_PLAY) {
            var target = {};
            for (var i in context.block) {
                target[i] = context.block[i];
            }
            target.z++;
            units.forEach(function (unit) { unit.target = target; });
        }

        if (mode === MODE_EDITOR) {
            if (context.type === 'unit') {
                unitPositions = unitPositions.filter(function (unit) {
                    return unit.x !== context.unit.x || unit.y !== context.unit.y || unit.z !== context.unit.z;
                })
                return;
            }
            var block = context.block;
            var element = placeableElements[selectedPlaceableIndex];
            if (event.shiftKey) {
                map.set(block.x, block.y, block.z, null);
            } else {
                var x = block.x + +(context.face === 'x');
                var y = block.y + +(context.face === 'y');
                var z = block.z + +(context.face === 'z');
                if (!map.isValid(x, y, z)) {
                    return;
                }
                var spotTaken = unitPositions.some(function (unit) {
                    return unit.x === x && unit.y === y && unit.z === z;
                });
                if (spotTaken) {
                    return;
                }
                if (element.type === 'cube') {
                    map.set(x, y, z, new Cube(x, y, z));
                } else if (element.type === 'ramp') {
                    map.set(x, y, z, new Ramp(x, y, z, element.dir));
                } else if (element.type === 'fighter') {
                    unitPositions.push(new Fighter(x, y, z));
                }
            }
        };
    });
}(Events, Cube, Ramp, Fighter);
