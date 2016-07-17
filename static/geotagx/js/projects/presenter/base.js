/**
 * This script is part of the GeoTag-X theme.
 * It is the task presenter's core script.
 *
 * Author: Jeremy Othieno (j.othieno@gmail.com)
 *
 * Copyright (c) 2016 UNITAR/UNOSAT
 *
 * The MIT License (MIT)
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
 * OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE
 * OR OTHER DEALINGS IN THE SOFTWARE.
 */
(function(geotagx){
	"use strict";

	geotagx.project.taskPresenter = {};
	/**
	 * The current PyBossa AJAX context.
	 */
	geotagx.project.taskPresenter.ajaxContext_ = {
		task: null,
		deferred: null,
	};
	/**
	 * Start the task presenter.
	 */
	geotagx.project.taskPresenter.start = function(shortName){
		pybossa.taskLoaded(function(task, deferred){
/*
			if (!$.isEmptyObject(task)) {
				// Is the task's URL accessible?
				task.info.accessible = true;

				// TODO Do this only if the subject type is an image.
				// Cache the image for later use.
				var imageCache = new Image();
				imageCache.onload = function(){ deferred.resolve(task); };
				imageCache.onerror = function(){
					task.info.accessible = false;
					//deferred.resolve(task);
				};
				imageCache.src = task.info.image_url;
			}
*/
			deferred.resolve(task);
		});
		pybossa.presentTask(function(task, deferred){
			geotagx.project.taskPresenter.ajaxContext_.task = task;
			geotagx.project.taskPresenter.ajaxContext_.deferred = deferred;

			// If the task object is empty, then there're no more tasks to participate in.
			// Display a participation appreciation message.
			if ($.isEmptyObject(task)) {
//				$("#participation-appreciation-section").removeClass("hide");
//				$("#questionnaire-section").addClass("hide");
//				$("#image-section").addClass("hide");
//				$("#pdf-section").addClass("hide");
//				$("#project-task-presenter-header").addClass("hide");
			} else {
				geotagx.project.taskPresenter.questionnaire.updateTaskCounter();
//				geotagx.project.taskPresenter.subject.setUrl(task.info.image_url);
//				geotagx.project.taskPresenter.subject.setSource(task.info.source_uri);
				geotagx.analytics.onTaskChanged(task.id);
			}
		});
		pybossa.run(geotagx.project.shortName);
	};
	/**
	 * Uploads the specified set of questionnaire answers.
	 */
	geotagx.project.taskPresenter.uploadAnswers = function(answers){
		var task = geotagx.project.taskPresenter.ajaxContext_.task;
		var deferred = geotagx.project.taskPresenter.ajaxContext_.deferred;
		var questionnaire = geotagx.project.taskPresenter.questionnaire;
		var resolve = function(){ deferred.resolve(); };

		// Add metadata to the answers object.
		answers._accessible = task.info.accessible;

		pybossa.saveTask(task.id, answers)
		.done(function(){
			if (answers._accessible) {
				// A delay is introduced between the moment results have been stored and the next question
				// is displayed. Let's give the user the satisfaction of submitting their work...
				setTimeout(function(){
					questionnaire.onSubmission();
					setTimeout(resolve, 1000);
				}, 1000);
			} else {
				resolve();
			}
		})
		.fail(function(){
			if (answers._accessible) {
				// If the status code is 403 (FORBIDDEN), then we assume that the
				// data was sent but the deferred object has not yet been resolved.
				if (response.status === 403) {
					resolve();
				} else {
					questionnaire.onSubmissionError();
					setTimeout(resolve, 1000);
				}
			} else {
				resolve();
			}
		});
	};
})(window.geotagx = window.geotagx || {});
