/*
https://www.dyclassroom.com/chartjs/chartjs-how-to-draw-line-graph-using-data-from-mysql-table-and-php
1.2:  use of array of arrays
1.3   moved chart.data.json under www/js/
1.4:  introduced bar graph
2.4:  introduced pie chart
      + random colors for variable number of arrays
      + random colors updated dynamically with button
2.5:  all 3 graphs use variable array datasets

TODO: actually use chart.data.json via XMLhr
TODO: map columns or something like that within a dict, currently num of columns is fixed
TODO: random colors button works only for pie, check why
*/
var chartVersion = 2.5;
var config;
var myChart;
var ctx;

function createchartContainer() {
  var div  = document.createElement('div');
  div.className = "chart-container";
  var canvas  = document.createElement('canvas');
  canvas.id = "chartcanvas";
  div.appendChild(canvas);
  document.getElementById("output").appendChild(div);
}

function resetCanvas() {
  purgeElement("chart-container");
  var canvas = document.createElement('canvas');
  canvas.id = "chartcanvas";
  document.getElementById("chart-container").appendChild(canvas);
}

/* // what we need is this :
[{
    "timestamp" : "date",
    "CIS212-001" : "-1",
    "ITEC250-002" : "5",
  },..

sql select returns this:
timestamp 'CIS212-001' 'ITEC250-002'
"1510866999"	"3"	"12"
"1510870572"	"3"	"12"
*/

var randRgba = function() {
  return Math.round(Math.random() * 255);
};

var randRgbaColor = function() {
  return "rgba("+randRgba()+", "+randRgba()+", "+randRgba()+", 0.75)";
};

// gui.js execute returns this:
// console.log('columns='+results[i].columns); // [ "timestamp", "CIS212-001", "ITEC250-002" ]
// console.log('values='+results[i].values);   // [ Array[3], Array[3],..]

// chartType = line,bar.. // http://www.chartjs.org/docs/latest/charts/
// fillLineChartWithSql is called by the GUI gui.js
// fillPieChartWithSql is called by the GUI gui.js
// http://www.chartjs.org/samples/latest/charts/pie.html
function fillLineChartWithSql(columns,values) {
  resetCanvas();
  var arrays = [];
  var colors = [];
  
  // create arrays of arrays with the right number of columns passed as argument
  for (var c in columns) {
    arrays.push([]);
  }

  // fill data and label arrays with each biunary value from the values array passed as argument
  // input:
  // console.log(columns);       //  dual datasets: Array(3) [ "timestamp", "CIS212-001", "ITEC250-002" ]
  // console.log(values);        //  dual datasets: Array(n) [ ["2018-08-02 18:44:25", 4, 0], ..] => point 1 [timestamp, value dataset 1, value dataset 2], point 2 [], ...
  for (var i in values) {
    for (var c in columns) {
      arrays[c].push(values[i][c]);
    };
  };
  // output:
  // console.log(arrays[0]);     //  x-axis timestamps: Array(n) [ "2018-08-02 18:44:25", ..]
  // console.log(arrays[1]);     //  y-axis dataset 1 : Array(n) [ 4, 4, ..]
  // console.log(arrays[2]);     //  y-axis dataset 2 : Array(n) [ 0, 0, ..]
  
  transparency = 0.75;
  for (var i = 0; i < columns.length; ++i) {
    colors.push(randRgbaColor());
  };
  // console.log(colors);        //  Array(3) ["rgba(161, 97, 32, 0.75)", ..]

  // build datasets starting from 1 since I don't mind having colors one more item than necessary:
  var datasets = [];
  for (var i = 1; i < colors.length; ++i) {
    datasets.push({
      label: columns[i],
      data: arrays[i],
      fill: false,
      lineTension: 0.1,
      backgroundColor: colors[i],
      borderColor: colors[i],
      pointHoverBackgroundColor: colors[i],
      pointHoverBorderColor: colors[i]
    });
  };

  config = {
    type: 'line',
    data: {
      datasets: datasets,
      labels: arrays[0]
    },
    options: {
      responsive: true,
      scales: {
        xAxes: [{
          type: 'time',
          distribution: 'linear'
        }]
      }
    }
  };

  ctx = document.getElementById('chartcanvas').getContext('2d');
  window.myChart = new Chart(ctx, config);

}

