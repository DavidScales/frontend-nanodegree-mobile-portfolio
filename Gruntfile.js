/*
  Code Partly From Udacity Responsive Images Course

  Automatically resize and optimize images, minify and internalize css,
  minify html and inline js, and manage the associate files and directories.
*/

module.exports = function(grunt) {
  grunt.initConfig({

    /* Minify my main html file, index.html
    https://github.com/gruntjs/grunt-contrib-htmlmin */
    htmlmin: {
      dist: {
        options: {
          removeComments: true, // remove comments from html
          removeCommentsFromCDATA: true, // remove comments from <script> and <style>
          removeScriptTypeAttributes: true, // remove unnecessary <script> attributes
          removeStyleLinkTypeAttributes: true, // remove unnecessary <style> attributes
          minifyJS: true, // minify inline js
          collapseWhitespace: true, // remove whitespace
          conservativeCollapse: true // preserve a single whitespace, to prevent potential errors
        },
        files: {
          'index.min.html': 'index.html' // destination : source
        }
      }
    },

    /*  Minify and internalize style.css into <style> in index.html
     * Mark href with ?__inline=true
     * https://github.com/chyingp/grunt-inline */
    inline: {
      dist: {
        options: {
          cssmin: true
        },
        src: 'index_src.html',
        dest: 'index.html'
      }
    },

    /* Optimize images with ImageOptim
    Run after responsive_images for further optimizations.
    Leave jPeg mini false, its not installed (its $20!).
    You can set imageAlpha to true, it works on png's only and is lossy.
    ImageOptim is already true (all are true by default)
    https://github.com/JamieMason/grunt-imageoptim */
    imageoptim: {
      myTask: {
        options: {
          jpegMini: false,
          imageAlpha: false
        },
        src: ['img','views/images']
      }
    },

    /* Resize and optimize images with ImageMagick
    https://github.com/andismith/grunt-responsive-images */
    responsive_images: {
      dev: {
        options: {
          engine: 'im', // engine is for ImageMagick command line tool
          sizes: [{
            width: 115,
            rename: false,
            quality: 60
          }]
        },

        /* Set source image file types and directory. Set destination image directory */
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png,jpeg}'],
          cwd: 'views/images_src/',
          dest: 'views/images/'
        }]
      }
    },

    /* Clear out the images directory if it exists */
    clean: {
      dev: {
        src: ['views/images'],
      },
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['views/images']
        },
      },
    },

    /* Copy the "fixed" images that don't go through processing into the images/directory */
    copy: {
      dev: {
        files: [{
          expand: true,
          src: '*.{gif,jpg,png}',
          cwd: 'views/images_src/fixed/',
          dest: 'views/images/'
        }]
      },
    },
  });

  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-inline');
  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-imageoptim');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.registerTask('default', ['clean', 'mkdir', 'copy','inline', 'htmlmin', 'responsive_images', 'imageoptim']);

};
