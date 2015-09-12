'use strict';

var unlockedLevel = localStorage['unlockedLevel'] || 0;
var currentLevel = localStorage['currentLevel'] || 0;

exports.getUnlockedLevel = function () {
    return unlockedLevel;
};

exports.unlockLevel = function (level) {
    if (level > unlockedLevel) {
        unlockedLevel = level;
        localStorage['unlockedLevel'] = level;
    }
};

exports.getCurrentLevel = function () {
    return currentLevel;
};

exports.setCurrentLevel = function (level) {
    currentLevel = level;
    localStorage['currentLevel'] = level;
};
