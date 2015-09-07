var edit = require('./edit.js').start;
var menu = require('./menu.js').start;
var play = require('./play.js').start;

if (window.menu) {
    menu();
} else if (window.edit) {
    edit();
} else {
    play();
}
