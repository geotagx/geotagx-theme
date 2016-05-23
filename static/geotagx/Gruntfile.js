module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON("bower.json"),
        dir: {
            css: "geotagx-css",
            js: "geotagx-js",
            img: "geotagx-img",
            vendor: "vendor",
        },
        concat: {
            options: {
                separator: ";",
                stripBanners: true
            },
            // Concatenate uncompressed files.
            bundle: {
                files: {
                    "<%= dir.js %>/base.min.js": [
                        "<%= dir.js %>/base/underscore-small.js",
                        "<%= dir.js %>/base/page.js",
                        "<%= dir.js %>/base/ccl-analytics.min.js",
                        "<%= dir.js %>/base/analytics.js",
                        "<%= dir.js %>/base/surveys.js",
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
    });
    grunt.loadNpmTasks("grunt-contrib-concat");

    grunt.registerTask("bundle", ["concat:bundle", "concat:bundle_minified_vendors"]);
    grunt.registerTask("minify", ["minify:TODO"]);
};
