/**
 * This script is part of the GeoTag-X theme.
 * It manages the task presenter's questionnaire.
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
(function(geotagx, taskPresenterConfiguration){
	"use strict";

	/**
	 * The task presenter's configuration.
	 */
	var configuration_ = geotagx.project.configuration.task_presenter;
	/**
	 * The list of questions.
	 */
	var questions_ = configuration_.questionnaire.questions;
	/**
	 * The questionnaire's answers.
	 */
	var answers_ = {};
	/**
	 * The questionnaire's index.
	 */
	var index_ = Object.freeze(function(){
		var output = {};
		for (var i = 0; i < questions_.length; ++i) {
			var key = questions_[i].key;
			output[key] = i;
			answers_[key] = null; // Populate the answers object while we're at it...
		}
		return output;
	}());
	/**
	 * The task presenter's questionnaire instance.
	 */
	geotagx.project.taskPresenter.questionnaire = new Vue({
		el: "#questionnaire",
		data: {
			/**
			 * True if the questionnaire is complete, false otherwise.
			 */
			isComplete: false,
			/**
			 * The questionnaire's submission status. Possible values are 'IDLE', 'BUSY', 'DONE' and 'ERROR'.
			 */
			submissionStatus: "IDLE",
			/**
			 * The questionnaire's current language.
			 */
			currentLanguage: configuration_.language.default,
			/**
			 * The current question's index.
			 */
			currentQuestionIndex: 0,
			/**
			 * A stack that keeps track of previous questions.
			 */
			previousQuestionStack_: [],
			/**
			 * The number of completed analyses. Note that this attribute is initialized with
			 * the unicode string for the infinity character. Its actual value is computed in
			 * the 'ready' method.
			 */
			analysesCompleted: "&#8734;",
			/**
			 * The total number of analyses. Just like 'analysesCompleted', this variable's
			 * real value is computed in the 'ready' method.
			 */
			numberOfAnalyses: "&#8734;",
		},
		computed: {
			/**
			 * The previous question if one exists, null otherwise.
			 */
			previousQuestion: function(){
				var question = null;
				if (this.hasPreviousQuestion()) {
					var previousQuestionIndex = this.previousQuestionStack_[this.previousQuestionStack_.length - 1];
					question = questions_[previousQuestionIndex];
				}
				return question;
			},
			/**
			 * The current question.
			 */
			currentQuestion: function(){
				return questions_[this.currentQuestionIndex];
			},
			/**
			 * The percentage of completed questions.
			 */
			percentageComplete: function(){
				var result = 100;
				if (!this.isComplete) {
					result = ((this.currentQuestionIndex / questions_.length) * 100).toFixed(0);
					result = Math.max(0, Math.min(100, result));
				}
				return result;
			},
		},
		filters: {
			/**
			 * A filter that converts markdown text to HTML.
			 */
			markdown: marked,
		},
		methods: {
			/**
			 * Resets the questionnaire.
			 */
			reset: function(){
				for (var i = 0; i < questions_.length; ++i) {
					answers_[questions_[i].key] = null;
				}
				this.previousQuestionStack_ = [];
				this.isComplete = false;
				this.submissionStatus = "IDLE";
				this.currentQuestionIndex = 0;
			},
			/**
			 * Returns the number of questions in the questionnaire.
			 */
			getLength: function(){
				return questions_.length;
			},
			/**
			 * Returns true if the specified key exists in the questionnaire's index, false otherwise.
			 * @param key a question key.
			 */
			keyExists: function(key){
				return key && typeof(key) === "string" && key in index_;
			},
			/**
			 * Returns the answer to the question with the specified key.
			 * @param key a question key.
			 */
			getAnswer: function(key){
				return this.keyExists(key) ? answers_[key] : null;
			},
			/**
			 * Saves the answer of the question with the specified key.
			 * @param key a question key.
			 * @param answer the answer to save.
			 */
			saveAnswer: function(key, answer){
				if (this.keyExists(key)) {
					answers_[key] = answer;
				} else {
					throw "InvalidQuestionKey";
				}
			},
			/**
			 * Returns all current answers to the questionnaire.
			 */
			getAnswers: function(){
				return answers_;
			},
			/**
			 * Submits the questionnaire's answers.
			 */
			submit: function(){
				geotagx.project.taskPresenter.submit(answers_);
			},
			/**
			 * Returns true if the specified status is valid, false otherwise.
			 * @param status a submission status string to validate.
			 */
			isSubmissionStatus: function(status){
				return typeof(status) === "string" && ["IDLE", "BUSY", "DONE", "ERROR"].indexOf(status) >= 0;
			},
			/**
			 * Sets the questionnaire's submission status.
			 * @param status a status string.
			 */
			setSubmissionStatus: function(status){
				if (this.isSubmissionStatus(status)) {
					this.submissionStatus = status;
				} else {
					throw "InvalidSubmissionStatus";
				}
			},
			/**
			 * Returns true if at least one question has been answered, false otherwise.
			 */
			hasPreviousQuestion: function(){
				return this.previousQuestionStack_.length > 0;
			},
			/**
			 * Displays the previous question, if one exists.
			 */
			showPreviousQuestion: function(){
				// Before showing the previous question, the answer to the current question should be
				// discarded since the questionnaire's flow may change based on the answer to the previous
				// question, which means that keeping the answer to the current question will most likely
				// create an incoherent answer set.
				answers_[this.currentQuestion.key] = null;

				if (this.isComplete) {
					this.isComplete = false;
				} else if (this.hasPreviousQuestion()) {
					this.currentQuestionIndex = this.previousQuestionStack_.pop();
				}
			},
			/**
			 * Displays the nth question.
			 * @param index the index of the question to display.
			 */
			showQuestion: function(index){
				if (index < 0 || index >= this.getLength()) {
					throw "InvalidQuestionIndex";
				}
				this.currentQuestionIndex = index;
			},
			/**
			 * Returns the next question based on the specified answer to the current one.
			 * If no question is found, null is returned.
			 * @param answer the answer to the current question.
			 */
			getNextQuestion: function(answer){
				// Let's assume the questionnaire's flow is sequential.
				var nextQuestionIndex = this.currentQuestionIndex + 1;

				var branch = questions_[this.currentQuestionIndex].branch || null;
				if (branch) {
					var branchType = typeof(branch);
					if (branchType === "string") {
						// If the branch is a string, its value is either "_end" or a question key.
						if (branch === "_end") {
							nextQuestionIndex = -1;
						} else if (branch in index_) {
							nextQuestionIndex = index_[branch];
						}
					} else if (branchType === "object") {
						var inputType = this.currentQuestion.input.type;
						var branchKey = answer.toLowerCase(); // Lower-case for case-insensitive string comparisons.

						// Polar questions are a bit special: if the user clicks "I do not know" or "Not clear enough"
						// and neither of these answers has been explicitly specified as a branching condition, the
						// answer is assumed to be "No".
						if (inputType === "polar" && branchKey !== "yes" && !(branchKey in branch)) {
							branchKey = "no";
						}
						if (branchKey in branch) {
							var indexKey = branch[branchKey];
							if (indexKey in index_) {
								nextQuestionIndex = index_[indexKey];
							}
						}
					}
				}
				// At this point, the nextQuestionIndex variable may hold a value in the range [-1, N] where
				// N is the length of the questionnaire. It will hold -1 in cases where a question is explicitly
				// branched to the end of the questionnaire and N when the current question index is (N - 1).
				return questions_[nextQuestionIndex] || null;
			},
			/**
			 * Displays the next question based on the answer to the current one.
			 * @param answer the answer to the current question.
			 */
			showNextQuestion: function(answer){
				var nextQuestion = this.getNextQuestion(answer);
				if (nextQuestion) {
					this.previousQuestionStack_.push(this.currentQuestionIndex);
					this.showQuestion(index_[nextQuestion.key]);
				} else {
					this.isComplete = true;
				}
			},
		},
		ready: function(){
			(function(vue){
				pybossa.userProgress(geotagx.project.shortName).done(function(data){
					vue.analysesCompleted = data.done + 1;
					vue.numberOfAnalyses = data.total;
				});
			})(this);

			var remindMeLaterButton = document.getElementById("remind-me-later");
			if (remindMeLaterButton) {
				remindMeLaterButton.addEventListener("click", function(){
					document.getElementById("anonymous-notification").style.display = "none";
				});
				remindMeLaterButton.removeAttribute("disabled");
			}

			// Display the questionnaire element.
			this.$el.hidden = false;

			// Start the task presenter.
			geotagx.project.taskPresenter.start(geotagx.project.shortName);
		},
	});
})(window.geotagx = window.geotagx || {});
