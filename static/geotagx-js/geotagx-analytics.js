/*
 * GeoTag-X page analytics.
 */
;(function($, undefined){
	"use strict";

	$(document).ready(function(){
		// TODO Implement me.

		$("html").on("click", onInvalidClick);


	});
	/**
	 * Sets the user identifier, i.e. the username.
	 * @param userId the user's identifier.
	 */
	function setUserId(userId){
		analytics.setGlobal("userId", userId ? userId : "anonymous");
	};
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
	 * Fires an event when a user visits a category.
	 */
	function onVisitCategory(){
		var data = {
			"categoryId":null
		};
		analytics.fireEvent("action.visitCategory", data);
	}
	/**
	 * Fires an event when a user visits a project.
	 */
	function onVisitProject(){
		var data = {
			"projectId":null
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
			"categoryId":null,
			"elementUrl":null
		};
		analytics.fireEvent("action.shareCategory", data);
	}
	/**
	 * Fires an event when a user shares a project (on social media).
	 */
	function onShareProject(e){
		stopEventPropagation(e);
		var data = {
			"projectId":null,
			"elementUrl":null
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
