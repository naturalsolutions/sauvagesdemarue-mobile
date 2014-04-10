module.exports = function(grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: 'www',
                    dest: 'build',
                    src: [
                        'config.xml',
                        'css/**/*.{png,svg,jpeg,jpg,gif,eot,ttf,woff}',
                        'data/*.xml',
                        'data/**/*.{jpg,png}',
                        'libs/**/*.{png,svg,jpeg,jpg,gif,eot,ttf,woff}',
                        'libs/**/*min.{js,css}',
                        'tpl/*.html'
                    ]
                }]
            }
        },
        cssmin: {
            dist: {
                src: ['www/css/*.css'],
                dest: 'build/css/all.min.css'
            },
            libflexslider: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/flexslider/flexslider.css']
                }]
            },
            libmmenu: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/jQuery.mmenu-master/src/css/jquery.mmenu.css']
                }]
            },
            libnotification : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/NS.UI.Notification/*.css']
                }]
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['js/*.js']
                }]
            },
            libforms : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/NS.UI.Forms/forms.js']
                }]
            },
            libnotification : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/NS.UI.Notification/*.js']
                }]
            }
        },
        replace: {
            dist: {
                src: ['www/index.html'],
                dest: 'build/index.html',
                options: {
                    patterns: [{
                        match: /css\/main\.css/,
                        replacement: 'css/all.min.css'
                    }, {
                        match: /[\s\t]*<link .*css\/key\.css.*\/>/,
                        replacement: ''
                    }, {
                        match: /(jquery-1\.9\.1|jquery\.mmenu)\.js/g,
                        replacement: '$1.min.js'
                    }, {
                        match: /(underscore|backbone)\.js/g,
                        replacement: '$1-min.js'
                    }]
                }
            }
        }
        // TODO: replace
        // TODO: zip + phonegap build : https://coderwall.com/p/e0jxea
        // TODO: comment concaténer les templates (<script> wrapper + function de loading adaptée)
        // TODO: concaténer les JS en gérant le chargement de Forms.js
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');

    // Default task(s).
    grunt.registerTask('default', ['copy', 'cssmin', 'uglify', 'replace']);
};