/**
 * This script is part of the GeoTag-X theme.
 * It contains the implementation of the multiple-choice input component.
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

    geotagx.vue.component.MultipleChoiceInput = Vue.extend({
        template: "#g-input-multiple-choice-template",
        data: function(){
            return {
                selectedOptions: [],
                otherOptionValue: null,
            }
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
        computed: {
            /**
             * The list of selectable options.
             */
            options: function(){
                return this.input.options;
            },
            /**
             * An option's input type can either be a radio or checkbox depending on
             * whether the multiple-choice input expects a single or multiple answers.
             */
            optionInputType: function(){
                return this.allowMultipleAnswers ? "checkbox" : "radio";
            },
            /**
             * If true, the input can accept more than one answer, otherwise only one answer
             * is accepted.
             */
            allowMultipleAnswers: function(){
                var result = this.input["allow-multiple-answers"];
                if (result === undefined || result === null)
                    result = false;

                return result;
            },
            /**
             * If true, the allowOtherOption parameter enables an option that allows a user
             * to input an unlisted value.
             */
            allowOtherOption: function(){
                var result = this.input["allow-other-option"];
                if (result === undefined || result === null)
                    result = true;

                return result;
            },
        },
        methods: {
            /**
             * Resets the input.
             */
            reset: function(){
                this.selectedOptions = [];
                this.otherOptionValue = null;
            },
            /**
             * Returns true if an option is selected, false otherwise.
             */
            isOptionSelected: function(){
                return this.selectedOptions.length > 0;
            },
            /**
             * Returns true if the 'Other' option is selected, false otherwise.
             */
            isOtherOptionSelected: function(){
                return this.selectedOptions.indexOf("Other") >= 0;
            },
            /**
             * A function that is called when an answer button is pressed.
             */
            onAnswer: function(answer){
                // If the OK button is pressed, the answer may need to be
                // preprocessed before it is stored.
                if (answer === "OK"){
                    answer = this.selectedOptions;

                    // If a specific 'Other' option is provided, it needs to be added to the
                    // final answer.
                    if (this.allowOtherOption && this.isOtherOptionSelected()){
                        var completeOtherOption = "Other";
                        if (this.otherOptionValue){
                            this.otherOptionValue = this.otherOptionValue.trim();
                            if (this.otherOptionValue.length > 0)
                                completeOtherOption += "[" + this.otherOptionValue + "]";
                        }
                        if (this.allowMultipleAnswers){
                            var i = answer.indexOf("Other");
                            if (i >= 0)
                                answer[i] = completeOtherOption;
                        }
                        else
                            answer = completeOtherOption;
                    }
                }
                geotagx.vue.helper.dispatchAnswer(this, answer);
            }
        }
    });
})(window.geotagx = window.geotagx || {});
