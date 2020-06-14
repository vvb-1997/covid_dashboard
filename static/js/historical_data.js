function getCookie(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

function sort_object_of_objects(data, attr) {
    var arr = [];
    for (var prop in data) {
        if (data.hasOwnProperty(prop)) {
            var obj = {};
            obj[prop] = data[prop];
            obj.tempSortName = data[prop][attr];
            arr.push(obj);
        }
    }

    arr.sort(function(a, b) {
        var at = a.tempSortName,
            bt = b.tempSortName;
        return at < bt ? 1 : ( at < bt ? 0 : -1 );
    });

    var result = [];
    for (var i=0, l=arr.length; i<l; i++) {
        var obj = arr[i];
        delete obj.tempSortName;
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                var id = prop;
            }
        }
        var item = obj[id];
        result.push(item);
    }
    return result;
}

// function CardCreator(dataPoint){
//
//   Total_cases = dataPoint.Total_cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
//   Active_cases = dataPoint.Active_cases.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//   Total_recovered = dataPoint.Total_recovered.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
//
//   var html_content = '<div class="ui cards content_div"> <div class="card content_div"> <div class="content"> <div class="header"> '+ dataPoint.Country +' </div> <hr><div class="meta"><b>Total Cases: </b>'+ Total_cases +' </div> <div class="meta"><b>Active: </b>'+ Active_cases +' </div> <div class="meta"><b>Recovered: </b>'+ Total_recovered +' </div> </div> </div> </div> '
//   return html_content;
// }

// function dataMassaging(data){
//   // alert(data['World']);
//   $.each( data, function( key, value ) {
//     console.log( key + ": " + value );
//   });
//   $('#home_body').html(CardCreator(data['World']));
// }

// function NumberAnimateCommas(div_id_array){
//   div_id_array.forEach(function(item){
//     var comma_separator_number_step = $.animateNumber.numberStepFactories.separator(',');
//     console.log(comma_separator_number_step);
//     var counterValv = $(item).text();
//     $(item).animateNumber({
//       number: $(item).text(),
//       numberStep: comma_separator_number_step
//     });
//   });
// }

function commaSeparateNumber(val){
  while (/(\d+)(\d{3})/.test(val.toString())){
    val = val.toString().replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
  }
  return val;
}

function lastOccurance(val, last_day_flag = false){
  var idx = val.lastIndexOf(',');
  if(last_day_flag){
    latest_figure = val.substring(idx + 1).trim();
    var temp = val.substring(0,idx).trim();
    var new_idx = temp.lastIndexOf(',');
    day_before_figure = val.substring(new_idx + 1).trim();
    return commaSeparateNumber((parseInt(latest_figure) - parseInt(day_before_figure)));
  }
  else{
    return commaSeparateNumber(parseInt(val.substring(idx + 1).trim()));
  }
}

function NumberAnimate(div_id_array){
  div_id_array.forEach(function(item){
    value_text = $(item).text();
    $({someValue: 0}).animate({someValue: value_text}, {
        // duration: 3000,
        easing: 'swing',
        step: function () {
          $(item).text(commaSeparateNumber(Math.round(this.someValue)));
      }
    });
  });
}

function rowCreator(i,data){
  if(data['Country'] == 'Global'){
    i = '';
    Country_url = data['Country']
  }
  else{
    Country_url = "<a href = '/country/" + data['Slug'] + "'> " + data['Country'] +"</a>";
  }
  return "<tr><td>" + i + "</td><td>" + Country_url + "</td><td>" + commaSeparateNumber(data['Total_cases'])+ "</td><td>" + commaSeparateNumber(data['New_cases'])+ "</td><td>" + commaSeparateNumber(data['Total_deaths'])+ "</td><td>" + commaSeparateNumber(data['New_deaths'])+ "</td><td>" + commaSeparateNumber(data['Total_recovered'])+ "</td><td>" + commaSeparateNumber(data['New_recovered'])+ "</td></tr>";
}

