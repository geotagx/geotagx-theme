/**
 * This script is part of the GeoTag-X theme.
 * It initializes common page elements.
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
(function(){
    "use strict";

    var $backToTopButton = $("#back-to-top");
    $backToTopButton.click(function(e){
        $("body, html").animate({scrollTop: 0});
        e.preventDefault();
    });
    $(window).scroll(_throttle(function(){$backToTopButton.css("visibility", $(this).scrollTop() > 400 ? "visible" : "hidden");}, 150));

    $("#accept-cookies").click(function(){
        var TIMEOUT = 120; // The message is shown again after TIMEOUT number of days.
        var expirationDate = new Date();
        expirationDate.setDate(expirationDate.getDate() + TIMEOUT);

        document.cookie = "GeoTag-X_accept_cookies=Yes; expires=" + expirationDate.toUTCString() + ";path=/"

        $("#cookie-consent").fadeOut(75);
    });

    $(document).ready(function(){
        // Initialize Bootstrap's opt-in javascript components.
        $("[data-toggle='tooltip']").tooltip();
        $("[data-toggle='popover']").popover();

        // Initialize Smooth scroll.
        $("a").smoothScroll();
    });
})();
