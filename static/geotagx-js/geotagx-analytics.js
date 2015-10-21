/*
 * GeoTag-X page analytics.
 */
;(function($, undefined){
	"use strict";

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
		// With the analytics configured, we can properly start tracking our
		// events. The "geotagx-analytics-configured" event is fired to notify
		// the project-specific analytics script that it is OK to begin tracking.
		$(document).trigger("geotagx-analytics-configured");

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
})(jQuery);
