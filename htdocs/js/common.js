// common.js - set of functions developed by AudioScavengeR@Github
var version = 3.1

function log(e) { console.log(e); }

function formatCrHtml(str) {
  // return str.replace(/(?:\r\n|\r|\n|$)/mg, '<br />');
  // return str.replace(/$/mg, '<br />');
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br />' +'$2');
}

function purgeElement(id) {
  ID = id.replace(/\#/g,'');
  var node = document.getElementById(ID);
  while (node.firstChild) {
    node.removeChild(node.firstChild);
  }
}

function changeFavicon2Link(strLink) {
  var strLink = document.createElement('link');
  strLink.type = 'image/x-icon';
  strLink.rel = 'shortcut icon';
  strLink.href = strLink;
  document.getElementsByTagName('head')[0].appendChild(strLink);
}

// basenameNoExt
function basenameNoExt(strPpath) {
  return strPpath.substr(0, strPpath.lastIndexOf('.')) || strPpath;
}

// extension
function extension(strPpath) {
  // var arrExt = /^.+\.([^.]+)$/.exec(strPpath);
  // return arrExt == null ? "" : arrExt[1];
  return strPpath.split('.').pop();
}

// basename
function basename(strPpath) {
  // return strPpath.split('/').pop();
  // this covers also Windows paths:
  return strPpath.replace(/\\/g,'/').replace( /.*\//, '' );
}

// dirname
function dirname(strPpath) {
  return strPpath.replace(/\\/g,'/').replace(/\/[^\/]*$/, '');
}

function filename(strPpath) {
  return strPpath.substring(strPpath.lastIndexOf("/") + 1, strPpath.lastIndexOf("."));
}

function is_inArray(value,array) {
  if (array.indexOf(value) === -1) { return false } else { return true }
}

// getCSSvalue: element can be idName, className, or element
// getCSSvalue('divId', 'width') {
// getCSSvalue('className', 'width') {
function getCSSvalue(element, propertyName) {
  var cssValue = null;
  var elem = element;
  // try to get element by idName
  if (elem.nodeType != 1) {elem = document.getElementById(element); }
  // try to get element by className
  if (!elem) { elem = document.getElementsByClassName(element)[0]; }
  if (!elem) return null;
  
  if (window.getComputedStyle) {
    // if style is applyied somewhere on the page:
    cssValue = document.defaultView.getComputedStyle(elem, null).getPropertyValue(propertyName);
  } else if(elem.currentStyle) {
    // else get style from css directly:
    cssValue = elem.currentStyle[propertyName];
  }
  return cssValue;
}

function isUrlValid(strUrl) {
  // alert(document.URL);
  var RegexUrl = new RegExp( '(http|ftp|https)://[\\w-]+(\\.[\\w-]+)+([\\w-.,@?^=%&:/~+#-]*[\\w@?^=%&;/~+#-])?' );
  var RegexRelative = new RegExp( '(\.\.)/+([\\w-.,@?^=%&:/~+#-]*[\\w@?^=%&;/~+#-])?' );
  // alert('strUrl='+strUrl);
  // alert(RegexUrl.test(strUrl));
  if (RegexUrl.test(strUrl) === true) return true;
  if (RegexRelative.test(strUrl) === true) return true;
  // return RegexUrl.test(strUrl);
}

// getParent: element can be idName, or element
function getParent(element, pTagName) {
  if (element == null) return null;
  var elem = element;
  // http://www.javascriptkit.com/domref/nodetype.shtml
  // nodeType Returned integer	Node type Constant
  // 1	ELEMENT_NODE
  // 2	ATTRIBUTE_NODE
  // 3	TEXT_NODE
  // 4	CDATA_SECTION_NODE
  // 5	ENTITY_REFERENCE_NODE
  // 6	ENTITY_NODE
  // 7	PROCESSING_INSTRUCTION_NODE
  // 8	COMMENT_NODE
  // 9	DOCUMENT_NODE
  // 10	DOCUMENT_TYPE_NODE
  // 11	DOCUMENT_FRAGMENT_NODE
  // 12`	NOTATION_NODE
  if (elem.nodeType != 1) {elem = document.getElementById(element); }
  var parentElement = elem.parentNode;
  if (pTagName != null)
    if (parentElement.nodeType == 1 && parentElement.tagName.toLowerCase() == pTagName.toLowerCase())	// Gecko bug, supposed to be uppercase
      return parentElement;
    else return getParent(parentElement, pTagName);
  else return parentElement;
}


// https://stackoverflow.com/questions/15164655/generate-html-table-from-2d-javascript-array
// example: createTable(values = [["tr 1, td 1", "tr 1, td 2"], ["tr 2, td 1", "tr 2, td 2"]]);
// columns = array        = [0:id,   1:timestamp,2:ClassNumber,.. x nbColumns]
// values  = array[array] = [0:[1512,1510867045, 2792,         .. x nbColumns],.. x nbRows]
function createTableNode(values, columns=null) {
  var table = document.createElement('table');
  var tbody = document.createElement('tbody');

  // table head
  if (columns) {
    var thead = document.createElement('thead');
    var tr = document.createElement('tr');
    
    columns.forEach(function(cellTitle) {
      var th = document.createElement('th');
      th.appendChild(document.createTextNode(cellTitle));
      tr.appendChild(th);
    });
    thead.appendChild(tr);
    table.appendChild(thead);
  }

  // table body
  values.forEach(function(rowData) {
    var tr = document.createElement('tr');
    var colNum = 0;

    rowData.forEach(function(cellData) {
      var td = document.createElement('td');
      td.appendChild(document.createTextNode(cellData));
      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

// http://stackoverflow.com/questions/841553/jquery-this-child-selector
function getNextOfClassName(className) {
  return this.next('.'+className);
  // return this.parent().children('.'+className);
}

function getPrevOfClassName(className) {
  return this.prev('.'+className);
}

function getParentChildOfClassName(className) {
  return this.parent().children('.'+className);
}

// Browser: Determine browser and version.
function Browser() {
// blah, browser detect, but mouse-position stuff doesn't work any other way
  var ua, s, i;
  ua = navigator.userAgent;

  this.isIE    = false;
  this.isNS    = false;
  this.agent = ua;
  this.version = null;
  this.isMobile = false;
  
  // isMobile detection: https://stackoverflow.com/questions/3514784/what-is-the-best-way-to-detect-a-mobile-device-in-jquery
  if (window.matchMedia("only screen and (max-width: 760px)").matches) {
  this.isMobile = true;
}

  s = "MSIE";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isIE = true;
    this.version = parseFloat(ua.substr(i + s.length));
    return;
  }

  s = "Netscape6/";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isNS = true;
    this.version = parseFloat(ua.substr(i + s.length));
    return;
  }

  // Treat any other "Gecko" browser as NS 6.1.

  s = "Gecko";
  if ((i = ua.indexOf(s)) >= 0) {
    this.isNS = true;
    this.version = 6.1;
    return;
  }
}

function isMobile() {
  return window.matchMedia("only screen and (max-width: 760px)").matches;
}

function getMousePosition(event) {
  if (browser.isIE) {
    x = window.event.clientX + document.documentElement.scrollLeft + document.body.scrollLeft;
    y = window.event.clientY + document.documentElement.scrollTop  + document.body.scrollTop;
  }
  if (browser.isNS) {
    x = event.clientX + window.scrollX;
    y = event.clientY + window.scrollY;
  }
  return [x,y];
}


// https://api.jquery.com/jQuery.get/
function ajaxGetFromUrl(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  $.ajax({
    url: url,
    // data: { name: "John", location: "Boston" },
    type: 'GET',
    dataType: "html",
    success: function (data, text) {
      alert(data);                  // <html...
      alert(text);                  // success
      callback(whatever);
    },
    error: function (request, status, error) {
      alert(request.status);        // 404
      alert(request.responseText);  // <html><head><title>404 Not Found...
      alert(error);                 // Not Found
    }
  });
}

// https://api.jquery.com/jQuery.get/
// getJsonFromUrlAsync callback a function with 1st arg=json and any subsequent arguments passed after useProxy
function getJsonFromUrlAsync(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  // arguments are those passed to 'this' function: ["url", ƒ, true, "tooltip-Towson_University"]
  // var optArgs = arguments.slice(3, arguments.length);
  var optArgs = Array.prototype.slice.call(arguments, 3, arguments.length);

  // $.getJSON(url, callback);
  $.getJSON(url, function( json ) { callback(json, ...optArgs); });
}
/*
function tryMe (param1, param2) {
  alert(param1 + " and " + param2);
}
function callbackTester (callback) {
  callback (arguments[1], arguments[2]);
}
callbackTester (tryMe, "hello", "goodbye");
*/


// https://api.jquery.com/jQuery.get/
// https://stackoverflow.com/questions/24118961/how-to-store-the-output-of-an-xmlhttprequest-in-a-global-variable
function getJsonAsync(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  
  // https://www.w3schools.com/js/tryit.asp?filename=tryjson_http
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function() {
    if (this.readyState == 4 && this.status == 200) {
      // console.log(unescape(this.responseText));
      // https://jsonlint.com/
      // https://stackoverflow.com/questions/42068/how-do-i-handle-newlines-in-json
      if (typeof callback == 'function') {
        callback(JSON.parse(unescape(this.responseText)));
      } else if (typeof callback == 'string') {
        window[callback] = JSON.parse(unescape(this.responseText));
      } else {
        throw new TypeError();
      }
    }
  };
  xhr.open("GET", url, true);
  xhr.send();
}

// https://api.jquery.com/jQuery.get/
function getFromUrl(url, callback, useProxy=false) {
  // https://ourcodeworld.com/articles/read/73/how-to-bypass-access-control-allow-origin-error-with-xmlhttprequest-jquery-ajax-
  var proxy = 'https://cors-anywhere.herokuapp.com/';
  url = (useProxy) ? proxy + url : url;
  
  $.get(url, function( data ) {
    // console.log(data.responseText);
    callback(data);
  });
}

// without Parent, createTag does not attach the element to the document.body
// todo: see if it's best practice to elm.appendChild(document.createTextNode(content)) instead of lm.textContent = content
// todo: try to process optArgs such as: elm.title = "my title text";
function createTag(tag, id=null, className=null, content=null, Parent=null) {
  elm  = (id && document.getElementById(id)) ? document.getElementById(id) : document.createElement(tag);
  // elm  = document.createDocumentFragment(tag);  // See the use of document fragments for performance
  if (id) elm.id = id;
  if (className) elm.className = className;
  // content = document.createTextNode(content); 
  // elm.appendChild(content);
  // console.log(content);
  if (content && typeof content === 'object') { elm.appendChild(content); } else { elm.textContent = content; }
  if (Parent) {
    if (typeof Parent === 'object') { Parent.appendChild(elm); } else { if (document.getElementById(Parent)) document.getElementById(Parent).appendChild(elm); }
  // } else {
    // document.body.appendChild(elm);
  }
  
  if (arguments.length > 5) {
    var optArgs = Array.prototype.slice.call(arguments, 3, arguments.length);
    console.log(optArgs);
  }
  
  // console.log('createTag: '+elm.id);
  return elm;
}

// https://stackoverflow.com/questions/610406/javascript-equivalent-to-printf-string-format
// String.format usage: "{0} is dead, but {1} is alive! {0} {2}".format("ASP", "ASP.NET")
if (!String.prototype.format) {
  String.prototype.format = function() {
    var args = arguments;
    return this.replace(/{(\d+)}/g, function(match, number) { 
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}

var browser = new Browser();
