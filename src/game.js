var Game = function (Events, Cube, Ramp) {
    var MODE_EDITOR = 0;
    var MODE_PLAY = 1;
    var mode = MODE_EDITOR;
    var fps = 30;

    var map = new Map();

    function addBlock(x, y, z) {
            map.set(x, y, z, new Cube(x, y, z));
    }

    function removeBlock(x, y, z) {
            map.set(x, y, z, null);
    }

    function render() {
        canvas.drawBackground();
        map.render(canvas);
    }

    (function loop() {
        window.requestAnimationFrame(render);

        setTimeout(loop, 1000 / fps);
    })();

    Events.on('canvas-clicked', function (data) {
        if (mode === MODE_EDITOR) {
            var block = data.block;
            if (!map.isValid(block.x, block.y, block.z)) {
                return;
            }
            if (event.button === 1) {
                console.log(block);
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
                map.set(
                    block.x + +(data.face === 'x'), block.y + +(data.face === 'y'), block.z + +(data.face === 'z'),
                    new Cube(block.x, block.y, block.z)
                );
            }
        };
    });
}(Events, Cube, Ramp);
