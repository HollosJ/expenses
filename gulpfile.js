var { src, dest, watch, series, parallel } = require("gulp");
var sass = require("gulp-sass")(require("sass"));
var postcss = require("gulp-postcss");
var browserSync = require("browser-sync").create();
var uglify = require("gulp-uglify");
var concat = require("gulp-concat");
var imageMin = require("gulp-imagemin");

// Tailwind stuff
function stylesTask() {
  var tailwindcss = require("tailwindcss");

  return src("src/*.scss")
    .pipe(sass().on("error", sass.logError))
    .pipe(
      postcss([tailwindcss("./tailwind.config.js"), require("autoprefixer")])
    )
    .pipe(dest("./dist"))
    .pipe(browserSync.stream());
}

// JS stuff
function jsTask() {
  return src("src/js/*.js")
    .pipe(uglify())
    .pipe(concat("script.js"))
    .pipe(dest("./dist"))
    .pipe(browserSync.stream());
}

// Moves HTML files to the dist folder
function htmlTask() {
  return src("src/*.html").pipe(dest("./dist")).pipe(browserSync.stream());
}

// Start browserSync server
function browserSyncServe(cb) {
  browserSync.init({
    server: {
      baseDir: "./dist",
    },
  });
  cb();
}

// Reloads server
function browserSyncReload(cb) {
  browserSync.reload();
  cb();
}

// Images
function imagesTask() {
  return src("src/img/*").pipe(imageMin()).pipe(dest("./dist/img"));
}

// Watch stuff
function watchTask() {
  console.log("Watching for changes...");
  watch("src/*.html", series(htmlTask, browserSyncReload));
  watch(["src/*.scss", "src/*.html"], series(stylesTask, browserSyncReload));
  watch("src/js/*.js", series(jsTask, browserSyncReload));
}

exports.default = series(
  stylesTask,
  jsTask,
  htmlTask,
  imagesTask,
  browserSyncServe,
  watchTask
);
exports.build = series(stylesTask, jsTask, htmlTask, imagesTask);
