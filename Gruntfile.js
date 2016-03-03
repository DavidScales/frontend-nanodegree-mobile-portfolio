/*
  Code Partly From Udacity Responsive Images Course

  1. Inline (and minify) css.
  2. Minify html (and inlined js).
  3. Uglify js
  4. Minify remaining css
  5. Clean and make image directories, copy fixed images
  6. Resize and optimize images


  Automatically resize and optimize images, minify and internalize critical css,
  minify non-critical css, uglify js (non-critical),
  minify html and inlined js, and manage the associate files and directories.

  Can be used to check PageSpeed Insights - requires manual set up.
  Manual call with 'grunt pagespeed.'

  2016-03-02
  Tried to automate pagespeed with:
    http://www.jamescryer.com/2014/06/12/grunt-pagespeed-and-ngrok-locally-testing/
    https://github.com/jrcryer/grunt-pagespeed-ngrok-sample
  But Recent bug is preventing access:
    https://github.com/inconshreveable/ngrok/issues/248
*/

module.exports = function(grunt) {

  grunt.initConfig({

    /* PageSpeed Insights report. Requires manual set up.
    https://www.npmjs.com/package/grunt-pagespeed

    Input url's into marked options below.

    For local testing:
    Start local server: python -m SimpleHTTPServer 8080
    Expose server with ngrok(need download https://ngrok.com/): ./ngrok http 8080 */
    pagespeed: {
      options: {
        nokey: true,
        locale: 'en_GB',
        threshold: 40,
        url: 'https://www.google.com/' // Set target url. (or ngrok provided url, if local)
      },
      local: {
        options: {
          locale: 'en_GB',
          strategy: 'desktop',
          url: 'https://www.google.com/' // Set target url. (or ngrok provided url, if local)
        }
      },
      mobile: {
        options: {
          locale: 'en_GB',
          strategy: 'mobile',
          url: 'https://www.google.com/' // Set target url. (or ngrok provided url, if local)
        }
      }
    },

    /* Minify css files. Only print.css (non-critical) needs minification,
    as style.css (critical) is minified & internalized by grunt-inline.

    https://github.com/gruntjs/grunt-contrib-cssmin */
    cssmin: {
      target: {
        files: [{
          expand: true,
          cwd: 'src/css',
          src: ['print.css'],
          dest: 'css',
          ext: '.css'
        }]
      }
    },

    /* Uglify js
    https://github.com/gruntjs/grunt-contrib-uglify */
    uglify: {
      my_target: {
        files: {
          'js/perfmatters.js': ['src/js/perfmatters.js'], // dest : src
          'views/js/main.js': ['views/src/js/main.js'], // dest : src
        }
      }
    },

    /* Minify html files, including inlined js
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
          'index.html': 'index.html', // destination : source
          'project-mobile.html' : 'project-mobile.html', // destination : source
          'project-2048.html' : 'project-2048.html', // destination : source
          'project-webperf.html' : 'project-webperf.html', // destination : source
          'views/pizza.html' : 'views/pizza.html' // destination : source
        }
      }
    },

    /*  Minify and internalize critical css into <style> in html files.

     * Mark href with ?__inline=true
     * https://github.com/chyingp/grunt-inline */
    inline: {
      task1: {
        options: {
          cssmin: true
        },
        src: 'src/index.html',
        dest: 'index.html'
      },
      task2: {
        options: {
          cssmin: true
        },
        src: 'src/project-mobile.html',
        dest: 'project-mobile.html'
      },
      task3: {
        options: {
          cssmin: true
        },
        src: 'src/project-webperf.html',
        dest: 'project-webperf.html'
      },
      task4: {
        options: {
          cssmin: true
        },
        src: 'src/project-2048.html',
        dest: 'project-2048.html'
      },
      task5: {
        options: {
          cssmin: true
        },
        src: 'views/src/pizza.html',
        dest: 'views/pizza.html'
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
          }, {
            width: 720,
            rename: true,
            quality: 60
          }]
        },

        /* Set source image file types and directory. Set destination image directory */
        files: [{
          expand: true,
          src: ['*.{gif,jpg,png,jpeg}'],
          cwd: 'views/src/images/',
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
          cwd: 'views/src/images/fixed/',
          dest: 'views/images/'
        }]
      },
    },
  });

  // Load grunt tasks, loads tasks automatically from package.json
  // replaces grunt.loadNpmTask('grunt-...'); lines for each plugin
  require('load-grunt-tasks')(grunt);

  grunt.registerTask('default', ['inline', 'htmlmin', 'uglify', 'cssmin', 'clean', 'mkdir', 'copy', 'responsive_images', 'imageoptim']);
};
