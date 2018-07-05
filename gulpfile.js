'use strict';

var

    /* Project configurations */

    config = {

        project: {
            name: 'sofia'
        },

        folder: {
            src: '../src/',
            build: '../build/'
        },

        options: {
            jshint: '',
            jshint_reporter: 'default'
        }

    },

    /* Modules */

    gulp = require('gulp'),
    newer = require('gulp-newer'),
    imagemin = require('gulp-imagemin'),
    concat = require('gulp-concat'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    sass = require('gulp-sass'),
    postcss = require('gulp-postcss'),
    assets = require('postcss-assets'),
    autoprefixer = require('autoprefixer'),
    mqpacker = require('css-mqpacker'),
    cssnano = require('cssnano'),
    sourcemaps = require('gulp-sourcemaps'),
    plumber = require('gulp-plumber'),
    notify = require('gulp-notify'),
    rename = require('gulp-rename')

;



/* Tasks */

// Images

gulp.task('images', function() {

    var out = config.folder.build + 'images/';

    return gulp.src(config.folder.src + 'images/**/*')
        .pipe(newer(out))
        .pipe(imagemin([
            imagemin.gifsicle({interlaced: true}),
            imagemin.jpegtran({progressive: true}),
            imagemin.optipng({optimizationLevel: 5}),
            imagemin.svgo({
                plugins: [
                    {removeViewBox: true},
                    {cleanupIDs: false}
                ]
            })
        ]))
        .pipe(notify({
            'title'   : 'Images Task Finished',
            'onLast': true
        }))
        .pipe(gulp.dest(out));

});


// JS

gulp.task('project-js', function() {

    return gulp.src(config.folder.src + 'js/*.js')
        .pipe(plumber({ errorHandler: function(err) {
                notify.onError({
                    title: 'JS Error',
                    message:  'Check console'
                })(err);

                this.emit('end');
            }}))
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'))
        .pipe(uglify())
        .pipe(concat(config.project.name + '.js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.folder.build + 'js/'))
        .pipe(notify({
            'title': 'JS Task Finished',
            'message': 'File: ' + config.folder.build + '<%= file.relative %>',
            'sound': 'Tink',
            'onLast': true
        }));

});

gulp.task('vendor-js', function() {

    return gulp.src(config.folder.src + 'js/vendor/*')
        .pipe(uglify())
        .pipe(concat(config.project.name + '.vendor.js'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(gulp.dest(config.folder.build + 'js/'))
        .pipe(notify({
            'title': 'JS Task Finished',
            'message': 'File: ' + config.folder.build + '<%= file.relative %>',
            'sound': 'Tink',
            'onLast': true
        }));

});

gulp.task('js', ['project-js', 'vendor-js']);


// CSS

gulp.task('css', ['images'], function() {

    var postCssOpts = [
        assets({ loadPaths: ['images/'] }),
        autoprefixer({ browsers: ['last 2 versions', '> 2%'] }),
        mqpacker
    ];

    postCssOpts.push(cssnano);

    return gulp.src(config.folder.src + 'scss/main.scss')
        .pipe(sourcemaps.init())
        .pipe(plumber({ errorHandler: function(err) {
                notify.onError({
                    title: 'SCSS Error',
                    message:  'Check console'
                })(err);

                this.emit('end');
            }}))
        .pipe(sass().on('error', sass.logError))
        .pipe(postcss(postCssOpts))
        .pipe(concat( config.project.name + '.css'))
        .pipe(rename({
            suffix: '.min'
        }))
        .pipe(sourcemaps.write('./maps'))
        .pipe(gulp.dest(config.folder.build + 'css/'))
        .pipe(notify({
            'title': 'CSS Task Finished',
            'message': 'File: ' + config.folder.build + '<%= file.relative %>',
            'sound': 'Tink',
            'onLast': true
        }));

});



// Run all tasks

gulp.task('run', ['css', 'js']);



// Watch for changes

gulp.task('watch', function() {

    gulp.watch(config.folder.src + 'images/**/*', ['images']);
    gulp.watch(config.folder.src + 'js/**/*', ['js']);
    gulp.watch(config.folder.src + 'scss/**/*', ['css']);

});


// Default task
gulp.task('default', ['run', 'watch']);