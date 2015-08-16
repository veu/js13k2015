var canvas = function () {
    'use strict';

    var width = 640;
    var height = 360;

    var blockSize = 8;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    var inputCanvas = document.createElement('canvas');
    var inputCtx = inputCanvas.getContext('2d');

    var translationStack = [];

    function drawPolygon(ctx, color, points) {
        ctx.beginPath();
        ctx.moveTo(points[0], points[1]);
        for (var i = 2; i < points.length; ++i) {
            ctx.lineTo(points[i], points[++i]);
        }
        ctx.lineTo(points[i - 1], points[i]);
        ctx.fillStyle = color;
        ctx.fill();
    }

    return {
        drawBackground: function () {
            canvas.width = inputCanvas.width = width;
            canvas.height = inputCanvas.height = height;
            ctx.fillStyle = '#222';
            ctx.fillRect(0, 0, width, height);
        },
        drawPolygon: function (color, points) {
            drawPolygon(ctx, color, points);
            drawPolygon(inputCtx, color, points);
        },
        drawPolygon3d: function (color, points) {
            var points2d = [];
            for (var i = 0; i < points.length; i += 3) {
                points2d.push((points[i] - points[i + 1]) * 2 * blockSize);
                points2d.push((points[i] + points[i + 1] + points[i + 2] * 2) * blockSize);
            }
            this.drawPolygon(color, points2d);
        },
        translate: function (x, y) {
            ctx.translate(x, y);
            inputCtx.translate(x, y);
            translationStack.push({x: x, y: y});
        },
        translate3d: function (x, y, z) {
            this.translate((x - y) * 2 * blockSize, (x + y - z * 2) * blockSize);
        },
        pop: function () {
            var translation = translationStack.pop();
            ctx.translate(-translation.x, -translation.y);
            inputCtx.translate(-translation.x, -translation.y);
        },
        getWidth: function () {
            return width;
        },
        getHeight: function () {
            return height;
        }
    }


}();
