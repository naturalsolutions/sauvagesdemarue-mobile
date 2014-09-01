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
                        'libs/**/*min.css',
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
                    src: ['libs/flexslider_2.2.2/flexslider.css']
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
            libleaflet: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/leaflet/leaflet.css']
                }]
            },      
            libnotification : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/NS.UI.Notification/*.css']
                }]
            },
            libautocomplete : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'build',
                    src: ['libs/backbone-autocomplete/backbone.autocomplete.css']
                }]
            }
        },
        uglify: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'tmp',
                    src: ['js/*.js']
                }]
            },
            libforms : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'tmp',
                    src: ['libs/NS.UI.Forms/forms.js']
                }]
            },
            libnotification : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'tmp',
                    src: ['libs/NS.UI.Notification/*.js']
                }]
            },
            libautocomplete : {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'tmp',
                    src: ['libs/backbone-autocomplete/backbone.autocomplete.js']
                }]
            },
            libfastclick: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'tmp',
                    src: ['libs/fastclick_1.0.2/fastclick.js']
                }]
            },
           libPushNotification: {
                files: [{
                    expand: true,
                    cwd: 'www',
                    dest: 'tmp',
                    src: ['libs/cordova_plugin-PushNotification/PushNotification.js']
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
                        match: /libs\/jquery_2\.0\.3\/jquery-2\.0\.3\.\min.js/,
                        replacement: 'preCordova.js'
                    }, {
                        match: /libs\/flexslider_2\.2\.2\/jquery\.flexslider-min\.js/,
                        replacement: 'postCordova.js'
                    }, {
                        match: /[\s\t]*<script .*src="(libs|js)\/.*<\/script>/g,
                        replacement: ''
                    }, {
                        match: /<\/body>/,
                        replacement: function() {
                            return grunt.file.read("tmp/templates.html") + '</body>';
                        }
                    }, {
                        match: /app.config.debug = true/,
                        replacement: 'app.config.debug = false'
                    }]
                }
            },
            distApp: {
                src: ['build/postCordova.js'],
                dest: 'build/postCordova.js',
                options: {
                    patterns: [{
                        match: /app.config.debug=!0/,
                        replacement: 'app.config.debug=0'
                    }]
                }
            }
        },
        concat: {
            templates: {
                options: {
                    process: function(src, filepath) {
                        var id = filepath.replace(/www\/tpl\/(.*)\.html/, '$1');
                        return '<script type="text/template" id="' + id + '">' + src + '</script>';
                    }
                },
                src: ['www/tpl/*.html'],
                dest: 'tmp/templates.html'
            },
            distPreCordova: {
                options: {
                    separator: ';',
                },
                src: ['www/libs/jquery_2.0.3/jquery-2.0.3.min.js','www/libs/underscore_1.4.4/underscore-min.js','www/libs/backbone_1.0.0/backbone-min.js'],
                dest: 'build/preCordova.js'
            },
            distPostCordova: {
                options: {
                    separator: ';',
                },
                src: [
                    // libriairies déjà minifiées
                    'www/libs/flexslider_2.2.2/jquery.flexslider-min.js',
                    'www/libs/jQuery.mmenu-master/src/js/jquery.mmenu.min.js',
                    'www/libs/leaflet/leaflet.js',
                    'www/libs/bootstrap_3.0.2/js/bootstrap.min.js',
                    'www/libs/jquery.hammer.js-master/jquery.hammer-full.min.js',
                    // libriairies minifiées avec uglify ci-dessus
                    'tmp/libs/NS.UI.Notification/notification.js',
                    'tmp/libs/fastclick_1.0.2/fastclick.js',
                    'tmp/libs/cordova_plugin-PushNotification/PushNotification.js',
                    'tmp/js/sauvage_notifications.js',
                    'tmp/js/app.js',
                    'tmp/js/utilities.js',
                    'tmp/libs/NS.UI.Forms/forms.js',
                    'tmp/js/database.js',
                    'tmp/js/dao.js',
                    'tmp/js/model.js',
                    'tmp/js/view.js',
                    'tmp/js/router.js',
                    'tmp/js/utilities_wstela.js',
                    'tmp/js/utilities_send_obs.js',
                    'tmp/libs/NS.UI.Notification/notification_modal.js',
                    'tmp/libs/backbone-autocomplete/backbone.autocomplete.js',
                ],
                dest: 'build/postCordova.js'
            }
        },
        clean: ['tmp','build/tpl']
        // TODO: zip + phonegap build : https://coderwall.com/p/e0jxea
    });

    // Load the plugin that provides the "uglify" task.
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-replace');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Default task(s).
    grunt.registerTask('default', ['copy', 'cssmin', 'uglify', 'concat', 'replace', 'clean']);
};
