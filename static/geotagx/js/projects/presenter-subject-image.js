/*
 * A script that manages a GeoTag-X project's image subject.
 * Copyright (c) 2016, UNITAR/UNOSAT.
 *
 * The code is based heavily on Wheelzoom 3.0.2 by jacklmoore (http://www.jacklmoore.com/wheelzoom).
 * Author: Jeremy Othieno.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function(geotagx, $, undefined){
    "use strict";
    /**
     * Instantiate an Image object on the HTML element with the specified id.
     */
    var Image = function(id, options){
        this.source = null;

        this.frame = document.getElementById(id);
        this.frame.style.overflow = "hidden";
        this.frame.style.backgroundColor = "#CFCFCF";
        this.frame.oldWidth = 0;
        this.frame.oldHeight = 0;

        this.busyIcon = this.frame.appendChild(document.createElement("i"));
        this.busyIcon.className = "fa fa-3x fa-cog fa-spin";
        this.busyIcon.style.color = "#FFF";
        this.busyIcon.style.textAlign = "center";
        this.busyIcon.style.visibility = "hidden";

        this.image = this.frame.appendChild(document.createElement("img"));
        this.image.addEventListener("wheel", onWheel.bind(this));
        this.image.addEventListener("mousedown", onMouseDown.bind(this));
        this.image.aspectRatio = 0;
        this.image.rotation = 0;
        this.image.style.backgroundRepeat = "no-repeat";
        this.image.transparentCanvas_ = generateTransparentImage(1, 1);

        this.settings = $.extend({
            zoomFactor:0.15,
            discreetZoomFactor:0.45
        }, options);

        this.attributes = {
            x:0,   // The image's horizontal position.
            y:0,   // The image's vertical position.
            w:0,   // The image's width.
            h:0,   // The image's height.
            bgw:0, // The background width.
            bgh:0, // The background height.
            e:null // The previous event.
        };
    };
    /**
     * Returns the URL to the image.
     */
    Image.prototype.getSource = function(){
        return this.source;
    };
    /**
     * Sets the image source, i.e. the URL to the image.
     */
    Image.prototype.setSource = function(source){
        if (typeof(source) !== "string")
            return;

        var context = this;
        $(context.image).fadeOut(100, function(){
            if (this.source === source){
                // If the new source is the same as the older one, there's no need to
                // change the image. Instead, we reset its zoom level and rotation.
                context.resetZoom();
                context.resetRotation();
                $(context.image).fadeIn();
            }
            else {
                this.source = source;

                // Display the busy icon. Note that the icon's visibility is set to hidden when
                // the frame is being resized since setting its display to 'none' would return
                // incorrect values for offsetWidth and offsetHeight.
                context.busyIcon.style.display = "block";
                context.busyIcon.style.visibility = "visible";

                // Wait for the image to completely download before we set it up.
                context.image.src = source;
                var interval = setInterval(function(){
                    if (context.image.complete){
                        clearInterval(interval);

                        // Hide the busy icon but do not set its display to 'none'. Remember, we need its
                        // offsetWidth and offsetHeight when resizing the frame.
                        context.busyIcon.style.visibility = "hidden";

                        context.image.aspectRatio = context.image.naturalWidth / context.image.naturalHeight;
                        context.image.rotation = 0;
                        context.image.src = context.image.transparentCanvas_;
                        context.image.style.backgroundImage = 'url("' + source + '")';

                        context.resize();

                        // Now we can completely cull the busy icon.
                        context.busyIcon.style.display = "none";

                        $(context.image).fadeIn();
                    }
                }, 300);
            }
        });
    };
    /**
     * Zoom in on the image.
     */
    Image.prototype.zoomIn = function(){
        // Zoom in on the center of the image.
        var x = this.image.width / 2;
        var y = this.image.height / 2;

        zoom(this, -1, this.settings.discreetZoomFactor, x, y);
    };
    /**
     * Zooms out of the image.
     */
    Image.prototype.zoomOut = function(){
        // Zoom out from the center of the image.
        var x = this.image.width / 2;
        var y = this.image.height / 2;

        zoom(this, 1, this.settings.discreetZoomFactor, x, y);
    };
    /**
     * Resets the image's zoom level.
     */
    Image.prototype.resetZoom = function(){
        this.attributes.x   = 0;
        this.attributes.y   = 0;
        this.attributes.bgw = this.attributes.w;
        this.attributes.bgh = this.attributes.h;

        updateImage(this.image, this.attributes);
    };
    /**
     * Rotates the image to the left.
     */
    Image.prototype.rotateLeft = function(){
        rotate(this, this.image.rotation - 90);
    };
    /**
     * Rotates the image to the right.
     */
    Image.prototype.rotateRight = function(){
        rotate(this, this.image.rotation + 90);
    };
    /**
     * Resets the image's rotation.
     */
    Image.prototype.resetRotation = function(){
        rotate(this, 0);
    };
    /**
     * REsizes the image to fit it to the frame.
     */
    Image.prototype.resize = function(){
        var fw = this.frame.offsetWidth;
        var fh = Math.ceil(fw/this.image.aspectRatio);
        if (this.frame.oldWidth !== fw || this.frame.oldHeight !== fh){
            this.frame.oldWidth = fw;
            this.frame.oldHeight = fh;
            this.frame.style.height = fh + "px";
            this.image.style.width = fw + "px";
            this.image.style.height = fh + "px";
            this.image.style.backgroundSize = fw + "px " + fh + "px";
            this.image.style.backgroundPosition = "0 0"; // Resets the image position.

            // Vertically center the busy icon.
            this.busyIcon.style.marginTop = (0.5 * (fh - this.busyIcon.offsetHeight)) + "px";

            // Update the attributes.
            this.attributes.w   = fw;
            this.attributes.h   = fh;
            this.attributes.bgw = fw;
            this.attributes.bgh = fh;
            this.attributes.x   = 0;
            this.attributes.y   = 0;
        }
    };
    /**
     * Returns a transparent image with the specified width and height.
     */
    function generateTransparentImage(width, height){
        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        return canvas.toDataURL();
    }
    /**
     * Updates the image.
     */
    function updateImage(image, attributes){
        if (attributes.x > 0)
            attributes.x = 0;
        else if (attributes.x < (attributes.w - attributes.bgw))
            attributes.x = attributes.w - attributes.bgw;

        if (attributes.y > 0)
            attributes.y = 0;
        else if (attributes.y < (attributes.h - attributes.bgh))
            attributes.y = attributes.h - attributes.bgh;

        image.style.backgroundSize = attributes.bgw + "px " + attributes.bgh + "px";
        image.style.backgroundPosition = attributes.x + "px " + attributes.y + "px";
    }
    /**
     * Zooms in/out of the image at the coordinates <x, y>.
     */
    function zoom(context, delta, factor, x, y){
        var attributes = context.attributes;

        // Record the offset between the bg edge and cursor:
        var bgCursorX = x - attributes.x;
        var bgCursorY = y - attributes.y;

        // Use the previous offset to get the percent offset between the bg edge and cursor:
        var bgRatioX = bgCursorX / attributes.bgw;
        var bgRatioY = bgCursorY / attributes.bgh;

        // Update the bg size:
        if (delta < 0){
            attributes.bgw += attributes.bgw * factor;
            attributes.bgh += attributes.bgh * factor;
        }
        else {
            attributes.bgw -= attributes.bgw * factor;
            attributes.bgh -= attributes.bgh * factor;
        }

        // Take the percent offset and apply it to the new size:
        attributes.x = x - (attributes.bgw * bgRatioX);
        attributes.y = y - (attributes.bgh * bgRatioY);

        // Prevent zooming out beyond the starting size
        if (attributes.bgw <= attributes.w || attributes.bgh <= attributes.h){
            attributes.x   = 0;
            attributes.y   = 0;
            attributes.bgw = attributes.w;
            attributes.bgh = attributes.h;
        }
        else
            $(context.image).trigger("zoom", delta < 0 ? -1 : 1);

        updateImage(context.image, attributes);
    }
    /**
     * A handler that is called when the user scrolls over the image.
     */
    function onWheel(e){
        /*jshint validthis:true*/
        e.preventDefault();

        var delta = e.deltaY ? e.deltaY : (e.wheelDelta ? -e.wheelDelta : 0);

        // As far as I know, there is no good cross-browser way to get the cursor position relative to the event target.
        // We have to calculate the target element's position relative to the document, and subtract that from the
        // cursor's position relative to the document.
        var rect = this.image.getBoundingClientRect();
        var x = e.pageX - rect.left - document.body.scrollLeft;
        var y = e.pageY - rect.top - document.body.scrollTop;

        // When the image is rotated, the x and y coordinates need to be transformed.
        switch (this.image.rotation){
            /*jshint shadow:true*/
            case 90:
                var a = x;
                x = (y / rect.height) * rect.width;
                y = rect.height - ((a / rect.width) * rect.height);
                break;
            case 180:
                x = rect.width - x;
                y = rect.height - y;
                break;
            case 270:
                var a = x;
                x = rect.width - (y / rect.height) * rect.width;
                y = ((a / rect.width) * rect.height);
                break;
            default:
                break;
        }
        zoom(this, delta, this.settings.zoomFactor, x, y);
    }
    /**
     * A handler that is called when the user clicks on an image.
     */
    function onMouseDown(e){
        /*jshint validthis:true*/
        e.preventDefault();

        var image = this.image;
        var attributes = this.attributes;

        attributes.e = e;

        document.addEventListener("mousemove", drag);
        document.addEventListener("mouseup", removeDrag);

        function drag(e){
            var dx = (e.pageX - attributes.e.pageX);
            var dy = (e.pageY - attributes.e.pageY);

            attributes.e = e;
            e.preventDefault();

            switch (image.rotation){
                case 90:
                    attributes.x += dy;
                    attributes.y -= dx;
                    break;
                case 180:
                    attributes.x -= dx;
                    attributes.y -= dy;
                    break;
                case 270:
                    attributes.x -= dy;
                    attributes.y += dx;
                    break;
                default:
                    attributes.x += dx;
                    attributes.y += dy;
                    break;
            }
            updateImage(image, attributes);
        }

        function removeDrag(){
            document.removeEventListener("mouseup", removeDrag);
            document.removeEventListener("mousemove", drag);
        }
    }
    /**
     * Rotates the image to the specified angle (in degrees).
     */
    function rotate(context, angle){
        angle = (360 + angle) % 360;

        var frame = context.frame;
        var image = context.image;
        var ratio = angle === 90 || angle === 270 ?
                    1 / image.aspectRatio :
                    image.aspectRatio;

        // Calculate the rotated image's dimensions.
        var fw = frame.offsetWidth;
        var fh = fw / ratio;

        // Resize the frame to match the height of the rotated image.
        frame.style.height = fh + "px";

        // Changing the height may result in a scrollbar appearing, which
        // shrinks the viewport horizontally. Consequently, the frame's width
        // changes and has to be refetched.
        fw = frame.offsetWidth;

        // The image is rotated and scaled to match the new resolution.
        var sx = 1;
        var sy = 1;

        if (ratio !== image.aspectRatio){
            sx = fh / fw;
            sy = fw / fh;
        }

        image.rotation              = angle;
        image.style.transform       = /* Note: chained assignment */
        image.style.oTransform      =
        image.style.msTransform     =
        image.style.mozTransform    =
        image.style.webkitTransform = "rotate(" + image.rotation + "deg) scale(" + sx + ", " + sy + ")";

        // Set the image's new resolution.
        var imageStyle = window.getComputedStyle(image, null);
        context.attributes.w = parseInt(imageStyle.width, 10);
        context.attributes.h = parseInt(imageStyle.height, 10);

        Image.prototype.resetZoom.call(context);
    }

    geotagx.Image = Image;
})(window.geotagx = window.geotagx || {}, jQuery);
