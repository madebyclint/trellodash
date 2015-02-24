module.exports = function (grunt) {

    // NPM tasks
    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-bower-task');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-notify');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-template');

    // Load Reloadr
    var loadReloadr = '<script src="assets/js/libs/reloadr.js"></script>\n\t' + 
            '<script>\n\t\t' + 
            'Reloadr.go([\n\t\t' +
            // '    "assets/js/app.js",\n\t\t' +
            '    "assets/css/app.css",\n\t\t' +
            '    "index.html"\n\t\t' +
            ']);\n\t' +
        '</script>';

    // Create array of all javascript files

    var buildFootJs = [
        // '//code.jquery.com/jquery-2.0.3.min.js',
        // '//builds.emberjs.com/handlebars-1.0.0.js',
        // '//builds.emberjs.com/tags/v1.1.2/ember.js',
        // '//builds.emberjs.com/tags/v1.0.0-beta.3/ember-data.js',
        'assets/js/libs/jquery.js',
        'https://api.trello.com/1/client.js?key=a9eb8ca8277d2bfea3b1620aeec7ea95&name=MadeByClint+Application',
        'assets/js/app.js'
    ];

    var generateScriptTag = function(isArray, src) {
        // isArray = booleen
        // if true, src = array name
        // if false, src = relative source path
        var scriptArr = '<script src="';
        if(isArray) {
            scriptArr += src.join('"></script>\n\t<script src="');
        } else {
            var thisArr = grunt.file.expand({cwd: 'dist/' + src}, '*.js');
            scriptArr += thisArr.join();
            // scriptArr += src + '/' + grunt.file.expand({cwd: 'dist/' + src}, '*.js')
            //     .join('"></script>\n\t<script src="' + src + '/');
            // scriptArr = grunt.file.expand({cwd: 'src/' + relativeSrc}, '*.js');
        }
        scriptArr += '"></script>\n\t';
        // scriptArr += loadReloadr;
        return scriptArr;
    };

    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        autoprefixer: {
            files: {
                expand: true,
                flatten: true,
                src: 'dist/css/*.css',
                dest: 'dist/css'
            },
        },

        bower: {
            install: {
                options: {
                    targetDir: 'temp/assets/js/bower',
                    layout: 'byType',
                    // install: true,
                    verbose: false,
                    cleanTargetDir: false,
                    // cleanBowerDir: true,
                    bowerOptions: {}
                }
            }
        },

        clean: {
            build: ['dist'],
            temp: ['temp'],
        },

        concat: {
            options: {
                // separator: ';',
            },
            build: {
                files: {
                    // 'dist/js/loadfirst.min.js': prodJsHead,
                    'dist/assets/js/app.js' : ['src/assets/js/partials/**/*.js']
                }
            },
        },

        copy: {
            build: {
                cwd: 'src',
                src: [ '**', '!**/scss/**', '!assets/js/libs/**', '!assets/js/partials/**' ],
                dest: 'dist',
                expand: true
            },
            bower: {
                cwd: 'temp/assets/js/bower',
                src: [ '**' ],
                dest: 'dist/assets/js/libs',
                expand: true,
                flatten: true,
                filter: 'isFile'
            }
        },

        cssmin: {
            // prodbuild: {
            //     files: [{
            //         expand: true,
            //         cwd: 'dist/styles',
            //         src: ['*.css', '!*.min.css'],
            //         dest: 'dist/styles',
            //         ext: '.min.css'
            //     }]
            // }
        },

        notify: {
            build: {
                options: {
                    title: 'Build complete', // optional
                    message: 'Build has completed! ' // required
                }
            },
            watch: {
                options: {
                    title: 'Watch Update',  // optional
                    message: 'Build has been updated through Watch', //required
                }
            }
        },

        sass: {
            options: {
                style: 'expanded'
            },
            build: {
                files: [{
                    expand: true,
                    cwd: 'src/assets/scss/',
                    src: '**/*.scss',
                    dest: 'dist/assets/css',
                    ext: '.css'
                }]
            },
            // prodbuild: {
            //     files: [{
            //         expand: true,
            //         cwd: 'src/assets/scss/',
            //         src: '**/*.scss',
            //         dest: 'dist/css',
            //         ext: '.min.css'
            //     }]
            // }
        },

        template: {
            build: {
                options: {
                    'data': {
                        'css': 'assets/css/app.css',
                        'env': 'DEV',
                        // 'jsfoot': '<script src="assets/js/jsfoot.js"></script>'
                        'jsfoot': generateScriptTag(true, buildFootJs),
                        // 'jsfoot': generateScriptTag(false, 'assets/js/libs'),

                    }
                },
                files: {
                    'dist/index.html': ['src/index.html']
                }
            },
            // prodbuild: {
            //     options: {
            //         'data': {
            //             'css': 'styles/app.min.css',
            //             'env': 'PRODUCTION',
            //             'jshead': '<script type="text/javascript" src="js/loadfirst.min.js"></script>',
            //             'jsfoot': '<script type="text/javascript" src="js/loadlast.min.js"></script>',
            //         }
            //     },
            //     files: {
            //         'dist/index.html': ['src/index.html']
            //     }
            // }
        },

        uglify: {
            build: {
                options: {
                    beautify: true,
                    compress: {
                        drop_console: false
                    },
                    mangle: false,
                },
                files: [{
                    expand: true,
                    cwd: 'dist/assets/js',
                    src: '**/*.js',
                    dest: 'dist/assets/js'
                }]
            },
        },

        concurrent: {
            dist: ['css']
        },

        watch: {
            css: {
                files: [
                    'src/assets/scss/**/*.scss', 
                    'src/assets/js/**/*.js',
                    'src/**/*.html'
                ],
                tasks: ['build']
            }
        }
    });

    // Grunt tasks
    grunt.registerTask('default', ['build']);
    grunt.registerTask('cssbuild', ['sass:build', 'autoprefixer']);
    // grunt.registerTask('cssprod', ['sass:prodbuild', 'autoprefixer', 'cssmin:prodbuild']);
    grunt.registerTask('build', 'Compiles all of the assets and copies the files to the build directory.', ['clean', 'bower', 'copy', 'clean:temp', 'cssbuild', 'concat', 'template:build', 'version:dev', 'notify:build']);
    grunt.registerTask('prod', 'Compiles all of the assets and copies the files to the build directory.', ['clean', 'bower', 'copy', 'clean:temp', 'cssbuild', 'concat', 'template:build', 'version:dev', 'notify:build']);
    // grunt.registerTask('prod', 'Compiles all of the assets and copies the files to the build directory for prod.', ['all', 'copy:prodbuild', 'cssprod', 'concat:prod', 'uglify:prodbuild', 'template:prodbuild', 'version:prod']);

    grunt.registerTask('version', 'Update build number in version.txt file', function (build) {
        var version = 'IV_' + build.toUpperCase() + '_' + grunt.template.today('yymmdd.hhmmss');
        // UPDATE CONFIG FILE
        // grunt.file.write('dist/_data/version.json', '{"version" : "' + version + '"}');
        grunt.file.write('dist/version.txt', 'version ' + version + '');
    });
};
