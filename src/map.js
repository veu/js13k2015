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
                        if (z == 1 && (y < 2 || y < 3 && x < 8)) {
                            if (y === 2 && x === 7) {
                                blocks[z][y][x] = new Ramp(x, y, z, 'y');
                            } else {
                                blocks[z][y][x] = new Cube(x, y, z);
                            }
                        }
                    }
                }
            }
        })();

        this.get = function (x, y, z) {
            return blocks[z] && blocks[z][y] && blocks[z][y][x];
        };

        var isValid = this.isValid = function (x, y, z) {
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
        };

        this.getDirectionsForTarget = function (target, climbing) {
            var distances = [],
                directions = [];
            for (var z = size.z; z--;) {
                distances[z] = [];
                directions[z] = [];
                for (var y = size.y; y--;) {
                    distances[z][y] = [];
                    directions[z][y] = [];
                    for (var x = size.x; x--;) {
                        distances[z][y][x] = 100000000;
                        directions[z][y][x] = null;
                    }
                }
            }

            var todo = [{x: target.x, y: target.y, z: target.z, distance: 0}];
            distances[target.z][target.y][target.x] = 0;
            while (todo.length > 0) {
                var current = todo.pop();
                this.getReachableNeighbors(current, climbing).forEach(function (neighbor) {
                    var distance = current.distance + 1;
                    if (!blocks[neighbor.z][neighbor.y][neighbor.x] && distances[neighbor.z][neighbor.y][neighbor.x] > distance) {
                        distances[neighbor.z][neighbor.y][neighbor.x] = distance;
                        directions[neighbor.z][neighbor.y][neighbor.x] = {x: current.x, y: current.y, z: current.z};
                        todo.push({x: neighbor.x, y: neighbor.y, z: neighbor.z, distance: distance});
                    }
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
                        var neighbor = {x: origin.x + x, y: origin.y + y, z: origin.z + z};
                        if ((x !== 0 || y !== 0 || z !== 0) &&
                            (x === 0 || y === 0) &&
                            this.isValid(neighbor.x, neighbor.y, neighbor.z) &&
                            (isReachableNeighbor(origin, neighbor, climbing))) {
                            neighbors.push(neighbor);
                        }
                    }
                }
            }
            return neighbors;
        };

        function isReachableNeighbor(a, b, climbing) {
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
                    return dir === bGround.dir;
                }
                // air to cube
                if (!aGround && bGround && bGround.type === 'cube')  {
                    return a.z === b.z;
                }
                // ramp to air
                if (aGround && aGround.type === 'ramp' && !bGround)  {
                    return dir === aGround.dir;
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
    }

}(Cube);
