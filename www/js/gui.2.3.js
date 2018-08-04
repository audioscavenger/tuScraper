/*
1.4:  add call to fillChartWithSql
      execEditorContents will carry on chartType
      xhr request + JSON.parse for sqlDict
      call tooltip from here because hiddenTooltip are generated asynchronously
      TODO: progress bar do not fade after loadDb
1.5:  add remove .chart-container
2.0:  add checkbox chart
2.1:  add bootstrap4 + loadedDbFile label update
2.2:  use loadDbXhr class to attach xhr load db events on buttons
2.2:  loadedDbFile update by xhr buttons as well
2.3:  chartType decided upon table headers
2.3:  checkChart meaning inverted

TODO LIST:
- wherever title appears in a table, replace class title by an href to the mytumobile page; semester will need to be in the db somewhere
- try to include the glyphicons in the dict.json somehow
- maybe delete the graph when switching tabs
- finda way to reset the worker that crashes sometimes

bootstrap class quick help: https://www.w3schools.com/Bootstrap/bootstrap_ref_css_helpers.asp
*/
var version = 2.1;
var debug = false;

var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('loadDbFile');
var savedbElm = document.getElementById('savedb');
var purgeGraphBtn = document.getElementById('nav-graph-purge');
var tocMsg1 = document.getElementById('tocMsg1');
var tocMsg2 = document.getElementById('tocMsg2');
// var execBtnLoadDbXhr0 = document.getElementById('loadDbXhr0');
// var execBtnLoadDbXhrFull = document.getElementById('loadDbXhrFull');


// Start the worker in which sql.js will run
var worker = new Worker("www/js/worker.sql.js");
// alert(worker);
worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

// Connect to the HTML element we 'print' to
function print(text) {
  outputElm.innerHTML = text.replace(/\n/g, '<br>');
}
function error(e) {
  if (debug) console.log(e);
  errorElm.style.height = '2em';
  errorElm.textContent = e.message;
  outputElm.textContent = "See error for details.";
  outputElm.className = "alert alert-danger";
}

function noerror() {
  errorElm.style.height = '0';
}

function disableActions() {
  $(".buttons").addClass("disabled");
  // console.log("actions disabled");
}
function enableActions() {
  // $(id).removeClass("disabled");
  $(".disabled").removeClass("disabled");
  // console.log("actions enabled");
}

function formatTimestamp(timestamp) {
  return $.format.date(new Date(parseInt(timestamp+'000')),'yyyy-MM-dd HH:mm:ss');
}

// Run a command in the database
function execute(commands, chartType) {
  tic();
  worker.onmessage = function(event) {
    // console.log(event);  // MessageEvent {isTrusted: true, data: {…}, origin: "", lastEventId: "", source: null, …}
    // console.log(event.data);  // Object { id: undefined, results: Array[1] }
    // console.log(event.data.results);  // [{columns: Array(2), values: Array(3)}]
    var results = event.data.results;
    if (debug) console.log(results);  // Array [ Object ]
    if (results.length == 0) {
      outputElm.textContent = "Request returned 0 rows.";
      outputElm.className = "alert alert-warning";
    } else {
      toc("Executing SQL");

      tic();
      disableActions();
      // outputElm.innerHTML = ''; // http://jsperf.com/innerhtml-vs-removechild
      outputElm.removeChild(outputElm.firstChild);
      for (var i=0; i<results.length; i++) {
        // for event.data.results = Array [ Object ], results.length = 1
        // console.log('columns='+results[i].columns); // columns=[0:id,1:timestamp,2:ClassNumber,.. x8]
        // console.log('values='+results[i].values);   // values=[0:[1512,1510867045,2792,22,0,22,2,6,7228],.. xNbRows]
        outputElm.appendChild(tableCreate(results[i].columns, results[i].values, 'timestamp', 'formatTimestamp'));
        
        // chart for chartType = line,bar.. // http://www.chartjs.org/docs/latest/charts/
        if (!document.getElementById("checkChart").checked) {
          if (debug) console.log('results[i].columns[1]='+results[i].columns[1]);
          if (results[i].columns[0] == 'timestamp') {
            chartType="line";
            if (debug) console.log('execute: chartType='+chartType);
            $('#chart-container').addClass('chart-container');
            fillLineChartWithSql(results[i].columns, results[i].values, chartType);
            $('#nav-graph-purge').removeClass("invisible");
          }
          if (results[i].columns[1] == 'ynum') {
            chartType="bar";
            if (debug) console.log('execute: chartType='+chartType);
            $('#chart-container').addClass('chart-container');
            fillBarChartWithSql(results[i].columns, results[i].values, chartType);
            $('#nav-graph-purge').removeClass("invisible");
          }
        } else purgeGraphelement();
        // dataTable.jq.js is a table filter and sort plugin:
        var table = $('table').dataTable( {
          "autoWidth": true
        });
      }
    }
    toc("Displaying results");
    enableActions();
  }
  // try {
    // worker.postMessage({action:'exec',sql:commands});
  // }
  // catch(exception) {
    // worker.postMessage({action:'exec',sql:commands});
  // }
  worker.postMessage({action:'exec', sql:commands});
  outputElm.textContent = "Fetching results...";
  outputElm.className = "alert alert-light";
}

