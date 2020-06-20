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

function MapCreation(){
  console.log("hcauh");
  var map = L.map('mapid').setView([51.505, -0.09], 2).addLayer(new L.TileLayer("http://{s}.tile.cloudmade.com/1a1b06b230af4efdbb989ea99e9841af/998/256/{z}/{x}/{y}.png"));;
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);

  $.getJSON(json_file,function(data){
    console.log(data);
    L.geoJSON(data).addTo(map);
  });
}

function d3map(){
  var svg = d3.select("svg"),
  width = +svg.attr("width"),
  height = +svg.attr("height");

// Map and projection
var path = d3.geoPath();
var projection = d3.geoMercator()
  .scale(70)
  .center([0,20])
  .translate([width / 2, height / 2]);

// Data and color scale
var data = d3.map();
var colorScale = d3.scaleThreshold()
  .domain([100000, 1000000, 10000000, 30000000, 100000000, 500000000])
  .range(d3.schemeBlues[7]);

// Load external data and boot
d3.queue()
  .defer(d3.json, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson")
  .defer(d3.csv, "https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world_population.csv", function(d) { data.set(d.code, +d.pop); })
  .await(ready);

function ready(error, topo) {
  // Draw the map
  svg.append("g")
    .selectAll("path")
    .data(topo.features)
    .enter()
    .append("path")
      // draw each country
      .attr("d", d3.geoPath()
      .projection(projection)
    )
    // set the color of each country
    .attr("fill", function (d) {
      d.total = data.get(d.id) || 0;
      return colorScale(d.total);
    });
  }
}

function amchartsMap(covid_data){

  console.log(covid_data);
  am4core.useTheme(am4themes_animated);

  // confirmed_cases_array = [];

  //no data for some countries creation default values
  confirmed_cases_array = [
    {'id':'GL','name':'Greeland','value':0},
    {'id':'SJ','name':'Svalbard and Jan Mayen','value':0},
    {'id':'GF','name':'French Guiana','value':0},
    {'id':'TM','name':'Turkmenistan','value':0},
    {'id':'KP','name':'North Korea','value':0},
  ];

  $.each( covid_data, function( key, value ) {
    confirmed_cases_array.push({
      "id" : value['Country_code'],
      "value" : value['Total_cases'],
      "name" : value['Country']
    });
  });
  console.log(confirmed_cases_array);

  var chart = am4core.create("chartdiv", am4maps.MapChart);
  chart.geodata = am4geodata_worldLow;

  chart.projection = new am4maps.projections.Miller();

  var polygonSeries = chart.series.push(new am4maps.MapPolygonSeries());
  polygonSeries.useGeodata = true;

  var polygonTemplate = polygonSeries.mapPolygons.template;
  polygonTemplate.tooltipText = "{name} : {value}";
  polygonTemplate.fill = am4core.color("#74B266");

  // Create hover state and set alternative fill color
  var hs = polygonTemplate.states.create("hover");
  hs.properties.fill = am4core.color("#367B25");

  polygonSeries.heatRules.push({
    "property": "fill",
    "target": polygonSeries.mapPolygons.template,
    "min": am4core.color("#DBBDBD"),
    "max": am4core.color("#660000")
  });

  // var heatLegend = chart.createChild(am4maps.HeatLegend);
  // heatLegend.series = polygonSeries;
  // heatLegend.width = am4core.percent(100);
  //
  // polygonSeries.mapPolygons.template.events.on("over", function(ev) {
  // if (!isNaN(ev.target.dataItem.value)) {
  //   heatLegend.valueAxis.showTooltipAt(ev.target.dataItem.value)
  // }
  // else {
  //   heatLegend.valueAxis.hideTooltip();
  // }
  // });
  //
  // polygonSeries.mapPolygons.template.events.on("out", function(ev) {
  //   heatLegend.valueAxis.hideTooltip();
  // });

  // add heat legend
  var heatLegend = chart.chartContainer.createChild(am4maps.HeatLegend);
  heatLegend.valign = "bottom";
  heatLegend.align = "left";
  heatLegend.width = am4core.percent(100);
  heatLegend.series = polygonSeries;
  heatLegend.orientation = "horizontal";
  heatLegend.padding(20, 20, 20, 20);
  heatLegend.valueAxis.renderer.labels.template.fontSize = 10;
  heatLegend.valueAxis.renderer.minGridDistance = 40;

  polygonSeries.mapPolygons.template.events.on("over", event => {
    handleHover(event.target);
  });

  polygonSeries.mapPolygons.template.events.on("hit", event => {
    handleHover(event.target);
  });

  function handleHover(mapPolygon) {
    if (!isNaN(mapPolygon.dataItem.value)) {
      heatLegend.valueAxis.showTooltipAt(mapPolygon.dataItem.value);
    } else {
      heatLegend.valueAxis.hideTooltip();
    }
  }

  polygonSeries.mapPolygons.template.strokeOpacity = 0.4;
  polygonSeries.mapPolygons.template.events.on("out", event => {
    heatLegend.valueAxis.hideTooltip();
  });

  chart.zoomControl = new am4maps.ZoomControl();
  chart.zoomControl.valign = "top";


  polygonSeries.exclude = ["AQ"];
  polygonSeries.data = confirmed_cases_array;
  // map.series.push(polygonSeries);
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
    // console.log(response);
    console.log(data_url);
    amchartsMap(response);
  });
}

$(document).ready(function(){
  ajaxCall(data_url);
});
