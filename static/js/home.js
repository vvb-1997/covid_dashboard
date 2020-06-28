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
  return "<tr><td>" + i + "</td><td>" + Country_url + "</td><td>" + commaSeparateNumber(data['Total_cases'])+ "</td><td>" + commaSeparateNumber(data['New_cases'])+ "</td><td>" + commaSeparateNumber(data['Total_deaths'])+ "</td><td>" + commaSeparateNumber(data['New_deaths'])+ "</td><td>" + commaSeparateNumber(data['Total_recovered'])+ "</td><td>" + commaSeparateNumber(data['New_recovered'])+ "</td><td>" + commaSeparateNumber(data['Population'])+ "</td><td>" + Math.round((data['Total_cases']/data['Population'])*1000000)+ "</td></tr>";
}

function dataAppend(data_point){
  // console.log(data_point['Total_cases'].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","));
  $('#Confirmed').text(commaSeparateNumber(data_point['Total_cases']));
  $('#Active').text(commaSeparateNumber(data_point['Total_cases'] - (data_point['Total_recovered']+data_point['Total_deaths'])));
  $('#Recovered').text(commaSeparateNumber(data_point['Total_recovered']));
  $('#Deaths').text(commaSeparateNumber(data_point['Total_deaths']));
  $('#NewConfirmed').text(commaSeparateNumber(data_point['New_cases']));
  $('#NewActive').text(commaSeparateNumber(data_point['New_cases'] - (data_point['New_recovered']+data_point['New_deaths'])));
  $('#NewRecovered').text(commaSeparateNumber(data_point['New_recovered']));
  $('#NewDeaths').text(commaSeparateNumber(data_point['New_deaths']));
  // NumberAnimate(["#Confirmed","#Recovered","#Deaths","#Active"]);
  // NumberAnimateCommas(["#Confirmed","#Recovered","#Deaths"]);
}

function tableAppend(data_point){
  html_out = "<thead><tr><th>NO.</th><th>Country</th><th>Total Confirmed</th><th>New Cases</th><th>Total Deaths</th><th>New Deaths</th><th>Total Recovered</th><th>New Recovered</th><th>Population</th><th>Cases Per Million</th></tr></thead><tbody>";

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
// var defaultLegendClickHandler = Chart.defaults.global.legend.onClick;
// function newLegendClickHandle(e,legendItem){
//   var index = legendItem.datasetIndex;
//   console.log(index);
//   if (index > 1) {
//       // Do the original logic
//       defaultLegendClickHandler(e, legendItem);
//   }
// }

function dateFormater(dateString){
  var date = new Date(Date.parse(dateString));
  const formatter = new Intl.DateTimeFormat('en-GB', { year: 'numeric', month: 'short', day: 'numeric' });
  return formatter.format(date);
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
         var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100);
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
      },
      onClick: null
    }
  };

  console.log(options);
  var ctx = document.getElementById('myChart').getContext('2d');
  var myPieChart = new Chart(ctx, {
    type: 'pie',
    data: data,
    options: options
  });
}

function ajaxCall(data_url){
  var csrftoken = getCookie('csrftoken');

  $.ajaxPrefilter(function (options, originalOptions, jqXHR) {
    jqXHR.setRequestHeader('X-CSRFToken', csrftoken);
  });

  $.ajax({
    type: "POST",
    url: data_url,
  })
  .done(function( response ) {
    dataAppend(response['Global']);
    tableAppend(sort_object_of_objects(response, 'Total_cases'));
    piechart(response['Global']);
    $('#last_updated h4 span').text(dateFormater(response['Global']['Last_updated']));
    console.log(sort_object_of_objects(response, 'Total_cases'));
  });
}

$(document).ready(function(){
  ajaxCall(data_url);
});