function purgeGraphelement() {
  $('#chart-container').removeClass('chart-container');
  purgeElement("chart-container");
  $('#nav-graph-purge').addClass("invisible");
}
if (purgeGraphBtn) purgeGraphBtn.addEventListener("click", purgeGraphelement);

// Create an HTML table
var tableCreate = function () {
  function openTag(tagName, className) {
    return '<'+tagName+' class="'+className+'">'
  }
  // arguments are parsed below: return function (columns, values, fieldToFormat, functionToFormat)
  // they come from execute() that calls tableCreate(results[i].columns, results[i].values, 'timestamp', 'formatTimestamp')
  function valconcat(vals, tagName, fieldToFormat, functionToFormat) {
    // console.log('valconcat(vals)='+vals);
    // console.log('valconcat(tagName)='+tagName);
    // console.log('valconcat(fieldToFormat)='+fieldToFormat);
    // console.log('valconcat(functionToFormat)='+functionToFormat);
    if (vals.length === 0) return '';
    n = 0
    var open = '<'+tagName+'>', close='</'+tagName+'>';
    // return open + vals.join(close + open) + close;
    theRows='';
    switch (tagName) {
      case 'td':
        // console.log('tr vals='+vals);
        // console.log('timestampCol='+timestampCol);
        // console.log('functionToFormat='+functionToFormat);
        if (timestampCol>-1) {
          // console.log('td timestampCol='+timestampCol);
          // timestamp values in database are generated by python arrow library:
          // timestamp=str(arrow.get(datetime.datetime.now()).timestamp)
          // it's the only python library that can return a timestamp that javascript can format
          vals[timestampCol] = window[functionToFormat](vals[timestampCol]);
          return open + vals.join(close + open) + close;
        } else {
          return open + vals.join(close + open) + close;
        }
      break;
      // analyze table header to find out which column contains timestamp
      case 'th':
        // console.log('th vals='+vals);
        for (i in vals) {
          // console.log('th vals['+i+']='+vals[i]);
          theRows+=openTag(tagName, vals[i].replace(/\W/g, '')) + vals[i] + close;
          if (fieldToFormat) { 
            // console.log('th fieldToFormat='+fieldToFormat);
            if (vals[i] === fieldToFormat) { 
              // console.log('th timestamp=vals['+i+']='+vals[i]);
              timestampCol=i;
            }
          }
        }
      break;
      default:
        return open + vals.join(close + open) + close;
      break;
    }
    return theRows
  }
  // this is the dirtiest way to parse arguments from tableCreate function
  // TODO: rewrite this tableCreate function entirely
  return function (columns, values, fieldToFormat, functionToFormat){
    // no timestamp Column by defaut:
    timestampCol=-1;
    var tbl  = document.createElement('table');
    // console.log('columns='+columns);
    var html = '<thead>' + valconcat(columns, 'th', fieldToFormat, functionToFormat) + '</thead>';
    var rows = values.map(function(v){ return valconcat(v, 'td', fieldToFormat, functionToFormat); });
    html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
    tbl.innerHTML = html;
    return tbl;
  }
}();

// Execute the commands when the button is clicked
function execEditorContents(chartType) {
  noerror();
  // console.log('execEditorContent: chartType='+chartType);
  if (typeof chartType !== 'string') chartType=undefined;
  execute (editor.getValue() + ';', chartType);
}
execBtn.addEventListener("click", execEditorContents, true);



// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) {window.performance = {now:Date.now}}
function tic () {tictime = performance.now()}
function toc(msg) {
  var delta = performance.now()-tictime;
  message = (msg||'toc') + ": " + delta + "ms";
  console.log(message);
  printTocToGui(message);
}

function printTocToGui(msg) {
  tocMsg1.textContent = tocMsg2.textContent;
  tocMsg2.textContent = msg;
}

// TODO: jQuery UI show / hide with a slide effect
// https://stackoverflow.com/questions/17329533/jquery-ui-show-hide-with-a-slide-effect-how-to-change-the-slide-back-in-sp#17329624
// http://jsfiddle.net/xu3ck/1137/
// function printTocToGui(msg) {
  // $('.website-info').hide('slide', {direction: 'left'}, 300);
  // $(this).next('.website-info').stop().show('slide', {direction: 'right'}, 300);
// }

