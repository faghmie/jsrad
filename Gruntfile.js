module.exports = function (grunt) {
	require('jit-grunt')(grunt);

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				// define a string to put between each file in the concatenated output
				separator: ';'
			},
			common: {
				// the files to concatenate
				src: '<%= pkg.scripts.common %>',
				// the location of the resulting JS file
				dest: 'dist/js/<%= pkg.name %>_app.js'
			},
			widgets: {
				// the files to concatenate
				src: '<%= pkg.scripts.widgets %>',
				// the location of the resulting JS file
				dest: 'dist/js/<%= pkg.name %>_widgets.js'
			},
			ide: {
				// the files to concatenate
				src: '<%= pkg.scripts.ide %>',
				// the location of the resulting JS file
				dest: 'dist/js/<%= pkg.name %>_ide.js'
			},
			erd: {
				// the files to concatenate
				src: '<%= pkg.scripts.erd %>',
				// the location of the resulting JS file
				dest: 'dist/js/<%= pkg.name %>_erd.js'
			},
			external_libs: {
				// the files to concatenate
				src: '<%= pkg.scripts.libs %>',
				// the location of the resulting JS file
				dest: 'dist/js/<%= pkg.name %>_external_libs.js'
			}
		},
		uglify: {
			options: {
				// the banner is inserted at the top of the output
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("dd-mm-yyyy") %> */\n'
			},
			dist: {
				files: {
					'dist/js/<%= pkg.name %>_ide.min.js': ['<%= concat.ide.dest %>'],
					'dist/js/<%= pkg.name %>_external_libs.min.js': ['<%= concat.external_libs.dest %>'],
					'dist/js/<%= pkg.name %>.core.min.js': [
						'<%= concat.common.dest %>',
						'<%= concat.widgets.dest %>',
						'<%= concat.erd.dest %>',
					],
					'dist/js/<%= pkg.name %>.min.js': [
						'<%= concat.common.dest %>',
						'<%= concat.ide.dest %>',
						'<%= concat.widgets.dest %>',
						'<%= concat.erd.dest %>',
					]
				}
			}
		},

		eslint: {
			options: {
				format: require('eslint-tap')
			},
			target: [
				'Gruntfile.js',
				'<%= pkg.scripts.common %>',
				'<%= pkg.scripts.widgets %>',
				'<%= pkg.scripts.ide %>',
				'<%= pkg.scripts.erd %>',
			]

		},
		// jshint: {
		// 	// define the files to lint
		// 	files: [
		// 		'Gruntfile.js',
		// 		'<%= pkg.scripts.common %>',
		// 		'<%= pkg.scripts.widgets %>',
		// 		'<%= pkg.scripts.ide %>',
		// 		'<%= pkg.scripts.erd %>',
		// 	],
		// 	// configure JSHint (documented at http://www.jshint.com/docs/)
		// 	options: {
		// 		esversion: 6,
		// 		laxcomma: true,
		// 		loopfunc: true,
		// 		// more options here if you want to override JSHint defaults
		// 		globals: {
		// 			jQuery: true,
		// 			console: true,
		// 			module: true
		// 		}
		// 	}
		// },
		watch: {
			files: ['<%= eslint.target %>'],
			tasks: ['concat', 'uglify', 'cssmin', 'copy'],
			options: {
				livereload: true
			}
		},
		cssmin: {
			external_styles: {
				src: '<%= pkg.scripts.css_libs %>',
				dest: 'dist/css/<%= pkg.name %>_external_styles.min.css'
			},
			core_styles: {
				src: '<%= pkg.scripts.css_core %>',
				dest: 'dist/css/<%= pkg.name %>_core_styles.min.css'
			}
		},
		copy: {
			main: {
				files: [{
						expand: true,
						src: 'images/**',
						dest: 'dist'
					},
					{
						expand: true,
						src: 'libs/jquery-ui-1.12.1/images/*',
						dest: 'dist/images',
						flatten: true
					},
					{
						expand: true,
						src: 'libs/font-awesome-4.5.0/fonts/*',
						dest: 'dist/fonts',
						flatten: true
					},
					{
						expand: true,
						src: 'libs/bootstrap-3.3.7/fonts/*',
						dest: 'dist/fonts',
						flatten: true
					},
					{
						expand: true,
						src: 'config/**',
						dest: 'dist'
					},
					{
						expand: true,
						src: 'api/**',
						dest: 'dist'
					}
				]
			}
		},
		connect: {
			server: {
				options: {
					keepalive: true,
					port: 80,
					open: true,
					base: 'dist'
				}
			}
		},
		php: {
			server: {
				options: {
					keepalive: true,
					port: 80,
					open: true,
					base: '.',
					ini: 'c:/php/php.ini',
					bin: 'c:/php/php.exe',
				}
			}
		},
		clean: {
			all_css: ['dist/**/*.css'],
			js: ['dist/**/*.js'],
			production: [
				'dist/js/jsrad_app.js',
				'dist/js/jsrad_erd.js',
				'dist/js/jsrad_external_libs.js',
				'dist/js/jsrad_ide.js',
				'dist/js/jsrad_ide.min.js',
				'dist/js/jsrad_widgets.js'
			]
		},
		htmlbuild: {
			dev: {
				src: 'html/index.html',
				options: {
					beautify: true,
					relative: true,
					type: 'module',
					scripts: {
						libs: '<%= pkg.scripts.libs %>',
						app: [
							'<%= pkg.scripts.common %>',
							'<%= pkg.scripts.widgets %>',
							'<%= pkg.scripts.ide %>',
							'<%= pkg.scripts.erd %>'
						],
						main: 'main.js'
					},
					styles: {
						libs: [
							'<%= pkg.scripts.css_libs %>'
						],
						app: '<%= pkg.scripts.css_core %>',
					}
				},
			},
			prod: {
				src: 'html/index.html',
				dest: 'dist/',
				options: {
					//beautify: true,
					//relative: true,
					scripts: {
						libs: 'dist/js/jsrad_external_libs.min.js',
						app: 'dist/js/jsrad.min.js',
						main: 'main.js',
					},
					styles: {
						libs: 'dist/css/jsrad_external_styles.min.css',
						app: 'dist/css/jsrad_core_styles.min.css',
					}
				},
			},
		},

		service_worker: {
			options: {
				baseDir: 'dist',
				workerFile: 'sw.js'
				//staticFileGlobs: [
				//	'**/*.{gif,jpg,png}'
				//]
			}
		},
	});

	// grunt.loadNpmTasks('grunt-service-worker');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	// grunt.loadNpmTasks('grunt-contrib-jshint');
	// grunt.loadNpmTasks('grunt-eslint');
	//grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-cssmin');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-connect');
	// grunt.loadNpmTasks('grunt-php');
	grunt.loadNpmTasks('grunt-newer');
	grunt.loadNpmTasks('grunt-html-build');


	grunt.registerTask('default',
		[
			'clean',
			// 'jshint',
			// 'eslint',
			'newer:concat',
			// 'newer:uglify',
			'cssmin',
			'newer:copy',
			'htmlbuild',
			//'service_worker',
			// 'php',
			'watch'
		]
	);
};