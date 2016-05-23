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
                stripBanners: true
            },
            // Concatenate uncompressed files.
            bundle: {
                files: {
                    "<%= dir.js %>/base.min.js": [
                        "<%= dir.js %>/base/underscore-small.js",
                        "<%= dir.js %>/base/page.js",
                    ],
                }
            },
        },
    });
    grunt.loadNpmTasks("grunt-contrib-concat");

    grunt.registerTask("bundle", ["concat:bundle"]);
    grunt.registerTask("minify", ["minify:TODO"]);
};
