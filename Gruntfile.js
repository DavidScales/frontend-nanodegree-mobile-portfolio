/*
  Code Partly From Udacity Responsive Images Course

  "grunt" alone creates a new, completed images directory
  "grunt clean" removes the images directory
  "grunt responsive_images" re-processes images without removing the old ones
*/

module.exports = function(grunt) {
  grunt.initConfig({
    /* Minify html https://github.com/gruntjs/grunt-contrib-htmlmin */
    htmlmin: {
      dist: {
        options: {
          removeComments: true,
          removeCommentsFromCDATA: true,
          removeScriptTypeAttributes: true,
          removeStyleLinkTypeAttributes: true,
          minifyJS: true,
          collapseWhitespace: true,
          conservativeCollapse: true
        },
        files: {
          'index.min.html': 'index.html'
        }
      }
    },

    /* Inline and minify css https://github.com/chyingp/grunt-inline */
    inline: {
      dist: {
        options: {
          cssmin: true
        },
        src: 'index_src.html',
        dest: 'index.html'
      }
    },

    /* run after responsive_images for further optimizations with ImageOptim.
    Leave jPeg mini false, its not installed (its $20!)
    You can set imageAlpha to true, it works on png's only and is lossy
    ImageOptim is already true (all are true by default) */
    imageoptim: {
      myTask: {
        options: {
          jpegMini: false,
          imageAlpha: false
        },
        src: ['img','views/images']
      }
    },

    /* resize and optimize images */
    responsive_images: {
      dev: {
        options: {
          engine: 'im',
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
