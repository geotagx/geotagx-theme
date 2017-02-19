/**
 * This script is part of the GeoTag-X theme.
 * It contains the implementation of the question component.
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

    Vue.component("g-question", {
        template: "#g-question-template",
        components: {
            "g-input-polar": geotagx.project.taskPresenter.component.PolarInput,
            "g-input-dropdown-list": geotagx.project.taskPresenter.component.DropdownListInput,
            "g-input-multiple-choice": geotagx.project.taskPresenter.component.MultipleChoiceInput,
            "g-input-text": geotagx.project.taskPresenter.component.TextInput,
            "g-input-number": geotagx.project.taskPresenter.component.NumberInput,
            "g-input-datetime": geotagx.project.taskPresenter.component.DatetimeInput,
            "g-input-url": geotagx.project.taskPresenter.component.UrlInput,
            "g-input-geotagging": geotagx.project.taskPresenter.component.GeotaggingInput,
        },
        props: {
            /**
             * The question configuration.
             */
            question: {
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
             * The question's title.
             */
            title: function(){
                return this.question.title[this.language];
            },
            /**
             * The question's key.
             */
            key: function(){
                return this.question.key;
            },
            /**
             * The question's hint.
             */
            hint: function(){
                return this.hasHint() ? this.question.hint[this.language] : null;
            },
            /**
             * The question's help.
             */
            help: function(){
                return this.hasHelp() ? this.question.help[this.language] : null;
            },
            /**
             * The question's input configuration.
             */
            input: function(){
                return this.question.input;
            },
        },
        methods: {
            /**
             * Returns true if the question has a hint in the current language, false otherwise.
             */
            hasHint: function(){
                return this.question.hint && this.question.hint[this.language];
            },
            /**
             * Returns true if the question has help in the current language, false otherwise.
             */
            hasHelp: function(){
                return this.question.help && this.question.help[this.language];
            },
            /**
             * An event handler that is called when the question is answered.
             */
            onAnswer: function(answer){
                geotagx.project.taskPresenter.questionnaire.saveAnswer(this.question.key, answer);
                geotagx.project.taskPresenter.questionnaire.showNextQuestion(answer);
            },
        },
    });
})(window.geotagx = window.geotagx || {});
