var Fighter = function () {
    return function (x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;

        this.move = function (map) {
            if (this.target) {
                var directions = map.getDirectionsForTarget(this.target);
                var newPos = directions[this.z][this.y][this.x];
                if (!newPos) {
                    this.target = null;
                    return;
                }
                this.x = newPos.x;
                this.y = newPos.y;
                this.z = newPos.z;
                if (this.x === this.target.x && this.y === this.target.y && this.z === this.target.z) {
                    this.target = null;
                }
            }
        };

        this.render = function (canvas, map) {
            var z = this.z;
            if (map.get(this.x, this.y, this.z - 1).type === 'ramp') {
                z -= 0.5;
            }
            canvas.translate3d(this.x, this.y, z);
            canvas.drawPolygon('#aaa', [-6,5, 6,5, 6,25, -6,25]);
            canvas.drawPolygon('#000', [-2,8, -2,11, -4,11, -4,8]);
            canvas.drawPolygon('#000', [2,8, 2,11, 4,11, 4,8]);
            canvas.pop();
        };
    };
}();
