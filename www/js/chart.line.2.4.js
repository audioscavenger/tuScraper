/*
https://www.dyclassroom.com/chartjs/chartjs-how-to-draw-line-graph-using-data-from-mysql-table-and-php
1.2:  use of array of arrays
1.3   moved chart.data.json under www/js/
1.4:  introduced bar graph
2.4:  introduced pie chart

TODO: actually use chart.data.json via XMLhr
TODO: map columns or something like that within a dict, currently num of columns is fixed
TODO: random colors for variable number of arrays
*/
var chartVersion = 2.4;
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
function fillLineChartWithSql(columns,values,chartType) {
  resetCanvas();
  var arrays = [[],[],[]];  // TODO: map columns or something like that within a dict
  var timestamps = [];
  var class1 = [];
  var class2 = [];
  // console.log(columns); //  [ "timestamp", "CIS212-001", "ITEC250-002" ]
  // console.log(values);  //  [ Array[3], Array[3],..]

  for(var i in values) {
    for(var c in columns) {
      arrays[c].push(values[i][c]);
      // class1.push(values[i][c]);
      // class2.push(values[i][c]);
    };
  };
  // console.log(timestamps);
  // console.log(class1);
  // console.log(class2);
  
  var chartdata = {
    labels: arrays[0],
    datasets: [
      {
        label: columns[1],
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(59, 89, 152, 0.75)",
        borderColor: "rgba(59, 89, 152, 1)",
        pointHoverBackgroundColor: "rgba(59, 89, 152, 1)",
        pointHoverBorderColor: "rgba(59, 89, 152, 1)",
        data: arrays[1]
      },
      {
        label: columns[2],
        fill: false,
        lineTension: 0.1,
        backgroundColor: "rgba(29, 202, 255, 0.75)",
        borderColor: "rgba(29, 202, 255, 1)",
        pointHoverBackgroundColor: "rgba(29, 202, 255, 1)",
        pointHoverBorderColor: "rgba(29, 202, 255, 1)",
        data: arrays[2]
      }
    ]
  };

  var ctx = $("#chartcanvas");

  var LineGraph = new Chart(ctx, {
    type: chartType,
    data: chartdata,
    options: {
      scales: {
        xAxes: [{
          type: 'time',
          distribution: 'linear'
        }]
      }
    }
  });
}

// fillBarGraphWithSql is called by the GUI gui.js
function fillBarGraphWithSql(columns,values,chartType) {
  resetCanvas();
  var arrays = [[],[],[]];  // TODO: map columns or something like that within a dict
  var class1 = [];
  var class2 = [];
  // console.log(columns); //  [ "timestamp", "CIS212-001", "ITEC250-002" ]
  // console.log(values);  //  [ Array[3], Array[3],..]

  for(var i in values) {
    for(var c in columns) {
      arrays[c].push(values[i][c]);
      // class1.push(values[i][c]);
      // class2.push(values[i][c]);
    };
  };
  // console.log(class1);
  // console.log(class2);
  
  var chartdata = {
    labels: arrays[0],
    datasets: [
      {
        label: columns[1],
        backgroundColor: "rgba(59, 89, 152, 0.75)",
        data: arrays[1]
      }
    ]
  };

  var ctx = $("#chartcanvas");

  var BarGraph = new Chart(ctx, {
    type: chartType,
    data: chartdata,
    options: {
      scales: {
        xAxes: [{
          gridLines: {
            offsetGridLines: false
          }
        }]
      }
    }
  });
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

function updateMyChartSingleColor() {
  if (config) {
    // preservation of the backgroundColor array by setting every value to the same color
    singleColor = randRgbaColor();
    // default color as random in every dataset within config:
    config.data.datasets.forEach(function(dataset) {
      dataset.backgroundColor = dataset.backgroundColor.map(function() {
        return singleColor;
      });
    });
    window.myChart.update();
  }
}

function updateMyChartRandomColors() {
  if (config) {
    // default color as random:
    config.data.datasets.forEach(function(dataset) {
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
  btnUpdateMyChartSingleColor.addEventListener("click", updateMyChartSingleColor);
  if (btnUpdateMyChartRandomColors) btnUpdateMyChartRandomColors.addEventListener("click", updateMyChartRandomColors);

});

