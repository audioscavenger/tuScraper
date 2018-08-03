var version = 1.3;
// 1.3 TODO: actually use chart.data.json via XMLhr
// 1.3 moved chart.data.json under www/js/

/*
https://www.dyclassroom.com/chartjs/chartjs-how-to-draw-line-graph-using-data-from-mysql-table-and-php
1.2:  use of array of arrays
*/

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

// gui.js execute returns this:
// console.log('columns='+results[i].columns); // [ "timestamp", "CIS212-001", "ITEC250-002" ]
// console.log('values='+results[i].values);   // [ Array[3], Array[3],..]

// chartType = line,bar.. // http://www.chartjs.org/docs/latest/charts/
function fillChartWithSql(columns,values, chartType) {
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

// $(document).ready(function(){
  // createchartContainer();
  // fillChartAjax("js/chart.data.json");
// });