function dataAppend(data_point){
  // console.log(data_point['Total_cases'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $('#Confirmed').text(lastOccurance(data_point['Confirmed']));
  $('#Active').text(lastOccurance(data_point['Active']));
  $('#Recovered').text(lastOccurance(data_point['Recovered']));
  $('#Deaths').text(lastOccurance(data_point['Deaths']));
  $('#NewConfirmed').text(lastOccurance(data_point['Confirmed'],true));
  $('#NewActive').text(lastOccurance(data_point['Active'],true));
  $('#NewRecovered').text(lastOccurance(data_point['Recovered'],true));
  $('#NewDeaths').text(lastOccurance(data_point['Deaths'],true));
  // NumberAnimate(["#Confirmed","#Recovered","#Deaths","#Active"]);
  // NumberAnimateCommas(["#Confirmed","#Recovered","#Deaths"]);
}

function tableAppend(data_point){
  html_out = "<thead><tr><th>NO.</th><th>Country</th><th>Total Confirmed</th><th>New Cases</th><th>Total Deaths</th><th>New Deaths</th><th>Total Recovered</th><th>New Recovered</th></tr></thead><tbody>";

  var i=0;
  console.log(data_point);

  $.each(data_point, function(index,jsonObject){
    html_out += rowCreator(i,jsonObject);
    i+=1;
  });

  // console.log(html_out);
  $('#countries').html(html_out);
  $('#countries').DataTable({
    responsive: true,
    fixedHeader: {
        header: true,
      }
  });
}

function piechart(data_point){

  data = {
    datasets: [{
        label: 'Covid-19',
        data: [data_point['Total_cases'] - (data_point['Total_recovered']+data_point['Total_deaths']),data_point['Total_recovered'],data_point['Total_deaths']],
        backgroundColor: ["blue", "green", "red"],
        borderColor: "#fff"
    }],

    // These labels appear in the legend and in the tooltips when hovering different arcs
    labels: [
        'Active',
        'Recovered',
        'Deaths'
    ]
  };

  options = {
    responsive: true,
    maintainAspectRatio: true,
    cutoutPercentage: 50,
    tooltips: {
     enabled: true,
     mode: 'single',
     callbacks: {
       title: function(tooltipItem, data) {
         return data['labels'][tooltipItem[0]['index']];
       },
       label: function(tooltipItem, data) {
         return commaSeparateNumber(data['datasets'][0]['data'][tooltipItem['index']]);
       },
       afterLabel: function(tooltipItem, data) {
         var dataset = data['datasets'][0];
         var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
         return '(' + percent + '%)';
       }
      }
    },
    plugins: {
     datalabels: {
       formatter: (value, ctx) => {
         let datasets = ctx.chart.data.datasets;

         if (datasets.indexOf(ctx.dataset) === datasets.length - 1) {
           let sum = datasets[0].data.reduce((a, b) => a + b, 0);
           let percentage = Math.round((value / sum) * 100) + '%';
           return percentage;
         } else {
           return percentage;
         }
       },
       color: '#fff',
     }
    },
    animation:{
      // duration: 1000,
      animateRotate: true,
      animateScale: true,
    },
    legend: {
      display: true,
      position: 'right',
      align: 'end',
      labels: {
        fontSize: 15,
      }
    }
  };

  var ctx = document.getElementById('myChart').getContext('2d');
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
  });
}

var object_data;

