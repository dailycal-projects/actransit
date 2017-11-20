const gulp = require('gulp');
const webpack = require('webpack');
const prodConfig = require('../../webpack-prod.config.js');
const webpackStream = require('webpack-stream');
const merge = require('merge-stream');
const rename = require('gulp-rename');

function slugify(text)
{
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

module.exports = () => {
	const gpx = gulp.src('src/data/gpx/*.gpx')
		.pipe(rename(function (path) {
		    path.basename = slugify(path.basename);
		  }))
		.pipe(gulp.dest('dist/data/gpx'));

	const stops = gulp.src('src/data/stops/*.gpx')
		.pipe(gulp.dest('dist/data/stops'));

	const js = gulp.src('src/js/main.js')
		.pipe(webpackStream(prodConfig, webpack))
		.pipe(gulp.dest('dist/'))

	return merge(gpx, stops, js);
};
