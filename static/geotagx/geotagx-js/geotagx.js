/**
 * This script contains functionality common to all GeoTag-X pages.
 */
$(document).ready(function(){
	// Initialize Bootstrap's opt-in javascript components.
	$("[data-toggle='tooltip']").tooltip();
	$("[data-toggle='popover']").popover();

	// Initialize Smooth scroll.
	$("a").smoothScroll();

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
});
