const gulp = require('gulp');
const webpack = require('webpack');
const prodConfig = require('../../webpack-prod.config.js');
const webpackStream = require('webpack-stream');
const merge = require('merge-stream');

module.exports = () => {
	const gpx = gulp.src('src/data/gpx/*')
		.pipe(gulp.dest('dist/data/gpx'));

	const stops = gulp.src('src/data/stops/*')
		.pipe(gulp.dest('dist/data/stops'));

	const js = gulp.src('src/js/main.js')
		.pipe(webpackStream(prodConfig, webpack))
		.pipe(gulp.dest('dist/'))

	return merge(gpx, stops, js);
};
