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

  this.isIE    = false;
  this.isNS    = false;
  this.version = null;

  ua = navigator.userAgent;

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

var browser = new Browser();
