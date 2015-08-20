'use strict';

exports.MapContext = function (block, face) {
    this.type = 'map';
    this.block = block;
    this.face = face;
};

exports.UnitContext = function (unit) {
    this.type = 'unit';
    this.unit = unit;
};
