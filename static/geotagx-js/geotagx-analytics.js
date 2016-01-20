/*
 * GeoTag-X page analytics.
 */
;(function(geotagx, $, undefined){
	"use strict";

	geotagx.analytics = {};

	var taskId_ = 0; // The current task's identifier.
	var projectId_ = null; // The current project's short name.
	var questionId_ = null; // The current question number.
	var previousQuestionId_ = null; // The previous question number.

	// This selector is used to determine whether or not an item is clickable.
	// Please refer to the onElementClicked method for more information.
	var isClickableSelector_ = null;

	// When the script is loaded, we have to make sure the GTM script is
	// fully loaded and to do so, we check whether the window.analyticsListener
	// variable is defined. If it isn't we keep checking at intervals of 450ms
	// until the variable gets defined, or we ultimately give up after ~10 seconds.
	// When the GTM script is ready, we trigger the 'gtmready' custom event
	// which starts page-agnostic, as well as project-specific analytics.
	$(document).ready(function(){
		var maxWaitPeriod = 10000;
		var dt = 450;
		var timer = setInterval(function(){
			if (maxWaitPeriod <= 0){
				clearInterval(timer);
				$(document).trigger("geotagx-analytics-disabled");
			}
			else {
				if (window.analyticsListener){
					clearInterval(timer);
					$(document).trigger("gtmready");
				}
				else
					maxWaitPeriod -= dt;
			}
		}, dt);
	});

	// The analytics begins only when the Google Tag Manager (GTM) script is
	// ready, i.e. when the "gtmready" custom event has been fired.
	$(document).on("gtmready", function(){
		analytics.setGlobal("userId", $("body").data("user-id"));
		analytics.setGlobal("userRemoteAddr", window.client_remote_addr);
		try {
			if(ga){
				var ga_clientIds = []
				$(ga.getAll()).each(function(){
					ga_clientIds.push($(this).get(0).get('clientId'));
				})
				analytics.setGlobal("ga_clientIds", JSON.stringify(ga_clientIds));

				// In case of anonymous users, set the userId param as `anonymous_ga_clientIds`
				if($("body").data("user-id") == 0){ //user-id = 0 for anonymous users
					analytics.setGlobal("userId", "#geotagx_anonymous_"+JSON.stringify(ga_clientIds));
				}
			}
		}
		catch(error){
			// The code above generates a ReferenceError when 'ga' is undefined
			// which can happen when the script is being run in an environment
			// where Google Analytics has been purposely disabled, e.g. on a
			// development server.
			// While the ReferenceError is expected behavior, not handling it
			// prevents the rest of the script from being executed.
		}

		// Are we viewing a category's profile page?
		var $categoryProfile = $("#category-profile[data-short-name!=][data-short-name]");
		if ($categoryProfile.length > 0)
			onVisitCategory($categoryProfile.data("short-name"));

		// Or is it a project's profile page? If it is, we are only interested
		// when the user visits the information page.
		if ($("#project-info").length > 0){
			var shortName = $.trim($("#project-profile").data("short-name"));
			if (shortName.length > 0)
				onVisitProject(shortName);
		}

		$("body").on("click.analytics", onElementClicked);
		$(".share-category").on("click.analytics", onShareCategory);
		$(".share-project").on("click.analytics", onShareProject);
		$("a[href!=][href]").on("click.analytics", onLinkClicked);
		$("#signin button").on("click.analytics", onSignInButtonClicked);

		$("#project-task-presenter.analysis .btn-answer").on("click.analytics", onAnswerQuestion);

		$("#project-task-presenter.tutorial #image").on("zoom.analytics", _debounce(onTutorialImageZoom, 350));
		$("#project-task-presenter.analysis #image").on("zoom.analytics", _debounce(onImageZoom, 350));

		$("#project-task-presenter.tutorial #image-source").on("click.analytics", onShowTutorialImageSource);
		$("#project-task-presenter.analysis #image-source").on("click.analytics", onShowImageSource);

		$("#project-task-presenter.tutorial #questionnaire-no-photo").on("click.analytics", onNoTutorialImage);
		$("#project-task-presenter.analysis #questionnaire-no-photo").on("click.analytics", onNoImage);

		$("#project-task-presenter.tutorial #questionnaire-rewind").on("click.analytics", onShowPreviousTutorialQuestion);
		$("#project-task-presenter.analysis #questionnaire-rewind").on("click.analytics", onShowPreviousQuestion);

		$("#project-task-presenter.tutorial #questionnaire-show-comments").on("click.analytics", onShowTutorialComments);
		$("#project-task-presenter.analysis #questionnaire-show-comments").on("click.analytics", onShowComments);

		$("#project-task-presenter.tutorial .help-toggle").on("click.analytics", onShowTutorialHelp);
		$("#project-task-presenter.analysis .help-toggle").on("click.analytics", onShowHelp);

		$("#submit-analysis").on("click.analytics", onSubmitTask);

		$("#skip-tutorial").on("click.analytics", onSkipTutorial);
		$("#start-contributing").on("click.analytics", onCompleteTutorial);

		//Add surveyModal specific events
		$("#surveyModal").on("shown.bs.modal", function(){
			var data = {};
			data.surveyType = window.geotagxSurveyType;
			data.surveyState = "OPEN";
			analytics.fireEvent("action.surveyEvent", data);
		});
		$("#surveyModal").on("hidden.bs.modal", function(){
			var data = {};
			data.surveyType = window.geotagxSurveyType;
			data.surveyState = "CLOSE";
			analytics.fireEvent("action.surveyEvent", data);
		});
	});
	/**
	 * Fires an event when a user signs in, also passes in the user email address the user tried to sign in with
	 */
	function onSignInButtonClicked(){
		var tentative_email_addr = $("#email").val();
		if(tentative_email_addr){
			var data = {
				"email" : tentative_email_addr
			};
			analytics.fireEvent("action.signInButtonClicked", data);
		}
	}
	/**
	 * Fires an event when a user clicks the browser's "Back" button.
	 */
	function onGoingBackButtonClicked(){
		var data = {
			"url":null
		};
		analytics.fireEvent("action.goingBackButtonClicked", data);
	}
	/**
	 * Determines if the element that triggered this event is clickable. If it isn't
	 * then the action.invalidClick event is fired, otherwise no operation is performed.
	 */
	function onElementClicked(e){
		var $target = $(e.target);
		var elementClass = $target.attr("class");
		if (elementClass){
			if (isClickableSelector_ == null){
				isClickableSelector_ = [
					".clickable, .clickable *", // A set of elements that aren't usually clickable but have been made so (e.g. when an event handler has been attached to them). See the project grid categories for an example of clickable divs.
					"div.modal.fade", // A modal underlay which can be used to close a modal.
					"label.illustration-label", // Illustration labels in multi-choice answers are clickable ...
					"img.illustration-img", // ... as well as the images.
					"canvas", // A canvas can be interacted with, e.g. the canvas used by the OpenLayers map.
					"input:enabled", // Enabled input fields can be selected when clicked on.
					"textarea", // Long text input fields can be selected when clicked on.
					"#questionnaire-rewind, #questionnaire-rewind *", // The "Go to previous question" button is disabled and hidden when there're no more questions. It is still considered clickable.
					"#questionnaire-no-photo, #questionnaire-no-photo *", // The "I don not see a photo" button behaves just like the "Go to previous question"" button.
					"button:enabled, button:enabled *", // Enabled buttons.
					"a[href!=], a[href!=] *", // Anchors with valid links.
					".image-caption", //Image Caption element on grid panels
					"#submit-analysis, #submit-analysis *" // Submit Task Response Button
				].join(", ");
			}

			// If the target is not clickable, i.e. does not match with the
			// clickable selector, an invalidClick action is generated.
			if (!$target.is(isClickableSelector_)){
				var data = {
					"elementClass":elementClass,
					"url":window.location.href
				};
				analytics.fireEvent("action.invalidClick", data);
			}
		}
	}
	/**
	 * Fires an event when a user visits a category's page.
	 */
	function onVisitCategory(categoryId){
		var data = {
			"categoryId":categoryId
		};
		analytics.fireEvent("action.visitCategory", data);
	}
	/**
	 * Fires an event when a user visits a project.
	 */
	function onVisitProject(projectId){
		var data = {
			"projectId":projectId
		};
		analytics.fireEvent("action.visitProject", data);
	}
	/**
	 * Fires an action.onInternalLinkClicked event when the user clicks on one of
	 * of the various internal links e.g. Find photos, my profile, etc., otherwise
	 * fires an action.onExternalLinkClicked event.
	 */
	function onLinkClicked(){
		var url = $(this).attr("href");
		if (url !== "#"){
			var isInternalLink =
				url.charAt(0) === "#" ||
				url.charAt(0) === "/" ||
				url.indexOf("http://geotagx.org") === 0 ||
				url.indexOf("https://geotagx.org") === 0;
			var data = {
				"elementUrl":url
			};

			if (isInternalLink){
				var buttonId = $(this).attr("id");
				if (buttonId !== "start-contributing" && buttonId !== "skip-tutorial")
					analytics.fireEvent("action.internalLinkClicked", data);
			}else {
				// Clicks to external pages are only interesting if we're viewing a project's profile page.
				var $projectProfile = $("#project-profile[data-short-name!=]");
				if ($projectProfile.length > 0){
					data.projectId = $projectProfile.data("short-name");
					analytics.fireEvent("action.externalLinkClicked", data);
				}
			}
		}
	}
	/**
	 * Fires an event when a user shares a category (on social media).
	 */
	function onShareCategory(){
		var data = {
			"categoryId":$("#share-category").data("name"),
			"elementUrl":$(this).attr("href")
		};
		analytics.fireEvent("action.shareCategory", data);
	}
	/**
	 * Fires an event when a user shares a project (on social media).
	 */
	function onShareProject(){
		var data = {
			"projectId":$("#share-project").data("name"),
			"elementUrl":$(this).attr("href")
		};
		analytics.fireEvent("action.shareProject", data);
	}
	/**
	 * Fires an event when a user answers a question during an analysis.
	 */
	function onAnswerQuestion(e){
		// Note that we use the previousQuestionId_ because the onQuestionChanged
		// function is called before this event handler, effectively changing the
		// value of questionId_ before we have the chance to read it.
		// However, previousQuestionId_ holds the value we are looking for.
		var data = {
			"projectId":projectId_,
			"questionId":previousQuestionId_,
			"taskId":taskId_,
			"buttonValue":$(e.target).val()
		};
		analytics.fireEvent("action.answerQuestion", data);
	}
	/**
	 * Fires an event when a user zooms in on an image during a tutorial.
	 */
	function onTutorialImageZoom(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_
		};
		analytics.fireEvent("action.tutorialImageZoom", data);
	}
	/**
	 * Fires an event when a user zooms in on an image during an analysis.
	 */
	function onImageZoom(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.imageZoom", data);
	}
	/**
	 * Fires an event when a user visits an image's source during a tutorial.
	 */
	function onShowTutorialImageSource(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_
		};
		analytics.fireEvent("action.showTutorialImageSource", data);
	}
	/**
	 * Fires an event when a user visits an image's source during an analysis.
	 */
	function onShowImageSource(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.showImageSource", data);
	}
	/**
	 * Fires an event when the user does not see an image during a tutorial.
	 */
	function onNoTutorialImage(){
		var data = {
			"projectId":projectId_,
			"imageUrl":$("#image > img").data("src"),
			"imageSource":$("#image-source").attr("href")
		};
		analytics.fireEvent("action.noTutorialImage", data);
	}
	/**
	 * Fires an event when the user does not see an image during an analysis.
	 */
	function onNoImage(){
		var data = {
			"projectId":projectId_,
			"imageUrl":$("#image > img").data("src"),
			"imageSource":$("#image-source").attr("href")
		};
		analytics.fireEvent("action.noImage", data);
	}
	/**
	 * Fires an event when a user goes back to a previous question during a tutorial.
	 */
	function onShowPreviousTutorialQuestion(){
		// Note that we use the previousQuestionId_ because the onQuestionChanged
		// function is called before this event handler, effectively changing the
		// value of questionId_ before we have the chance to read it.
		// However, previousQuestionId_ holds the value we are looking for.
		var data = {
			"projectId":projectId_,
			"questionId":previousQuestionId_
		};
		analytics.fireEvent("action.showPreviousTutorialQuestion", data);
	}
	/**
	 * Fires an event when a user goes back to a previous question during an analysis.
	 */
	function onShowPreviousQuestion(){
		// Note that we use the previousQuestionId_ because the onQuestionChanged
		// function is called before this event handler, effectively changing the
		// value of questionId_ before we have the chance to read it.
		// However, previousQuestionId_ holds the value we are looking for.
		var data = {
			"projectId":projectId_,
			"questionId":previousQuestionId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.showPreviousQuestion", data);
	}
	/**
	 * Fires an event when a user clicks the 'Show Comments' button during a tutorial.
	 */
	function onShowTutorialComments(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_
		};
		analytics.fireEvent("action.showTutorialComments", data);
	}
	/**
	 * Fires an event when a user clicks the 'Show Comments' button during an analysis.
	 */
	function onShowComments(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.showComments", data);
	}
	/**
	 * Fires an event when a user clicks a question's help toggle during a tutorial.
	 */
	function onShowTutorialHelp(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_
		};
		analytics.fireEvent("action.showTutorialHelp", data);
	}
	/**
	 * Fires an event when a user clicks a question's help toggle during an analysis.
	 */
	function onShowHelp(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.showHelp", data);
	}
	/**
	 * Fires an event when a user submits a task.
	 */
	function onSubmitTask(){
		var data = {
			"projectId":projectId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.submitTask", data);
	}
	/**
	 * Fires an event when a user skips a project tutorial.
	 */
	function onSkipTutorial(){
		var data = {
			"projectId":projectId_
		};
		analytics.fireEvent("action.skipTutorial", data);
	}
	/**
	 * Fires an event when a user completes a tutorial and starts contributing to a project.
	 */
	function onCompleteTutorial(){
		var data = {
			"projectId":projectId_
		};
		analytics.fireEvent("action.completeTutorial", data);
	}
	/**
	 * Updates the tracking parameters when a new task is presented to the user.
	 * @param taskId the task's identifier.
	 */
	geotagx.analytics.onTaskChanged = function(taskId){
		taskId_ = taskId;
		var data = {
			"projectId":projectId_,
			"taskId":taskId_
		};
		analytics.fireEvent("action.startTask", data);
	};
	/**
	 * Updates the tracking parameters when a new question is presented to the user.
	 * @param questionId the current question identifier.
	 */
	geotagx.analytics.onQuestionChanged = function(questionId){
		previousQuestionId_ = questionId_ === null ? questionId : questionId_; // Pay attention to the trailing underscore.
		questionId_ = questionId;
	};
	/**
	 * Fires an event when a user selects the correct answer in a tutorial.
	 */
	geotagx.analytics.onCorrectTutorialAnswer = function(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_
		};
		analytics.fireEvent("action.correctTutorialAnswer", data);
	};
	/**
	 * Fires an event when a user selects the wrong answer in a tutorial.
	 */
	geotagx.analytics.onWrongTutorialAnswer = function(){
		var data = {
			"projectId":projectId_,
			"questionId":questionId_
		};
		analytics.fireEvent("action.wrongTutorialAnswer", data);
	};
	/**
	 * Fires an event when a user starts a project.
	 */
	geotagx.analytics.onStartProject = function(projectId){
		projectId_ = projectId;
		var data = {
			"projectId":projectId_
		};
		analytics.fireEvent("action.startProject", data);
	};
	/**
	 * Fires an event when a user starts a project tutorial.
	 */
	geotagx.analytics.onStartTutorial = function(projectId){
		projectId_ = projectId;
		var data = {
			"projectId":projectId_
		};
		analytics.fireEvent("action.startTutorial", data);
	};
})(window.geotagx = window.geotagx || {}, jQuery);
