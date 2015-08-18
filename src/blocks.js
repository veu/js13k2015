var Cube = function (MapContext) {
    'use strict';

    return function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = 'cube';

        this.render = function (canvas) {
            canvas.drawPolygon3d('#dfd2c0', [0,0,0, 1,0,0, 1,0,1, 1,1,1, 0,1,1, 0,1,0], new MapContext(this, 'x'));
            canvas.drawPolygon3d('#cec1ba', [1,1,0, 0,1,0, 0,1,1, 1,1,1], new MapContext(this, 'y'));
            canvas.drawPolygon3d('#ffffe1', [0,0,0, 1,0,0, 1,1,0, 0,1,0], new MapContext(this, 'z'));
        }
    };

}(MapContext);

var Ramp = function (MapContext) {
    'use strict';

    return function (x, y, z, dir) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.dir = dir;
        this.type = 'ramp';

        this.render = function (canvas) {
            if (this.dir === 'y') {
                canvas.drawPolygon3d('#f1ecd3', [1,0,0, 0,0,0, 0,1,1, 1,1,1], new MapContext(this, 'y'));
                canvas.drawPolygon3d('#dfd2c0', [1,0,0, 1,1,1, 1,0,1], new MapContext(this, 'x'));
            } else {
                canvas.drawPolygon3d('#f1ebd2', [0,1,0, 0,0,0, 1,0,1, 1,1,1], new MapContext(this, 'x'));
                canvas.drawPolygon3d('#cec1ba', [0,1,0, 1,1,1, 0,1,1], new MapContext(this, 'y'));
            }

        }
    };

}(MapContext);
