/*
 * GeoTag-X page analytics.
 */
;(function($, undefined){
	"use strict";

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
			if (maxWaitPeriod <= 0)
				clearInterval(timer);
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

		// Are we viewing a category's profile page?
		var $categoryProfile = $("#category-profile[data-short-name!=][data-short-name]");
		if ($categoryProfile.length > 0)
			onVisitCategory($categoryProfile.data("short-name"));

		// Or is it a project's profile page?
		var $projectProfile = $("#project-profile[data-short-name!=][data-short-name]");
		if ($projectProfile.length > 0)
			onVisitProject($projectProfile.data("short-name"));

		$("html").on("click.analytics", onElementClicked);
		$("#share-category > a").on("click.analytics", onShareCategory);
		$("#share-project > a").on("click.analytics", onShareProject);
		$("a[href!=][href]").on("click.analytics", onLinkClicked);
		$("a.project-launcher").on("click.analytics", onStartProject);
		$("#signin button").on("click.analytics", onSignInButtonClicked);
		$("#questionnaire-submit").on("click.analytics", onTaskResponseSubmitButtonClicked);
		
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
	  * Fires an event when user submits a task response
	  */
	function onTaskResponseSubmitButtonClicked(){
                var data = {
                        "elementUrl":"/#task_response_submitted"
                };
                        analytics.fireEvent("action.internalLinkClicked", data);	
	}
	/**
	 * Determines if the element that triggered this event is clickable. If it isn't
	 * then the action.invalidClick event is fired, otherwise no operation is performed.
	 */
	function onElementClicked(e){
		var $target = $(e.target);
		var elementClass = $target.attr("class");
		if (elementClass){
			var isClickable =
				$target.is(".clickable") || // A set of elements that aren't usually clickable but have been made so (e.g. when an event handler has been attached to them).
				$target.is("div.modal.fade") || // A modal underlay which can be used to close a modal.
				$target.is("input:enabled") || // Enabled input fields.
				$target.is("label.illustration-label") || // Illustration labels in multi-choice answers are clickable ...
				$target.is("img.illustration-img") || // ... as well as the images.
				$target.is("canvas") || // A canvas can be interacted with, e.g. the canvas used by the OpenLayers map.
				$target.is("input:enabled") || // Enabled input fields can be selected when clicked on.
				$target.is("#questionnaire-rewind") || // The "Go to previous question" button is disabled and hidden when there're no more questions. It is still considered clickable.
				$target.is("button:enabled") || // Enabled buttons.
				$target.is("a[href!=]") || // Anchors with valid links.
				$target.is(".fa.fa-play") || //Start Contributing buttons
				$target.is(".image-caption") || //Image Caption element on grid panels
				$target.is("#questionnaire-submit") || // Submit Task Response Button
				$target.is(".img-circle.geotagx_profile_picture_placeholder") ;; //Profile Image on communite page

			if (!isClickable){
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
		var isInternalLink =
			url.charAt(0) === "#" ||
			url.charAt(0) === "/" ||
			url.indexOf("http://geotagx.org") === 0 ||
			url.indexOf("https://geotagx.org") === 0;

		var data = {
			"elementUrl":url
		};
		if (isInternalLink){
			if(data.elementUrl == "#"){
				return;
			}
			//Determines if its a SkipTutorialLink 
			// TODO : Probably, this should be implemented in the geotagx-project-template ?
			if( $(this).html() == "Skip tutorials and start contributing" ){
				data.elementUrl = data.elementUrl + "#SkipTuorial";
			}
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
	 * Fires an event when a user clicks an element that starts a project.
	 */
	function onStartProject(){
		var url  = $(this).attr("href");
		var data = {
			"projectId":url.substr(9, url.indexOf("/", 9) - 9),
			"elementUrl":window.location.origin + url
		};
		analytics.fireEvent("action.startProject", data);
	}
})(jQuery);