// TODO: implement codemirror properly: https://github.com/angular-ui/ui-codemirror http://plnkr.co/edit/?p=preview
// TODO: Add syntax highlihjting to the textarea... done?
var editor = CodeMirror.fromTextArea(commandsElm, {
  mode: 'text/x-mysql',
  viewportMargin: Infinity,
  indentWithTabs: true,
  smartIndent: true,
  lineNumbers: true,
  matchBrackets : true,
  autofocus: true,
  extraKeys: {
    "Ctrl-Enter": execEditorContents,
    "Ctrl-S": savedb,
  }
});

// Load a db from a file; this prevents the onchange event from the input itself
// therefore, the uploaded file name must be updated from here
if (dbFileElm) {
dbFileElm.onchange = function() {
  $('#loadedDbFile').val($(this).val().replace(/\\/g, '/').replace(/.*\//, ''));
  var f = dbFileElm.files[0];
  var r = new FileReader();
  updateProgressBar('init',0);
  r.addEventListener("progress", updateProgressTweaked);
  r.addEventListener("load", transferComplete);
  r.addEventListener("error", transferFailed);
  r.addEventListener("abort", transferCanceled);
  r.addEventListener("loadend", loadEnd);
  
  r.onload = function() {
    worker.onmessage = function () {
      toc("Loading database from uploaded file");
      // Show the schema of the loaded database
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
    };
    tic();
    try {
      if (debug) console.log(r.result);
      worker.postMessage({action:'open',buffer:r.result}, [r.result]);
    }
    catch(exception) {
      worker.postMessage({action:'open',buffer:r.result});
    }
  }
  disableActions();
  r.readAsArrayBuffer(f);
}
}

// Save the db to a file
function savedb () {
  worker.onmessage = function(event) {
    toc("Exporting the database");
    var arraybuff = event.data.buffer;
    var blob = new Blob([arraybuff]);
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);
    a.download = "sql.db";
    a.onclick = function() {
      setTimeout(function() {
        window.URL.revokeObjectURL(a.href);
      }, 1500);
    };
    a.click();
  };
  tic();
  worker.postMessage({action:'export'});
}
if (savedbElm) savedbElm.addEventListener("click", savedb, true);

// TODO: DONE! progress bar http://jsfiddle.net/GvdSy/ https://jsfiddle.net/zinoui/sx61fgm3/
// BUG: when the connection is too fast, the total size is sent too late. Thus, lengthComputable = false
/* function updateProgress(evt) {
  if (evt.lengthComputable) {
    var percentComplete = evt.loaded / evt.total;
    console.log("updateProgress "+percentComplete);
    updateProgressBar('update',percentComplete);
  } else {
    console.log("updateProgress unable to compute");
  }
}*/
function updateProgressTweaked(evt) {
  total = (evt.lengthComputable) ? evt.total : 10485760;
  var percentComplete = evt.loaded / total;
  if (debug) console.log("updateProgress "+percentComplete);
  updateProgressBar('update',percentComplete);
}
function transferComplete(evt) { if (debug) console.log("The transfer is complete"); }
function transferFailed(evt) { if (debug) console.log("transferFailed"); }
function transferCanceled(evt) { if (debug) console.log("transferCanceled"); }
function loadEnd(evt) { 
  updateProgressBar('update',1);
  if (debug) console.log("The transfer finished (abort, load, or error)"); 
  // console.log(evt['target']['responseURL']); 
}

// load db file from http
function execBtnLoadXhr2LoadFile(url) {
  var xhr = new XMLHttpRequest();
  updateProgressBar('init',0);
  xhr.addEventListener("progress", updateProgressTweaked);
  xhr.addEventListener("load", transferComplete);
  xhr.addEventListener("error", transferFailed);
  xhr.addEventListener("abort", transferCanceled);
  xhr.addEventListener("loadend", loadEnd);

  xhr.onload = function() {
    if (debug) console.log(this.response); // THIS is the ArrayBuffer we want for the worker postMessage buffer !
    worker.onmessage = function () {
      toc("Loading database from url: "+url);
      // Show the schema of the loaded database
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
      $("#initMessage").fadeOut(300, function() { $(this).remove(); });
      $('#loadedDbFile').val(url.replace(/\\/g, '/').replace(/.*\//, ''));
    };
    try {
      worker.postMessage({action:'open',buffer:this.response}, [this.response]);
    }
    catch(exception) {
      worker.postMessage({action:'open',buffer:this.response});
    }
  }
  tic();
  disableActions();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.send();
}

// TODO: BUG: for some reason these addEventListener are executed on load of the page, why?
// execBtnLoadDbXhr0.addEventListener("click", execBtnLoadXhr2LoadFile('tuScraper.0.sqlite3'));
// execBtnLoadDbXhrFull.addEventListener("click", execBtnLoadXhr2LoadFile('tuScraper.sqlite3'));
// if (execBtnLoadDbXhr0) execBtnLoadDbXhr0.onclick = function(e) { execBtnLoadXhr2LoadFile('tuScraper.0.sqlite3'); }

// if (execBtnLoadDbXhr0) execBtnLoadDbXhr0.onclick = function(e) { 
  // execBtnLoadXhr2LoadFile($(this).attr("database")); 
  // }
// if (execBtnLoadDbXhrFull) execBtnLoadDbXhrFull.onclick = function(e) { 
  // execBtnLoadXhr2LoadFile($(this).attr("database")); 
  // }

function jsonEscape(str)  {
  return str.replace(/\\/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
}

var sqlDict = '';
function getJsonAsync(url, callback) {
  // https://www.w3schools.com/js/tryit.asp?filename=tryjson_http
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // console.log(unescape(this.responseText));
      // https://jsonlint.com/
      // https://stackoverflow.com/questions/42068/how-do-i-handle-newlines-in-json
      callback(JSON.parse(unescape(this.responseText)));
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

/* 
// Firefox: Synchronous XMLHttpRequest on the main thread is deprecated 
// async: false - xhr.open("GET", url, false);
// because of its detrimental effects to the end user’s experience. For more help http://xhr.spec.whatwg.org/
var sqlDict = $.ajax({
  url : dirname(window.location.href)+"/sql.dict.json",
  type : "GET",
  contentType: "application/json",
  async: false
}).responseText;
*/

function setEditorSql(buttonId,sqlDict) {
  // console.log('setEditorSql: sqlDict['+buttonId+']='+sqlDict[buttonId]);
  editor.setValue(sqlDict[buttonId]);
}

// old school:
/* var execBtnInjectSql = document.getElementsByClassName('injectSql');
for (var i = 0; i < execBtnInjectSql.length; i += 1) {
  execBtnInjectSql[i].onclick = function(e) {
    setEditorSql(this.id);
    execute (editor.getValue() + ';');
  };
}*/
// jquery school:
function updateSqlButtons(sqlDict) {
  $(".injectSql").each(function(){
    this.onclick = function(e) {
      if (debug) console.log(this.id);
      setEditorSql(this.id,sqlDict);
      // execute (editor.getValue() + ';', $(this).attr("chart"));  // 1.4
      execEditorContents($(this).attr("chart"));  // 1.4
    };
  });
}

// generate the hiddenTooltip out from sqlDict
function createHiddenTooltip(sqlDict) {
    // console.log('createHiddenTooltip: sqlDict='+sqlDict);
    // console.log(sqlDict);
  $(".injectSql").each(function(){
    if ($(this).attr("tooltip") !== "" ){
      // console.log(sqlDict);
      var tooltipRef = $(this).attr('tooltip');
      // console.log('createHiddenTooltip: tooltipRef='+tooltipRef);
      var div  = document.createElement('div');
      // console.log(sqlDict[tooltipRef]);
      var content = document.createTextNode(sqlDict[tooltipRef]); 
      div.id = "tooltip-"+tooltipRef;
      div.className = "hiddenTooltip";
      div.appendChild(content);
      document.body.appendChild(div);
      // $("body").append('<div id="tooltip-'+tooltipRef+'" class="hiddenTooltip">'+sqlDict[tooltipRef]+'</div>');
    }
  });
}

// TODO: add my own class switcher here:
// TODO: disable upload buttons for 4s after success
function updateProgressBar(state,percentComplete) {
  switch (state) {
    case 'init':
      $('.progressBar').stop().css({transition:'0s',width:0,opacity:100});
      break;
    default:
      $('.progressBar').css({ width: percentComplete * 100 + '%' });
      if (percentComplete == 1) { 
      $('.progressBar').stop().animate({opacity:0}, 1300);
      }
      break;
  }
}
// TODO: check why this version do not work:
/* function updateProgressBar(state,percentComplete) {
  $('.progressBar').css({ width: percentComplete * 100 + '%' });
  if (percentComplete == 1) {
    $('.progressBar').stop().animate({opacity:0}, 1300);
    $('.progressBar').stop().css({transition:'0s',width:0,opacity:100});
  }
}
 */
// https://stackoverflow.com/questions/23667086/why-is-my-variable-unaltered-after-i-modify-it-inside-of-a-function-asynchron
function setVarAsync() {
  getJsonAsync(dirname(window.location.href)+"/www/js/sql.dict.json", function(sqlDict) {
    createHiddenTooltip(sqlDict);
    simple_tooltip(".tip","tooltip");
    updateSqlButtons(sqlDict);
  });
}

var sqlDict;


$( document ).ready(function() {

  $(".loadDbXhr").click(function () {
    execBtnLoadXhr2LoadFile($(this).attr("database"));
  }).end();
  setVarAsync();

});
