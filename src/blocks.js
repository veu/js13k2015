var Cube = function () {
    'use strict';

    return function () {
        this.render = function (canvas) {
        canvas.drawPolygon3d('#fff', [0,0,0, 1,0,0, 1,1,0, 0,1,0]);
        canvas.drawPolygon3d('#ddd', [1,1,0, 1,0,0, 1,0,1, 1,1,1]);
        canvas.drawPolygon3d('#bbb', [1,1,0, 0,1,0, 0,1,1, 1,1,1]);
        }
    };

}();