function linechart(chart_array,data_point){
  var Overall = {
    labels: data_point['Date'].split(','),
    datasets :[{
      data: data_point['Confirmed'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Confirmed",
      borderColor: "#7b7575",
      fill: false
    },{
      data: data_point['Active'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Active",
      borderColor: "#00f",
      fill: false
    },{
      data: data_point['Recovered'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Recovered",
      borderColor: "#008000",
      fill: false
    },{
      data: data_point['Deaths'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Deaths",
      borderColor: "#ff0000",
      borderWidth: 1,
      fill: false
    }]
  };
  var Confirmed = {
    labels: data_point['Date'].split(','),
    datasets :[{
      data: data_point['Confirmed'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Confirmed",
      borderColor: "#7b7575",
      fill: false
    }]
  };
  var Active = {
    labels: data_point['Date'].split(','),
    datasets :[{
      data: data_point['Active'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Active",
      borderColor: "#00f",
      fill: false
    }]
  };
  var Recovered = {
    labels: data_point['Date'].split(','),
    datasets :[{
      data: data_point['Recovered'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Recovered",
      borderColor: "#008000",
      fill: false
    }]
  };
  var Deaths = {
    labels: data_point['Date'].split(','),
    datasets :[{
      data: data_point['Deaths'].split(',').map(function(item) {return parseInt(item, 10);}),
      label: "Deaths",
      borderColor: "#ff0000",
      fill: false
    }]
  };

  object_data = {'Overall':Overall, 'Confirmed':Confirmed, 'Active':Active, 'Recovered':Recovered, 'Deaths':Deaths };

  $.each(chart_array, function(key,value){
    var new_value = value.split('_')[1];
    var ctx = document.getElementById(value).getContext('2d');
    var myLineChart = new Chart(ctx, {
      type: 'line',
      data: object_data[new_value],
      options: {
        responsive: true,
        maintainAspectRatio: true,
        title: {
          display: true,
          text: 'Trend in '+ new_value +' Cases in '+ countryName,
        },
        plugins: {
          datalabels: {
              display: false,
          },
        },
        animation: false,
        scales: {
          yAxes: [{
              ticks: {
                  beginAtZero: true
              }
          }]
        }
      }
    });
    line_chart_object[value] = myLineChart;
  });
}

function updatechart(id){
  console.log(id);
  $("#"+id).addClass('active');
  if(id.split('_')[0] == "linear"){
    $('#log_'+id.split('_')[1]).removeClass('active');
  }
  else{
    $('#linear_'+id.split('_')[1]).removeClass('active');
  }
  var type = id.split('_')[0];
  var tab_name = id.split('_')[1];
  var chart_id_name = 'myChart_' + id.split('_')[1];
  console.log(type,tab_name,chart_id_name);
  // $('#'+chart_id_name).remove();
  // $('#'+tab_name).append('<canvas id="' + chart_id_name + '"><canvas>');
  line_chart_object[chart_id_name].destroy();
  ctx = document.querySelector('#'+chart_id_name).getContext('2d');
  if(type == 'linear'){
    var options = {
      responsive: true,
      maintainAspectRatio: true,
      title: {
        display: true,
        text: 'Trend in '+ tab_name +' Cases in '+ countryName,
      },
      plugins: {
        datalabels: {
            display: false,
        },
      },
      animation: false,
      scales: {
        yAxes: [{
            ticks: {
                beginAtZero: true
            }
        }]
      }
    };
  }
  else{
    var options = {
      responsive: true,
      maintainAspectRatio: true,
      title: {
        display: true,
        text: 'Trend in '+ tab_name +' Cases in '+ countryName,
      },
      plugins: {
        datalabels: {
            display: false,
        },
      },
      animation: false,
      scales: {
        yAxes: [{
            type: 'logarithmic',
            ticks: {
              autoSkip: true,
              beginAtZero: true,
              min: 0,
              callback: function (value, index, values) {
                if( value ==1 || value==10 || value==100 || value==1000 || value==10000 || value==100000  || value==1000000 || value==10000000){
                    if(value < 1000) {
                      return value;
                    }
                    else{
                      return value/1000 +"K";
                    }
                }
              }
            },
            scaleLabel: {
              display: true,
              labelString: ''
            }
        }]
      }
    };
  }
  var myLineChart = new Chart(ctx, {
    type: 'line',
    data: object_data[tab_name],
    options: options
  });
  line_chart_object[type] = myLineChart;
}

var response_data;
var line_chart_object = {};
function ajaxCall(data_url){
  var csrftoken = getCookie('csrftoken');
  var chart_array = ['myChart_Overall','myChart_Confirmed','myChart_Active','myChart_Recovered','myChart_Deaths'];

  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    jqXHR.setRequestHeader('X-CSRFToken', csrftoken);
  });

  $.ajax({
    type: "POST",
    url: data_url,
    data: {
      'slug' : country_slug
    }
  })
  .done(function( response ) {
    dataAppend(response);
    // tableAppend(sort_object_of_objects(response, 'Total_cases'));
    linechart(chart_array,response);
    console.log(response);
    $('.tabular.menu .item').tab();
    $('.load_anchor').removeClass('loading');
    response_data = response;
  });
}

$(document).ready(function(){
  ajaxCall(data_url);
});
