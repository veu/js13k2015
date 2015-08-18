var canvas = function (Events) {
    'use strict';

    var width = 640;
    var height = 360;

    var scale = 1;
    var offsetX = 0;
    var offsetY = 0;

    var blockSize = 8;

    var canvas = document.createElement('canvas');
    var ctx = canvas.getContext('2d');
    document.body.appendChild(canvas);

    var inputCanvas = document.createElement('canvas');
    var inputCtx = inputCanvas.getContext('2d');

    var translationStack = [];
    var inputData = {};
    var inputIndex = 0;

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

    canvas.onclick = function (event) {
        var x = (event.pageX - offsetX) / scale | 0;
        var y = (event.pageY - offsetY) / scale | 0;
        var imageData = inputCtx.getImageData(x, y, 1, 1).data;
        if (imageData[0] !== ((imageData[1] + imageData[2]) & 255) || imageData[3] !== 255) {
            return;
        }
        var i = (imageData[1] << 8) | imageData[2];
        if (!inputData[i]) {
            return;
        }

        var data = {};
        for (var d in inputData[i]) {
            data[d] = inputData[i][d];
        }
        data.event = event;
        Events.emit('canvas-clicked', data);
    }

    var resize = window.onresize = function () {
        scale = Math.min(window.innerWidth / width, window.innerHeight / height);
        offsetX = (window.innerWidth - width * scale) / 2 | 0;
        offsetY = (window.innerHeight - height * scale) / 2 | 0;
        canvas.style.width = (width * scale | 0) + 'px';
        canvas.style.height = (height * scale | 0) + 'px';
        canvas.style.left = offsetX + 'px';
        canvas.style.top = offsetY + 'px';
    };
    resize();

    return {
        drawBackground: function () {
            canvas.width = inputCanvas.width = width;
            canvas.height = inputCanvas.height = height;
            ctx.fillStyle = '#3a0033';
            ctx.fillRect(0, 0, width, height);
            inputData = {};
            inputIndex = 0;
        },
        drawPolygon: function (color, points, data) {
            drawPolygon(ctx, color, points);

            if (data) {
                var i = inputIndex += 13;
                inputData[i] = data;
                color = 'rgb(' + [((i >> 8) + i) & 255, (i >> 8) & 255, i & 255] + ')';
                drawPolygon(inputCtx, color, points);
            }
        },
        drawPolygon3d: function (color, points, data) {
            var points2d = [];
            for (var i = 0; i < points.length; i += 3) {
                points2d.push((points[i] - points[i + 1]) * 2 * blockSize);
                points2d.push((points[i] + points[i + 1] + points[i + 2] * 2) * blockSize);
            }
            this.drawPolygon(color, points2d, data);
        },
        drawText: function (text, x, y) {
            ctx.fillStyle = '#ccc';
            ctx.fillText(text, x, y);
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


}(Events);
