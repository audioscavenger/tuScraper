/*
1.0:  added some buttons for custom xhr loading
1.2:  implemented dataTables.js + disableActions + more SQL buttons
1.3:  implemented dateFormat.js + Chart.js.js + auto tooltip of SQL in buttons
1.4:  add calls to fillChartWithSql
      + execEditorContents will carry on chartType
      + xhr request progres bar
      + JSON.parse for sqlDict!
      + call tooltip from here because hiddenTooltip are generated asynchronously
      TODO: progress bar do not fade after loadDb
1.5:  add remove .chart-container
2.0:  add checkbox chart
2.1:  add bootstrap4 + loadedDbFile label update
2.2:  use loadDbXhr class to attach xhr load db events on buttons
2.2:  loadedDbFile update by xhr buttons as well
2.3:  chartType decided upon table headers
2.4:  checkChart meaning inverted
      + update worker.sql.js to latest master 20180804
      + move codemirror under vendor folder
2.5:  added sql inject modif upon button input param
2.6:  added modal transition slide for tab content
      + added lzma.js for 7-zip LZMA decompress on the fly + asynchronous worker / ABORTED it just doesn't work
      + added JSZip and it works!
2.7:
- [x]  modal left/right detection for nav-tabContent
- [x]  auto detect db extension
- [ ]  add more tooltips
- [ ]  chartadmin dropdown buttion is transparent, why??

TODO LIST:
- handle progress bar with JSZip utils
- handle 404 (Not Found) in execBtnLoadXhr2LoadFile
- wherever title appears in a table, replace class title by an href to the mytumobile page; semester will need to be in the db somewhere
- try to include the glyphicons in the dict.json somehow
- maybe delete the graph when switching tabs
- finda way to reset the worker that crashes sometimes
- somehow swith to original sql.js as worker.js is said to be limited

bootstrap class quick help: https://www.w3schools.com/Bootstrap/bootstrap_ref_css_helpers.asp
*/
var guiVersion = 2.7;
var debug = false;
// var debug = true;

var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('alert-output');
var errorElm = document.getElementById('alert-error');
var tableElm = document.getElementById('output-table');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('loadDbFile');
var savedbElm = document.getElementById('savedb');
var purgeGraphBtn = document.getElementById('nav-graph-purge');
var tocMsg1 = document.getElementById('tocMsg1');
var tocMsg2 = document.getElementById('tocMsg2');
// var execBtnLoadDbXhr0 = document.getElementById('loadDbXhr0');
// var execBtnLoadDbXhrFull = document.getElementById('loadDbXhrFull');


// Start the sqlWorker in which sql.js will run
var sqlWorker = new Worker("dist/worker.sql.js");
// alert(sqlWorker);
sqlWorker.onerror = outputError;

// Open a database
sqlWorker.postMessage({action:'open'});

