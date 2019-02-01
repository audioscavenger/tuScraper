// https://github.com/kripken/sql.js/issues/85
if (!!window.Worker) {
  var worker = new Worker("www/js/worker.xhr.js");

  worker.postMessage({
    url: 'https://tigerweb.towson.edu/lderew1/tuScraper.0.sqlite3',
    sql: "SELECT `name`, `sql`\n  FROM `sqlite_master`\n  WHERE type='table';"
  });

  worker.onmessage = function(event) {
    console.log(event.data);
    worker.terminate();
  };

  worker.onerror = function(e) {console.log("Worker error: ", e)};
}