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

		// Are we viewing a category's profile page?
		var $categoryProfile = $("#category-profile[data-short-name!=]");
		if ($categoryProfile.length > 0)
			onVisitCategory($categoryProfile.data("short-name"));

		// Or is it a project's profile page?
		var $projectProfile = $("#project-profile[data-short-name!=]");
		if ($projectProfile.length > 0)
			onVisitProject($projectProfile.data("short-name"));

		$("html").on("click.analytics", onElementClicked);
		$("#share-category > a").on("click.analytics", onShareCategory);
		$("#share-project > a").on("click.analytics", onShareProject);
		$("a[href!=]").on("click.analytics", onLinkClicked);
		$("a.project-launcher").on("click.analytics", onStartProject);
	});
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
				$target.is("a[href!=]"); // Anchors with valid links.

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
			!url.indexOf("http://geotagx.org") ||
			!url.indexOf("https://geotagx.org");

		var eventName = isInternalLink ? "action.internalLinkClicked" : "action.externalLinkClicked";
		var data = {
			"elementUrl":url
		};
		analytics.fireEvent(eventName, data);
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
