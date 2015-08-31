'use strict';

function Vector(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
};

Vector.prototype.toString = function () {
    return '' + [this.x, this.y, this.z];
};

Vector.prototype.clone = function () {
    return new Vector(this.x, this.y, this.z);
};

Vector.prototype.equals = function (x, y, z) {
    if (y === undefined) {
        return this.equals(x.x, x.y, x.z);
    }
    return this.x === x && this.y === y && this.z === z;
};

Vector.prototype.add = function (x, y, z) {
    if (y === undefined) {
        return this.add(x.x, x.y, x.z);
    }
    return new Vector(this.x + x, this.y + y, this.z + z);
};

Vector.prototype.sub = function (x, y, z) {
    if (y === undefined) {
        return this.sub(x.x, x.y, x.z);
    }
    return new Vector(this.x - x, this.y - y, this.z - z);
};

Vector.prototype.diff = function (x, y, z) {
    if (y === undefined) {
        return this.diff(x.x, x.y, x.z);
    }
    return new Vector(Math.abs(this.x - x), Math.abs(this.y - y), Math.abs(this.z - z));
};

Vector.prototype.times = function (n) {
    return new Vector(this.x * n, this.y * n, this.z * n);
};

exports.Vector = Vector;
