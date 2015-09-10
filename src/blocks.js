'use strict';

var MapContext = require('./context.js').MapContext;
var Vector = require('./vector.js').Vector;

exports.Cube = function (x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.type = 'cube';

    this.render = function (canvas) {
        if (this.z > 0) {
            canvas.drawPolygon3d('x', [0,0,0, 1,0,0, 1,0,1, 1,1,1, 0,1,1, 0,1,0], new MapContext(this, 'x'));
            canvas.drawPolygon3d('y', [1,1,0, 0,1,0, 0,1,1, 1,1,1], new MapContext(this, 'y'));
        }
        canvas.drawPolygon3d('z', [0,0,0, 1,0,0, 1,1,0, 0,1,0], new MapContext(this, 'z'));
    }
};

exports.Target = function (x, y, z) {
    this.pos = new Vector(x, y, z);
    this.type = 'target';

    this.render = function (canvas) {
        canvas.drawPolygon3d('rgba(137,247,254,.5)', [.2,.2,0, .8,.2,1, .8,.8,1]);
        canvas.drawPolygon3d('rgba(150,236,254,.5)', [.2,.2,0, .8,.8,1, .2,.8,1]);
    }
};

exports.Ramp = function (x, y, z, dir) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.dir = dir;
    this.type = 'ramp';

    this.render = function (canvas) {
        if (this.dir === 'y') {
            canvas.drawPolygon3d('yz', [1,0,0, 0,0,0, 0,1,1, 1,1,1], new MapContext(this, 'y'));
            canvas.drawPolygon3d('x', [1,0,0, 1,1,1, 1,0,1], new MapContext(this, 'x'));
        } else {
            canvas.drawPolygon3d('xz', [0,1,0, 0,0,0, 1,0,1, 1,1,1], new MapContext(this, 'x'));
            canvas.drawPolygon3d('y', [0,1,0, 1,1,1, 0,1,1], new MapContext(this, 'y'));
        }

    };
};
