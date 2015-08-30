'use strict';

var events = require('./events.js');

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

var currentTranslation;
var translationStack = [];
var inputData = {};
var inputIndex = 0;

var gradients = {
    x: ctx.createRadialGradient(
        width / 2 + 140, height / 2 + 90, 200,
        width / 2 + 140, height / 2 + 90, 60
    ),
    xz: ctx.createRadialGradient(
        width / 2 + 140, height / 2 - 90, 200,
        width / 2 + 140, height / 2 - 90, 60
    ),
    y: ctx.createRadialGradient(
        width / 2 - 140, height / 2 + 90, 200,
        width / 2 - 140, height / 2 + 90, 60
    ),
    yz: ctx.createRadialGradient(
        width / 2 - 140, height / 2 - 90, 200,
        width / 2 - 140, height / 2 - 90, 60
    ),
    z: ctx.createRadialGradient(
        width / 2, height / 2 - 180, 140,
        width / 2, height / 2 - 180, 200
    )
};

gradients.x.addColorStop(0, '#f5e7d3');
gradients.x.addColorStop(1, '#dfd2c0');
gradients.xz.addColorStop(0, '#f9f2dc');
gradients.xz.addColorStop(1, '#efe8d7');
gradients.y.addColorStop(0, '#d9cbc4');
gradients.y.addColorStop(1, '#c4b8b1');
gradients.yz.addColorStop(0, '#ebe4d5');
gradients.yz.addColorStop(1, '#d1dbd0');
gradients.z.addColorStop(0, '#fefee6');
gradients.z.addColorStop(1, '#ffffef');

function drawPolygon(ctx, color, points) {
    ctx.beginPath();
    ctx.moveTo(currentTranslation.x + points[0], currentTranslation.y + points[1]);
    for (var i = 2; i < points.length; ++i) {
        ctx.lineTo(currentTranslation.x + points[i], currentTranslation.y + points[++i]);
    }
    ctx.lineTo(currentTranslation.x + points[i - 1], currentTranslation.y + points[i]);
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
    events.emit('canvas-clicked', data);
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

exports.drawBackground = function () {
    canvas.width = inputCanvas.width = width;
    canvas.height = inputCanvas.height = height;
    ctx.fillStyle = '#3a0033';
    ctx.fillRect(0, 0, width, height);
    inputData = {};
    inputIndex = 0;
    currentTranslation = {x: 0, y: 0};
};

exports.drawPolygon = function (color, points, data) {
    drawPolygon(ctx, color, points);

    if (data) {
        var i = inputIndex += 13;
        inputData[i] = data;
        color = 'rgb(' + [((i >> 8) + i) & 255, (i >> 8) & 255, i & 255] + ')';
        drawPolygon(inputCtx, color, points);
    }
};

exports.drawPolygon3d = function (color, points, data) {
    if (gradients[color]) {
         color = gradients[color];
    }

    var points2d = [];
    for (var i = 0; i < points.length; i += 3) {
        points2d.push((points[i] - points[i + 1]) * 2 * blockSize);
        points2d.push((points[i] + points[i + 1] + points[i + 2] * 2) * blockSize);
    }
    this.drawPolygon(color, points2d, data);
};

exports.drawText = function (text, x, y) {
    ctx.fillStyle = '#ccc';
    ctx.fillText(text, currentTranslation.x + x, currentTranslation.y + y);
};

exports.translate = function (x, y) {
    currentTranslation.x += x;
    currentTranslation.y += y;
    translationStack.push({x: x, y: y});
};

exports.translate3d = function (x, y, z) {
    if (y === undefined) {
        this.translate3d(x.x, x.y, x.z);
        return;
    }
    this.translate((x - y) * 2 * blockSize, (x + y - z * 2) * blockSize);
};

exports.pop = function () {
    var translation = translationStack.pop();
    currentTranslation.x -= translation.x;
    currentTranslation.y -= translation.y;
};

exports.getWidth = function () {
    return width;
};

exports.getHeight = function () {
    return height;
};
