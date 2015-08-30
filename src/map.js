'use strict';

var blockTypes = require('./blocks.js');
var Vector = require('./vector.js').Vector;

var TYPE_EMPTY = 0;
var TYPE_CUBE = 1;
var TYPE_RAMPX = 2;
var TYPE_RAMPY = 3;

exports.Map = function (save) {
    var blocks = [];
    var size = new Vector(9, 9, 9);

    this.size = size;
    this.target = null;

    (function init() {
        save = save && atob(save);
        for (var z = size.z; z--;) {
            blocks[z] = [];
            for (var y = size.y; y--;) {
                blocks[z][y] = [];
                for (var x = size.x; x--;) {
                    blocks[z][y][x] = null;
                    if (save) {
                        var index = (z * size.y + y) * size.x + x;
                        var type = (save.charCodeAt(index >> 2) >> ((index % 4) * 2)) & 3;
                        if (type === TYPE_CUBE) {
                            blocks[z][y][x] = new blockTypes.Cube(x, y, z);
                        } else if (type === TYPE_RAMPX) {
                            blocks[z][y][x] = new blockTypes.Ramp(x, y, z, 'x');
                        } else if (type === TYPE_RAMPY) {
                            blocks[z][y][x] = new blockTypes.Ramp(x, y, z, 'y');
                        }
                    } else if (z == 0) {
                        blocks[z][y][x] = new blockTypes.Cube(x, y, z);
                    }
                }
            }
        }
    }).call(this);

    this.get = function (x, y, z) {
        if (y === undefined) {
            return blocks[x.z] && blocks[x.z][x.y] && blocks[x.z][x.y][x.x];
        }

        return blocks[z] && blocks[z][y] && blocks[z][y][x];
    };

    var isValid = this.isValid = function (x, y, z) {
        if (y === undefined) {
            return isValid(x.x, x.y, x.z);
        }

        if (z < 0 || z >= size.z || y < 0 || y >= size.y || x < 0 || x >= size.x) {
            return false;
        }
        return true;
    };

    this.set = function (x, y, z, block) {
        blocks[z][y][x] = block;
    };

    this.render = function (canvas) {
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

        if (this.target) {
            canvas.translate3d(this.target.pos);
            this.target.render(canvas);
            canvas.pop();
        }
    };

    this.getDirectionsForTarget = function (target, climbing) {
        var distances = {};
        var directions = {};

        var todo = [{pos: target, distance: 0}];
        distances[target] = 0;
        while (todo.length > 0) {
            var current = todo.pop();
            this.getReachableNeighbors(current.pos, climbing).forEach(function (neighbor) {
                var distance = current.distance + 1;
                if (blocks[neighbor.z][neighbor.y][neighbor.x] || distances[neighbor] <= distance) {
                    return;
                }
                distances[neighbor] = distance;
                directions[neighbor] = current.pos;
                todo.push({pos: neighbor, distance: distance});
            }, this);
            todo.sort(function (a, b) { return b.distance - a.distance; });
        }

        return directions;
    };

    this.getReachableNeighbors = function (origin, climbing) {
        var neighbors = [];
        for (var z = -1; z < 2; z++) {
            for (var y = -1; y < 2; y++) {
                for (var x = -1; x < 2; x++) {
                    var neighbor = origin.add(x, y, z);
                    if ((x === 0 || y === 0) && isReachableNeighbor(origin, neighbor, climbing)) {
                        neighbors.push(neighbor);
                    }
                }
            }
        }
        return neighbors;
    };

    this.toString = function() {
        var blockTypes = [];
        for (var z in blocks) {
            for (var y in blocks[z]) {
                for (var x in blocks[z][y]) {
                    var type = TYPE_EMPTY;
                    if (blocks[z][y][x]) {
                        if (blocks[z][y][x].type === 'cube') {
                            type = TYPE_CUBE;
                        }
                        if (blocks[z][y][x].type === 'ramp') {
                            type = blocks[z][y][x].dir === 'x' ? TYPE_RAMPX : TYPE_RAMPY;
                        }
                    }
                    blockTypes.push(type);
                }
            }
        }

        var compressedBlockTypes = '';
        for (var i = 0; i < blockTypes.length; i += 4) {
            var value =
                (blockTypes[i] || 0) |
                (blockTypes[i + 1] || 0) << 2 |
                (blockTypes[i + 2] || 0) << 4 |
                (blockTypes[i + 3] || 0) << 6;
            compressedBlockTypes += String.fromCharCode(value);
        }

        return btoa(compressedBlockTypes);
    };

    this.getTopBlockAt = function (x, y) {
        for (var z = size.z; z--;) {
            if (blocks[z][y][x]) {
                return blocks[z][y][x];
            }
        }
    };

    this.getUnitRenderPosition = function (position) {
        var ground = this.get(position.sub(0, 0, 1));
        if (ground && ground.type === 'ramp') {
            return position.sub(0, 0, 0.5);
        }
        return position;
    };

    function isReachableNeighbor(a, b, climbing) {
        if (!isValid(b) || a.equals(b)) {
            return false;
        }

        if (a.z === 0 || b.z === 0) {
            return false;
        }
        if (blocks[b.z][b.y][b.x]) {
            return false;
        }

        var aGround = blocks[a.z - 1][a.y][a.x];
        var bGround = blocks[b.z - 1][b.y][b.x];
        var dir = a.x !== b.x ? 'x' : a.y !== b.y ? 'y' : 'z';

        // not climbing
        if (aGround && bGround) {
            // cube to ramp
            if (aGround.type === 'cube' && bGround.type === 'ramp')  {
                return dir === bGround.dir;
            }
            // ramp to cube
            if (aGround.type === 'ramp' && bGround.type === 'cube')  {
                return dir === aGround.dir;
            }
            // ramp to ramp
            if (aGround.type === 'ramp' && bGround.type === 'ramp')  {
                return dir === aGround.dir && dir === bGround.dir;
            }
            // cube to cube
            return a.z === b.z;
        }

        // climbing
        if (climbing) {
            // strictly up / down
            if (dir === 'z') {
                return isNextToClimbableAWall(a.x, a.y, Math.min(a.z, b.z));
            }
            // air to ramp
            if (!aGround && bGround && bGround.type === 'ramp')  {
                return dir === bGround.dir && a.z < b.z;
            }
            // air to cube
            if (!aGround && bGround && bGround.type === 'cube')  {
                return a.z === b.z;
            }
            // ramp to air
            if (aGround && aGround.type === 'ramp' && !bGround)  {
                return dir === aGround.dir && a.z > b.z;
            }
            // cube to air
            if (aGround && aGround.type === 'cube' && !bGround)  {
                return a.z === b.z;
            }
        }

        return false;
    };

    function isNextToClimbableAWall(x, y, z) {
        var adjacent = [{x: 1, y: 0}, {x: -1, y: 0}, {x: 0, y: 1}, {x: 0, y: -1}];

        return adjacent.some(function (dir) {
            if (!isValid(x + dir.x, y + dir.y, z) || !isValid(x + dir.x, y + dir.y, z + 1)) {
                return false;
            }

            var lower = blocks[z][y + dir.y][x + dir.x];

            return lower && lower.type === 'cube';
        });
    }
};
