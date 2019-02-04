// https://github.com/kripken/sql.js/issues/85
importScripts('sql.min.js');

onmessage = function(message){
    console.log(message);
    console.log(message.data);
    console.log(message.data.url);
    console.log(message.data.sql);
    http(message.data.url,message.data.sql);

    function http(url, sql)
    {
        var url = url;
        var sql = sql;

        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.responseType = 'arraybuffer';

        xhr.onload = function(e) {
          console.log(xhr);
          console.log(this.response); // this the ArrayBuffer we want for the worker postMessage buffer !
          console.log(applyTransform(this.response, sql)); // this is an array['table1=create table..', 'table2=..', ..]
          postMessage(applyTransform(this.response, sql));
          close();
        };

        xhr.send();
    }

    function applyTransform(result, sql)
    {
        var data = [];
        var uInt8Array = new Uint8Array(result);
        var db = new SQL.Database(uInt8Array);
        var stmt = db.prepare(sql);
        while(stmt.step())
        {
            data.push(stmt.getAsObject())
        }
        db.close();
        return data;
    }
}