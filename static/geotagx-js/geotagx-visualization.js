$(document).ready(function(){


window.global_summary = {};

// Prepare basic skeletal structure of the questions sections 
// from the schema
$(project_schema.questions).each(function(){
  var row = $('<div>').addClass('row');
  var h1 = $('<h3>').html(this.title);
  var chart_container = $('<div>').addClass('geotagx_chart_container').attr('id', 'geotagx_chart_'+this.answer.saved_as);
  // row.append(h1)
  row.append(chart_container);
  $("#task_run_visualization").append(row);
  $("#task_run_visualization").append($('<hr>'));

  global_summary[this.answer.saved_as] = {};
});

// Analyse data and init the graphs
var response;
$(project_task_runs).each(function(){
  var task_run = $(this).get(0);
  console.log(task_run);
    $(project_schema.questions).each(function(){
      // (this.answer.saved_as)
      try{
      response = task_run.info[this.answer.saved_as];
      if(response == undefined){
        // not answered this field
        // normalise this as NotAnswered
        response = "Not Answered";
      }else if(response.trim()==""){
        //normalise empty string results
        response = "Not Answered";        
      }
      //Check if this answer has been initialized in the global summary
      if(global_summary[this.answer.saved_as][response] == undefined){
        global_summary[this.answer.saved_as][response] = 0;
      }
      global_summary[this.answer.saved_as][response] += 1;
     }catch(err){
		//pass silently in case of errors
     }
    })
  });

//Render Graphs now in the respective containers
// Radialize the colors
Highcharts.getOptions().colors = Highcharts.map(Highcharts.getOptions().colors, function (color) {
    return {
        radialGradient: { cx: 0.5, cy: 0.3, r: 0.7 },
        stops: [
            [0, color],
            [1, Highcharts.Color(color).brighten(-0.3).get('rgb')] // darken
        ]
    };
});

function iterateSorted(dataObject, worker)
{
    var keys = [];
    for (var key in dataObject)
    {
        if (dataObject.hasOwnProperty(key))
            keys.push(key);
    }
    keys.sort();
    for (var i = 0; i < keys.length; i++)
    {
        worker(keys[i], dataObject[keys[i]]);
    }
}

$(project_schema.questions).each(function(){
  var question = this;
  if(question.type != "geotagging"){
    // Format Data for the chart
    var chart_data = [];
    var data_sum = 0;
    iterateSorted(global_summary[this.answer.saved_as], function(key, value){
      chart_data.push([key, value]);
      data_sum += value;
    });
    // Build the chart
    $('#geotagx_chart_'+this.answer.saved_as).highcharts({
        chart: {
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: true,
        },
        title: {
            text: this.title //Question text
        },
        tooltip: {
            pointFormat: '<b>{point.percentage:.1f}%</b>'
        },
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f} % ({point.y}/'+ data_sum +")",
                    style: {
                        color: (Highcharts.theme && Highcharts.theme.contrastTextColor) || 'black'
                    },
                    connectorColor: 'silver'
                },
                showInLegend: true
            }
        },
        series: [{
            type: 'pie',
            data: chart_data
        }],
        credits : {
          enabled : false
        }
    });
  }else{
    $('#geotagx_chart_'+this.answer.saved_as).html("<b>TODO:- Add support for Geotagging responses</b>");
  }
  
  $("#reference_image_padding").css("max-height",$(".partners").offset().top - $("#task_run_visualization_reference_image").height() - 400)
});

$(window).scroll(function(){
  var tOffSetOfImageTopPad = $("#reference_image_padding").offset().top;
  var tOffSetOfImage = $("#task_run_visualization_reference_image").offset().top;
  $("#reference_image_padding").stop().animate({height:$(window).scrollTop()-tOffSetOfImageTopPad + 130}, 500)
})

});

