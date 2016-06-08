/**
 * This script is part of the GeoTag-X theme.
 * It contains the implementation of the text input component.
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

    geotagx.vue.component.TextInput = Vue.extend({
        template: "#g-input-text-template",
        data: function(){
            return {
                model: null,
            };
        },
        props: {
            /**
             * The input configuration.
             */
            input: {
                type: Object,
                required: true,
            },
            /**
             * The current language.
             */
            language: {
                type: String,
                required: true,
            },
        },
        methods: {
            /**
             * Resets the input field.
             */
            reset: function(){
                this.model = null;
            },
            /**
             * An event handler that is called when the 'OK' button is pressed.
             */
            onAnswer: function(){
                this.model = typeof(this.model) === "string" ? this.model.trim() : "";
                geotagx.vue.helper.dispatchAnswer(this, this.model.length > 0 ? this.model : null);
            }
        }
    });
})(window.geotagx = window.geotagx || {});
