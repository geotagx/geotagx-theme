/**
 * This script contains functionality common to all GeoTag-X pages.
 *
 * It includes code from the Underscore.js 1.8.3 library (see _now, _throttle
 * and _debounce functions) that is distributed under the MIT license.
 */

// A (possibly faster) way to get the current timestamp as an integer.
var _now = Date.now || function(){
	return new Date().getTime();
};

// Returns a function, that, when invoked, will only be triggered at most once
// during a given window of time. Normally, the throttled function will run
// as much as it can, without ever going more than once per `wait` duration;
// but if you'd like to disable the execution on the leading edge, pass
// `{leading: false}`. To disable execution on the trailing edge, ditto.
function _throttle(func, wait, options){
	var context, args, result;
	var timeout = null;
	var previous = 0;
	if (!options) options = {};

	var later = function(){
		previous = options.leading === false ? 0 : _now();
		timeout = null;
		result = func.apply(context, args);
		if (!timeout) context = args = null;
	};

	return function(){
		var now = _now();
		if (!previous && options.leading === false) previous = now;
		var remaining = wait - (now - previous);
		context = this;
		args = arguments;
		if (remaining <= 0 || remaining > wait){
			if (timeout){
				clearTimeout(timeout);
				timeout = null;
			}
			previous = now;
			result = func.apply(context, args);
			if (!timeout) context = args = null;
		} else if (!timeout && options.trailing !== false){
			timeout = setTimeout(later, remaining);
		}
	return result;
	};
}

// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function _debounce(func, wait, immediate){
	var timeout, args, context, timestamp, result;

	var later = function(){
		var last = _now() - timestamp;

		if (last < wait && last >= 0){
			timeout = setTimeout(later, wait - last);
		} else {
			timeout = null;
			if (!immediate){
				result = func.apply(context, args);
				if (!timeout) context = args = null;
			}
		}
	};

	return function(){
		context = this;
		args = arguments;
		timestamp = _now();
		var callNow = immediate && !timeout;
		if (!timeout) timeout = setTimeout(later, wait);
		if (callNow){
			result = func.apply(context, args);
			context = args = null;
		}
		return result;
	};
}

