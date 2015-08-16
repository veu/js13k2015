var Game = function (Events, Cube) {
    var MODE_EDITOR = 0;
    var MODE_PLAY = 1;
    var mode = MODE_EDITOR;
    var fps = 30;

    var map = new Map();

    function addBlock(x, y, z) {
        if (map.isValid(x, y, z)) {
            map.set(x, y, z, new Cube(x, y, z));
        }
    }

    function removeBlock(x, y, z) {
        if (map.isValid(x, y, z)) {
            map.set(x, y, z, null);
        }
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
            if (data.event.shiftKey) {
                removeBlock(block.x, block.y, block.z);
            } else {
                addBlock(block.x + +(data.face === 'x'), block.y + +(data.face === 'y'), block.z + +(data.face === 'z'));
            }
        };
    });
}(Events, Cube);
