module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        dir: {
            css: "css",
            js: "js",
            img: "img",
            vendor: "node_modules",
        },
        cssmin: {
            theme: {
                files: {
                    "<%= dir.css %>/theme.min.css": "<%= dir.css %>/theme/**/*.css",
                },
            }
        },
        uglify: {
            theme: {
                files: {
                    "<%= dir.js %>/base.min.js": [
                        "<%= dir.js %>/base/underscore-small.js",
                        //"<%= dir.js %>/base/surveys.js",
                        "<%= dir.js %>/base/analytics.js",
                        "<%= dir.js %>/base/page.js"
                    ],
                }
            }
        },
        concat: {
            options: {
                separator: ";",
                stripBanners: {
                    block: true,
                    line: true
                }
            },
            js: {
                files: {
                    "<%= dir.js %>/base.min.js": [
                        "<%= dir.vendor %>/jquery/dist/jquery.min.js",
                        "<%= dir.vendor %>/bootstrap/dist/js/bootstrap.min.js",
                        "<%= dir.js %>/base/ccl-tracker/analytics.min.js",
                        "<%= dir.js %>/base.min.js",
                    ],
                }
            },
            css: {
                files: {
                    "<%= dir.css %>/theme.min.css": [
                        "<%= dir.vendor %>/bootstrap/dist/css/bootstrap.min.css",
                        "<%= dir.css %>/theme.min.css",
                    ],
                }
            },
        },
        zopfli: {
            css: {
                expand: true,
                cwd: "<%= dir.css %>",
                dest: "<%= dir.css %>",
                src: "*.min.css",
            },
            js: {
                expand: true,
                cwd: "<%= dir.js %>",
                dest: "<%= dir.js %>",
                src: "*.min.js",
            },
        },
    });
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-zopfli-native");

    grunt.registerTask("minify", ["cssmin:theme", "uglify:theme"]);
    grunt.registerTask("bundle", ["concat:css", "concat:js"]);
    grunt.registerTask("compress", ["zopfli:css", "zopfli:js"]);
    grunt.registerTask("default", ["minify", "bundle", "compress"]);
};
