var Cube = function (MapContext) {
    'use strict';

    return function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        this.type = 'cube';

        this.render = function (canvas) {
            canvas.drawPolygon3d('#ddd', [0,0,0, 1,0,0, 1,0,1, 1,1,1, 0,1,1, 0,1,0], new MapContext(this, 'x'));
            canvas.drawPolygon3d('#bbb', [1,1,0, 0,1,0, 0,1,1, 1,1,1], new MapContext(this, 'y'));
            canvas.drawPolygon3d('#fff', [0,0,0, 1,0,0, 1,1,0, 0,1,0], new MapContext(this, 'z'));
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
                canvas.drawPolygon3d('#eee', [1,0,0, 0,0,0, 0,1,1, 1,1,1], new MapContext(this, 'y'));
                canvas.drawPolygon3d('#ddd', [1,0,0, 1,1,1, 1,0,1], new MapContext(this, 'x'));
            } else {
                canvas.drawPolygon3d('#eee', [0,1,0, 0,0,0, 1,0,1, 1,1,1], new MapContext(this, 'x'));
                canvas.drawPolygon3d('#bbb', [0,1,0, 1,1,1, 0,1,1], new MapContext(this, 'y'));
            }

        }
    };

}(MapContext);