$(document).ready(function(){
	// checkBrowserCompatibility();

	// Initialize Bootstrap's opt-in javascript components.
	$("[data-toggle='tooltip']").tooltip();
	$("[data-toggle='popover']").popover();

    $(function () {

        var filterList = {

            init: function () {

                // MixItUp plugin
                // http://mixitup.io
                $('#portfoliolist-three').mixitup({
                    targetSelector: '.portfolio',
                    filterSelector: '.filter',
                    effects: ['fade'],
                    easing: 'snap',
                    // call the hover effect
                    onMixEnd: filterList.hoverEffect()
                });
            },
            hoverEffect: function () {
                $("[rel='tooltip']").tooltip();
                // Simple parallax effect
                $('#portfoliolist-three .portfolio .portfolio-hover').hover(
        function(){
            $(this).find('.image-caption').slideDown(250); //.fadeIn(250)
        },
        function(){
            $(this).find('.image-caption').slideUp(250); //.fadeOut(205)
        }
    );
            }

        };

        // Run the show!
        filterList.init();
    });
    $('.magnefig').each(function(){
        $(this).magnificPopup({
            type:'image',
            removalDelay: 300,
            mainClass: 'mfp-fade'
        })
    });

    $(".image-caption a").tooltip();



var Script = function () {



//    bxslider

    // $('.bxslider').show();
    // $('.bxslider').bxSlider({
    //     minSlides: 4,
    //     maxSlides: 4,
    //     slideWidth: 276,
    //     slideMargin: 20
    // });

}();

	(function() {

   			$('<i id="back-to-top"></i>').appendTo($('body'));

			$(window).scroll(function() {

				if($(this).scrollTop() != 0) {
					$('#back-to-top').fadeIn();
				} else {
					$('#back-to-top').fadeOut();
				}

			});

			$('#back-to-top').click(function() {
				$('body,html').animate({scrollTop:0},600);
			});

	})();


/** Including jquery.smooth.scroll **/
/*!
 * jQuery Smooth Scroll - v1.5.5 - 2015-02-19
 * https://github.com/kswedberg/jquery-smooth-scroll
 * Copyright (c) 2015 Karl Swedberg
 * Licensed MIT (https://github.com/kswedberg/jquery-smooth-scroll/blob/master/LICENSE-MIT)
 */
(function(t){"function"==typeof define&&define.amd?define(["jquery"],t):"object"==typeof module&&module.exports?t(require("jquery")):t(jQuery)})(function(t){function e(t){return t.replace(/(:|\.|\/)/g,"\\$1")}var l="1.5.5",o={},n={exclude:[],excludeWithin:[],offset:0,direction:"top",scrollElement:null,scrollTarget:null,beforeScroll:function(){},afterScroll:function(){},easing:"swing",speed:400,autoCoefficient:2,preventDefault:!0},s=function(e){var l=[],o=!1,n=e.dir&&"left"===e.dir?"scrollLeft":"scrollTop";return this.each(function(){if(this!==document&&this!==window){var e=t(this);e[n]()>0?l.push(this):(e[n](1),o=e[n]()>0,o&&l.push(this),e[n](0))}}),l.length||this.each(function(){"BODY"===this.nodeName&&(l=[this])}),"first"===e.el&&l.length>1&&(l=[l[0]]),l};t.fn.extend({scrollable:function(t){var e=s.call(this,{dir:t});return this.pushStack(e)},firstScrollable:function(t){var e=s.call(this,{el:"first",dir:t});return this.pushStack(e)},smoothScroll:function(l,o){if(l=l||{},"options"===l)return o?this.each(function(){var e=t(this),l=t.extend(e.data("ssOpts")||{},o);t(this).data("ssOpts",l)}):this.first().data("ssOpts");var n=t.extend({},t.fn.smoothScroll.defaults,l),s=t.smoothScroll.filterPath(location.pathname);return this.unbind("click.smoothscroll").bind("click.smoothscroll",function(l){var o=this,r=t(this),i=t.extend({},n,r.data("ssOpts")||{}),c=n.exclude,a=i.excludeWithin,f=0,h=0,u=!0,d={},p=location.hostname===o.hostname||!o.hostname,m=i.scrollTarget||t.smoothScroll.filterPath(o.pathname)===s,S=e(o.hash);if(i.scrollTarget||p&&m&&S){for(;u&&c.length>f;)r.is(e(c[f++]))&&(u=!1);for(;u&&a.length>h;)r.closest(a[h++]).length&&(u=!1)}else u=!1;u&&(i.preventDefault&&l.preventDefault(),t.extend(d,i,{scrollTarget:i.scrollTarget||S,link:o}),t.smoothScroll(d))}),this}}),t.smoothScroll=function(e,l){if("options"===e&&"object"==typeof l)return t.extend(o,l);var n,s,r,i,c,a=0,f="offset",h="scrollTop",u={},d={};"number"==typeof e?(n=t.extend({link:null},t.fn.smoothScroll.defaults,o),r=e):(n=t.extend({link:null},t.fn.smoothScroll.defaults,e||{},o),n.scrollElement&&(f="position","static"===n.scrollElement.css("position")&&n.scrollElement.css("position","relative"))),h="left"===n.direction?"scrollLeft":h,n.scrollElement?(s=n.scrollElement,/^(?:HTML|BODY)$/.test(s[0].nodeName)||(a=s[h]())):s=t("html, body").firstScrollable(n.direction),n.beforeScroll.call(s,n),r="number"==typeof e?e:l||t(n.scrollTarget)[f]()&&t(n.scrollTarget)[f]()[n.direction]||0,u[h]=r+a+n.offset,i=n.speed,"auto"===i&&(c=u[h]-s.scrollTop(),0>c&&(c*=-1),i=c/n.autoCoefficient),d={duration:i,easing:n.easing,complete:function(){n.afterScroll.call(n.link,n)}},n.step&&(d.step=n.step),s.length?s.stop().animate(u,d):n.afterScroll.call(n.link,n)},t.smoothScroll.version=l,t.smoothScroll.filterPath=function(t){return t=t||"",t.replace(/^\//,"").replace(/(?:index|default).[a-zA-Z]{3,4}$/,"").replace(/\/$/,"")},t.fn.smoothScroll.defaults=n});
$(document).ready(function(){
	$('a').smoothScroll();
});

/** jquery smooth scroll included **/
});
/**
 * Checks for any missing HTML5 requirements.
 */
function checkBrowserCompatibility(){
	var missing = null; // An array of missing requirements.

	// If the compatibility check has already been performed, any missing
	// requirements are most likely cached.
	if (window.sessionStorage)
		missing = JSON.parse(sessionStorage.getItem("org.geotagx.browser.compatibility.missing"));

	// No cached results so we have to determine all missing requirements.
	if (missing === null){
		missing = [];
		var requirements = {
			"history":"HTML5 History Management",
			"localstorage":"HTML5 Web Storage (Local Storage)",
			"sessionstorage":"HTML5 Web Storage (Session Storage)",
		};
		for (var key in requirements){
			if (!Modernizr[key])
				missing.push(requirements[key]);
		}
		// Cache the results, if possible.
		if (window.sessionStorage)
			sessionStorage.setItem("org.geotagx.browser.compatibility.missing", JSON.stringify(missing));
	}

	// If there are any missing requirements, then the browser is incompatible.
	if (missing.length > 0){
		// Explicitly list all missing requirements.
		var $list = $("#incompatible-browser-missing-requirements");
		for (var i = 0; i < missing.length; ++i){
			$list.append("<li>" + missing[i] + "</li>");
		}

		var $message = $("#incompatible-browser-message");

		// When the message is hidden, it is assumed that the user has read it
		// and does not need to be constantly reminded; keep it hidden indefinitely, if possible.
		if (window.localStorage){
			var hideMessage = JSON.parse(localStorage.getItem("org.geotagx.browser.compatibility.hideMessage"));
			if (hideMessage)
				$message.removeClass("in");

			$message.on("hidden.bs.collapse", function(){
				localStorage.setItem("org.geotagx.browser.compatibility.hideMessage", true);
			}).on("shown.bs.collapse", function(){
				localStorage.setItem("org.geotagx.browser.compatibility.hideMessage", false);
			});
		}
		$(".show-on-incompatible-browser").removeClass("show-on-incompatible-browser");
	}
}
