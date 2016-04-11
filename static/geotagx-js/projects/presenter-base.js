/*
 * A script to manage GeoTag-X project task presenters.
 *
 * Copyright (c) 2016, UNITAR/UNOSAT.
 *
 * The MIT License (MIT)
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
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function(geotagx, $, undefined){
    "use strict";
    /**
     * The core object where all modules will be attached.
     */
    geotagx.project = geotagx.project || {};
    /**
     * Events.
     */
    geotagx.project.EVENT_READY = "event-project-ready";
    geotagx.project.EVENT_VIEWPORT_RESIZE = "event-project-viewport-resize";
    /**
     * Initializes the project when the document is ready.
     */
    $(document).ready(function(){
        geotagx.project = Object.freeze(geotagx.project);
        geotagx.project.initialize();
    });
    /**
     * Initializes the project.
     */
    geotagx.project.initialize = function(){
        //try {
            var language = "en-US";//document.querySelector("html").getAttribute("lang");

            updateReminder(language);
            updateRepository();
            initializeEvents();

            // Initialize the task presenter and subject.
            geotagx.project.questionnaire.initialize(language);
            geotagx.project.subject.initialize();
            setTimeout(function(){
                $("#loading-project").fadeOut(function(){
                    $("#project").fadeIn(150, function(){
                        pybossa.taskLoaded(onTaskLoaded);
                        pybossa.presentTask(onPresentTask);
                        pybossa.run(geotagx.project.getShortName());
                    });
                });
            }, 500);
            geotagx.project.trigger(geotagx.project.EVENT_READY);
        //} catch (e){
             // TODO Implement me.
             //throw e;
        //}
    };
    /**
     * Attaches an event handler for one or more events to the project.
     */
    geotagx.project.on = function(events, handler){
        $("#project").on(events, handler);
        return this;
    };
    /**
     * Removes an event handler.
     */
    geotagx.project.off = function(events, handler){
        $("#project").off(events, handler);
        return this;
    };
    /**
     * Executes all handlers attached to the event.
     */
    geotagx.project.trigger = function(type, parameters){
        $("#project").trigger(type, parameters);
        return this;
    };
    /**
     * Returns the project's short name.
     */
    geotagx.project.getShortName = function(){
        return document.getElementById("project").dataset.shortName;
    };
    /**
     * Updates the project's participation reminder.
     */
    function updateReminder(language){
        // TODO Implement me.
    }
    /**
     * Updates the URL to the project's version control system repository.
     */
    function updateRepository(){
        //TODO Finish implementing me.
        var url = __configuration__.project.repository.url;
        var type = __configuration__.project.repository.type;
    }
    /**
     * Initializes the project's event triggers and handlers.
     */
    function initializeEvents(){
        geotagx.project.on(geotagx.project.EVENT_VIEWPORT_RESIZE, onViewportResize);

        var triggerViewportResize = function(){
            geotagx.project.trigger(geotagx.project.EVENT_VIEWPORT_RESIZE);
        };
        // When the 'Remind Me Later' button is clicked, it hides the notification displayed to
        // anonymous users, thereby increasing the task presenter's viewport height. The viewport
        // width may change in cases where a once visible scrollbar is no longer necessary.
        $("#remind-me-later").click(function(){
            $("#anonymous-notification").fadeOut(triggerViewportResize);
        }).attr("disabled", false);

        // Note: The _debounce function is defined in geotagx.js.
        $(window).on("resize", _debounce(triggerViewportResize, 300));
    }
    /**
     * A handler that is called when PyBossa loads a new task.
     */
    function onTaskLoaded(task, deferred){
        if ($.isEmptyObject(task))
            deferred.resolve(task);
        else {
            var subjectType = geotagx.project.subject.getType();
            if (subjectType === geotagx.project.subject.TYPE_IMAGE){
                task.url_accessible = true;

                // Cache the image for later use.
                $("<img>")
                .load(function(){
                    deferred.resolve(task);
                })
                .error(function(){
                    task.url_accessible = false;
                    deferred.resolve(task);
                })
                .attr("src", task.info.image_url);
            }
            else if (subjectType === geotagx.project.subject.TYPE_PDF){
                deferred.resolve(task);
            }
        }
    }
    /**
     * A handler that is called when PyBossa presents a new task.
     */
    function onPresentTask(task, deferred){
        // If the task object is empty, then there're no more tasks to participate in.
        // Display a participation appreciation message.
        if ($.isEmptyObject(task)){
            $("#participation-appreciation-section").removeClass("hide");
            $("#questionnaire-section").addClass("hide");
            $("#image-section").addClass("hide");
            $("#pdf-section").addClass("hide");
            $("#project-task-presenter-header").addClass("hide");
        }
        else {
            var subjectUrl = task.info.image_url;
            var subjectSource = task.info.source_uri;

            geotagx.analytics.onTaskChanged(task.id);
            geotagx.project.subject.updateUserProgress();
            geotagx.project.subject.setUrl(subjectUrl);
            //geotagx.project.subject.setSource(subjectSource);
            geotagx.project.questionnaire.off(geotagx.project.questionnaire.EVENT_SUBMIT)
            .on(geotagx.project.questionnaire.EVENT_SUBMIT, function(_, results, onSubmissionSuccessful, onSubmissionFailed){
                onQuestionnaireSubmitted(task, deferred, results, onSubmissionSuccessful, onSubmissionFailed);
            })
            .start();
            //geotagx.project.questionnaire.start();
        }
    }
    /**
     * A handler that is called when the questionnaire is submitted.
     */
    function onQuestionnaireSubmitted(task, deferred, results, onSubmissionSuccessful, onSubmissionError){
        var resolve = function(){ deferred.resolve(); };

        if (!task.url_accessible){
            // If the photo is not accessible, submit the task and load another.
            pybossa.saveTask(task.id, results).done(resolve).fail(resolve);
        }
        else {
            results._subject = task.info.image_url;
            results._accessible = task.url_accessible;
            //results._visible = results._accessible && (results._visible || true); //FIXME What is it I'm trying to do here?

            switch (geotagx.project.subject.getType()){
                case geotagx.project.subject.TYPE_IMAGE:
                    results.img = results._subject;
                    break;
                case geotagx.project.subject.TYPE_PDF:
                    results.pdf = results._subject;
                    break;
                default:
                    break;
            }

            pybossa.saveTask(task.id, results)
            .done(function(){
                // A delay is introduced between the moment results have been stored and the next question
                // is displayed. Let's give the user the satisfaction of submitting their work...
                setTimeout(function(){
                    onSubmissionSuccessful();
                    setTimeout(resolve, 1000);
                }, 1000);
            })
            .fail(function(response){
                // If the status code is 403 (FORBIDDEN), then we assume that the
                // data was sent but the deferred object has not yet been resolved.
                if (response.status === 403)
                    resolve();
                else
                    setTimeout(onSubmissionError, 1000);
            });
        }
    }
    /**
     * A handler that is called when the task presenter's viewport is resized.
     */
    function onViewportResize(){
        geotagx.project.questionnaire.resize();
        geotagx.project.subject.resize();
    }
})(window.geotagx = window.geotagx || {}, jQuery);
