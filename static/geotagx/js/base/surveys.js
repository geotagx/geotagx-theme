$(document).ready(function(){
	if(document.location.pathname!="/survey" && document.location.pathname!="/survey/") {
		$.get("/survey/status", function(data){
			window.spm = data
			if(data.geotagx_survey_status=="RESPONSE_NOT_TAKEN"){
				//Redirect to surveys page
				document.location = "/survey/"
			}else if(data.geotagx_survey_status=="AGREE_TO_PARTICIPATE"){
				//Check if the number of tasks is greater than the required number of tasks
				if(data.task_runs > data.final_survey_task_requirements){
					document.location = "/survey/"
				}
			}else {
				//Case of ["DENY_TO_PARTICIPATE", "DENY_TO_PARTICIPATE_IN_FINAL_SURVEY", "ALL_SURVEYS_COMPLETE" ]
				//Do Nothing
			}
		});
	}
})
