# Performance Optimization
The goal of this project was to optimize the performance of a given website, or put more elegantly:

> As web applications become increasingly interactive and accessed on
> a variety of devices there are a variety of opportunities in which
> performance issues can hinder the user experience. This project
> presents a number of those performance issues and provides an
> opportunity to showcase your skills in identifying and optimizing
> web applications.

Throughout the project and proceeding course I learned about the critical rendering path (CRP), which is essentially the browser's pipeline of receiving, processing, and eventually rendering HTML, CSS, and JavaScript into a visible web page, and the dependencies between them. Further, I learned to see sites as continuously running applications, as opposed to static pages, and how to maintain a high and consistent frame rate in order to secure the best user experience.

## Optimizing the CRP and load time
The first step in the project was to optimize the CRP, and bring the page load time down. [Google's PageSpeed Insights] PageSpeed score was used as the metric of performance.

#### Starting out and setting up
This project began by forking the [Web Performance Optimization] project, which is a repo with the original janky website. The forked repo was then cloned to my local machine. To test the performance of the site, it needs to be accessed via a server, rather than my local machine. Otherwise, resource requests are not actually being sent over the web.

Trying to achieve this, I set up a local python server by running
```sh
    python -m SimpleHTTPServer 8080
```
in the project's working directory. This lets the directory act as a local server, but unfortunately, this still won't work for Google's Page Speed Insights, because my local server is not accessible remotely. To solve this, I used [ngrok] to securely expose my local server to the web.
```sh
    ./ngrok http 8080
```
Testing the website with Pagespeed Insights, I get a starting score of:
- Mobile: 27
- Desktop: 29

#### Media Queries
I started by adding a media query to the non-critical CSS resource, print.css. This resource is only used if the page is being printed, and so it doesn't need to be requested and parsed before we start displaying content. Adding the attribute `media="print"` to the print.css external link tells the browser not to prioritize this file unless we are printing, and wait until after the page has rendered to request and process it.

#### Resizing and Optimizing Images
Images can take up huge amounts of data and substantially hurt load time if neglected. The largest image of this site, had a natural width of 2048px, but was only about 115px wide on the actual site. Resizing and compressing the image reduced its size from 2.3MB to just 23KB (a 99% reduction), and reduced the total site data transferred from 2.3MB to 77.5KiB (a 96% reduction). While image resources are not render blocking, they can dramatically slow site loading.

#### Deferring JavaScript
By default, the browser assumes any JS is going to interact with and affect the DOM or CSSOM. So when JS is reached in parsing, it not only blocks further parsing of HTML (mostly), but also must wait for the CSSOM to finish construction. This can be a significant delay. If the JS is not going to interact with the DOM/CSSOM though, it can be marked with `defer` to postpone execution until after the page has loaded, avoiding any delay entirely.

#### More Image Optimization
Even though the remaining images don't need to be resized, they can still benefit from compression. Using another image tool, all site images were compressed (including the previously resized & compressed image, which compressed further). Again, while these are not CRP resources, this step does reduce the sites total transferred size from 77.5KB to 23.8KB (much of which may be overhead from GZIP or a similar process), a 69% reduction.

#### Inlining Fonts
Normally, a browser must construct the render tree (requiring the DOM and CSSOM) before it will know which fonts are needed, so font requests are postponed until late in the CRP. But the browser cannot render text until the font resources are received and downloaded, so rendering can get pushed back because of this. To get around the delay, the fonts were inlined into the main CSS file, style.css. This forces the browser to load the fonts immediately, since CSS resources are required for the CSSOM and thus high priority.

#### Minification and Internalization of CSS
Inlining a CSS resource, into the `<style>` tag of an HTML file eliminates the request for the CSS resource altogether. Additionally, minifying a file removes unnecessary whitespace (along with some other tricks), reducing a files size. Both of these were used on the main CSS resource, style.css, eliminating a critical request and reducing overall file sizes. One disadvantage of this strategy however, is that the process must be repeated for other pages that use the same CSS file, since it's internalized in the original page and not available to any additional pages. This can lead to redundant code, and an increase in the average size of pages as a result. For this project however, the advantage of avoiding the CSS resource request outweighed this drawback, especially since the CSS file itself is quite small.

#### More Minification and Uglification
Taking the previous step further, HTML files themselves can be minified, allowing further reduction in transferred file size. This was done for the main HTML file, index.html, as well as the aforementioned auxiliary CSS file, print.css. The sites JS file's were also similarly reduced, although this process is referred to as uglification.

#### Final PageSpeed Score
While only the homepage was under scrutiny in this project, ultimately the above optimizations were performed on each of the site's pages, and the final PageSpeed scores were substantially higher:
- Mobile: 95
- Desktop: 96

There are certainly further optimizations that could be made (for example using srcset to make images more responsive, as I've learned in [another project]), however as far as the CRP is concerned, the PageScore is high and the site seems to load in about 700-1100ms on on simulated 3G network.

#### A Note on Automation and Using Grunt
Much of the tasks in the optimization process are highly tedious, especially if they must be re-done every time a change or update is made. To solve this I used [Grunt], a command line task runner. This allowed me to set up an automated process for most of these steps. Setting up a grunt process requires essentially three parts. First, a Gruntfile.js and package.json file must be created in the project directory. These files specify what Grunt needs to to, and which resources it needs to do it, respectively. Next, each of the required plugins must be installed locally. The final step is to configure the Grunt.js file itself, defining each of the tasks that need to be performed. For example, the task 'cssmin' defined here
```sh
cssmin: {
    target: {
        files: [{
            expand: true,
            cwd: 'src/css',
            src: ['print.css'],
            dest: 'dist/css',
            ext: '.min.css'
        }]
    }
}
```
creates a minified version of the print.css file in *scr/css*, changing the extension to ".min.css", and placing it in *dist/css*. This task can be executed from the project directory by running `grunt cssmin`. Similarly
* `grunt inline` will inline the pretermined CSS files (marked with `?__inline=true`)
* `grunt htmlmin` will minify the HTML files
* `grunt uglify` will uglify the JS files
* `grunt clean` will remove the *dist/images* directory
* `grunt mkdir` will make a new *dist/images* directory
* `grunt copy` will copy over images from *src/images/fixed* to *dist/images*
* `grunt responsive_images` will resize and optimize images in *src/images* to *dist/images*
* `grunt imageoptim` will attempt to optimize images in *dist/images*

For simplest use, however, just running `grunt` from the project directory will perform all of these tasks, in the appropriate order.

##### Some of the tools and Grunt plugins I used
- [Image Magick]
- [ImageOptim]
- [ImageMagick plugin]
- [ImageOptim plugin]
- [CSS Inline plugin]
- [CSS Minification plugin]
- [HTML Minification plugin]
- [JS Uglification plugin]

## Optimizing FPS
The second part of the project was to optimize the performance of pizza.html, which had major jank issues when the pizza images were resized and when the page was scrolled.

### Resizing
The first major performance bottleneck was the section of code responsible for resizing pizza images on the screen. There were four sources of jank.

##### Unnecessary DOM Lookups
Looking up elements within the DOM can be expensive, especially when happening repeatedly. This code below, for resizing the pizza elements, redundantly calls `querySelectorAll(".randomPizzaContainer")` four times in this loop.
```sh
function changePizzaSizes(size) {
    for (var i = 0; i < document.querySelectorAll(".randomPizzaContainer").length; i++) {
      var dx = determineDx(document.querySelectorAll(".randomPizzaContainer")[i], size);
      var newwidth = (document.querySelectorAll(".randomPizzaContainer")[i].offsetWidth + dx) + 'px';
      document.querySelectorAll(".randomPizzaContainer")[i].style.width = newwidth;
    }
}
```
A better approach would be to perform this lookup just once, and store it in a variable. In fact, since the element being looked up each loop iteration is the same, we can factor it outside of the loop with that same variable, like so:
```sh
var randomPizzaContainer = document.querySelectorAll("randomPizzaContainer");
function changePizzaSizes(size) {
    for (var i = 0; i < randomPizzaContainer.length; i++) {
      var dx = determineDx(randomPizzaContainer[i], size);
      var newwidth = (randomPizzaContainer.offsetWidth + dx) + 'px';
      document.randomPizzaContainer[i].style.width = newwidth;
    }
}
```
Now rather that performing lookups in every loop iteration, the computation is done only once.

##### Forced Synchronous Layout
Forced synchronous layout (FSL) occurs when a style event is triggered immediately after a layout event is triggered for the same element. Since style events naturally generate layout events, any layout events occurring before a style event will be invalidated (because all the layout computations for the page must be done again). This is wasted computation.

We still have this problem in the new code, shown again below. Each time `determineDX` is called and `.offsetWidth` is accessed, layout events occur. This is followed by a `.style` access, which triggers a style event. Since this style event will generate yet another layout event, the previous two become invalidated.
```sh
var randomPizzaContainer = document.querySelectorAll("randomPizzaContainer");
function changePizzaSizes(size) {
    for (var i = 0; i < randomPizzaContainer.length; i++) {
      var dx = determineDx(randomPizzaContainer[i], size);
      var newwidth = (randomPizzaContainer.offsetWidth + dx) + 'px';
      document.randomPizzaContainer[i].style.width = newwidth;
    }
}
```
##### Layout Thrashing
In addition to the current FSL problem, layout thrashing is also occuring in this code. Layout thrashing happens when a geometric CSS property is accessed repeatedly, such as in a loop. Since these properties cause layout events, we get multiple layout events stacking up, eating through a lot of computation time. This is occurring in the two previously problematic lines
```sh
var dx = determineDx(randomPizzaContainer[i], size);
var newwidth = (randomPizzaContainer.offsetWidth + dx) + 'px';
```
as `.offsetWidth` is a geometric property and `determinDx` also accesses `.offsetWidth`.

##### Reduce Computation
Looking further at these two problematic lines, and `determineDx` in particular, it can be seen that these lines and the function itself are essentially unnecessary. A better approach is to simply choose a percentage value in a switch statement (assigned to `newWidth`), and assign it directly as the `.width` property, since the sizes of the pizzas are finite. This eliminates a lot of computation, as well as the layout thrashing and FSL.
```sh
function changePizzaSizes(size) {
    var randomPizzaContainer = document.getElementsByClassName("randomPizzaContainer");
    for (var i = 0, l = randomPizzaContainer.length; i < l; i++) {
      randomPizzaContainer[i].style.width = newWidth;
    }
}
```
Notice also that `getElementsByClassName` is used instead of `querySelectorAll`, as it is faster when choosing classes. Additionally the for loop has been rewritten from
```sh
for (var i = 0; i < randomPizzaContainer.length; i++)
```
which must compute the length of `randomPizzaContainer` on each iteration, to
```sh
 for (var i = 0, l = randomPizzaContainer.length; i < l; i++)
```
which only needs to compute the length once, and stores it as a variable for reference.

##### Improvement
Overall these optimizations brought the transition time for resizing the pizza images from 170-220ms to 0.5ms. A substantially improvement.


### Scrolling
The second major performance bottleneck was the section of code that animated the background pizza images during scrolling. The issues and solutions were similar.

Looking at the code that animates the pizzas, we can see a number of issues again.
```sh
function updatePositions() {
  ...
  var items = document.querySelectorAll('.mover');
  for (var i = 0; i < items.length; i++) {
    var phase = Math.sin((document.body.scrollTop / 1250) + (i % 5));
    items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
  }
  ...
```
Rather than using `querySelectorAll`,
```sh
var items = document.querySelectorAll('.mover');
```
we could use `getElementsByClassName`, which is faster:
```sh
var items = document.getElementsByClassName('.mover');
```

Rather than calculate length on every loop iteration,
```sh
for (var i = 0; i < items.length; i++)
```
we could compute it once and store it as a variable:
```sh
for (var i = 0, len = items.length; i < len; i++)
```
Rather than do all the math within the loop,
```sh
var phase = Math.sin((document.body.scrollTop / 1250) + (i % 5));
```
We could factor some of it out:
```sh
  var phase = [];
  for (var i = 0; i < 5; i++) {
    phase.push(Math.sin(normalizeScrollTop + i));
  }
```
Finally, this line here triggers style, which isn't inherently a problem.
```sh
items[i].style.left = items[i].basicLeft + 100 * phase + 'px';
```
However, style also triggers layout and paint, which is potentially the most expensive operation, especially when done repeatedly for multiple elements. Rather than repaint the whole screen for all of these pizzas, another approach is to use a CSS property that doesn't trigger paint at all, such as transform.
```sh
items[i].style.transform = 'translate3d(' + pos + 'px, 0, 0)';
```
This promotes the pizza images to their own layer, and simply shifts them around the screen during animation, rather than constantly repainting them. The final improved function is significantly optimized:
```sh
function updatePositions() {
  ...
  var normalizeScrollTop = document.body.scrollTop/1250;
  var phase = [];
  for (var i = 0; i < 5; i++) {
    phase.push(Math.sin(normalizeScrollTop + i));
  }
  var items = document.getElementsByClassName('.mover');
  for (var i = 0, len = items.length; i < len; i++) {
    var pos = items[i].basicLeft + (100 * phase[i % 5]);
    items[i].style.transform = 'translate3d(' + pos + 'px, 0, 0)';
  }
  ...
```

Further, rather than initially generating 200 pizza items (most of which aren't even visible on screen)
```sh
for (var i = 0; i < 200; i++)
```
we can calculate a more optimal amount (originally I had calculated the *minimum*, by letting `cols` be based on window width, however this led to potential problems with the math used in `updatePositions`), that still covers the visible window:
```sh
var cols = 8;
var rows = Math.floor(window.innerHeight / s) + 1;
var numPizzas = rows * cols;
for (var i = 0; i < numPizzas; i++)
```
This means that instead of updating 200 objects, we may only need to update perhaps 30-35. And finally, rather than updating on every scroll event with
```sh
window.addEventListener('scroll', updatePositions);
```
we can use requestAnimationFrame (rAF), which lets the browser have more control over the timing of animations, so that we can work with the browser's timing pipeline rather than against it:
```sh
window.addEventListener('scroll', tryRequestAnimationFrame);
function tryRequestAnimationFrame() {
  if (!window.requested) {
    requestAnimationFrame(updatePositions);
    window.requested = true;
  }
}
```
(The `window.requested` feature helps ensure that rAF is only called when the previous rAF has finished.)
##### Improvement
Initially the site's frames per second (fps) was about 13 or 14, and the `updatePositions` function itself took about 55ms to execute. After the optimizations, `updatePositions` executes in about 0.3-0.6ms, and the frame rate is consistently 55-60fps.


[Google's PageSpeed Insights]: <https://developers.google.com/speed/pagespeed/insights/>
[Web Performance Optimization]: <https://github.com/udacity/frontend-nanodegree-mobile-portfolio>
[ngrok]: <https://ngrok.com/>
[Grunt]: <http://gruntjs.com/>
[another project]: <https://github.com/DavidScales/portfolio>

[Image Magick]: <http://www.imagemagick.org/script/index.php>
[ImageOptim]: <https://imageoptim.com/>
[ImageMagick plugin]: <https://github.com/andismith/grunt-responsive-images>
[ImageOptim plugin]: <https://github.com/JamieMason/grunt-imageoptim>
[CSS Inline plugin]: <https://github.com/chyingp/grunt-inline>
[CSS Minification plugin]: <https://github.com/gruntjs/grunt-contrib-cssmin>
[HTML Minification plugin]: <https://github.com/gruntjs/grunt-contrib-htmlmin>
[JS Uglification plugin]: <https://github.com/gruntjs/grunt-contrib-uglify>

License
----

MIT
