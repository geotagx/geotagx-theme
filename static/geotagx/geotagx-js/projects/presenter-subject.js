/*
 * A script that manages a GeoTag-X project's subject.
 * Copyright (c) 2016, UNITAR-UNOSAT.
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
;(function(project, $, undefined){
    "use strict";

    var __component__ = {};
    /**
     * The subject instance.
     */
    var subject_ = null;
    /**
     * Event types.
     */
    __component__.EVENT_URL_CHANGE = "project-event-subject-url-change";
    __component__.EVENT_SOURCE_CHANGE = "project-event-subject-source-change";
    __component__.EVENT_IMAGE_ROTATE = "project-event-subject-image-rotate";
    __component__.EVENT_IMAGE_ZOOM = "project-event-subject-image-zoom";
    /**
     * Subject types.
     */
    __component__.TYPE_IMAGE = "image";
    __component__.TYPE_PDF = "pdf";
    /**
     * Initializes the subject module.
     */
    __component__.initialize = function(){
        var type = $.trim(__configuration__.task_presenter.subject.type);
        var node = document.getElementById("subject");
        if (node)
            node.dataset.type = type;

        // Instantiate the subject.
        var Subject = geotagx.Image; // Image is used by default.
        switch (type){
            case __component__.TYPE_PDF:
                Subject = geotagx.PDF;
                break;
            case __component__.TYPE_IMAGE:
                /* falls through */
            default:
                // Remember the Image class has already been referenced.
                break;
        }
        subject_ = new Subject("subject-body");

        initializeEventHandlers();
    };
    /**
     * Attaches an event handler for one or more events to the subject.
     */
    __component__.on = function(events, handler){
        $("#subject").on(events, handler);
        return this;
    };
    /**
     * Removes an event handler.
     */
    __component__.off = function(events, handler){
        $("#subject").off(events, handler);
        return this;
    };
    /**
     * Executes all handlers attached to the event.
     */
    __component__.trigger = function(type, parameters){
        $("#subject").trigger(type, parameters);
        return this;
    };
    /**
     * Returns the subject's type.
     */
    __component__.getType = function(){
        if (subject_ instanceof geotagx.Image)
            return __component__.TYPE_IMAGE;
        else if (subject_ instanceof geotagx.PDF)
            return __component__.TYPE_PDF;
        else
            return null;
    };
    /**
     * Returns the URL to the subject.
     */
    __component__.getUrl = function(){
        return subject_.getSource();
    };
    /**
     * Sets the URL to the subject.
     * @param url a URL to the subject.
     */
    __component__.setUrl = function(url){
        url = $.trim(url);
        if (url.length > 0 && subject_ && subject_.setSource && typeof(subject_.setSource) === "function"){
            subject_.setSource(url);
            __component__.trigger(__component__.EVENT_URL_CHANGE, url);
        }
    };
    /**
     * Returns the URL to the subject's source.
     */
    __component__.getSource = function(){
        return document.getElementById("subject-source").href;
    };
    /**
     * Sets the URL to the subject's source.
     * @param url a URL to the subject's source.
     */
    __component__.setSource = function(url){
        url = $.trim(url);
        if (url.length > 0){
            document.getElementById("subject-source").href = url;
            __component__.trigger(__component__.EVENT_SOURCE_CHANGE, url);
        }
    };
    /**
     * Updates the user's progress.
     */
    __component__.updateUserProgress = function(){
        pybossa.userProgress(geotagx.project.getShortName()).done(function(data){
            document.getElementById("analyses-remaining").innerHTML = data.done + 1;
            document.getElementById("analyses-completed").innerHTML = data.total;
        });
    };
    /**
     * Updates the component's dimensions.
     */
    __component__.resize = function(){
        subject_.resize();
    };
    /**
     * Initializes the subject's event handlers.
     */
    function initializeEventHandlers(){
        if (subject_ instanceof geotagx.Image){
            $("#subject-zoom-in").click(function(){
                subject_.zoomIn();
                __component__.trigger(__component__.EVENT_IMAGE_ZOOM, 1);
            });
            $("#subject-zoom-out").click(function(){
                subject_.zoomOut();
                __component__.trigger(__component__.EVENT_IMAGE_ZOOM, -1);
            });
            $("#subject-zoom-reset").click(function(){
                subject_.zoomReset();
                __component__.trigger(__component__.EVENT_IMAGE_ZOOM, 0);
            });
            $("#subject-rotate-left").click(function(){
                subject_.rotateLeft();
                __component__.trigger(__component__.EVENT_IMAGE_ROTATE, subject_.image.rotation);
            });
            $("#subject-rotate-right").click(function(){
                subject_.rotateRight();
                __component__.trigger(__component__.EVENT_IMAGE_ROTATE, subject_.image.rotation);
            });
        }
    }
    // Expose the frozen (immutable) module.
    project.subject = Object.freeze(__component__);
})(window.geotagx.project, jQuery);
