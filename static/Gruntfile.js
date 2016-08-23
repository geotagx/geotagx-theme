module.exports = function(grunt){
    grunt.initConfig({
        pkg: grunt.file.readJSON("bower.json"),
        dir: {
            css: "css",
            js: "geotagx/js",
            img: "img",
            vendor: "vendor",
        },
        concat: {
            options: {
                separator: ";",
                stripBanners: true
            },
            bundle_css: {
                options: {
                    separator: "",
                },
                files: {
                    "<%= dir.css %>/base.min.css": [
                        "<%= dir.css %>/base/component/call-to-action.css",
                        "<%= dir.css %>/base/component/grid.css",
                        "<%= dir.css %>/base/bootstrap-reset.css",
                        "<%= dir.css %>/base/page.css",
                        "<%= dir.css %>/base/footer.css",
                        "<%= dir.css %>/base/component.css",
                        "<%= dir.css %>/base/style.css",
                        "<%= dir.css %>/base/style-responsive.css",
                    ],
                }
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
    });
    grunt.loadNpmTasks("grunt-contrib-concat");

    grunt.registerTask("bundle", ["concat:bundle_css", "concat:bundle_js", "concat:bundle_minified_vendors"]);
    grunt.registerTask("minify", ["minify:TODO"]);
};