// basename
function basename(filename) {
  return filename.replace(/\\/g, '/').replace(/.*\//, '');
}

// basenameNoExt
function basenameNoExt(filename) {
  return filename.substr(0, filename.lastIndexOf('.')) || filename;
}

// extension
function extension(filename) {
  return filename.split('.').pop();
}

// Connect to the HTML element we 'print' to
function print(text) {
  outputElm.innerHTML = text.replace(/\n/g, '<br>');
}

function outputTable(content) {
  tableElm.removeChild(tableElm.firstChild);
  tableElm.appendChild(content);
}

function hideTable(content) {
  tableElm.innerHTML = "";
  errorElm.className = "hidden";
}

function outputMessage(message, alert="info") {
  if (debug) console.log('outputMessage-'+alert+': '+message);
  // outputElm.textContent = message;
  // outputElm.className = "alert alert-"+alert;
  // $(outputElm).fadeOut(2000);
  
  $(outputElm).animate({'opacity': 1}, 1000, function () {
    $(this).text(message).attr('class', "alert alert-"+alert);
  }).animate({'opacity': 0}, 2000);

}

function outputError(message) {
  outputMessage("See error for details.", alert="warning");
  errorElm.className = "alert alert-danger";
  errorElm.textContent = message;
}

function noerror() {
  errorElm.className = "hidden";
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

function hideChartButtons() {
  // $('#nav-graph-purge').addClass("invisible");
  $('.chartButton').addClass("invisible");
}

function showChartButtons() {
  // $('#nav-graph-purge').removeClass("invisible");
  $('.chartButton').removeClass("invisible");
}

// Run a command in the database
function execute(commands, chartType) {
  tic();
  sqlWorker.onmessage = function(event) {
    // console.log(event);  // MessageEvent {isTrusted: true, data: {…}, origin: "", lastEventId: "", source: null, …}
    // console.log(event.data);  // Object { id: undefined, results: Array[1] }
    // console.log(event.data.results);  // [{columns: Array(2), values: Array(3)}]
    var results = event.data.results;
    // this results.length sometimes returns uncaught TypeError??
    // console.log(results);  // Array [ Object ]
    if (!results || results.length == 0) {
      outputMessage("Request returned 0 rows.", "warning");
    } else {
      toc("Executing SQL");

      tic();
      disableActions();
      // outputElm.innerHTML = ''; // http://jsperf.com/innerhtml-vs-removechild
      // outputElm.removeChild(outputElm.firstChild);
      for (var i=0; i<results.length; i++) {
        // for event.data.results = Array [ Object ], results.length = 1
        // console.log('columns='+results[i].columns); // columns=[0:id,1:timestamp,2:ClassNumber,.. x8]
        // console.log('values='+results[i].values);   // values=[0:[1512,1510867045,2792,22,0,22,2,6,7228],.. xNbRows]
        // outputElm.appendChild(tableCreate(results[i].columns, results[i].values, 'timestamp', 'formatTimestamp'));
        outputTable(tableCreate(results[i].columns, results[i].values, 'timestamp', 'formatTimestamp'));
        outputMessage("Request rsults:")
        
        // chart for chartType = line,bar.. // http://www.chartjs.org/docs/latest/charts/
        // TODO: add radio boxes for selecting chart type
        if (!document.getElementById("checkChart").checked) {
          if (debug) console.log('results[i].columns[1]='+results[i].columns[1]);
          if (results[i].columns[0] == 'timestamp') {
            chartType="line";
            if (debug) console.log('execute: chartType='+chartType);
            $('#chart-container').addClass('chart-container');
            fillLineChartWithSql(results[i].columns, results[i].values);
            showChartButtons();
          }
          if (results[i].columns[1] == 'ynum') {
            chartType="bar";
            if (debug) console.log('execute: chartType='+chartType);
            $('#chart-container').addClass('chart-container');
            fillBarGraphWithSql(results[i].columns, results[i].values);
            showChartButtons();
          }
          if (results[i].columns[1] == 'pienum') {
              chartType="pie";
              if (debug) console.log('execute: fillPieChartWithSql');
              $('#chart-container').addClass('chart-container');
              fillPieChartWithSql(results[i].columns, results[i].values);
              showChartButtons();
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
    // sqlWorker.postMessage({action:'exec',sql:commands});
  // }
  // catch(exception) {
    // sqlWorker.postMessage({action:'exec',sql:commands});
  // }
  sqlWorker.postMessage({action:'exec', sql:commands});
  toc("Fetching results...");
  outputMessage("Fetching results...")
}

function purgeGraphelement() {
  $('#chart-container').removeClass('chart-container');
  purgeElement("chart-container");
  hideChartButtons();
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

// jQuery UI slide modal transition effect for .tab-pane via .nav-link click
// adaptation for bootstrap 4 tab navigation
// https://stackoverflow.com/questions/17329533/jquery-ui-show-hide-with-a-slide-effect-how-to-change-the-slide-back-in-sp#17329624
// http://jsfiddle.net/xu3ck/1137/
function setNavLinkEvents() {
/*   $('.nav a').on('show.bs.tab', function(event){
    event.stopPropagation();
    console.log($(event));
    console.log($(event.target).text());         // active tab
    console.log($(event.relatedTarget).text());  // previous tab
    console.log($(event.target.id));         // active tab
    console.log($(event.relatedTarget.id));  // previous tab
    console.log($('.tab-pane.active'));
    $('.tab-pane.active').hide('slide', {direction: 'left'}, 300);
  });
  $('.nav a').on('shown.bs.tab', function(event){
    event.stopPropagation();
    console.log($(event));
    console.log($(event.target).text());         // active tab
    console.log($(event.relatedTarget).text());  // previous tab
    console.log($(event.target.id));         // active tab
    console.log($(event.relatedTarget.id));  // previous tab
    console.log($('.tab-pane.active'));
    // $('.tab-pane').hide('slide', {direction: 'left'}, 300);
    $('.tab-pane.active').stop().show('slide', {direction: 'right'}, 300);
  });
 */
  $('.nav-link').click(function (event) {
    // event.stopPropagation();
    activeTab = $('.tab-pane.active');
    activeTabElm = activeTab[0];
    activeTabId = activeTabElm.id;
    activeTabElmIndex=Array.from(activeTabElm.parentNode.children).indexOf(activeTabElm)    // #nav-admin->0
    
    targetPane = event.target;
    targetPaneId = targetPane.id;
    targetPaneId = event.target.hash;
    targetPaneElmIndex=Array.from(targetPane.parentNode.children).indexOf(targetPane)       // #nav-graph->2

    if (debug) {
    console.log('------------------.nav-link click----------------------');
    // console.log(activeTabElm);                                             // <div class="tab-pane buttons" id="nav-admin" ...
    console.log('activeTabId='+activeTabId+' index='+activeTabElmIndex);      // activeTabId=nav-admin index=0
    // console.log(targetPane);                                               // <a class="nav-item nav-link btn-info active show" id="nav-graph-tab" ...
    console.log('targetPaneId='+targetPaneId+' index='+targetPaneElmIndex);   // targetPaneId=nav-graph-tab index=2
    console.log('click from '+activeTabElmIndex+' to '+targetPaneElmIndex);   // activeTabElmIndex < targetPaneElmIndex = right; 
    
    }
    
    // to be synchronized, directions of show and hide panes must be inverted
    hideWay = (activeTabElmIndex < targetPaneElmIndex) ? "left" : "right";
    showWay = (activeTabElmIndex < targetPaneElmIndex) ? "right" : "left";
    // THIS WORKS without event.stopPropagation(); AND with .tab-pane {position: absolute;}
    // TODO: handle bug where you click on another whil animation is not over
    activeTab.hide('slide', {direction: hideWay}, 600),
    $(targetPaneId+'.tab-pane').stop().show('slide', {direction: showWay}, 600);
  });

  $('.tab-pane.active').show('slide', {direction: 'up'}, 600);   // first time load
}


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
  $('#loadedDbFile').val(basename($(this).val()));
  var f = dbFileElm.files[0];
  var r = new FileReader();
  updateProgressBar('init',0);
  r.addEventListener("progress", updateProgressTweaked);
  r.addEventListener("load", transferComplete);
  r.addEventListener("error", transferFailed);
  r.addEventListener("abort", transferCanceled);
  r.addEventListener("loadend", loadEnd);
  
  r.onload = function() {
    sqlWorker.onmessage = function () {
      toc("Loading database from uploaded file");
      // Show the schema of the loaded database
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
    };
    tic();
    try {
      if (debug) console.log(r.result);
      sqlWorker.postMessage({action:'open',buffer:r.result}, [r.result]);
    }
    catch(exception) {
      sqlWorker.postMessage({action:'open',buffer:r.result});
    }
  }
  disableActions();
  r.readAsArrayBuffer(f);
}
}

// Save the db to a file
function savedb () {
  sqlWorker.onmessage = function(event) {
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
  sqlWorker.postMessage({action:'export'});
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

// load db file from url.sqlite3
function execBtnLoadXhr2LoadFile(url) {
  var xhr = new XMLHttpRequest();

  updateProgressBar('init',0);
  xhr.addEventListener("progress", updateProgressTweaked);
  xhr.addEventListener("load", transferComplete);
  xhr.addEventListener("error", transferFailed);
  xhr.addEventListener("abort", transferCanceled);
  xhr.addEventListener("loadend", loadEnd);

  xhr.onload = function() {
    if (debug) console.log('xhr this.response:'+this.response); // THIS is the [object ArrayBuffer] we want for the worker postMessage buffer !
    if (debug) console.log(this.response); // THIS is the ArrayBuffer we want for the worker postMessage buffer !

    sqlWorker.onmessage = function () {
      toc("Loading database from url: "+url);
      // Show the schema of the loaded database
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
      // $("#initMessage").fadeOut(300, function() { $(this).remove(); });
      $('#loadedDbFile').val(basename(url));
    };
    try {
      sqlWorker.postMessage({action:'open',buffer:this.response}, [this.response]);
    }
    catch(exception) {
      sqlWorker.postMessage({action:'open',buffer:this.response});
    }
  }
  tic();
  disableActions();
  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  if (debug) console.log('-----------------------xhr------------------------:');
  if (debug) console.log(xhr);
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


// https://stuk.github.io/jszip/documentation/examples.html
// https://stuk.github.io/jszip/documentation/examples/get-binary-files-ajax.html
function xhrDecompressDbFile(url) {
  // 1) get a promise of the content
  var promise = new JSZip.external.Promise(function (resolve, reject) {
    JSZipUtils.getBinaryContent(url, function(err, data) {
      if (err) {
        reject(err);
      } else {
        resolve(data);
      }
    });
  });

  // 2) chain with the zip promise
  promise.then(JSZip.loadAsync)
  .then(function(zip) {
    // zippedFile = basenameNoExt(url)+'txt';   // debug txt file
    zippedFile = basenameNoExt(url);
    if (debug) console.log('zippedFile: '+zippedFile);
    
    if (extension(zippedFile) != 'sqlite3') throw '"'+basename(url)+'" doesn\'t look like it contains an sqlite3 db!';
    
    // 3) chain with the response content promise
    // return zip.file(zippedFile).async("string"); // debug txt file
    return zip.file(zippedFile).async("ArrayBuffer");
  })
  // 4) display the result
  .then(function success(response) {
    if (debug) console.log('response: '+response);
    outputMessage("loaded, content = " + response);  // debug txt file
    
    sqlWorker.onmessage = function () {
      toc("Loading database from url: "+url);
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
      $("#initMessage").fadeOut(300, function() { $(this).remove(); });
      $('#loadedDbFile').val(basenameNoExt(url));
    };
    try {
      sqlWorker.postMessage({action:'open',buffer:response}, [response]);
    }
    catch(exception) {
      sqlWorker.postMessage({action:'open',buffer:response});
    }
    
    
    
    
  }, function error(e) {
    outputError(e + " for " + zippedFile);
  });
}

function jsonEscape(str)  {
  return str.replace(/\\/g, "\\\\n").replace(/\r/g, "\\\\r").replace(/\t/g, "\\\\t");
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
// fillEditorSqlField fills the sql textarea with JSON entry matching button id
function fillEditorSqlField(buttonId, sqlDict) {
  // console.log('fillEditorSqlField: sqlDict['+buttonId+']='+sqlDict[buttonId]);
  if ($('#'+buttonId).attr("getvaluefrom")) {
    value = $('#'+$('#'+buttonId).attr("getvaluefrom")).val();
    // TODO: validate it's a digit
    // console.log(value);
    editor.setValue(sqlDict[buttonId].replace("XYZ", value));
  } else editor.setValue(sqlDict[buttonId]);
}

/* ************************************************************** 
 *   SET UP ONCLICK TO EVERY BUTTONS ID MATCHING ENTRY IN sqlDict 
 * **************************************************************/
// old school:
/* var execBtnInjectSql = document.getElementsByClassName('injectSql');
for (var i = 0; i < execBtnInjectSql.length; i += 1) {
  execBtnInjectSql[i].onclick = function(e) {
    fillEditorSqlField(this.id);
    execute (editor.getValue() + ';');
  };
}*/
// jquery school:
function setSqlButtonEvents(sqlDict, className=".injectSql") {
  $(className).each(function(){
    // security, in case some buttons have className but no associated key in sqlDict:
    if (sqlDict.hasOwnProperty(this.id)) {
      this.onclick = function(e) {
        if (debug) console.log(this.id);
        fillEditorSqlField(this.id, sqlDict);
        // execute (editor.getValue() + ';', $(this).attr("chart"));  // 1.4
        execEditorContents($(this).attr("chart"));  // 1.4
      };
    }
  });
}
/* ************************************************************** 
 * **************************************************************/

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
function createSqlTooltips(dictionary) {
  getJsonAsync(dirname(window.location.href)+'/'+dictionary, function(sqlDict) {
    setSqlButtonEvents(sqlDict);
    createHiddenTooltips(sqlDict, ".injectSql");
  });
}

function createGeneralTooltips(dictionary) {
  url = dirname(window.location.href)+'/'+dictionary;
  getJsonAsync(url, function(generalTooltipDict) {
    // console.log(url);
    // console.log(generalTooltipDict);
    createHiddenTooltips(generalTooltipDict);
  });
}

$(document).ready(function() {
  createSqlTooltips("js/sql.dict.json");
  createGeneralTooltips("js/general.dict.json");
  setNavLinkEvents();
  outputMessage("Results will be displayed here");
  
  $(".loadDbXhr").click(function () {
    url = $(this).attr("database");
    switch (extension(url)) {
      case 'sqlite3':
        execBtnLoadXhr2LoadFile(url);
      break;
      case 'zip':
        xhrDecompressDbFile(url);
      break;
      default:
        alert('url='+url+' doesn\'t like an sqlite3 database');
      break;
    }
  }).end();
});
