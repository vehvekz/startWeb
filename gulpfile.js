'use strict';

const gulp = require('gulp'),
		$ = require('gulp-load-plugins')({
			pattern : ['gulp-*', 'gulp.*', 'del'],
			rename: {
				'gulp-svg-symbols': 'svgSymbols'
				}
			}),
		browserSync = require('browser-sync').create();

const isDevelopment = !process.env.NODE_ENV || process.env.NODE_ENV == 'development';

const path = {
	app: {
		jade: 'app/pages/*.jade',
		styles: 'app/styles/app.sass',
		scripts: 'app/scripts/app.js',
		assets: ['app/assets/**/*.*', '!app/assets/{svg,img}/**/*.*'],
		img: 'app/assets/img/**/*.*',
		svg: 'app/assets/svg/**/*.svg'
	},
	dist: { 
		html: 'dist',
		styles: 'dist/assets/css/',
		scripts: 'dist/assets/scripts/',
		assets: 'app/assets/',
		img: 'dist/assets/img'
	},
	watch: { 
		html: 'app/**/*.jade',
		styles: 'app/**/*.{sass,scss}',
		scripts: 'app/scripts/**/*.js',
		assets: ['app/assets/**/*.*', '!app/assets/{svg,img}/*.*'],
		img: 'app/assets/img/**/*.*',
		svg: 'app/assets/svg/**/*.svg'
	},
	sass: [
		'app/libs/foundation-sites/scss'
	],
	clean: 'dist'
};

gulp.task('html', function () {
	return gulp.src(path.app.jade)
		.pipe($.plumber({
			errorHandler: $.notify.onError()
			}))
		.pipe($.jade({
				pretty: true
			}))
		.pipe(gulp.dest(path.dist.html))
});

gulp.task('styles', function(){
	return gulp.src(path.app.styles)
		.pipe($.plumber({
			errorHandler: $.notify.onError()
			}))
		.pipe($.if(isDevelopment, $.sourcemaps.init()))
		.pipe($.sass({
			indentedSyntax: true,
			includePaths: path.sass
			}))
		.pipe($.autoprefixer({
			browsers: ['last 2 versions', 'ie >= 9', 'and_chr >= 2.3']
		}))
		.pipe($.if(!isDevelopment ,$.cssnano()))
		.pipe($.if(isDevelopment, $.sourcemaps.write()))
		.pipe($.rename('app.min.css'))
		.pipe(gulp.dest(path.dist.styles));
});

gulp.task('scripts', function () {
	return gulp.src(path.app.scripts) 
		.pipe($.plumber({
			errorHandler: $.notify.onError()
			}))
		.pipe($.rigger())
		.pipe($.if(isDevelopment, $.sourcemaps.init()))
		.pipe($.if(!isDevelopment ,$.uglify()))
		.pipe($.if(isDevelopment, $.sourcemaps.write()))
		.pipe($.rename('app.min.js'))
		.pipe(gulp.dest(path.dist.scripts));
});
 
gulp.task('assets', function(){
	return gulp.src(path.app.assets)
		.pipe($.newer(path.dist.assets))
		.pipe($.debug({title: 'assets'}))
		.pipe(gulp.dest(path.dist.assets));
});

gulp.task('svg', function(){
	return gulp.src(path.app.svg)
		.pipe($.plumber({
			errorHandler: $.notify.onError()
			}))
		.pipe($.svgmin({
			js2svg: {
				pretty: true
			}
		}))
		.pipe($.cheerio({
			run: function ($){
				$('[fill]').removeAttr('fill');
				$('[style]').removeAttr('style');
			},
			parserOptions: { xmlMode: true }
		}))
		.pipe($.svgSymbols({
			id: 'i-%f',
			className: 'i-%f',
			templates: [
				'default-svg'
			]
		}))
		.pipe($.rename('sprite.svg'))
		.pipe(gulp.dest(path.dist.img));
});

gulp.task('clean', function(){
	return $.del('dist');
});

gulp.task('server', function(){
	browserSync.init({
		server: path.dist.html,
		host: 'localhost',
		port: 9000,
		logPrefix: "Frontend Work!"
	});
	browserSync.watch(path.dist.html + '/**/*.*').on('change', browserSync.reload);
});

gulp.task('watch', function(){
	gulp.watch(path.watch.html, gulp.series('html'));
	gulp.watch(path.watch.styles, gulp.series('styles'));
	gulp.watch(path.watch.scripts, gulp.series('scripts'));
	gulp.watch(path.watch.svg, gulp.series('svg'));
	gulp.watch(path.watch.assets, gulp.series('assets'));
});


gulp.task('build', gulp.series('clean', gulp.parallel('styles', 'html', 'scripts', 'svg', 'assets')));

gulp.task('default', gulp.series('build', gulp.parallel('watch', 'server')));








