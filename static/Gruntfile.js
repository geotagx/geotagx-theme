module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON("bower.json"),
        dir: {
            css: "css",
            js: "geotagx/js",
            img: "img",
            vendor: "vendor",
        },
        cssmin: {
            theme: {
                files: {
                    "<%= dir.css %>/theme.min.css": [
                        "<%= dir.css %>/theme/button.css",
                        "<%= dir.css %>/theme/navigation.css",
                        "<%= dir.css %>/theme/page.css",
                        "<%= dir.css %>/theme/page-footer.css",
                        "<%= dir.css %>/theme/project-grid.css",
                    ],
                },
            }
        },
        concat: {
            options: {
                separator: ";",
                stripBanners: true
            },
            bundle_js: {
                files: {
                    "<%= dir.js %>/base.min.js": [
                        "<%= dir.js %>/base/underscore-small.js",
                        "<%= dir.js %>/base/page.js",
                        "<%= dir.js %>/base/ccl-analytics.min.js",
                        "<%= dir.js %>/base/analytics.js",
                        //"<%= dir.js %>/base/surveys.js",
                    ],
                }
            },
            bundle_minified_vendors: {
                files: {
                    "<%= dir.js %>/base.min.js": [
                        "<%= dir.js %>/base.min.js",
                        "<%= dir.vendor %>/jquery-smooth-scroll/jquery.smooth-scroll.min.js",
                    ],
                }
            },
        },
        zopfli: {
            css: {
                expand: true,
                cwd: "<%= dir.css %>",
                dest: "<%= dir.css %>",
                src: "**/*.min.css",
            },
            js: {
                expand: true,
                cwd: "<%= dir.js %>",
                dest: "<%= dir.js %>",
                src: "**/*.min.js",
            },
        },
    });
    grunt.loadNpmTasks("grunt-contrib-cssmin");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-zopfli-native");

    grunt.registerTask("minify", ["cssmin:theme"]);
    grunt.registerTask("bundle", ["concat:bundle_js", "concat:bundle_minified_vendors"]);
    grunt.registerTask("compress", ["zopfli:css", "zopfli:js"]);
    grunt.registerTask("default", ["minify", "bundle", "compress"]);
};
