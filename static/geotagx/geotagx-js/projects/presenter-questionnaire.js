/*
 * A script that manages a GeoTag-X project's questionnaire.
 * Copyright (c) 2016, UNITAR-UNOSAT.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */
;(function(project, $, undefined){
    "use strict";

    var __component__ = {};

    //TODO Document variables.
    var language_ = null;
    var index_ = null;
    var questions_ = null;
    var answers_ = null;
    var initialQuestion_ = null;
    var progressStack_ = null;
    var questionnaire_ = null;
    var questionnaireProgress_ = null;
    var $answerButtons_ = null;
    var rewindButton_ = null;
    var $progressBar_ = null;
    var percentageComplete_ = null;
    var statusIcons_ = null;
    var submitButton_ = null;
    var submitMessage_ = null;
    /**
     * Questionnaire events.
     */
    __component__.EVENT_START = "event-questionnaire-start";
    __component__.EVENT_FINISH = "event-questionnaire-finish";
    __component__.EVENT_REWIND = "event-questionnaire-rewind";
    __component__.EVENT_SUBMIT = "event-questionnaire-submit";
    __component__.EVENT_QUESTION_CHANGED = "event-question-changed";
    __component__.EVENT_QUESTION_ANSWERED = "event-question-answered";
    /**
     * Initializes the questionnaire from the specified configuration.
     * @param language the current language.
     */
    __component__.initialize = function(language){
        var configuration = __configuration__.task_presenter;

        language_ = isLanguageAvailable(language) ? language : getDefaultLanguage();
        index_ = configuration.questionnaire.index;
        questions_ = configuration.questionnaire.questions;
        initialQuestion_ = questions_[0];
        questionnaire_ = document.getElementById("questionnaire");
        questionnaireProgress_ = document.getElementById("questionnaire-progress");
        $answerButtons_ = $("#question-answer-buttons > .btn");
        rewindButton_ = document.getElementById("questionnaire-rewind");
        $progressBar_ = $("#questionnaire-progress-bar");
        percentageComplete_ = document.getElementById("questionnaire-percentage-complete");
        statusIcons_ = {
            "busy":document.getElementById("questionnaire-status-busy"),
            "success":document.getElementById("questionnaire-status-success"),
            "error":document.getElementById("questionnaire-status-error")
        };
        submitButton_ = document.getElementById("questionnaire-submission-button");
        submitMessage_ = document.getElementById("questionnaire-submission-message");

        // Initialize the set of questionnaire answers.
        answers_ = {};
        for (var i = 0; i < questions_.length; ++i){
            var key = questions_[i].key;
            answers_[key] = null;
        }

        // Set up various event handlers.
        $(rewindButton_).click(function(){ __component__.showPreviousQuestion(); });
        $answerButtons_.click(onQuestionAnswered);
        $(questionnaire_).on(__component__.EVENT_QUESTION_ANSWERED, function(_, key, answer){ __component__.showNextQuestion(answer); });
        $("#dropdown-list-field").change(function(){ document.getElementById("dropdown-list-field-reset").disabled = false; });
        $("#dropdown-list-field-reset").click(function(){ document.getElementById("dropdown-list-field").selectedIndex = 0; this.disabled = true; });
        $(submitButton_).click(onSubmit);
    };
    /**
     * Starts the questionnaire from the question with the specified key.
     * If no key is given, the questionnaire begins at the first question
     * defined in the project configuration.
     * @param key a question key.
     */
    __component__.start = function(key){
        // Reset the progress stack and answer set.
        progressStack_ = [];
        for (var k in answers_){
            if (answers_.hasOwnProperty(k))
                answers_[k] = null;
        }

        // Reset the questionnaire's status and hide all status icons and messages.
        questionnaire_.dataset.analysisComplete = "false";
        for (var statusIconsKey in statusIcons_){
            if (statusIcons_.hasOwnProperty(statusIconsKey))
                statusIcons_[statusIconsKey].style.display = "none";
        }
        submitMessage_.display = "none";

        // If the key was specified, find the initial question.
        if (key && __component__.keyExists(key))
            initialQuestion_ = __component__.getQuestion(key);

        showQuestion(initialQuestion_);

        trigger(__component__.EVENT_START);
    };
    /**
     * Ends the questionnaire.
     */
    __component__.finish = function(){
        $progressBar_.css("width", (questionnaireProgress_.offsetWidth - rewindButton_.offsetWidth) + "px");
        percentageComplete_.innerHTML = "100%";

        questionnaire_.dataset.analysisComplete = "true";
        submitButton_.disabled = false;

        trigger(__component__.EVENT_FINISH);
    };
    /**
     * Returns the number of questions in the questionnaire.
     */
    __component__.getLength = function(){
        return questions_.length;
    };
    /**
     * Returns the answer to the question with the specified key.
     * @param key a question key.
     */
    __component__.getAnswer = function(key){
        return key in answers_ ? answers_[key] : null;
    };
    /**
     * Returns the current set of questionnaire answers.
     */
    __component__.getAnswers = function(){
        return answers_;
    };
    /**
     * Returns true if the specified key exists in the questionnaire's index, false otherwise.
     * @param key a question key.
     */
    __component__.keyExists = function(key){
        return key && typeof(key) === "string" && key in index_;
    };
    /**
     * Returns the question with the specified key or null if none is assigned to the key.
     * @param key the question key.
     */
    __component__.getQuestion = function(key){
        return __component__.keyExists(key) ? questions_[index_[key]] : null;
    };
    /**
     * Returns the current question or null if none has been set yet.
     */
    __component__.getCurrentQuestion = function(){
        var index = progressStack_.length > 0 ? progressStack_[progressStack_.length - 1] : null;
        return index !== null ? questions_[index] : null;
    };
    /**
     * Returns the previous question or null if none exists.
     */
    __component__.getPreviousQuestion = function(){
        var index = progressStack_.length > 1 ? progressStack_[progressStack_.length - 2] : null;
        return index !== null ? questions_[index] : null;
    };
    /**
     * Returns the next question based on the answer to the specified one.
     * If no question is specified, then the current question is used.
     * @param answer the answer to the specified question.
     */
    __component__.getNextQuestion = function(answer, question){
        question = question || __component__.getCurrentQuestion();

        var nextQuestionIndex = -1;
        var branch = question.branch || null;
        if (branch !== null){
            var STRICT = 0;
            var CONDITIONAL = 1;

            var branchType = typeof(branch) === "object" ? CONDITIONAL : typeof(branch) === "string" ? STRICT : undefined;
            if (branchType === STRICT)
                nextQuestionIndex = index_[branch];
            else if (branchType === CONDITIONAL && answer !== null){
                answer = $.trim(answer).toLowerCase(); // toLowerCase for case-insensitive string comparisons.

                // Binary questions are a bit special: if the user clicks "I Don't Know" or "Subject Not Clear"
                // and neither of these answers has been explicitly specified as a branching condition, the
                // answer is assumed to be "No".
                if (question.input.type === "binary" && !(answer in branch) && answer !== "yes")
                    answer = "no";

                if (answer in branch){
                    var nextQuestionKey = branch[answer];
                    nextQuestionIndex = index_[nextQuestionKey];
                }
            }
        }
        // If the next question's index is still -1, then no branching directive was set.
        // In such a case, the next question is the successor to the current question.
        if (nextQuestionIndex === -1)
            nextQuestionIndex = index_[question.key] + 1;

        return nextQuestionIndex < questions_.length ? questions_[nextQuestionIndex] : null;
    };
    /**
     * Displays the question with the specified key.
     * @param key a question key.
     */
    __component__.showQuestion = function(key){
        var question = __component__.getQuestion(key);
        if (question !== null)
            showQuestion(question);
    };
    /**
     * Displays the previous question.
     */
    __component__.showPreviousQuestion = function(){
        // We can only show the previous question if at least one question has been answered.
        if (progressStack_.length > 1){
            // Before showing the previous question, the answer to the current question should be deleted
            // since the questionnaire's flow may change based on the answer to the previous question.
            // Keeping the answer to the current question will create an invalid answer set.
            // However, if the previous question was the last (the questionnaire is 100% complete), there's
            // no need to delete anything, but the questionnaire's "complete" data attribute must be updated.
            if (questionnaire_.dataset.analysisComplete === "true")
                questionnaire_.dataset.analysisComplete = "false";
            else {
                answers_[__component__.getCurrentQuestion().key] = null;
                progressStack_.pop();
            }
            // At this point, the index at the top of the progress stack belongs to the previous question,
            // however said question is not yet shown. Before it can be shown, its index needs to be popped from the
            // progress stack because the 'showQuestion' function will push the same index onto the stack again,
            // creating a duplicate.
            var previousQuestion = __component__.getCurrentQuestion();
            progressStack_.pop();
            showQuestion(previousQuestion);

            trigger(__component__.EVENT_REWIND);
        }
    };
    /**
     * Displays the next question based on the answer to the current question.
     * @param answer the answer to the current question.
     */
    __component__.showNextQuestion = function(answer){
        var nextQuestion = __component__.getNextQuestion(answer);
        if (nextQuestion !== null)
            showQuestion(nextQuestion);
        else
            __component__.finish();
    };
    /**
     * Attaches an event handler for one or more events to the questionnaire.
     */
    __component__.on = function(events, handler){
        $(questionnaire_).on(events, handler);
        return this;
    };
    /**
     * Removes an event handler.
     */
    __component__.off = function(events, handler){
        $(questionnaire_).off(events, handler);
        return this;
    };
    /**
     * Resizes the questionnaire's viewport.
     */
    __component__.resize = function(){
        //TODO
    };
    /**
     * Checks if translations for the specified language are available.
     * @param languageCode the language code for the language to check.
     */
    function isLanguageAvailable(languageCode){
        return __configuration__.task_presenter.language["available"].indexOf(languageCode) >= 0;
    }
    /**
     * Returns the default language.
     */
    function getDefaultLanguage(){
        return __configuration__.task_presenter.language["default"];
    }
    /**
     * Displays the specified question.
     * @param question the question to display.
     */
    function showQuestion(question){
        if (question){
            var key = question.key;
            var type = question.input.type;
            var index = index_[key];

            $("#question")
            .attr("data-key", key)
            .attr("data-type", type)
            .attr("data-index", index); // Why .attr() instead of .data()? See https://stackoverflow.com/q/7458649

            var hasHint = "hint" in question;
            var hasHelp = "help" in question;
            $("#question-assistance").toggleClass("hide", !hasHint && !hasHelp);
            $("#question-hint").toggleClass("hide", !hasHint);
            $("#question-more-help").toggleClass("hide", !hasHelp);

            progressStack_.push(index);

            // Update the progress bar (and rewind button state).
            var percentage = Math.max(0, Math.min(100, ((index / questions_.length) * 100).toFixed(0)));
            var maxWidth = questionnaireProgress_.offsetWidth - rewindButton_.offsetWidth - 100;
            $progressBar_.css("width", Math.round((percentage * maxWidth) / 100) + "px");
            percentageComplete_.innerHTML = percentage + "%";
            rewindButton_.disabled = progressStack_.length < 2;

            switch (type){
                case "dropdown-list":
                    buildDropdownListField(key, question.input);
                    break;
                case "radio-list":
                    buildRadioListField(key, question.input);
                    break;
                case "checklist":
                    buildChecklistField(key, question.input);
                    break;
                case "illustrative-checklist":
                    buildIllustrativeChecklistField(key, question.input);
                    break;
                case "geotagging":
                    buildGeotaggingField(key, question.input);
                    break;
                default:
                    break;
            }

            // When all required HTML elements have been built, content is added to them.
            updateQuestionContent(question);

            trigger(__component__.EVENT_QUESTION_CHANGED);
        }
    }
    /**
     * Builds the question's 'dropdown-list' input field.
     * @param key a question key.
     * @param input the input configuration used to build the field.
     */
    function buildDropdownListField(key, input){
        var element = document.getElementById("dropdown-list-field");
        var storageKey = "dropdown-list-field-for-" + key;
        var html = sessionStorage.getItem(storageKey); // Has the HTML been cached?
        if (html === null){
            html = '<option name="' + key + '" role="prompt" selected disabled></option>';
            for (var i = 0; i < input.options.length; ++i){
                var option = input.options[i];
                html += '<option name="' + key + '" value="' + option.value + '"></option>';
            }
            sessionStorage.setItem(storageKey, html);
        }
        element.innerHTML = html;
    }
    /**
     * Builds the question's 'radio-list' input field.
     * @param key a question key.
     * @param input the input configuration used to build the field.
     */
    function buildRadioListField(key, input){
        var storageKey = "radio-list-field-for-" + key;
        var html = sessionStorage.getItem(storageKey);
        if (html === null){
            html = "";
            for (var i = 0; i < input.options.length; ++i){
                var option = input.options[i];
                html += '<label><input type="radio" name="' + key + '" value="' + option.value + '"><span role="label-name"></span></label><br>';
            }
            sessionStorage.setItem(storageKey, html);
        }
        document.querySelector("#radio-list-field > section.custom-labels").innerHTML = html;
        document.querySelector('#radio-list-field > label[role="other-option"] > input[type="radio"]').setAttribute("name", key);
    }
    /**
     * Builds the question's 'checklist' input field.
     * @param key a question key.
     * @param input the input configuration used to build the field.
     */
    function buildChecklistField(key, input){
        var storageKey = "checklist-field-for-" + key;
        var html = sessionStorage.getItem(storageKey);
        if (html === null){
            html = "";
            for (var i = 0; i < input.options.length; ++i){
                var option = input.options[i];
                html += '<label><input type="checkbox" name="' + key + '" value="' + option.value + '"><span role="label-name"></span></label><br>';
            }
            sessionStorage.setItem(storageKey, html);
        }
        document.querySelector("#checklist-field > section.custom-labels").innerHTML = html;
        document.querySelector('#checklist-field > label[role="other-option"] > input[type="checkbox"]').setAttribute("name", key);
    }
    /**
     * Returns the string corresponding to the current language from a set of specified translations.
     */
    function inCurrentLanguage(translations){
        return translations[language_];
    };
    /**
     * Updates the textual content of the HTML node that contains the question.
     * Note that no HTML elements are added, removed or hidden; only modified.
     */
    function updateQuestionContent(question){
        var title = inCurrentLanguage(question.title);
        $("#question-title").html(title);

        var hint = question.hint ? inCurrentLanguage(question.hint) : null;
        if (hint !== null)
            document.getElementById("question-hint").innerHTML = hint;

        var help = question.help ? inCurrentLanguage(question.help) : null;
        if (help !== null){
            document.getElementById("question-help-modal-title").innerHTML = title;
            document.getElementById("question-help-modal-content").innerHTML = help;
        }

        switch (question.input.type){
            case "dropdown-list":
                updateDropdownListField(question.key, question.input);
                return;
            case "radio-list":
            case "checklist":
                updateMultipleChoiceField(question.input.type, question.key, question.input.options);
                return;
            default:
                return;
        }
    }
    /**
     * Updates a dropdown list field.
     * @param key a question key.
     * @param input the input configuration used to build the field.
     */
    function updateDropdownListField(key, input){
        var prompt = "Please select an item"; // FIXME parameters.prompt
        var options = input.options;
        var nodes = document.getElementById("dropdown-list-field").children;

        // Note: the first node is reserved for the prompt.
        nodes[0].innerHTML = prompt;
        for (var i = 0; i < options.length; ++i)
            nodes[i + 1].innerHTML = inCurrentLanguage(options[i].label);
    }
    /**
     * Updates a multiple choice field, i.e. radio-list (multiple choice, single response) or checklist (multiple choice, multiple response).
     * @param type a question type.
     * @param key a question key.
     * @param options the input's list of selectable options.
     */
    function updateMultipleChoiceField(type, key, options){
        for (var i = 0; i < options.length; ++i){
            var option = options[i];
            var selector = '#' + type + '-field > section.custom-labels > label > input[value="' + option.value + '"] + span[role="label-name"]';
            document.querySelector(selector).innerHTML = inCurrentLanguage(option.label);
        }
    }
    /**
     *
     */
    function onQuestionAnswered(event){
        var question = __component__.getCurrentQuestion();
        var type = question.input.type;
        var answer = event.currentTarget.value;
        if (answer === "OK"){
            // In cases where the answer is "OK", the answer will depend on the question type
            // which could be a dropdown list, checklist, or illustrative checklist input, etc.
            switch (type){
                case "url":
                case "text":
                case "longtext":
                    answer = $.trim(document.getElementById(type + "-field").value);
                    answer = answer.length > 0 ? answer : null;
                    break;
                case "number":
                    answer = parseFloat($.trim(document.getElementById("number-field").value));
                    answer = !isNaN(answer) && isFinite(answer) ? answer : null;
                    break;
                case "dropdown-list":
                    var selectedItem = document.querySelector("#dropdown-list-field > option:checked:not(:disabled)");
                    answer = selectedItem !== null ? $.trim(selectedItem.value) : "None";
                    break;
                case "radio-list":
                case "checklist":
                    answer = "";
                    var inputs = document.querySelectorAll('#' + type + '-field input[name="' + question.key + '"]:checked');
                    if (inputs && inputs.length > 0){
                        for (var i = 0; i < inputs.length; ++i){
                            var input = inputs[i];
                            var value = $.trim(input.value);
                            if (value.length > 0){
                                answer += ", " + value;
                                if (value === "Other"){
                                    var otherText = $.trim($(input).siblings('input[type="text"]').val());
                                    if (otherText.length > 0)
                                        answer += "[" + otherText + "]";
                                }
                            }
                        }
                        answer = answer.substring(2); // Remove the leading comma and whitespace.
                    }
                    answer = answer.length > 0 ? answer : "None";
                    break;
                default:
                    break;
            }
        }
        var errors = validateAnswer(answer, type);
        if (errors === null){
            answers_[question.key] = answer;
            trigger(__component__.EVENT_QUESTION_ANSWERED, [question.key, answer]);
        }
    }
    /**
     *
     */
    function onSubmit(event){
        // If there was an error submitting prior to this call, hide the error status icon and message.
        statusIcons_.error.style.display = "none";

        // Show the busy icon.
        $(statusIcons_.busy).fadeIn(150, function(){ statusIcons_.busy.style.display = "inline-block"; });

        // Disable the submit button until we get a response from the server (which could be a successful
        // submission or an error). See onSubmissionSuccess and onSubmissionError for more info.
        event.currentTarget.disabled = true;

        trigger(__component__.EVENT_SUBMIT, [answers_, onSubmissionSuccess, onSubmissionError]);
    }
    /**
     * Updates the status icons when a submission is successful.
     */
    function onSubmissionSuccess(){
        $(statusIcons_.busy).fadeOut(150, function(){
            statusIcons_.busy.style.display = "none";
            $(statusIcons_.success).fadeIn(150);
        });
    }
    /**
     * Updates the status icons and submit button when a submission fails.
     * @param message an error message.
     */
    function onSubmissionError(message){
        $(statusIcons_.busy).fadeOut(150, function(){
            statusIcons_.busy.style.display = "none";
            $(statusIcons_.error).fadeIn(150, function(){
                // Display the error message, if one was given.
                message = $.trim(message);
                if (message.length > 0){
                    submitMessage_.innerHTML = message;
                    submitMessage_.dataset.severity = "error";
                    $(submitMessage_).fadeIn(300);
                }
                // Re-enable the submit button so the user can retry submitting their analysis.
                submitButton_.disabled = false;
            });
        });
    }
    /**
     * Validates the specified answer.
     * If no errors are found, null is returned, otherwise a string containing an error message is returned.
     * @param answer an answer to validate.
     * @param type a type of question used to determine the validator.
     */
    function validateAnswer(answer, type){
        //TODO Implement me.
        return null;
    }
    /**
     * Triggers the event with the specified name, and with the given parameters.
     */
    function trigger(name, parameters){
        $(questionnaire_).trigger(name, parameters);
    }

    // Expose the frozen (immutable) API.
    project.questionnaire = Object.freeze(__component__);
})(window.geotagx.project, jQuery);