/****************************************************************
// fillBarGraphWithSql is called by the GUI gui.js
// http://www.chartjs.org/samples/latest/charts/bar/vertical.html
*/
function fillBarGraphWithSql(columns,values) {
  resetCanvas();
  var arrays = [];
  var colors = [];
  
  // create arrays of arrays with the right number of columns passed as argument
  for (var c in columns) {
    arrays.push([]);
  }

  // fill data and label arrays with each biunary value from the values array passed as argument
  // input:
  // console.log(columns);       //  dual datasets: Array(3) [ "timestamp", "CIS212-001", "ITEC250-002" ]
  // console.log(values);        //  dual datasets: Array(n) [ ["2018-08-02 18:44:25", 4, 0], ..] => point 1 [timestamp, value dataset 1, value dataset 2], point 2 [], ...
  for (var i in values) {
    for (var c in columns) {
      arrays[c].push(values[i][c]);
    };
  };
  // output:
  // console.log(arrays[0]);     //  x-axis timestamps: Array(n) [ "2018-08-02 18:44:25", ..]
  // console.log(arrays[1]);     //  y-axis dataset 1 : Array(n) [ 4, 4, ..]
  // console.log(arrays[2]);     //  y-axis dataset 2 : Array(n) [ 0, 0, ..]
  
  transparency = 0.75;
  for (var i = 0; i < columns.length; ++i) {
    colors.push(randRgbaColor());
  };
  console.log(colors);        //  Array(3) ["rgba(161, 97, 32, 0.75)", ..]

  // build datasets starting from 1 since I don't mind having colors one more item than necessary:
  var datasets = [];
  for (var i = 1; i < colors.length; ++i) {
    datasets.push({
      label: columns[i],
      data: arrays[i],
      backgroundColor: colors[i]
    });
  };

  config = {
    type: 'bar',
    data: {
      datasets: datasets,
      labels: arrays[0]
    },
    options: {
      responsive: true,
      scales: {
        xAxes: [{
          gridLines: {
            offsetGridLines: false
          }
        }]
      }
    }
  };

  ctx = document.getElementById('chartcanvas').getContext('2d');
  window.myChart = new Chart(ctx, config);
}

// fillPieChartWithSql is called by the GUI gui.js
// http://www.chartjs.org/samples/latest/charts/pie.html
function fillPieChartWithSql(columns,values) {
  resetCanvas();
  
  // arrays[0] = labels
  // arrays[1] = values
  // arrays[3] = backgroundColor
  var arrays = [[],[],[]];       // TODO: map columns or something like that within a dict

  // fill data and label arrays with each biunary value from the values array passed as argument
  // input:
  // console.log(columns);       //  Array(2) [ "field", "ynum" ]
  // console.log(values);        //  Array(17) [ ["CHEM", 2], ["BIOL", 2], ..]
  for (var i in values) {
    for (var c in columns) {
      arrays[c].push(values[i][c]);
    };
  };
  // output:
  // console.log(arrays[0]);     //  Array(17) [ "CHEM", "BIOL", ..]
  // console.log(arrays[1]);     //  Array(17) [ 2, 2, ..]
  
  transparency = 0.75;
  for (var item in arrays[1]) {
    arrays[2].push(randRgbaColor());
  };
  // console.log(arrays[2]);       //  Array(17) ["rgba(161, 97, 32, 0.75)", ..]

  config = {
    type: 'pie',
    data: {
      datasets: [{
        data: arrays[1],
        backgroundColor: arrays[2],
        label: 'Dataset 1'
      }],
      labels: arrays[0]
    },
    options: {
      responsive: true
    }
  };

  ctx = document.getElementById('chartcanvas').getContext('2d');
  window.myChart = new Chart(ctx, config);

}

// set single backgroundColor to each dataset
function updateMyChartSingleColor() {
  if (config) {
    config.data.datasets.forEach(function(dataset) {
      singleColor = randRgbaColor();
      dataset.backgroundColor = singleColor;
    });
    window.myChart.update();
  }
}

// set array(backgroundColor) to each dataset
function updateMyChartRandomColors() {
  if (config) {
    // default color as random:
    config.data.datasets.forEach(function(dataset) {
      // we make backgroundColor = data because we want an array of same length
      dataset.backgroundColor = dataset.data;
      // then we map randRgbaColor for each item in backgroundColor array
      dataset.backgroundColor = dataset.backgroundColor.map(function() {
        return randRgbaColor();
      });
    });
    window.myChart.update();
  }
}

  // window.onload = function() {
    // var ctx = document.getElementById('chart-area').getContext('2d');
    // window.myChart = new Chart(ctx, config);
  // };

  // document.getElementById('randomizeData').addEventListener('click', function() {
    // config.data.datasets.forEach(function(dataset) {
      // dataset.data = dataset.data.map(function() {
        // return randomScalingFactor();
      // });
    // });

    // window.myChart.update();
  // });

  // var colorNames = Object.keys(window.chartColors);
  // document.getElementById('addDataset').addEventListener('click', function() {
    // var newDataset = {
      // backgroundColor: [],
      // data: [],
      // label: 'New dataset ' + config.data.datasets.length,
    // };

    // for (var index = 0; index < config.data.labels.length; ++index) {
      // newDataset.data.push(randomScalingFactor());

      // var colorName = colorNames[index % colorNames.length];
      // var newColor = window.chartColors[colorName];
      // newDataset.backgroundColor.push(newColor);
    // }

    // config.data.datasets.push(newDataset);
    // window.myChart.update();
  // });

  // document.getElementById('removeDataset').addEventListener('click', function() {
    // config.data.datasets.splice(0, 1);
    // window.myChart.update();
  // });

$(document).ready(function(){
  // createchartContainer();
  // fillChartAjax("js/chart.data.json");
  var btnUpdateMyChartSingleColor = document.getElementById('btnUpdateMyChartSingleColor');
  var btnUpdateMyChartRandomColors = document.getElementById('btnUpdateMyChartRandomColors');
  // TODO: both these addEventListener attachement work, have to chose one once and for all...
  btnUpdateMyChartSingleColor.addEventListener("click", updateMyChartSingleColor);
  if (btnUpdateMyChartRandomColors) btnUpdateMyChartRandomColors.addEventListener("click", updateMyChartRandomColors);

});

