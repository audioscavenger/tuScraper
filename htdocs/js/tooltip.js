// version = 2.0
/*
I think this originates from https://kriesi.at/archives/create-simple-tooltips-with-css-and-jquery-part-2-smart-tooltips

1) this tooltip function works with any element with the class "tip" AND the attribute tooltip="img url"
	it will show a tooltip with the content of the url, within a div with "tooltip" class and id="tooltipX"
2) OR, defining anywhere else, some div with "hiddenTooltip" class and an "id" that you can call later in the "tooltip" attribute (tooltip="ID")
	that allow you to have more complex content inside your tooltips, such as images, html, anything you like
http://coding.smashingmagazine.com/2007/06/12/tooltips-scripts-ajax-javascript-css-dhtml/
1.2:  now we call hiddenTooltip divs with id="tooltip-id"
      formatCrHtml for html carriage returns
2.0:  simplified functions and tooltip id names
2.1:  re-enabled isUrlValid(tooltipRef)

TODO:
- [x] autovalidate isUrlValid(tooltipRef) url for either img, canvas, text, etc

*/

// 2.0: function formatCrHtml doesn;t seem to be needed anymore
function formatCrHtml(str) {
  return (str + '').replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1'+ '<br />' +'$2');
}

function createTag(tag, id="", className="tooltip hiddenTooltip", innerHTML="") {
  elm  = document.createElement(tag);
  elm.id = id;
  elm.className = className;
  // content = document.createTextNode(innerHTML); 
  // elm.appendChild(content);
  elm.innerHTML = innerHTML;
  document.body.appendChild(elm);
  // console.log('createTag: '+elm.id);
  return elm;
}


// 2.0: function attachTooltip(elm, tooltipId, tootipContent=null) attaches tooltipId to elm if exist, creates them otherwise
function attachTooltip(elm, tooltipId, tootipContent=null) {
  // console.log('attachTooltip: '+tooltipId+'='+tootipContent);
  if (tootipContent) createTag('div', tooltipId, "tooltip hiddenTooltip", '<p>'+tootipContent+'</p>');
  // $("body").append('<div class="tooltip" id="'+tooltipId+'"><p>'+formatCrHtml(tootipContent)+'</p></div>');
  
  // console.log('tooltip: appended  '+tooltipId);
  //THEN give the tooltip div an id and a content; if given before it just doesn't work
  var my_tooltip = $("#"+tooltipId);
  $(elm).removeAttr("tooltip").mouseover(function() {
    // my_tooltip.css({opacity:0.8, display:"none"}).fadeIn(400);   // why display:"none" here?
    my_tooltip.css({opacity:0.8}).fadeIn(400);
    // my_tooltip.css({opacity:0.8}).fadeIn(400);
  }).mousemove(function(kmouse){
    var border_top = $(window).scrollTop;
    var border_right = $(window).width();
    var left_pos;
    var top_pos;
    var offset = 15;
    if (border_right - (offset *2) >= my_tooltip.width() + kmouse.pageX){
      left_pos = kmouse.pageX+offset;
    } else {
      left_pos = border_right-my_tooltip.width()-offset;
    }

    if (border_top + (offset *2)>= kmouse.pageY - my_tooltip.height()){
      top_pos = border_top +offset;
    } else {
      top_pos = kmouse.pageY-my_tooltip.height()-offset;
    }
    my_tooltip.css({left:left_pos, top:top_pos});
  }).mouseout(function(){
    my_tooltip.css({left:"-9999px"});     // this looks like much faster than display:"none"
    // my_tooltip.css({display:"none"});  // for some reason, hovering multiple elelemnts raises a bug: they dont't disappear
  });
}

/* function createHiddenTooltip generate div.hiddenTooltip for each element with either:
  - class=jQueryString (usually .tip; warning though this class also adds cursor: help)
  - or attribute toolitp="tooltipRef"
  - or both, or more
* dict = {tooltipRef:tooltipContent}
* jQueryStringThatApply can be string or array or attributes, id, className, etc: whatever identifies elements that need tooltip
* tooltipRef=$(this)attr('tooltip') or $(this)id with class=jQueryString
* tooltipId="tooltip-tooltipRef"
=> creates hidden tooltips only for elements identified with both jQueryString + dict[tooltipRef] exists
=> if tooltipId already exist, just attach it to identified element
=> if isUrlValid(dict[tooltipRef]), tooltip content becomes an img
*/
function createHiddenTooltip(dict, jQueryStringThatApply=['[tooltip]']) {
  jQueryStringArray = (Array.isArray(jQueryStringThatApply)) ? jQueryStringThatApply : Array.of(jQueryStringThatApply);
  // console.log(jQueryStringArray);
  jQueryStringArray.forEach(function(jQueryString) {
    // console.log(jQueryString);
    $(jQueryString).each(function() {
      var tooltipRef = ($(this).attr('tooltip') !== "" ) ? $(this).attr('tooltip') : $(this).id;
      if (dict.hasOwnProperty(tooltipRef)) {
        tooltipId = "tooltip-"+tooltipRef;
        tootipContent = (isUrlValid(dict[tooltipRef]) ) ? '<img src="'+dict[tooltipRef]+'" /></img>' : '<p>'+dict[tooltipRef]+'</p>';
        tooltip = (document.getElementById(tooltipId) !== null) ? document.getElementById(tooltipId) : createTag('div', tooltipId, "tooltip hiddenTooltip", tootipContent);
        attachTooltip($(this), tooltipId);
      }
    });
  });
  // console.log('-------createHiddenTooltip-document.body:------');
  // console.log(document.body);
  // console.log('-----------------------------------------------');
}


// this should be called once the hiddenTooltip have been generated
// $(document).ready(function(){
    // createHiddenTooltip(sqlDict, '.tip');      // attach tooltipId="tooltip-tooltipRef" only to elements with class .tip; tooltipRef=elementID unless attribute tooltip exists
    // createHiddenTooltip(sqlDict, '[tooltip]'); // attach tooltipId="tooltip-tooltipRef" only to elements with attribute tooltip="tooltipRef" -> 
    // createHiddenTooltip(sqlDict, ['[tooltip]', '.tip']); // attach tooltipId="tooltip-tooltipRef" only to elements with attribute tooltip="tooltipRef" -> 
// });
