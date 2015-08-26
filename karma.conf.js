var webpack = require("webpack");
module.exports = function(config) {
    config.set({
        browsers: ['PhantomJS'],
        singleRun: true,
        frameworks: ['jasmine'],
        files: [
            'tests/*.js'
        ],
        preprocessors: {
            'tests/*.js': ['webpack']
        },
        webpack: {
            devtool: 'inline-source-map',
            resolve: {
                modulesDirectories: [
                    "src"
                ]
            }
        },
        plugins: [
            require("karma-webpack"),
            require("karma-jasmine"),
            require("karma-phantomjs-launcher")
        ]
    });
};
