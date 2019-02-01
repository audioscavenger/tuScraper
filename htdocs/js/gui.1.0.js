var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var dbFileElm = document.getElementById('dbfile');
var savedbElm = document.getElementById('savedb');

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
  console.log(e);
  errorElm.style.height = '2em';
  errorElm.textContent = e.message;
}

function noerror() {
    errorElm.style.height = '0';
}

// Run a command in the database
function execute(commands) {
  tic();
  worker.onmessage = function(event) {
    var results = event.data.results;
    toc("Executing SQL");

    tic();
    outputElm.innerHTML = "";
    for (var i=0; i<results.length; i++) {
      outputElm.appendChild(tableCreate(results[i].columns, results[i].values));
      $('table').dataTable( {
      "sDom": 'C&lt;"clear"&gt;lfrtip'
      });
    }
    toc("Displaying results");
  }
  worker.postMessage({action:'exec', sql:commands});
  outputElm.textContent = "Fetching results...";
}

// Create an HTML table
var tableCreate = function () {
  function valconcat(vals, tagName) {
    if (vals.length === 0) return '';
    var open = '<'+tagName+'>', close='</'+tagName+'>';
    return open + vals.join(close + open) + close;
  }
  return function (columns, values){
    var tbl  = document.createElement('table');
    var html = '<thead>' + valconcat(columns, 'th') + '</thead>';
    var rows = values.map(function(v){ return valconcat(v, 'td'); });
    html += '<tbody>' + valconcat(rows, 'tr') + '</tbody>';
    tbl.innerHTML = html;
    return tbl;
  }
}();

// Execute the commands when the button is clicked
function execEditorContents () {
  noerror();
  execute (editor.getValue() + ';');
}
execBtn.addEventListener("click", execEditorContents, true);

// Performance measurement functions
var tictime;
if (!window.performance || !performance.now) {window.performance = {now:Date.now}}
function tic () {tictime = performance.now()}
function toc(msg) {
  var dt = performance.now()-tictime;
  console.log((msg||'toc') + ": " + dt + "ms");
}

// Add syntax highlihjting to the textarea
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

// Load a db from a file
dbFileElm.onchange = function() {
  var f = dbFileElm.files[0];
  var r = new FileReader();
  r.onload = function() {
    worker.onmessage = function () {
      toc("Loading database from file");
      // Show the schema of the loaded database
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
    };
    tic();
    try {
      console.log(r.result);
      worker.postMessage({action:'open',buffer:r.result}, [r.result]);
    }
    catch(exception) {
      worker.postMessage({action:'open',buffer:r.result});
    }
  }
  r.readAsArrayBuffer(f);
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
savedbElm.addEventListener("click", savedb, true);

// TODO: progress bar http://jsfiddle.net/GvdSy/ https://jsfiddle.net/zinoui/sx61fgm3/
function updateProgress(evt) {
  if (evt.lengthComputable) {
    var percentComplete = evt.loaded / evt.total;
    console.log("updateProgress "+percentComplete);
  } else {
    console.log("updateProgress unable to compute");
  }
}
function transferComplete(evt) { console.log("The transfer is complete"); }
function transferFailed(evt) { console.log("transferFailed"); }
function transferCanceled(evt) { console.log("transferCanceled"); }
function loadEnd(evt) { console.log("The transfer finished"); }

function execBtnLoadXhr2LoadFile(url) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("progress", updateProgress);
  xhr.addEventListener("load", transferComplete);
  xhr.addEventListener("error", transferFailed);
  xhr.addEventListener("abort", transferCanceled);
  xhr.addEventListener("loadend", loadEnd);

  xhr.open('GET', url, true);
  xhr.responseType = 'arraybuffer';
  xhr.onload = function() {
    console.log(this.response); // THIS is the ArrayBuffer we want for the worker postMessage buffer !
    worker.onmessage = function () {
      toc("Loading database from url: "+url);
      // Show the schema of the loaded database
      editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
      execEditorContents();
    };
    tic();
    try {
      worker.postMessage({action:'open',buffer:this.response}, [this.response]);
    }
    catch(exception) {
      worker.postMessage({action:'open',buffer:this.response});
    }
  }
  xhr.send();
}
var execBtnLoadDbXhr0 = document.getElementById('loadDbXhr0');
var execBtnLoadDbXhrFull = document.getElementById('loadDbXhrFull');
// TODO: BUG: for some reason these addEventListener are executed on load of the page, why?
// execBtnLoadDbXhr0.addEventListener("click", execBtnLoadXhr2LoadFile('tuScraper.0.sqlite3'));
// execBtnLoadDbXhrFull.addEventListener("click", execBtnLoadXhr2LoadFile('tuScraper.sqlite3'));
execBtnLoadDbXhr0.onclick = function(e) { execBtnLoadXhr2LoadFile('tuScraper.0.sqlite3'); }
execBtnLoadDbXhrFull.onclick = function(e) { execBtnLoadXhr2LoadFile('tuScraper.sqlite3'); }

function setEditorSql(buttonId) {
  var sql;
  switch (buttonId) {
    case 'sql_mySurvey':
      sql = "SELECT * from perso_fall2017;";
      break;
    case 'sql_ITEC':
      sql = "SELECT * from  ITEC_fall2017;";
      break;
    default:
      sql = "select name,sql from sqlite_master \
      where type in ('table','view');";
      break;
  }
editor.setValue(sql);
}

var execBtnInjectSql = document.getElementsByClassName('injectSql');
for (var i = 0; i < execBtnInjectSql.length; i += 1) {
  execBtnInjectSql[i].onclick = function(e) {
    setEditorSql(this.id);
  };
}
