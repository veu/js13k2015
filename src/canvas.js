'use strict';

var events = require('./events.js');

var width = 1200;
var height = 900;

var scale = 1;
var offsetX = 0;
var offsetY = 0;

var blockSize = 16;

var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
document.body.appendChild(canvas);

var inputCanvas = document.createElement('canvas');
var inputCtx = inputCanvas.getContext('2d');

var currentTranslation;
var translationStack = [];
var currentRotation = 0;
var inputData = {};
var inputIndex = 0;

function drawPolygon(ctx, color, points) {
    ctx.translate(currentTranslation.x, currentTranslation.y);
    ctx.rotate(currentRotation);
    ctx.beginPath();
    ctx.moveTo(points[0], points[1]);
    for (var i = 2; i < points.length; ++i) {
        ctx.lineTo(points[i], points[++i]);
    }
    ctx.lineTo(points[i - 1], points[i]);
    ctx.fillStyle = color;
    ctx.fill();
    ctx.rotate(-currentRotation);
    ctx.translate(-currentTranslation.x, -currentTranslation.y);
}

function getGradient(face) {
    var gradient;
    switch (face) {
        case 'x':
            gradient = ctx.createRadialGradient(
                width / 2 + 280 - currentTranslation.x, height / 2 + 180 - currentTranslation.y, 400,
                width / 2 + 280 - currentTranslation.x, height / 2 + 180 - currentTranslation.y, 120
            );
            gradient.addColorStop(0, '#f5e7d3');
            gradient.addColorStop(1, '#dfd2c0');
            return gradient;
        case 'xz':
            gradient = ctx.createRadialGradient(
                width / 2 + 340 - currentTranslation.x, height / 2 - 100 - currentTranslation.y, 400,
                width / 2 + 340 - currentTranslation.x, height / 2 - 100 - currentTranslation.y, 120
            );
            gradient.addColorStop(0, '#f9f2dc');
            gradient.addColorStop(1, '#efe8d7');
            return gradient;
        case 'y':
            gradient = ctx.createRadialGradient(
                width / 2 - 280 - currentTranslation.x, height / 2 + 180 - currentTranslation.y, 400,
                width / 2 - 280 - currentTranslation.x, height / 2 + 180 - currentTranslation.y, 120
            );
            gradient.addColorStop(0, '#d9cbc4');
            gradient.addColorStop(1, '#c4b8b1');
            return gradient;
        case 'yz':
            gradient = ctx.createRadialGradient(
                width / 2 - 340 - currentTranslation.x, height / 2 - 100 - currentTranslation.y, 400,
                width / 2 - 340 - currentTranslation.x, height / 2 - 100 - currentTranslation.y, 120
            );
            gradient.addColorStop(0, '#ebe4d5');
            gradient.addColorStop(1, '#d1dbd0');
            return gradient;
        case 'z':
            gradient = ctx.createRadialGradient(
                width / 2 - currentTranslation.x, height / 2 - 200 - currentTranslation.y, 140,
                width / 2 - currentTranslation.x, height / 2 - 200 - currentTranslation.y, 200
            );
            gradient.addColorStop(0, '#fefee6');
            gradient.addColorStop(1, '#ffffef');
            return gradient;
    };
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
    var gradient = getGradient(color);
    if (gradient) {
         color = gradient;
    }

    var points2d = [];
    for (var i = 0; i < points.length; i += 3) {
        points2d.push((points[i] - points[i + 1]) * 2 * blockSize);
        points2d.push((points[i] + points[i + 1] + points[i + 2] * 2) * blockSize);
    }
    this.drawPolygon(color, points2d, data);
};

exports.drawText = function (text, x, y, size) {
    ctx.font = (size || 24) + 'px Trebuchet MS, Helvetica, sans-serif';
    ctx.fillStyle = '#ccc';
    ctx.textAlign = 'center';
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

exports.rotate = function (angle) {
    currentRotation = angle;
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
