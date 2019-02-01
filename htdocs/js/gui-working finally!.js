var execBtn = document.getElementById("execute");
var outputElm = document.getElementById('output');
var errorElm = document.getElementById('error');
var commandsElm = document.getElementById('commands');
var execBtnLoad1 = document.getElementById('loadDb1');
var execBtnLoadXhr = document.getElementById('loadDbXhr');
var loadDb2Elm = document.getElementById('loadDb2');
var dbFileElm = document.getElementById('dbfile');
var savedbElm = document.getElementById('savedb');

// Start the worker in which sql.js will run
var worker = new Worker("www/js/worker.sql.js");
// alert(worker);
worker.onerror = error;

// Open a database
worker.postMessage({action:'open'});

// Start another xhr worker in which sql.js will run
// https://github.com/kripken/sql.js/issues/85
var workerXhr = new Worker("www/js/worker.xhr.js");
workerXhr.onerror = error;
workerXhr.postMessage({action:'open'});

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

// Load scraper TU db from a local file
/* loadDb2Elm.onchange = function() {
    // var f = loadDb2Elm.files[0];
    var f = new File([""], "tuScraper.0.sqlite3");
    alert(f.name);
	var reader = new FileReader();
  // alert(reader);
	reader.onload = function() {
		worker.onmessage = function () {
			toc("Loading database from file");
			// Show the schema of the loaded database
			editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		tic();
		try {
			worker.postMessage({action:'open',buffer:reader.result}, [reader.result]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:reader.result});
		}
	}
	reader.readAsArrayBuffer(f);
  // alert(reader);
}
 */
/*
function execBtnLoad1LoadFile () {
noerror();
loadBinaryFile('file:///S:/wintools/Documents/towson.edu/www/tuScraper.0.sqlite3', function(data){
  // var db = new SQL.Database(data);
  worker.onmessage = function () {
    toc("Loading database from file");
    // Show the schema of the loaded database
    editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
    execEditorContents();
  };
  tic();
  try {
    worker.postMessage({action:'open',buffer:data.result}, [data.result]);
  }
  catch(exception) {
    worker.postMessage({action:'open',buffer:data.result});
  }
});
}
*/
function execBtnLoad1LoadFile () {
  noerror();
  loadBinaryFile('tuScraper.0.sqlite3', function(data){
  // loadBinaryFile('https://tigerweb.towson.edu/lderew1/tuScraper.0.sqlite3', function(data){
  alert(data);
  });
}
execBtnLoad1.addEventListener("click", execBtnLoad1LoadFile, true);

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

// https://stackoverflow.com/questions/28066570/read-sqlite-database-from-the-disk-using-sql-js
function loadBinaryFile(path,success) {
  var xhr = new XMLHttpRequest();
  xhr.addEventListener("progress", updateProgress);
  xhr.addEventListener("load", transferComplete);
  xhr.addEventListener("error", transferFailed);
  xhr.addEventListener("abort", transferCanceled);
  xhr.addEventListener("loadend", loadEnd);

  xhr.open('GET', path, true);
  xhr.responseType = 'arraybuffer';

  xhr.onload = function(evt) {
    var arrayBuffer = new Uint8Array(this.response);
    // var arrayBuffer = xhr.response;
		worker.onmessage = function () {
			toc("Loading database from file");
			// Show the schema of the loaded database
			editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
			execEditorContents();
		};
		tic();
		try {
			worker.postMessage({action:'open',buffer:arrayBuffer.result}, [arrayBuffer.result]);
		}
		catch(exception) {
			worker.postMessage({action:'open',buffer:arrayBuffer.result});
		}
  };
  xhr.send(null);
};

function execBtnLoadXhrFile () {
  workerXhr.postMessage({
    url: '//tigerweb.towson.edu/lderew1/tuScraper.0.sqlite3',
    sql: "SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';"
  });

  workerXhr.onmessage = function(event) {
    toc("Loading database from file");
    console.log(event.data);  // this is an array['table1=create table..', 'table2=..', ..]
    editor.setValue("SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';");
    execEditorContents();
    // workerXhr.terminate();
  };
  tic();
  worker.postMessage({action:'open',buffer:event.data}, [event.data]);
  workerXhr.onerror = function(e) {console.log("workerXhr error: ", e)};
}
execBtnLoadXhr.addEventListener("click", execBtnLoadXhrFile, true);
