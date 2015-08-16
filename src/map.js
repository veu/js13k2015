var Map = function (Cube) {
    'use strict';

    return function () {
        var blocks = [];
        var size = {x: 9, y: 9, z: 9};

        (function init() {
            for (var z = size.z; z--;) {
                blocks[z] = [];
                for (var y = size.y; y--;) {
                    blocks[z][y] = [];
                    for (var x = size.x; x--;) {
                        blocks[z][y][x] = null;
                        if (z == 0) {
                            blocks[z][y][x] = new Cube(x, y, z);
                        }
                        if (z == 1 && y < 3) {
                            if (y === 2 && x === 8) {
                                blocks[z][y][x] = new Ramp(x, y, z);
                            } else {
                                blocks[z][y][x] = new Cube(x, y, z);
                            }
                        }
                    }
                }
            }
        })();

        this.get = function (x, y, z) {
            return blocks[z][y][x];
        };

        this.isValid = function (x, y, z) {
            try {
                blocks[z][y][x];
                return true;
            } catch (e) {
                return false;
            }
        };

        this.set = function (x, y, z, block) {
            blocks[z][y][x] = block;
        };

        this.render = function (canvas) {
            canvas.translate(canvas.getWidth() / 2, canvas.getHeight() - 180);
            for (var z in blocks) {
                for (var y in blocks[z]) {
                    for (var x in blocks[z][y]) {
                        if (blocks[z][y][x]) {
                            canvas.translate3d(+x, +y, +z);
                            blocks[z][y][x].render(canvas);
                            canvas.pop();
                        }
                    }
                }
            }
            canvas.pop();
        }
    }

}(Cube);
