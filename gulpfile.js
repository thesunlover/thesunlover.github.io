var gulp        = require('gulp');
var browserSync = require('browser-sync').create();
var sass        = require('gulp-sass');
// var concat = require('gulp-concat');
// var uglify = require('gulp-uglify');
// var rename = require('gulp-rename');
// var minifyCSS = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');
var requirejsOptimize = require('gulp-requirejs-optimize');
 
var SASSsources = ['./new.scss',];
var actionsByOrderForDefault = [];

// Compile sass into CSS & auto-inject into browsers

actionsByOrderForDefault.push('html');
gulp.task('html', function() {
		return gulp.src(["./new.html","./index.html",])
	        .pipe(gulp.dest('./http/'))
	        .pipe(browserSync.stream());
});

actionsByOrderForDefault.push('scripts');
gulp.task('scripts', function () {
    return gulp.src('main.js')
        .pipe(sourcemaps.init())
        .pipe(requirejsOptimize())
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('http'));
});

actionsByOrderForDefault.push('sass');
gulp.task('sass', function() {
    return gulp.src(SASSsources)
        .pipe(sourcemaps.init())
        .pipe(sass({style: 'compact'}))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('./http/'))
        .pipe(browserSync.stream());
});

// // Concatenate & Minify CSS
// actionsByOrderForDefault.push('minify-css');
// gulp.task('minify-css', function() {
//     return gulp.src('./bower_components/bootstrap/dist/css/bootstrap.css')
//     	.pipe(sourcemaps.init())
//     	.pipe(minifyCSS())
//         .pipe(sourcemaps.write())
//         .pipe(gulp.dest('./assets/css'));
// });


// Run mini server
actionsByOrderForDefault.push('server');
gulp.task('server', function() {
		browserSync.init({
		server: "./http/",
        notify: false,
        reloadDebounce: 5000
    });
});

actionsByOrderForDefault.push('watch');
gulp.task('watch', function(){
	SASSsources.forEach(function(source){
		gulp.watch(source, ['sass']);
	});
	gulp.watch("./*.html", ['html']);
	gulp.watch("./main.js", ['scripts']);
});



// Static server
gulp.task('default', actionsByOrderForDefault);