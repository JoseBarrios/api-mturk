var gulp = require('gulp');
var minify = require('gulp-minify');

gulp.task('default', ['compress']);


gulp.task('compress', function() {
    gulp.src('src/index.js')
    .pipe(minify())
    .pipe(gulp.dest('dist'))
});
