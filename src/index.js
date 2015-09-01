var edit = require('./edit.js').start;
var play = require('./play.js').start;

if (window.edit) {
    edit();
} else {
    play();
}
