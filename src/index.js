var menu = require('./menu.js').start;
var play = require('./play.js').start;

if (window.menu) {
    menu();
} else {
    play();
}
