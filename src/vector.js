'use strict';

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vector.prototype.clone = function () {
    return new Vector(this.x, this.y, this.z);
};

Vector.prototype.equals = function (vector) {
    return this.x === vector.x && this.y === vector.y && this.z === vector.z;
};

Vector.prototype.add = function (vector) {
    return new Vector(
        this.x + vector.x,
        this.y + vector.y,
        this.z + vector.z
    );
};

Vector.prototype.sub = function (vector) {
    return new Vector(
        this.x - vector.x,
        this.y - vector.y,
        this.z - vector.z
    );
};

Vector.prototype.diff = function (vector) {
    return new Vector(
        Math.abs(this.x - vector.x),
        Math.abs(this.y - vector.y),
        Math.abs(this.z - vector.z)
    );
};

exports.Vector = Vector;
