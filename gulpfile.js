var gulp = require('gulp');
var webpack = require('webpack-stream');
var uglify = require('gulp-uglify');
var zip = require('gulp-zip');
var merge = require('merge-stream');
var karma = require('karma');

gulp.task('default', ['build'], function() {
    gulp.watch(['src/*'], ['build']);
});

gulp.task('build', function() {
    var js = gulp.src('src/*.js')
        .pipe(webpack({
            devtool: 'inline-source-map',
            output: {
                filename: 'bundle.js'
            }
        }))
        .pipe(gulp.dest('build/'));
    var resources = gulp.src(['src/*.html', 'src/*.css']).pipe(gulp.dest('build/'));
    return merge(js, resources);
});

gulp.task('build-production', function() {
    return gulp.src('src/*.js')
    .pipe(webpack({
        output: {
            filename: 'bundle.js'
        }
    }))
    .pipe(uglify())
    .pipe(gulp.dest('build/'));
});

gulp.task('dist', function() {
    return gulp.src(['build/*', 'README.md'])
    .pipe(zip('game.zip'))
    .pipe(gulp.dest('dist'));
});

gulp.task('test', function (done) {
    karma.server.start({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, function(){
        done();
    });
});
