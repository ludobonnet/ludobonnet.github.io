var gulp        = require('gulp');
var concat      = require('gulp-concat');
var uglify      = require('gulp-uglify');
var browserSync = require('browser-sync');
var cleanCSS    = require('gulp-clean-css');
var prefix      = require('gulp-autoprefixer');
var cp          = require('child_process');
var imagemin    = require('gulp-imagemin');
var pngquant    = require('imagemin-pngquant');
var jpegtran    = require('imagemin-jpegtran');
var shell       = require('gulp-shell');

var messages = {
    jekyllBuild: '<span style="color: grey">Running:</span> $ jekyll build'
};

/**
 * Build the Jekyll Site
 */
gulp.task('jekyll-build', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build', '--config', '_config.yml,_config_dev.yml'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Build the Jekyll Site for production
 */
gulp.task('jekyll-build-prod', function (done) {
    browserSync.notify(messages.jekyllBuild);
    return cp.spawn('jekyll', ['build'], {stdio: 'inherit'})
        .on('close', done);
});

/**
 * Rebuild Jekyll & do page reload
 */
gulp.task('jekyll-rebuild', ['jekyll-build'], function () {
    browserSync.reload();
});

/**
 * Wait for jekyll-build, then launch the Server
 */
gulp.task('browser-sync', ['css', 'js', 'jekyll-build'], function() {
    browserSync({
        server: {
            baseDir: '_site'
        }
    });
});

gulp.task('css', function() {
  return gulp.src(['_styles/*.css'])
    .pipe(cleanCSS({compatibility: 'ie8', onError: browserSync.notify}))
    .pipe(prefix(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
    .pipe(concat('styles.min.css'))
    .pipe(gulp.dest('_site/css'))
    .pipe(browserSync.reload({stream:true}))
    .pipe(gulp.dest('css'));
});

gulp.task('js', function () {
    gulp.src(['_scripts/jquery.js', '_scripts/bootstrap.js', '_scripts/custom.js'])
        .pipe(concat('scripts.min.js'))
        .pipe(uglify())
        .pipe(gulp.dest('_site/js'))
        .pipe(browserSync.reload({stream:true}))
        .pipe(gulp.dest('js'));
});

/**
 * Watch scss files for changes & recompile
 * Watch html/md files, run jekyll & reload BrowserSync
 */
gulp.task('watch', function () {
    gulp.watch(['_styles/*.css'], ['css']);
    gulp.watch(['_scripts/*.js'], ['js']);
    gulp.watch(['*.html', '_layouts/*.html', '_includes/*.html', '_posts/*', '_config.yml', 'img/*'], ['jekyll-rebuild']);
});

/**
 * Default task, running just `gulp` will compile the sass,
 * compile the jekyll site, launch BrowserSync & watch files.
 */
gulp.task('default', ['browser-sync', 'watch']);

gulp.task('deploy', ['jekyll-build-prod'], shell.task([
  'cd _site/ && git add --all && git commit -m "update blog" && git push origin gh-pages'
]));
