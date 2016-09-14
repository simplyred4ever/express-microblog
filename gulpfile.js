const gulp = require('gulp');
const react = require('gulp-react');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync');
const nodemon = require('gulp-nodemon');

gulp.task('react', () => {
    gulp.src('public/reactjsx/*.jsx')
        .pipe(react())
        .pipe(gulp.dest('public/reactjs/'));
});

gulp.watch('public/reactjsx/*.jsx', ['react']);

/*gulp.task('serve', (done) => {
    runSequence('default', done);
});*/

gulp.task('default', ['browser-sync'], () => {});

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init(null, {
        proxy: "http://localhost:3000",
        files: ["public/**/*.*"],
        browser: "google chrome",
        port: 7000
    });
});

gulp.task('nodemon', ['react'], (cb) => {

    var started = false;

    return nodemon({
        script: 'bin/www'
    }).on('start', () => {
        // to avoid nodemon being started multiple times
        // thanks @matthisk
        if (!started) {
            cb();
            started = true;
        }
    });
});
