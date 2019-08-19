'use strict';

const fs           = require('fs')
const gulp         = require('gulp');
const sass         = require('gulp-sass');
const sassGlob     = require('gulp-sass-glob');
const autoprefixer = require('gulp-autoprefixer');
const sourcemaps   = require('gulp-sourcemaps');
const babel        = require('gulp-babel');
const runSequence  = require('run-sequence');
const browserSync  = require('browser-sync').create();
const browserify   = require('browserify');
const babelify     = require('babelify');
const source       = require('vinyl-source-stream');
const buffer       = require('vinyl-buffer');
const concat       = require('gulp-concat');
const cleanCSS     = require('gulp-clean-css');
const gulpif       = require('gulp-if');
const uglify       = require('gulp-uglify');
const glob         = require("glob");
const path         = require('path');

const env  = process.argv.slice(2)[0];
var config = JSON.parse(fs.readFileSync('configs.json'))

/**
 * Global Variables section
 * In this section we define global variables
 */
const dirs = {
  src: 'src',
  dest: 'build'
};

var paths = {
  styles: {
    src: `${dirs.src}/styles/*.scss`,
    dest: `${dirs.dest}/arquivos/`,
    wildcard: `${dirs.src}/styles/**/*.scss`
  },
  scripts: {
    src: `${dirs.src}/scripts/script.js`,
    dest: `${dirs.dest}/arquivos/`,
    wildcard: `${dirs.src}/scripts/**/*.js`,
    mainFiles: `${dirs.src}/scripts/*.js`,
    dir: `${dirs.src}/scripts/`
  },
  templates: {
    src: `${dirs.src}/templates/index.html`,
    dest: dirs.dest,
  },
  files: {
    src: `${dirs.src}/arquivos/*`,
    dest: `${dirs.dest}/arquivos`,
  },
  images: {
    src: `${dirs.src}/images/**/*.*`,
    dest: `${dirs.dest}/arquivos`,
  },
};

const browserSyncProxy = function() {
  return browserSync.init({
            open: false,
            watch: true,
            https: config.https || true,
            host: config.accountName + '.vtexlocal.com.br',
            startPath: '/admin/login/',
            proxy: 'https://' + config.accountName + '.vtexcommercestable.com.br',
            serveStatic: [{
                route: '/arquivos',
                dir: ['./build/arquivos']
            }]
        });
}

/**
 * Handle browser Sync functions
 */
const live = () => {
  browserSync.init({
    server: {
      baseDir: "./build",
      index: "index.html",
      directory: false,
      https: false,
    },
    watch: true,
    port: 3070,
    ui: {
      port: 3004
    },
    open: false,
    cors: true,
    notify: false
  });
}

/**
 * Styles section
 * In this section we define functionality who doing style stuff
 */
const styles = () => {

  return gulp.src(paths.styles.src)
    .pipe(sourcemaps.init())
    .pipe(sassGlob())
    .pipe(sass.sync())
    .on('error', function (err) {
      console.log(err.toString());
      this.emit('end');
    })
    .pipe(autoprefixer())
    .pipe(sourcemaps.write('.'))
    .pipe(gulpif((env === "build"), cleanCSS({compatibility: 'ie11'})) )
    .pipe(gulp.dest(paths.styles.dest))
    .pipe(browserSync.stream());
}

const concatLegacyJsFiles = (file) => {

  let filename = file.replace('src/scripts/', '');

  if(filename.startsWith("concat_")) {
    console.log("---- Merging " + filename + " with legacy files ----");
  } else {
    console.log("---- File " + filename + " is not to merge, skipping.");
    return;
  }

  let files = [
    //legacy
    // , './src/scripts/legacyFiles/someLegacyFile.js'

    //new builded Code
    ,'./build/arquivos/' + filename
  ];

  return gulp.src(files)
    .pipe(concat(filename.replace('concat_','').replace('.js','') + "_bundle.js" ))
    .pipe(gulp.dest('./build/arquivos/legacyPlusNew/'));
}

/**
 * Script section
 * In this section we define functionality who doing JS stuff ;)
 */
const scripts = () => {

  var browserifyFile = function(file) {

    let b = browserify({
      entries: file,
      debug: true,
      paths: [paths.scripts.dir],
      extensions: ['es6'],
      transform: [
        babelify // Enable ES6 features
      ]
    });

    return b.bundle()
      .on('error', function (err) {
        console.log(err.toString());
        this.emit('end');
      })
      .pipe(source(file.replace('src/scripts/', '')))
      .pipe(buffer())
      .pipe(sourcemaps.init({
        loadMaps: true
      }))
      .pipe(gulpif((env === "build"), uglify()) )
      .pipe(sourcemaps.write('./'))
      .pipe(gulp.dest(paths.scripts.dest))
      .on('end', function() {

          concatLegacyJsFiles(file);

      });

  }

  glob(paths.scripts.mainFiles, function (er, files) {

    files.map(function(entry) {
      return browserifyFile(entry);
    });

  });

}

/**
 * Template handler
 */
const templates = () => {
  return gulp.src(paths.templates.src)
    .pipe(gulp.dest(paths.templates.dest))
}

const files = () => {
  return gulp.src(paths.files.src)
    .pipe(gulp.dest(paths.files.dest))
}

/**
 * Images handler
 */
const images = () => {
  return gulp.src(paths.images.src)
    .pipe(gulp.dest(paths.images.dest))
}

/**
 * Gulp task watch usefull in development time
 */
const watch = () => {
  gulp.watch(paths.styles.wildcard, ['styles']);
  gulp.watch(paths.scripts.wildcard, ['scripts']).on('change', browserSync.reload);
  gulp.watch(paths.templates.src, ['templates']).on('change', browserSync.reload);
}

/**
 * build Function
 * Provide Sequence for run in order
 */
const build = (callback) => {
  runSequence(
    'files',
    'styles',
    'scripts',
    'templates',
    'images',
    callback);
}

/**
 * In development time use this task, it will proviede watch and other stuff
 */
const dev = (callback) => {
  runSequence(
    'build',
    'browserSyncProxy',
    'watch',
    callback);
}

const devlocal = (callback) => {
  runSequence(
    'build',
    'live',
    'watch',
    callback);
}

/**
 * Gulp Tasks
 */

gulp.task('live', live);
gulp.task('browserSyncProxy', browserSyncProxy);
gulp.task('styles', styles);
gulp.task('scripts', scripts);
gulp.task('templates', templates);
gulp.task('files', files);
gulp.task('images', images);
gulp.task('build', build);
gulp.task('watch', watch);
gulp.task('dev', dev);
gulp.task('devlocal', devlocal);
gulp.task('default', build);