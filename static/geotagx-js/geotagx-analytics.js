/*
 * GeoTag-X page analytics.
 */
;(function($, undefined){
	"use strict";

	$(document).ready(function(){
		// If analytics is not enabled, do nothing.
		if (!window.analyticsListener)
			return;

		analytics.setGlobal("userId", $("body").data("user-id"));

		var path = window.location.pathname;

		// Are we currently viewing a category page?
		if (!path.indexOf("/project/category/")){
			var categoryId = path.substr(18, path.indexOf("/", 18) - 18);
			onVisitCategory(categoryId);
		}
		else if (!path.indexOf("/project/")){
			var projectId = path.substr(9, path.indexOf("/", 9) - 9);

			// If this is the project's landing page, fire an action.visitProject event. The
			// project's landing page is found at "/project/projectId/" so we compare the
			// current path's length with the expected landing page's path length to make sure
			// we're on the landing page.
			if ((9 + projectId.length + 1) == path.length)
				onVisitProject(projectId);
		}

		$("html").on("click", onInvalidClick);
		$(".project-category-selector").on("click", onSelectCategory);
		$("#share-category > a").on("click", onShareCategory);
		$("#share-project > a").on("click", onShareProject);
	});
	/**
	 * Stops the specified event from bubbling up.
	 * @param e the event to stop.
	 */
	function stopEventPropagation(e){
		if (e.stopPropagation)
			e.stopPropagation();
		else
			e.cancelBubble = true; // For IE < 9.
	}
	/**
	 * Fires an event when a user clicks the browser's "Back" button.
	 */
	function onGoingBackButtonClicked(e){
		var data = {
			"url":null
		};
		analytics.fireEvent("action.goingBackButtonClicked", data);
	}
	/**
	 * Fires an event when a user clicks an element that is not clickable.
	 */
	function onInvalidClick(e){
		var data = {
			"elementClass":$(e.target).attr("class"),
			"url":window.location.href
		};
		analytics.fireEvent("action.invalidClick", data);
	}
	/**
	 * Fires an event when a user selects a category from the project grid.
	 */
	function onSelectCategory(e){
		stopEventPropagation(e);
		var data = {
			"categoryId":$(this).data("filter")
		};
		analytics.fireEvent("action.selectCategory", data);
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
	 * Fires an event when a user clicks on one of the various internal links,
	 * e.g. find photos, my profile, etc.
	 */
	function onInternalLinkClicked(e){
		stopEventPropagation(e);
		var data = {
			"elementUrl":null
		};
		analytics.fireEvent("action.internalLinkClicked", data);
	}
	/**
	 * Fires an event when a user clicks on an external link.
	 */
	function onExternalLinkClicked(e){
		stopEventPropagation(e);
		var data = {
			"elementUrl":null
		};
		analytics.fireEvent("action.externalLinkClicked", data);
	}
	/**
	 * Fires an event when a user shares a category (on social media).
	 */
	function onShareCategory(e){
		stopEventPropagation(e);
		var data = {
			"categoryId":$("#share-category").data("name"),
			"elementUrl":$(this).attr("href")
		};
		analytics.fireEvent("action.shareCategory", data);
	}
	/**
	 * Fires an event when a user shares a project (on social media).
	 */
	function onShareProject(e){
		stopEventPropagation(e);
		var data = {
			"projectId":$("#share-project").data("name"),
			"elementUrl":$(this).attr("href")
		};
		analytics.fireEvent("action.shareProject", data);
	}
	/**
	 * Fires an event when a user starts a project.
	 */
	function onStartProject(e){
		stopEventPropagation(e);
		var data = {
			"projectId":null,
			"elementUrl":null
		};
		analytics.fireEvent("action.startProject", data);
	}
})(jQuery);
