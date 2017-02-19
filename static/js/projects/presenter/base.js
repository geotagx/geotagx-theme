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
	 * The current task.
	 */
	var task_ = null;
	/**
	 *
	 */
	var deferred_ = null;
	/**
	 * True if all project tasks have been completed by the user, false otherwise.
	 */
	var tasksCompleted_ = false;
	/**
	 * Start the task presenter.
	 */
	geotagx.project.taskPresenter.start = function(shortName){
		pybossa.taskLoaded(function(task, deferred){
			if ($.isEmptyObject(task)) {
				tasksCompleted_ = true;
			} else {
				// Is the task's URL accessible?
				task.info.accessible = true;
/*
				// TODO Do this only if the subject type is an image.
				// Cache the image for later use.
				var imageCache = new Image();
				imageCache.onload = function(){ deferred.resolve(task); };
				imageCache.onerror = function(){
					task.info.accessible = false;
					//deferred.resolve(task);
				};
				imageCache.src = task.info.image_url;
*/
				deferred.resolve(task);
			}
		});
		pybossa.presentTask(function(task, deferred){
			task_ = task;
			deferred_ = deferred;
			geotagx.project.taskPresenter.questionnaire.reset();
//			geotagx.project.taskPresenter.subject.setUrl(task.info.image_url);
//			geotagx.project.taskPresenter.subject.setSource(task.info.source_uri);
			geotagx.analytics.onTaskChanged(task.id);
		});
		pybossa.run(geotagx.project.shortName);
	};
	/**
	 * Submits the questionnaire's answers.
	 */
	geotagx.project.taskPresenter.submit = function(answers){
		if (!$.isEmptyObject(task_) && !$.isEmptyObject(deferred_)) {
			// Add metadata to the answers object.
			answers._accessible = task_.info.accessible;

			geotagx.project.taskPresenter.questionnaire.setSubmissionStatus("BUSY");

			pybossa.saveTask(task_.id, answers)
			.done(function(response){
				// A delay is introduced between the moment results have been stored and the next question
				// is displayed. Let's give the user the satisfaction of submitting their work...
				setTimeout(function(){
					setTimeout(function(){
						if (tasksCompleted_) {
							window.location.href = "/project/" + geotagx.project.shortName + "/newtask";
						} else {
							deferred_.resolve();
						}
					}, 1500);
					geotagx.project.taskPresenter.questionnaire.analysesCompleted++;
					geotagx.project.taskPresenter.questionnaire.setSubmissionStatus("DONE");
				}, 1000);
			})
			.fail(function(response){
				// If the status code is 403 (FORBIDDEN), then we assume that the
				// data was sent but the deferred object has not yet been resolved.
				if (response.status === 403) {
					deferred_.resolve();
				} else {
					geotagx.project.taskPresenter.questionnaire.setSubmissionStatus("ERROR");
					setTimeout(function(){
						geotagx.project.taskPresenter.questionnaire.setSubmissionStatus("IDLE");
					}, 3500);
				}
			});
		}
	};
})(window.geotagx = window.geotagx || {});
