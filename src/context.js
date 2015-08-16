var MapContext = function () {
    'use strict';

    return function (block, face) {
        this.type = 'map';
        this.block = block;
        this.face = face;
    }
}();
