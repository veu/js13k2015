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
            return blocks[z][y][x];
        };

        this.isValid = function (x, y, z) {
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

        this.getDirectionsForTarget = function (target) {
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
                this.getReachableNeighbors(current).forEach(function (neighbor) {
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

        this.getReachableNeighbors = function (origin) {
            var neighbors = [];
            for (var z = -1; z < 2; z++) {
                for (var y = -1; y < 2; y++) {
                    for (var x = -1; x < 2; x++) {
                        var neighbor = {x: origin.x + x, y: origin.y + y, z: origin.z + z};
                        if ((x !== 0 || y !== 0 || z !== 0) &&
                            neighbor.x >= 0 && neighbor.x < size.x &&
                            neighbor.y >= 0 && neighbor.y < size.y &&
                            neighbor.z > 0 && neighbor.z < size.z &&
                            isReachableNeighbor(origin, neighbor)) {
                                neighbors.push(neighbor);

                        }
                    }
                }
            }
            return neighbors;
        };

        function isReachableNeighbor(origin, neighbor) {
            if (blocks[neighbor.z][neighbor.y][neighbor.x] || !blocks[neighbor.z - 1][neighbor.y][neighbor.x]) {
                return false;
            }
            if (Math.abs(origin.y - neighbor.y) + Math.abs(origin.x - neighbor.x) > 1) {
                return false;
            }
            if (neighbor.z === origin.z &&
                blocks[neighbor.z - 1][neighbor.y][neighbor.x].type !== 'ramp' &&
                blocks[origin.z - 1][origin.y][origin.x].type !== 'ramp') {
                return true;
            }
            if (blocks[neighbor.z - 1][neighbor.y][neighbor.x].type === 'ramp') {
                if (blocks[neighbor.z - 1][neighbor.y][neighbor.x].dir === 'x' && origin.y === neighbor.y) {
                    return true;
                }
                if (blocks[neighbor.z - 1][neighbor.y][neighbor.x].dir === 'y' && origin.x === neighbor.x) {
                    return true;
                }
            }
            if (blocks[origin.z - 1][origin.y][origin.x].type === 'ramp') {
                if (blocks[origin.z - 1][origin.y][origin.x].dir === 'x' && origin.y === neighbor.y) {
                    return true;
                }
                if (blocks[origin.z - 1][origin.y][origin.x].dir === 'y' && origin.x === neighbor.x) {
                    return true;
                }
            }
            return false;
        };
    }

}(Cube);
