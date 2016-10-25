const gulp = require('gulp');
const react = require('gulp-react');
const runSequence = require('run-sequence');
const browserSync = require('browser-sync').create();
const nodemon = require('gulp-nodemon');
const sourcemaps = require('gulp-sourcemaps');
const babel = require('gulp-babel');

gulp.task('babel', () => {
    gulp.src(['src/**/*.js'])
        /*.pipe(babel({
            presets: ['es2015']
        }))*/
        .pipe(gulp.dest('dist'));

    gulp.src(['src/**/*.ejs'])
        .pipe(gulp.dest('dist'));
});

gulp.task('ejs', () => {
    gulp.src(['src/**/*.ejs'])
        .pipe(gulp.dest('dist'));
});

gulp.task('react', () => {
    gulp.src('public/reactjsx/*.jsx')
        .pipe(react())
        /*.pipe(babel({
            presets: ['es2015']
        }))*/
        .pipe(gulp.dest('public/reactjs/'));
});

gulp.watch(['src/**/*.js', 'src/**/*.ejs'], ['babel', 'ejs']);

gulp.watch('public/reactjsx/*.jsx', ['react']);

/*gulp.task('serve', (done) => {
    runSequence('default', done);
});*/

gulp.task('default', ['browser-sync'], () => {});

gulp.task('browser-sync', ['nodemon'], () => {
    browserSync.init({
        files: ["public/**/*.*"],
        browser: ["chrome"], //["chrome", "firefox", "opera"],
        proxy: "localhost:80",
        motify: false,
        port: 5000
    });

    gulp.watch(["public/**/*.*"]).on("change", browserSync.reload);
});

gulp.task('nodemon', ['react', 'babel'], (cb) => {

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
